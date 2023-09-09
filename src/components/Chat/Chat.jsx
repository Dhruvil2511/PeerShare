import React, { useEffect, useState } from 'react'
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useParams } from 'react-router-dom';
import '../Chat/Chat.scss'
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import animation from './FINAL.json'
import Lottie from 'lottie-react';
import DeleteIcon from '@mui/icons-material/Delete';

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


let messageChannel;
var scale = 'scale(1.5)';
let channel;
let d;
// let message = null;

const Chat = ({ peerAName, peerBName, peerApfpId, peerBpfpId, localConnection, remoteConnection }) => {
    let { id } = useParams();
    const [avatar, setAvatar] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const [message, setMessage] = useState('');
    const [videoCallButtonState, setVideoCallButtonState] = useState(true);
    // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const chatbox = document.querySelector(".chatBox");

    // let {id} = useParams();

    useEffect(() => {
        let checkPeerRole = sessionStorage.getItem('peerRole');
        if (checkPeerRole === 'peerA') {
            initializeLocalConnection();
        } else {
            initializeRemoteConnection();
        }

        fetchAvatar();
    }, []);

    async function initializeLocalConnection() {
        console.log(localConnection);
        messageChannel = localConnection.createDataChannel('messageChannel');
        messageChannel.addEventListener('open', () => {
            console.log('Message channel opened');
        });

        messageChannel.addEventListener('message', (event) => {
            if (event.data) {
                console.log(event.data);
                setMessageList(prevList => [...prevList, { id: Math.floor(Math.random() * 100), 'role': 'peerB', 'message': event.data, time: fetchTime() }]);
            }
        });

        messageChannel.addEventListener('close', (event) => {
            console.log('Message channel closed');
        });
    }
    async function initializeRemoteConnection() {

        remoteConnection.addEventListener('datachannel', async (event) => {
            channel = event.channel;
            if (channel.label === 'messageChannel') {
                remoteConnection.messageChannel = channel;
                channel.onmessage = recieveMessage;
            }
            channel.onopen = event => {
                if(channel.label ==='messageChannel')  console.log(channel.label + " opened");
            }

            channel.onclose = event => {
                if(channel.label ==='messageChannel') console.log(channel.label + " closed");
            }

        });
    }
    function fetchTime() {
        const time = new Date();
        let str = time.getHours();
        time.getMinutes() < 10 ? str += ': 0' + time.getMinutes() : str += ':' + time.getMinutes();
        return str;
    }

    async function recieveMessage(e) {
        console.log('recieved message from peerA : ' + e.data);
        setMessageList(prevList => [...prevList, { id: Math.floor(Math.random() * 100), 'role': 'peerA', 'message': e.data, time: fetchTime() }]);
    }
    const sendMessage = async (e) => {
        e.preventDefault();
        if (message === ' ' || message === '') return;

        document.getElementById('input-field').value = '';
        let val = sessionStorage.getItem('peerRole');
        if (val === 'peerA') {
            setMessageList(prevList => [...prevList, { id: Math.floor(Math.random() * 100), 'role': 'peerA', 'message': message, time: fetchTime() }]);
            messageChannel.send(message);

        } else {
            setMessageList(prevList => [...prevList, { id: Math.floor(Math.random() * 100), 'role': 'peerB', 'message': message, time: fetchTime() }]);
            remoteConnection.messageChannel.send(message);
        }
        setTimeout(() => {
            chatbox.scrollTop = chatbox.scrollHeight;
        }, 100);

        setMessage('');
    }

    const fetchAvatar = () => {
        let key = '';
        sessionStorage.getItem('peerRole') === 'peerA' ? key = peerBpfpId : key = peerApfpId
        axios.get(`https://api.multiavatar.com/${key}.png?apikey=GlfxOwCHERyz56`).then((response) => {
            setAvatar(response.config.url);

        }).catch((error) => {
            console.log(error)
        });
    }

    async function handleChange(event) {
        setMessage(event.target.value);
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

    async function handleCopy(event) {
        event.preventDefault();
        let copied = await navigator.clipboard.readText();
        setMessage(copied);
        document.querySelector('#input-field').focus();
    }

    async function removeChat(event) {
        event.preventDefault();
        const response = window.confirm("Are you sure you want to clear chat?");

        if (response) {
            setMessageList([]);
        } else {
            return;
        }

    }


    return (
        <>

            <div style={{ backgroundColor: 'transparent', overflow: 'hidden', border: '1px solid white', borderRadius: '15px', height: '80vh', width: '30%', float: 'left' }}>
                <div style={{ backgroundColor: '#1a1a1a', flexDirection: 'row', borderBottom: '1px solid white', height: '10%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                    <div style={{ height: '100%', width: '75%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <img src={avatar} alt="avatar" style={{ height: '80%', marginRight: '5%', borderRadius: '100%' }} />
                        <span style={{ color: 'white', fontSize: '1.2vw', marginLeft: '1.5%', marginRight: '-1%' }}>
                            {sessionStorage.getItem('peerRole') === 'peerA' ? peerBName : peerAName}
                        </span>
                    </div>
                    <div className="video-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button className='videoBtn' title={'Video Call'} style={{ background: 'transparent', border: 'none' }} onClick={handlevideoCallButtonState}>
                            <VideoCallIcon style={{ transform: `scale(${1.4})`, width: '100%', color: 'rgb(26, 240, 161)' }} />
                        </button>
                        <button className='deleteChatBtn' title={'Clear chat'} style={{ background: 'transparent', border: 'none' }} onClick={removeChat}>
                            <DeleteIcon style={{ transform: `scale(${1.2})`, width: '100%', color: 'rgb(26, 240, 161)' }} />
                        </button>
                    </div>
                </div>


                <div className="chatBox" style={{ height: '80%', overflow: 'scroll', overflowX: 'hidden', position: 'relative' }}>
                    {
                        messageList.length === 0 &&
                        // <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: "100%" }}>
                        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10%' }}>
                            <Lottie style={{ height: '50%' }} animationData={animation} />
                            <div style={{ height: '50%' }}>
                                <span style={{ fontSize: '1.5vw', color: 'white' }}>IT'S EMPTY IN HERE!</span>
                                <br />
                                <span style={{ fontSize: '1vw', color: 'white' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Start chatting with your peer&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            </div>
                        </div>
                        // </div>
                    }
                    {
                        messageList.map((value) => {
                            let checkPeerRole = sessionStorage.getItem('peerRole');
                            // console.log(value);
                            if (checkPeerRole === 'peerA') {
                                if (value.role === 'peerA') {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <div key={value.id} style={{ display: 'flex', maxWidth: '70%', maxHeight: 'fit-content', backgroundColor: '#0A82FD', color: 'white', padding: '1.5%', margin: '1.2%', borderRadius: '15px' }}>
                                                <span style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                <span style={{ color: 'wheat', fontSize: '0.6vw', justifySelf: 'flex-end', WebkitAlignSelf: 'flex-end' }}> &nbsp;&nbsp;&nbsp;{value.time}</span>

                                            </div>
                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <div key={value.id} style={{ maxWidth: '70%', maxHeight: 'fit-content', backgroundColor: '#333333', color: 'white', padding: '1.5%', margin: '1.2%', borderRadius: '15px' }}>
                                                <span style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                <span style={{ color: 'wheat', fontSize: '0.6vw', justifySelf: 'flex-end', WebkitAlignSelf: 'flex-end' }}> &nbsp;&nbsp;&nbsp; {value.time}</span>
                                            </div>
                                        </div>
                                    )
                                }
                            }
                            else {
                                if (value.role === 'peerA') {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <div key={value.id} style={{ maxWidth: '70%', maxHeight: 'fit-content', backgroundColor: '#333333', color: 'white', padding: '1.5%', margin: '1.2%', borderRadius: '15px' }}>
                                                <span style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                <span style={{ color: 'wheat', fontSize: '0.6vw', justifySelf: 'flex-end', WebkitAlignSelf: 'flex-end' }}> &nbsp;&nbsp;&nbsp; {value.time}</span>
                                            </div>

                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <div key={value.id} style={{ display: 'flex', maxWidth: '70%', maxHeight: 'fit-content', backgroundColor: '#0A82FD', color: 'white', padding: '1.5%', margin: '1.2%', borderRadius: '15px' }}>
                                                <span style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                <span style={{ color: 'wheat', fontSize: '0.6vw', justifySelf: 'flex-end', WebkitAlignSelf: 'flex-end' }}> &nbsp;&nbsp;&nbsp; {value.time}</span>
                                            </div>

                                        </div>
                                    )
                                }

                            }
                        })
                    }
                </div>

                <form action="" onSubmit={sendMessage} style={{ backgroundColor: '#1a1a1a', width: '100%', height: '10%' }}>
                    <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <button type='button' onClick={handleCopy} className='copyBtn' style={{ padding: '2%', background: 'transparent', border: 'none', borderRadius: '5px', marginRight: '4%' }}>
                            <ContentPasteIcon style={{ transform: `scale(${1.2})`, width: '100%', color: 'rgb(26, 240, 161)' }} />
                        </button>
                        <input id='input-field' style={{ fontSize: '1.2vw', color: 'white', width: '70%', backgroundColor: '#333333', border: 'none', borderRadius: '5px' }} type='text' value={message} onChange={handleChange}></input>
                        <button type="submit" id='sendBtn' style={{ padding: '2%', background: 'transparent', border: 'none', borderRadius: '5px', marginLeft: '4%' }}>
                            <SendIcon style={{ transform: `scale(${1.3})`, width: '100%', color: 'rgb(26, 240, 161)' }} />
                        </button>
                    </footer>
                </form>
            </div>
        </>
    );
}

export default Chat;