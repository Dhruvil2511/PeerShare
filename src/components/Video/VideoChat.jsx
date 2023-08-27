import React, { useEffect, useState } from 'react'
import CallEndIcon from '@mui/icons-material/CallEnd';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useParams } from 'react-router-dom';
import '../Video/VideoChat.scss'
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicOffIcon from '@mui/icons-material/MicOff';

const firebaseConfig = {
    apiKey: "AIzaSyDp2oKcwTulKcY-PGLSwNmCTqjtx8zyXiw",
    authDomain: "peershare2425.firebaseapp.com",
    projectId: "peershare2425",
    storageBucket: "peershare2425.appspot.com",
    messagingSenderId: "308108699413",
    appId: "1:308108699413:web:94b0d16825b57b93d6ab1c",
    measurementId: "G-721QV10KH1"
};
const configuration = {
    iceServers: [
        {
            urls: ["stun:stun.relay.metered.ca:80", 'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',],
        },
        {
            urls: "turn:a.relay.metered.ca:80",
            username: "a1682711142862882518afae",
            credential: "RAx91eWI7uYEsYa7",
        },
        {
            urls: "turn:a.relay.metered.ca:80?transport=tcp",
            username: "a1682711142862882518afae",
            credential: "RAx91eWI7uYEsYa7",
        },
        {
            urls: "turn:a.relay.metered.ca:443",
            username: "a1682711142862882518afae",
            credential: "RAx91eWI7uYEsYa7",
        },
        {
            urls: "turn:a.relay.metered.ca:443?transport=tcp",
            username: "a1682711142862882518afae",
            credential: "RAx91eWI7uYEsYa7",
        },
    ],
    // To prefetch ice Candidate before setting local description range(0-255) more better but use more resource
    iceCandidatePoolSize: 10,
};

firebase.initializeApp(firebaseConfig);
let userRef = null;
let remoteStream = null;
let localStream = null;
let data = null;
let val = null;
let dummyCH;
let localConnection = null;
let remoteConnection = null;



