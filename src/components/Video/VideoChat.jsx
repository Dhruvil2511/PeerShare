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

firebase.initializeApp(firebaseConfig);
let userRef = null;
let remoteStream = null;
let localStream = null;
let data = null;
let val = null;
let dummyCH;

const VideoChat = ({ localConnection, remoteConnection }) => {
    let { id } = useParams();
    const [videoCaller, setVideoCaller] = useState('');
    const [videoCallButtonClicked, setVideoCallButtonClicked] = useState({ clicked: false, clickedBy: null });


    useEffect(() => {
        const db = firebase.firestore();
        let userRef = db.collection('users').doc(`${id}`);
        const unsubscribe = userRef.onSnapshot(async (snapshot) => {
            data = snapshot.data();
            if (data && data.videoCallHandle) {
                // await openUserMedia();
                setVideoCallButtonClicked(data.videoCallHandle);
                val = localStorage.getItem('peerRole');
                val === 'peerA' ? initializeLocalConnection() : initializeRemoteConnection();
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);


    // async function openUserMedia() {
    //     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //     document.querySelector('#localVideo').srcObject = stream;
    //     localStream = stream;
    //     remoteStream = new MediaStream();
    //     document.querySelector('#remoteVideo').srcObject = remoteStream;
    // }


    async function initializeLocalConnection() {
        console.log(localConnection);
        localConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            // peerA.add(event.candidate.toJSON());
        });
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        remoteStream = new MediaStream();

        localStream.getTracks().forEach(track => {
            localConnection.addTrack(track, localStream);
        });

        localConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };
        document.querySelector('#localVideo').srcObject = localStream;
        document.querySelector('#remoteVideo').srcObject = remoteStream;

        // localConnection.addEventListener('track', event => {
        //     console.log('Got remote track:', event.streams[0]);
        //     event.streams[0].getTracks().forEach(track => {
        //         console.log('Add a track to the remoteStream:', track);
        //         remoteStream.addTrack(track);
        //     });
        // });
    }
    async function initializeRemoteConnection() {
        console.log(remoteConnection);
        remoteConnection.addEventListener('icecandidate', (event) => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            // peerB.add(event.candidate.toJSON());

        });
        // console.log('Got room:', roomSnapshot.exists);

        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        remoteStream = new MediaStream();


        localStream.getTracks().forEach(track => {
            remoteConnection.addTrack(track, localStream);
        });

        // remoteConnection.addEventListener('track', event => {
        //     console.log('Got remote track:', event.streams[0]);
        //     event.streams[0].getTracks().forEach(track => {
        //         console.log('Add a track to the remoteStream:', track);
        //         remoteStream.addTrack(track);
        //     });
        // });

        remoteConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };
        document.querySelector('#localVideo').srcObject = localStream;
        document.querySelector('#remoteVideo').srcObject = remoteStream;

    }
    async function hangVideoCall() {
        const db = firebase.firestore();
        let userRef = db.collection('users').doc(`${id}`);
        await userRef.set({ videoCallHandle: { clickedBy: null, clicked: false } });
        document.querySelector('#localVideo').srcObject = null;
        document.querySelector('#remoteVideo').srcObject = null;

        const tracks = document.querySelector('#localVideo').srcObject.getTracks();
        tracks.forEach(track => {
            track.stop();
        });
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
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