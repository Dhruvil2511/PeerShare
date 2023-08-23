import React, { useEffect, useState } from 'react'
import Footer from '../Footer/Footer';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useParams } from 'react-router-dom';

const firebaseConfig = {
    apiKey: "AIzaSyCSOJm6G6RZFH46AlN9oeQmjfuyIIGXrG0",
    authDomain: "signalling-28129.firebaseapp.com",
    databaseURL: "https://signalling-28129-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "signalling-28129",
    storageBucket: "signalling-28129.appspot.com",
    messagingSenderId: "985022221543",
    appId: "1:985022221543:web:d08428c9ffe1beee9c2642",
    measurementId: "G-YJPJ8LZZXD"
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
let peerConnection = null;
// let roomId = null;


const VideoChat = ({ localConnection, remoteConnection }) => {
    let { id } = useParams();
    const [videoCaller, setVideoCaller] = useState('');
    const [flag, setFlag] = useState(true);
    const [videoCallButtonClicked, setVideoCallButtonClicked] = useState({ clicked: false, clickedBy: null });


    useEffect(() => {
        const db = firebase.firestore();
        let userRef = db.collection('users').doc(`${id}`);
        const unsubscribe = userRef.onSnapshot(async (snapshot) => {
            data = snapshot.data();
            if (data && data.videoCallHandle) {
                setVideoCallButtonClicked(data.videoCallHandle);
                if (data.videoCallHandle && data.videoCallHandle.clicked) {
                    await openUserMedia();
                    val = localStorage.getItem('peerRole');
                    if ((data.videoCallHandle.clickedBy === 'peerA' && val === 'peerA') || (data.videoCallHandle.clickedBy === 'peerB' && val === 'peerB')) {
                        initializeLocalConnection();
                    }
                    else {
                        setTimeout(() => {
                            initializeRemoteConnection();
                        }, 5000);


                    }
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

        console.log('Stream:', document.querySelector('#localVideo').srcObject);
    }


    async function initializeLocalConnection() {
        const db = firebase.firestore();
        const roomRef = await db.collection('videoCon').doc(`${id}`);

        console.log('Create PeerConnection with configuration: ', configuration);
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        const callerCandidatesCollection = roomRef.collection('callerCandidates');

        peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final video candidate!');
                return;
            }
            console.log('Got video ice candidate: ', event.candidate);
            callerCandidatesCollection.add(event.candidate.toJSON());
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Created video offer:', offer);

        const roomWithOffer = {
            'offer': {
                type: offer.type,
                sdp: offer.sdp,
            },
        };
        await roomRef.set(roomWithOffer);

        peerConnection.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
                console.log('Add a track to the remoteStream:', track);
                remoteStream.addTrack(track);
            });
        });

        roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data();
            if (!peerConnection.currentRemoteDescription && data && data.answer) {
                console.log('Got remote description: ', data.answer);
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                await peerConnection.setRemoteDescription(rtcSessionDescription);
            }
        });
        // Listening for remote session description above

        // Listen for remote ICE candidates below
        roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
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
            peerConnection = new RTCPeerConnection(configuration);
            registerPeerConnectionListeners();
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
            const calleeCandidatesCollection = roomRef.collection('calleeCandidates');

            peerConnection.addEventListener('icecandidate', event => {
                if (!event.candidate) {
                    console.log('Got final candidate!');
                    return;
                }
                console.log('Got candidate: ', event.candidate);
                calleeCandidatesCollection.add(event.candidate.toJSON());
            });
            // Code for collecting ICE candidates above

            peerConnection.addEventListener('track', event => {
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
                await peerConnection.setRemoteDescription(offer);
                const answer = await peerConnection.createAnswer();
                console.log('Created video answer:', answer);
                await peerConnection.setLocalDescription(answer);

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
                        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
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

        const tracks = document.querySelector('#localVideo').srcObject.getTracks();
        document.querySelector('#localVideo').srcObject = null;
        document.querySelector('#remoteVideo').srcObject = null;
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
        tracks.forEach(track => {
            track.stop();
        });
    }
    function registerPeerConnectionListeners() {
        peerConnection.addEventListener('icegatheringstatechange', () => {
            console.log(
                `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
        });

        peerConnection.addEventListener('connectionstatechange', () => {
            console.log(`Connection state change: ${peerConnection.connectionState}`);
        });

        peerConnection.addEventListener('signalingstatechange', () => {
            console.log(`Signaling state change: ${peerConnection.signalingState}`);
        });

        peerConnection.addEventListener('iceconnectionstatechange ', () => {
            console.log(
                `ICE connection state change: ${peerConnection.iceConnectionState}`);
        });
    }

    return (
        <>

            <div className="video" style={{ width: '30%' }}>
                <video style={{ height: '45%' }} id="localVideo" muted autoPlay playsInline></video>
                <video style={{ height: '45%' }} id="remoteVideo" autoPlay playsInline></video>
                {/* {videoCallButtonClicked ? (
                    <>

                    </>) : (<p>Waiting for video call initiation...</p>)
                } */}
                <div style={{ height: '10%', width: '100%' }}>
                    <div className="footer" style={{ backgroundColor: 'purple', height: '100%', width: '100%' }}>
                        <button onClick={hangVideoCall}>Hang up</button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default VideoChat;