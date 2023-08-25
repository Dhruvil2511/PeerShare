import React, { useEffect, useState } from 'react'
import Transfer from '../Transfer/Transfer'
import Chat from '../Chat/Chat'
import Footer from '../Footer/Footer'
import { useParams } from 'react-router-dom'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import VideoChat from '../Video/VideoChat'
import Navbar from '../Navbar/Navbar'
import ClipLoader from 'react-spinners/ClipLoader'
import Preloader from '../Loader/Preloader'

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

firebase.initializeApp(firebaseConfig);

let userRef = null;
let answer = null;
let localConnection = null;
let remoteConnection = null;
let channel = null;
let dummyChannel = null;

const Room = () => {
    let { id } = useParams();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {

        let checkPeerRole = localStorage.getItem('peerRole');
        if (checkPeerRole === 'peerA') {
            generateID();
        } else if (checkPeerRole === 'peerB') {
            joinRoom();
        } else {
            // If peerRole is not set, assume Peer B by default
            localStorage.setItem('peerRole', 'peerB');
            joinRoom();
        }
    }, []);


    async function generateID() {

        const db = firebase.firestore();
        userRef = await db.collection('users').doc(`${id}`);
        console.log('generate id called');
        console.log('Creating local connection');

        localConnection = new RTCPeerConnection(configuration);
        initializeIceListeners(localConnection);

        dummyChannel = localConnection.createDataChannel('dummyChannel');
        // initializeDataChannelListeners(dataChannel);

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
        // setting offer in firestore for roomID
        const btn = { 'peerAVideoClick': false };
        // userRef.set(btn);
        await userRef.set(peerOffer);
        // await userRef.set({ 'peerAVideoClick': false });
        // setConnectionId(userRef.id);

        userRef.onSnapshot(async (snapshot) => {
            const data = snapshot.data();
            if (data && data.answer) {
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
        localStorage.setItem('senderId', id);
    }


    async function joinRoom() {
        // steps 1: create databse var and create fireebase instance
        const db = firebase.firestore();
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
        }
    }

    function initializeIceListeners(connection) {
        connection.addEventListener('icegatheringstatechange', () => {
            console.log(`ICE gathering state changed: ${connection.iceGatheringState}`);
        });

        // connection state change -> event for checking wheter connection failed or success
        connection.addEventListener('connectionstatechange', async () => {
            if (connection.connectionState === 'disconnected') {
                localStorage.removeItem('senderId');
            }
            else if (connection.connectionState === 'connected') {
                setIsConnected(true);
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


    return (
        <>
            {!isConnected && <Preloader />}
            {isConnected && <Navbar />}
            <div style={{ display: 'flex' }}>
                {isConnected && <Transfer localConnection={localConnection} remoteConnection={remoteConnection} />}
                {isConnected && <VideoChat localConnection={localConnection} remoteConnection={remoteConnection} />}
                {isConnected && <Chat localConnection={localConnection} remoteConnection={remoteConnection} />}
            </div>
        </>
    )
}

export default Room;