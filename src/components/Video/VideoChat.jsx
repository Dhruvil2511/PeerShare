import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import firebaseConfig from '../../config/firebaseconfig';
import configuration from '../../config/iceconfig';
import '../Video/VideoChat.scss'
import { toast } from 'react-toastify';

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
let db, dbVideo = null;
let userRef = null;

const VideoChat = ({ peerApfpId, peerBpfpId }) => {
    let { id } = useParams();

    const [flag, setFlag] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [videoCallButtonClicked, setVideoCallButtonClicked] = useState({ clickedBy: null, clicked: false, verdict: '' });
    const [callAccepted, setCallAccepted] = useState(false);
    const [showVidIcon, setShowVidIcon] = useState(false);
    const [videoCallButtonState, setVideoCallButtonState] = useState(true);

    useEffect(() => {
        db = firebase.firestore();
        dbVideo = firebase.firestore();
        userRef = db.collection('users').doc(`${id}`);
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
                if (!data.videoCallHandle.clicked) {
                    callConnected = false;
                    setCallAccepted(false);
                    setIsMicOn(true);
                    setIsVideoOn(true);
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
                }
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (showVidIcon || window.screen.width <= 800) setShowVidIcon(true);
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 800) setShowVidIcon(true)
            else setShowVidIcon(false)
        })
    }, []);

    async function openUserMedia() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(
                { video: true, audio: true });
            document.querySelector('#localVideo').srcObject = stream;
            localStream = stream;
            remoteStream = new MediaStream();
            document.querySelector('#remoteVideo').srcObject = remoteStream;
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                // User denied permission for audio and/or video
                console.error('User denied permission for audio and/or video.');
                toast('Please accept the permission for video and audio', { theme: 'dark' });
            }
            else if (error.name === 'NotFoundError') {
                // The requested media was not found (e.g., no camera/microphone available)
                console.error('Cannot find video or audio resource.');
                toast('Cannot find video or audio source', { theme: 'dark' });
            }
            else {
                // Handle other types of errors
                console.error('Error accessing media devices:', error);
            }
        }

    }

    async function initializeLocalConnection() {
        await openUserMedia();
        const roomRef = await db.collection('videoCon').doc(`${id}`);

        console.log('Create local with configuration: ', configuration);
        localConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners(localConnection);

        videoSignalChannel = localConnection.createDataChannel('videoSignalChannel');
        initializeChannelListeners(videoSignalChannel);

        if (localStream) {

            localStream.getTracks().forEach(track => {
                localConnection.addTrack(track, localStream);
            });
        }

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
                if (remoteStream) remoteStream.addTrack(track);
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

            if (localStream) {
                localStream.getTracks().forEach(track => {
                    remoteConnection.addTrack(track, localStream);
                });
            }

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
                    if (remoteStream) remoteStream.addTrack(track);
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
                        if (remoteConnection) await remoteConnection.addIceCandidate(new RTCIceCandidate(data));
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
                setIsMicOn(true);
                setIsVideoOn(true);
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
        let userRef = db.collection('users').doc(`${id}`);

        userRef.onSnapshot(async (snapshot) => {
            var data = snapshot.data();
            console.log(data);
            if (data && data.videoCallHandle) {
                if (data.videoCallHandle && data.videoCallHandle.clickedBy === null) {
                    setVideoCallButtonState(false);
                }
            }
        });

        val === 'peerA' ? await userRef.set({ videoCallHandle: { clickedBy: 'peerA', clicked: true, verdict: '' } }) : await userRef.set({ videoCallHandle: { clickedBy: 'peerB', clicked: true, verdict: '' } });

    }
    return (
        <>
            {showVidIcon && !videoCallButtonClicked.clicked && <div style={{ height: '78vh', display: 'flex', alignItems: 'center' }}><button className='videoBtn2' title={'Video Call'} onClick={handlevideoCallButtonState}>Start Video Call</button></div>}
            {videoCallButtonClicked.clicked &&
                <div className="video" >
                    <div className="first">
                        {
                            sessionStorage.getItem('peerRole') === 'peerA' ? <img className='local-pfp' src={`https://api.multiavatar.com/${peerApfpId}.png?apikey=${process.env.REACT_APP_AVATAR_API_KEY}`} alt="X" /> : <img className='local-pfp' src={`https://api.multiavatar.com/${peerBpfpId}.png?apikey=${process.env.REACT_APP_AVATAR_API_KEY}`} alt="X" />
                        }

                        <video id="localVideo" muted autoPlay playsInline></video>
                    </div>
                    <div className="second">
                        {
                            sessionStorage.getItem('peerRole') === 'peerA' ? <img className='remote-pfp' src={`https://api.multiavatar.com/${peerBpfpId}.png?apikey=${process.env.REACT_APP_AVATAR_API_KEY}`} alt="X" /> : <img className='remote-pfp' src={`https://api.multiavatar.com/${peerApfpId}.png?apikey=${process.env.REACT_APP_AVATAR_API_KEY}`} alt="X" />
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

export default VideoChat;