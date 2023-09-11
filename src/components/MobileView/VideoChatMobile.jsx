import React, { useEffect, useState } from 'react'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useParams } from 'react-router-dom';
import './VideoChatMobile.scss'
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicOffIcon from '@mui/icons-material/MicOff';
import axios from 'axios';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideoCallIcon from '@mui/icons-material/VideoCall';
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
    iceCandidatePoolSize: 10,
};

firebase.initializeApp(firebaseConfig);
let remoteStream = null;
let localStream = null;
let data = null;
let val = null;
let localConnection = null;
let remoteConnection = null;
let channel = null;
let videoSignalChannel = null;
let callConnected = false;


const VideoChatMobile = ({ peerApfpId, peerBpfpId }) => {
    let { id } = useParams();

    const [flag, setFlag] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [videoCallButtonClicked, setVideoCallButtonClicked] = useState({ clickedBy: null, clicked: false, verdict: '' });
    const [callAccepted, setCallAccepted] = useState(false);
    const [clickedBy,setClickedBy]=useState('')
    const [videoCallButtonState, setVideoCallButtonState] = useState(true);

    useEffect(() => {
        const db = firebase.firestore();
        let userRef = db.collection('users').doc(`${id}`);
        val = sessionStorage.getItem('peerRole');
        const unsubscribe = userRef.onSnapshot(async (snapshot) => {
            data = snapshot.data();
            if (data && data.videoCallHandle) {
                setVideoCallButtonClicked(data.videoCallHandle); // clickedby ; peerA , clickted : true 
                if (data.videoCallHandle.clicked && !callConnected) {
                    setTimeout(async () => {
                        if (((data.videoCallHandle.clickedBy === 'peerA' && val === 'peerA') || (data.videoCallHandle.clickedBy === 'peerB' && val === 'peerB')) && data.videoCallHandle.verdict === '') {
                            initializeLocalConnection();
                        }
                        else {
                            if (((data.videoCallHandle.clickedBy !== 'peerA' && val === 'peerA') || (data.videoCallHandle.clickedBy !== 'peerB' && val === 'peerB')) && data.videoCallHandle.verdict === 'accepted') {
                                initializeRemoteConnection();
                            }
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
        await openUserMedia();
        const db = firebase.firestore();
        const roomRef = await db.collection('videoCon').doc(`${id}`);

        console.log('Create local with configuration: ', configuration);
        localConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners(localConnection);

        videoSignalChannel = localConnection.createDataChannel('videoSignalChannel');
        initializeChannelListeners(videoSignalChannel);


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


    function initializeChannelListeners(channel) {
        channel.bufferedAmountLowThreshold = 15 * 1024 * 1024;
        channel.addEventListener('open', () => {

            if (channel.label === 'videoSignalChannel')
                console.log('video signal channel opened');
        });
        channel.addEventListener('message', (event) => {
            if (channel.label === 'videoSignalChannel') {
                const message = event.data;
                if (message === 'video_off') {
                    document.getElementById('remoteVideo').style.display = "none";
                    document.querySelector('.remote-pfp').style.display = "block";

                }
                else if (message === 'video_on') {
                    document.getElementById('remoteVideo').style.display = "block";
                    document.querySelector('.remote-pfp').style.display = "none";
                }
            }
        });

        channel.addEventListener('close', (event) => {
            if (channel.label === 'videoSignalChannel') {
                console.log('video signal channel closed');
            }
        });
    }
    async function initializeRemoteConnection() {
        setFlag(false);
        await openUserMedia();
        const db = firebase.firestore();
        const roomRef = await db.collection('videoCon').doc(`${id}`);
        const roomSnapshot = await roomRef.get();

        if (roomSnapshot.exists) {
            remoteConnection = new RTCPeerConnection(configuration);
            registerPeerConnectionListeners(remoteConnection);



            remoteConnection.addEventListener('datachannel', (event) => {

                channel = event.channel;
                if (channel.label === 'videoSignalChannel') {
                    remoteConnection.videoSignalChannel = channel;
                }

                channel.addEventListener('message', (event) => {

                    if (channel.label === 'videoSignalChannel') {
                        const message = event.data;
                        if (message === 'video_off') {
                            document.getElementById('remoteVideo').style.display = "none";
                            document.querySelector('.remote-pfp').style.display = "block";

                        } else if (message === 'video_on') {
                            document.getElementById('remoteVideo').style.display = "block";
                            document.querySelector('.remote-pfp').style.display = "none";

                        }
                    }
                });

            });
            
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
        callConnected = false;
        setCallAccepted(false);
        setIsMicOn(true);
        setIsVideoOn(true);
        const dbUser = firebase.firestore();
        let userRef = await dbUser.collection('users').doc(`${id}`);
        await userRef.set({ videoCallHandle: { clickedBy: null, clicked: false, verdict: '' } });

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

        localConnection = null;
        remoteConnection = null;
        localStream = null;
        remoteStream = null;
    }
    function registerPeerConnectionListeners(connection) {
        connection.addEventListener('icegatheringstatechange', () => {
            console.log(
                `ICE gathering state changed: ${connection.iceGatheringState}`);
        });

        connection.addEventListener('connectionstatechange', () => {
            if (connection.connectionState === 'connected') {
                callConnected = true;
                setCallAccepted(true);
            }
            else if (connection.connectionState === 'disconnected') {
                callConnected = false;
                setCallAccepted(false);
            }
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
        let val = sessionStorage.getItem('peerRole');
        if (localStream) localStream.getVideoTracks()[0].enabled = !isVideoOn;

        let message;
        if (isVideoOn) {
            message = 'video_off';
            document.getElementById('localVideo').style.display = "none";
            document.querySelector('.local-pfp').style.display = "block";
        }
        else {
            document.querySelector('.local-pfp').style.display = "none";
            document.getElementById('localVideo').style.display = "block";
            message = 'video_on';
        }

        if (val === 'peerA') videoSignalChannel.send(message);
        else remoteConnection.videoSignalChannel.send(message);

        setIsVideoOn(!isVideoOn);
    }
    async function handleMicOn() {

        if (localStream) localStream.getAudioTracks()[0].enabled = !isMicOn;

        setIsMicOn(!isMicOn);
    }

    async function handleAcceptCall() {
        setCallAccepted(true);
        const dbUser = firebase.firestore();
        let userRef = await dbUser.collection('users').doc(`${id}`);
        await userRef.set({ videoCallHandle: { clickedBy: val === 'peerB' ? 'peerA' : 'peerB', clicked: true, verdict: 'accepted' } });
    }
    async function handlevideoCallButtonState(event) {
        const db = firebase.firestore();
        let userRef = db.collection('users').doc(`${id}`);

        userRef.onSnapshot(async (snapshot) => {
            var data = snapshot.data();
            console.log(data);
            if (data && data.videoCallHandle) {
                if (data.videoCallHandle && data.videoCallHandle.clickedBy === null) {
                    document.querySelector('.videoBtn').disabled = false;
                    setVideoCallButtonState(false);
                }
            }
        });

        if (videoCallButtonState) {
            document.querySelector('.videoBtn').disabled = true;
        }

        let val = sessionStorage.getItem('peerRole');
        val === 'peerA' ? await userRef.set({ videoCallHandle: { clickedBy: 'peerA', clicked: true, verdict: '' } }) : await userRef.set({ videoCallHandle: { clickedBy: 'peerB', clicked: true, verdict: '' } });

    }
    return (
        <>
                <button className='videoBtn' title={'Video Call'} style={{ background: 'rgb(26, 240, 161)', border: '1px solid white' }} onClick={handlevideoCallButtonState}>
                    {/* <VideoCallIcon style={{ transform: `scale(${1.4})`, width: '100%', color: 'rgb(26, 240, 161)' }} /> */}
                    Start Video Call
                </button>
                {videoCallButtonClicked.clicked &&
                <div className="video" >
                    <div className="first">
                        {
                            sessionStorage.getItem('peerRole') === 'peerA' ? <img className='local-pfp' src={`https://api.multiavatar.com/${peerApfpId}.png?apikey=GlfxOwCHERyz56`} alt="X" /> : <img className='local-pfp' src={`https://api.multiavatar.com/${peerBpfpId}.png?apikey=GlfxOwCHERyz56`} alt="X" />
                        }

                        <video id="localVideo" muted autoPlay playsInline></video>
                    </div>
                    <div className="second">
                        {
                            sessionStorage.getItem('peerRole') === 'peerA' ? <img className='remote-pfp' src={`https://api.multiavatar.com/${peerBpfpId}.png?apikey=GlfxOwCHERyz56`} alt="X" /> : <img className='remote-pfp' src={`https://api.multiavatar.com/${peerApfpId}.png?apikey=GlfxOwCHERyz56`} alt="X" />
                        }
                        <video id="remoteVideo" autoPlay playsInline></video>
                    </div>


                    <div className="footer">
                        {((val === 'peerA' && videoCallButtonClicked.clickedBy === 'peerB') || (val === 'peerB' && videoCallButtonClicked.clickedBy === 'peerA')) && (!callAccepted) &&
                            <div className="accept-reject">
                                <button className='video-call-accept'>
                                    <CallIcon sx={{ fontSize: { xs: 12, sm: 16, md: 25, lg: 30 } }} className='accept-call' onClick={handleAcceptCall} />
                                </button>
                                <button className='end-call-button' onClick={hangVideoCall}>
                                    <CallEndIcon sx={{ fontSize: { xs: 12, sm: 16, md: 25, lg: 30 } }} className='end-call' />
                                </button>
                            </div>
                        }
                        {
                            ((val === 'peerA' && videoCallButtonClicked.clickedBy === 'peerA') || (val === 'peerB' && videoCallButtonClicked.clickedBy === 'peerB') || (callAccepted)) && <div className='footer-in'>
                                {isVideoOn ?
                                    <button className='video-on-button' onClick={handleVideoOn}>
                                        <VideocamIcon sx={{ fontSize: { xs: 12, sm: 16, md: 25, lg: 30 } }} className='video-on' />
                                    </button> : <button className='video-off-button' onClick={handleVideoOn}>
                                        <VideocamOffIcon sx={{ fontSize: { xs: 12, sm: 16, md: 25, lg: 30 } }} className='video-off' />
                                    </button>
                                }
                                {isMicOn ?
                                    <button className='mic-on-button' onClick={handleMicOn}>
                                        <MicIcon sx={{ fontSize: { xs: 12, sm: 16, md: 25, lg: 30 } }} className='mic-on' />
                                    </button> : <button className='mic-off-button' onClick={handleMicOn}>
                                        <MicOffIcon className='mic-off' sx={{ fontSize: { xs: 12, sm: 16, md: 25, lg: 30 } }} />
                                    </button>
                                }

                                <button className='end-call-button' onClick={hangVideoCall}>
                                    <CallEndIcon sx={{ fontSize: { xs: 12, sm: 16, md: 25, lg: 30 } }} className='end-call' />
                                </button>
                            </div>
                        }


                    </div>
                </div>
            }
        </>
    )
}

export default VideoChatMobile;