const VideoChat = () => {
    let { id } = useParams();
    const [videoCaller, setVideoCaller] = useState('');
    const [flag, setFlag] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [videoCallButtonClicked, setVideoCallButtonClicked] = useState({ clicked: false, clickedBy: null });


    useEffect(() => {
        const db = firebase.firestore();
        let userRef = db.collection('users').doc(`${id}`);
        const unsubscribe = userRef.onSnapshot(async (snapshot) => {
            data = snapshot.data();
            if (data && data.videoCallHandle) {
                setVideoCallButtonClicked(data.videoCallHandle);
                if (data.videoCallHandle && data.videoCallHandle.clicked) {
                    setTimeout(async () => {
                        await openUserMedia();
                        val = sessionStorage.getItem('peerRole');
                        if ((data.videoCallHandle.clickedBy === 'peerA' && val === 'peerA') || (data.videoCallHandle.clickedBy === 'peerB' && val === 'peerB')) {
                            initializeLocalConnection();
                        }
                        else {
                            setTimeout(() => {
                                initializeRemoteConnection();
                            }, 6000);

                        }
                    }, 1000);
                }
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);


    async function openUserMedia() {
        const stream = await navigator.mediaDevices.getUserMedia(
            { video: true, audio: true });
        document.querySelector('#localVideo').srcObject = stream;
        localStream = stream;
        remoteStream = new MediaStream();
        document.querySelector('#remoteVideo').srcObject = remoteStream;
    }


    async function initializeLocalConnection() {
        const db = firebase.firestore();
        const roomRef = await db.collection('videoCon').doc(`${id}`);

        console.log('Create local with configuration: ', configuration);
        localConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners(localConnection);

        localStream.getTracks().forEach(track => {
            localConnection.addTrack(track, localStream);
        });

        const callerCandidatesCollection = roomRef.collection('callerCandidates');

        localConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final video candidate!');
                return;
            }
            console.log('Got video ice candidate: ', event.candidate);
            callerCandidatesCollection.add(event.candidate.toJSON());
        });

        const offer = await localConnection.createOffer();
        await localConnection.setLocalDescription(offer);
        console.log('Created video offer:', offer);

        const roomWithOffer = {
            'offer': {
                type: offer.type,
                sdp: offer.sdp,
            },
        };
        await roomRef.set(roomWithOffer);

        localConnection.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                remoteStream.addTrack(track);
            });
        });

        roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data();
            if (!localConnection.currentRemoteDescription && data && data.answer) {
                console.log('Got remote description: ', data.answer);
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                await localConnection.setRemoteDescription(rtcSessionDescription);
            }
        });
        // Listening for remote session description above

        // Listen for remote ICE candidates below
        roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await localConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
    }
    async function initializeRemoteConnection() {
        setFlag(false);
        const db = firebase.firestore();
        const roomRef = await db.collection('videoCon').doc(`${id}`);
        const roomSnapshot = await roomRef.get();

        if (roomSnapshot.exists) {
            remoteConnection = new RTCPeerConnection(configuration);
            registerPeerConnectionListeners(remoteConnection);
            localStream.getTracks().forEach(track => {
                remoteConnection.addTrack(track, localStream);
            });
            const calleeCandidatesCollection = roomRef.collection('calleeCandidates');

            remoteConnection.addEventListener('icecandidate', event => {
                if (!event.candidate) {
                    console.log('Got final candidate!');
                    return;
                }
                console.log('Got candidate: ', event.candidate);
                calleeCandidatesCollection.add(event.candidate.toJSON());
            });
            // Code for collecting ICE candidates above

            remoteConnection.addEventListener('track', event => {
                console.log('Got remote track:', event.streams[0]);
                event.streams[0].getTracks().forEach(track => {
                    console.log('Add a track to the remoteStream:', track);
                    remoteStream.addTrack(track);
                });
            });

            // Code for creating SDP answer below
            const offer = await roomSnapshot.data().offer;
            if (offer) {
                console.log('Got video offer:', offer);
                await remoteConnection.setRemoteDescription(offer);
                const answer = await remoteConnection.createAnswer();
                console.log('Created video answer:', answer);
                await remoteConnection.setLocalDescription(answer);

                const roomWithAnswer = {
                    answer: {
                        type: answer.type,
                        sdp: answer.sdp,
                    },
                };
                await roomRef.update(roomWithAnswer);

            }


            // Listening for remote ICE candidates below
            roomRef.collection('callerCandidates').onSnapshot(snapshot => {
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        let data = change.doc.data();
                        console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                        await remoteConnection.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });
            // Listening for remote ICE candidates above

        }
    }
    async function hangVideoCall() {
        const dbUser = firebase.firestore();
        let userRef = await dbUser.collection('users').doc(`${id}`);
        await userRef.set({ videoCallHandle: { clickedBy: null, clicked: false } });


        const dbVideo = firebase.firestore();
        const roomRef = await dbVideo.collection('videoCon').doc(`${id}`);
        const calleeCandidates = await roomRef.collection('calleeCandidates').get();
        calleeCandidates.forEach(async candidate => {
            await candidate.ref.delete();
        });
        const callerCandidates = await roomRef.collection('callerCandidates').get();
        callerCandidates.forEach(async candidate => {
            await candidate.ref.delete();
        });
        await roomRef.delete();

        if (localConnection) localConnection.close();
        if (remoteConnection) remoteConnection.close();

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream.getVideoTracks()[0].stop();
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            remoteStream.getVideoTracks()[0].stop();
        }
    }
    function registerPeerConnectionListeners(connection) {
        connection.addEventListener('icegatheringstatechange', () => {
            console.log(
                `ICE gathering state changed: ${connection.iceGatheringState}`);
        });

        connection.addEventListener('connectionstatechange', () => {
            console.log(`Connection state change: ${connection.connectionState}`);
        });

        connection.addEventListener('signalingstatechange', () => {
            console.log(`Signaling state change: ${connection.signalingState}`);
        });

        connection.addEventListener('iceconnectionstatechange ', () => {
            console.log(
                `ICE connection state change: ${connection.iceConnectionState}`);
        });
    }

    async function handleVideoOn() {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = !isVideoOn;
        }
        setIsVideoOn(!isVideoOn);
    }
    async function handleMicOn() {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = !isMicOn;
        }
        setIsMicOn(!isMicOn);
    }

    return (
        <>
            {videoCallButtonClicked.clicked &&
                <div className="video" >
                    <video id="localVideo" muted autoPlay playsInline></video>
                    <video id="remoteVideo" autoPlay playsInline></video>
                    <div className="footer" >
                        <div className='footer-in'>
                            {isVideoOn ?
                                <button className='video-on-button' onClick={handleVideoOn}>
                                    <VideocamIcon className='video-on' />
                                </button> : <button className='video-off-button' onClick={handleVideoOn}>
                                    <VideocamOffIcon className='video-off' />
                                </button>
                            }
                            {isMicOn ?
                                <button className='mic-on-button' onClick={handleMicOn}>
                                    <MicIcon className='mic-on' />
                                </button> : <button className='mic-off-button' onClick={handleMicOn}>
                                    <MicOffIcon className='mic-off' />
                                </button>
                            }

                            <button className='end-call-button' onClick={hangVideoCall}>
                                <CallEndIcon className='end-call' />
                            </button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default VideoChat;