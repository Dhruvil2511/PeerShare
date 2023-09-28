import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isMobile } from 'react-device-detect';
import { toast } from 'react-toastify';
import { v4 } from 'uuid';
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import CircleIcon from '@mui/icons-material/Circle';
import DuoIcon from '@mui/icons-material/Duo';
import ChatIcon from '@mui/icons-material/Chat';
import IosShareIcon from '@mui/icons-material/IosShare';
import Transfer from '../Transfer/Transfer'
import Chat from '../Chat/Chat'
import VideoChat from '../Video/VideoChat'
import Preloader from '../Loader/Preloader'
import { name } from '../../utils/name';
import { ReactComponent as ReactLogo } from '../../assets/logo.svg';
import firebaseConfig from '../../config/firebaseconfig';
import configuration from '../../config/iceconfig';
import '../JoinRoom/Room.scss'

firebase.initializeApp(firebaseConfig);


let userRef = null;
let answer = null;
let localConnection = null;
let remoteConnection = null;
let dummyChannel = null;
let channel = null;
let peerAName = '';
let peerApfpId = '';
let peerBName = '';
let peerBpfpId = '';
let db = null;
const Room = () => {
    let { id } = useParams();
    const [isConnected, setIsConnected] = useState(false);
    const [avatar, setAvatar] = useState('');
    const [userConnected, setUserConnected] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [mobileView, setMobileView] = useState(false);
    const [chatLoaded, setChatLoaded] = useState(false);
    let checkPeerRole = sessionStorage.getItem('peerRole');
    useEffect(() => {
        try {
            db = firebase.firestore();
        } catch (error) {
            console.error('Error intializing Database');
        }

        if (checkPeerRole === 'peerA') {
            generateID();

        } else if (checkPeerRole === 'peerB') {
            setTimeout(() => {
                joinRoom();
            }, 2000);

        } else {
            sessionStorage.setItem('peerRole', 'peerB');
            setTimeout(() => {
                joinRoom();
            }, 2000);

        }
    }, []);

    useEffect(() => {
        if (isMobile || window.screen.width <= 800) {
            setMobileView(true);
        }
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 800) {
                setMobileView(true)
            }
            else {
                setMobileView(false)
            }
        })
    }, []);

    useEffect(() => {
        if (isConnected) {
            if (checkPeerRole === 'peerB') {
                setChatLoaded(true);
            }
            else {
                setTimeout(() => {
                    setChatLoaded(true);
                }, 2000);
            }
        }

    }, [isConnected]);



    async function fetchAvatar() {
        let key = '';
        sessionStorage.getItem('peerRole') === 'peerA' ? key = peerApfpId : key = peerBpfpId;
        axios.get(`https://api.multiavatar.com/${key}.png?apikey=${process.env.REACT_APP_AVATAR_API_KEY}`).then((response) => {
            setAvatar(response.config.url);
        }).catch((error) => {
            console.log('Something Wrong in profile api' + error.message)
        });
    }
    async function generateID() {
        console.log('Peer A');
        userRef = await db.collection('users').doc(`${id}`);


        console.log('Creating local connection');
        localConnection = new RTCPeerConnection(configuration);
        initializeIceListeners(localConnection);

        dummyChannel = localConnection.createDataChannel('dummyChannel');
        peerAName = name;
        peerApfpId = v4();

        dummyChannel.addEventListener('open', () => {
            console.log('Dummy channel opened');
            const detail = {
                name: peerAName,
                id: peerApfpId
            }
            try {
                dummyChannel.send(JSON.stringify(detail));
            } catch (error) {
                console.error('Exchange Channel is not open!');
                toast('Please try to make new room!', { theme: 'dark' });
            }
            fetchAvatar();
        });

        dummyChannel.addEventListener('message', async (event) => {
            if (event.data) {
                let details = JSON.parse(event.data);
                peerBName = await details.name;
                peerBpfpId = await details.id;
                console.log('details are: ' + JSON.stringify(details));
                setShowChat(true);
            }
        });
        localConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            peerA.add(event.candidate.toJSON());
        });

        const peerA = userRef.collection('peerA');

        const offer = await localConnection.createOffer();
        await localConnection.setLocalDescription(offer);
        console.log('Got offer: ', offer);
        console.log('local connection ', localConnection);

        // creating room schema object 
        const peerOffer = {
            'offer': {
                type: offer.type,
                sdp: offer.sdp
            },
        };

        await userRef.set(peerOffer);
        // await userRef.set({ 'peerAVideoClick': false });
        // setConnectionId(userRef.id);

        userRef.onSnapshot(async (snapshot) => {
            const data = snapshot.data();
            if (data && data.answer && !data.file) {
                console.log('We got remote description: ', data.answer);
                if (localConnection) {
                    const ans = new RTCSessionDescription(data.answer);
                    await localConnection.setRemoteDescription(ans);
                }

            }
        });

        userRef.collection('peerB').onSnapshot(async (snapshot) => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    if (localConnection.remoteDescription)
                        await localConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
    }


    async function joinRoom() {

        // check if id exists 
        userRef = db.collection('users').doc(`${id}`);
        const peerB = userRef.collection('peerB');
        const roomId = await userRef.get();

        console.log('Got room:', roomId.exists);

        if (roomId.exists) {

            remoteConnection = new RTCPeerConnection(configuration);

            initializeIceListeners(remoteConnection);
            remoteConnection.addEventListener('icecandidate', (event) => {
                if (!event.candidate) {
                    console.log('Got final candidate!');
                    return;
                }
                console.log('Got candidate: ', event.candidate);
                peerB.add(event.candidate.toJSON());

            });
            peerBName = name;
            peerBpfpId = v4();

            remoteConnection.addEventListener('datachannel', async (event) => {
                channel = event.channel;


                if (channel.label === 'dummyChannel') {
                    remoteConnection.dummyChannel = channel;
                    channel.onmessage = async (e) => {
                        let details = JSON.parse(e.data);
                        peerAName = await details.name;
                        peerApfpId = await details.id;
                        fetchAvatar();
                        setShowChat(true);
                        console.log('details are: ' + JSON.stringify(details));
                    };
                }

                channel.onopen = async (e) => {
                    console.log(channel.label + ' opened');

                    if (channel.label === 'dummyChannel') {
                        setTimeout(() => {
                            const detail = {
                                name: peerBName,
                                id: peerBpfpId
                            }
                            try {
                                remoteConnection.dummyChannel.send(JSON.stringify(detail));
                            } catch (error) {
                                console.error('Exchange Channel doesnot exists');
                            }
                        }, 500);

                    }

                };

            });

            const receivedOffer = await roomId.data().offer;
            console.log('Got offer: ', receivedOffer);
            if (receivedOffer) {
                await remoteConnection.setRemoteDescription(receivedOffer);
                answer = await remoteConnection.createAnswer();
                await remoteConnection.setLocalDescription(answer);

                const peerAnswer = {
                    answer: {
                        type: answer.type,
                        sdp: answer.sdp
                    },
                }
                await userRef.update(peerAnswer);

            }
            else {
                console.error('Unable to receive SDP Offer from peer A. Try to make connection Again');
            }

            // console.log(remoteConnection);
            userRef.collection('peerA').onSnapshot(snapshot => {
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        let data = change.doc.data();
                        console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                        if (remoteConnection.remoteDescription) await remoteConnection.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });
        } else {
            toast('Room not found. Try creating room again!', { theme: 'dark' });
            return;
        }
    }


    function initializeIceListeners(connection) {
        connection.addEventListener('icegatheringstatechange', () => {
            console.log(`ICE gathering state changed: ${connection.iceGatheringState}`);
        });

        // connection state change -> event for checking wheter connection failed or success
        connection.addEventListener('connectionstatechange', async () => {
            if (connection.connectionState === 'connected') {
                setIsConnected(true);
            }
            else if (connection.connectionState === 'disconnected') {
                setUserConnected(false);
                setTimeout(async () => {
                    alert('Peer Left. Redirecting to Home');
                    if (localConnection) localConnection.close();
                    if (remoteConnection) remoteConnection.close();

                    sessionStorage.clear();
                    userRef = db.collection('users').doc(id);
                    const peerA = await userRef.collection('peerA').get();
                    peerA.forEach(async candidate => {
                        await candidate.ref.delete();
                    });
                    const peerB = await userRef.collection('peerB').get();
                    peerB.forEach(async candidate => {
                        await candidate.ref.delete();
                    });
                    await userRef.delete();
                    window.location.href = '/join';
                }, 3000);
            }
            console.log(`Connection state change: ${connection.connectionState}`);
        });

        // event for checking stability of signaling
        connection.addEventListener('signalingstatechange', () => {
            console.log(`Signaling state change: ${connection.signalingState}`);
        });

        // event for noticing whenever we get new ice candidate
        connection.addEventListener('iceconnectionstatechange', () => {
            console.log(
                `ICE connection state change: ${connection.iceConnectionState}`);
        });
    }


    async function leaveRoom() {
        if (localConnection) localConnection.close();
        if (remoteConnection) remoteConnection.close();

        sessionStorage.clear();
        userRef = db.collection('users').doc(id);
        const peerA = await userRef.collection('peerA').get();
        peerA.forEach(async candidate => {
            await candidate.ref.delete();
        });
        const peerB = await userRef.collection('peerB').get();
        peerB.forEach(async candidate => {
            await candidate.ref.delete();
        });
        await userRef.delete();
        alert('Disconnecting');
        window.location.href = '/join';
    }

    return (
        <>
            {!isConnected && !peerApfpId && !peerBpfpId && <Preloader />}

            {isConnected && peerApfpId && peerBpfpId &&
                <div className="navbar" id='navbarForId'>
                    <div className="logo">
                        <div className="logo_name">
                            <ReactLogo className='.img' />
                            <div className="name-motive">
                                <span className='name'>PeerShare</span>
                                <span className='motive'>Your Files, Your Way, PeerShare Today!</span>
                            </div>

                        </div>

                    </div>
                    <div className="both">
                        <div className="user-info">
                            <img className='user-pfp' src={avatar} alt="X" />
                            <span className='text'>
                                {
                                    sessionStorage.getItem('peerRole') === 'peerA' ? peerAName : peerBName
                                }
                            </span>
                            <div className="room-buttons">
                                <button className="leave-button" title='exit' onClick={leaveRoom}><PowerSettingsNewIcon sx={{ fontSize: { xs: 8, sm: 14, md: 22, lg: 28 } }} /></button>
                            </div>
                        </div>

                    </div>
                    <div className="connection-status">
                        <div className='status'>
                            {
                                userConnected ? <><CircleIcon sx={{ fontSize: { xs: 5, sm: 8, md: 10, lg: 15 } }} color='success' style={{ marginBottom: '5%' }} /> <span id='status' style={{ fontSize: '1.1vw' }}>Connected</span> </> : <><CircleIcon sx={{ fontSize: { xs: 5, sm: 8, md: 10, lg: 15 } }} color='error' style={{ marginBottom: '5%' }} /> <span style={{ fontSize: '1.1vw' }}>Disconnected</span> </>
                            }
                        </div>
                    </div>
                </div>
            }
            {
                !mobileView &&
                <div className='room-wrapper' style={{ display: 'flex', padding: '1%' }}>
                    {isConnected && <Transfer localConnection={localConnection} remoteConnection={remoteConnection} />}
                    {isConnected && showChat && <VideoChat peerApfpId={peerApfpId} peerBpfpId={peerBpfpId} localConnection={localConnection} remoteConnection={remoteConnection} />}
                    {isConnected && showChat &&
                        chatLoaded &&
                        <Chat peerAName={peerAName} peerBName={peerBName} peerApfpId={peerApfpId} peerBpfpId={peerBpfpId} localConnection={localConnection} remoteConnection={remoteConnection} />
                    }
                </div>
            }

            {
                (!isConnected && !peerBpfpId) ? <Preloader /> :
                    mobileView &&

                    <>
                        <div id='mobdiv' style={{ display: 'flex', flexDirection: 'row', height: '5vh', justifyContent: 'center', margin: '2% 0% 2% 0%' }}>
                            <img className='user-pfp' src={avatar} alt="X" />
                            <div style={{ color: 'yellow', alignSelf: 'center', marginLeft: '2%' }}>{sessionStorage.getItem('peerRole') === 'peerA' ? peerAName : peerBName}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <div id='mobTransfer' style={{ width: '100vw' }}>{isConnected && <Transfer localConnection={localConnection} remoteConnection={remoteConnection} />}</div>
                            <div id='mobChat' style={{ width: '100vw', display: 'none' }}>  {isConnected && showChat &&
                                chatLoaded &&
                                <Chat peerAName={peerAName} peerBName={peerBName} peerApfpId={peerApfpId} peerBpfpId={peerBpfpId} localConnection={localConnection} remoteConnection={remoteConnection} />
                            }
                            </div>
                            <div id='mobVideoChat' style={{ width: '100vw', display: 'none' }}>  {isConnected && showChat && <VideoChat peerApfpId={peerApfpId} peerBpfpId={peerBpfpId} localConnection={localConnection} remoteConnection={remoteConnection} />}</div>
                        </div>
                        <div className='bottom-nav-bar' style={{ display: 'flex', flexDirection: 'row' }}>


                            <button className='nav-buttons active' id='fileshare' onClick={() => {
                                document.getElementById('mobdiv').style.display = 'flex';
                                document.getElementById('mobTransfer').style.display = 'block';
                                document.getElementById('mobChat').style.display = 'none';
                                document.getElementById('mobVideoChat').style.display = 'none';
                                document.getElementById('fileshare').style.color = '#0A82FD';
                                document.getElementById('chatmob').style.color = 'white';
                                document.getElementById('videomob').style.color = 'white';
                            }}>
                                <IosShareIcon sx={{ fontSize: { xs: 25, sm: 25, md: 40, lg: 50 } }} />
                            </button>


                            <button id='chatmob' className='nav-buttons' onClick={() => {
                                document.getElementById('mobdiv').style.display = 'none';
                                document.getElementById('mobTransfer').style.display = 'none'
                                document.getElementById('mobChat').style.display = 'block'
                                document.getElementById('mobVideoChat').style.display = 'none'
                                document.getElementById('chatmob').style.color = '#0A82FD';
                                document.getElementById('videomob').style.color = 'white';
                                document.getElementById('fileshare').style.color = 'white';
                                document.querySelector('.active').style.color = 'white';
                            }}>
                                <ChatIcon sx={{ fontSize: { xs: 25, sm: 25, md: 40, lg: 50 } }} />
                            </button>


                            <button id='videomob' className='nav-buttons' onClick={() => {
                                document.getElementById('mobdiv').style.display = 'flex';
                                document.getElementById('mobTransfer').style.display = 'none'
                                document.getElementById('mobChat').style.display = 'none'
                                document.getElementById('mobVideoChat').style.display = 'block'
                                document.getElementById('videomob').style.color = '#0A82FD';
                                document.getElementById('chatmob').style.color = 'white';
                                document.getElementById('fileshare').style.color = 'white';
                                document.querySelector('.active').style.color = 'white';
                            }}>
                                <DuoIcon sx={{ fontSize: { xs: 25, sm: 25, md: 40, lg: 50 } }} />
                            </button>


                        </div>
                    </>
            }
        </>
    )
}

export default Room;