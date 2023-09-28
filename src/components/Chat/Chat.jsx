import React, { useEffect, useState } from 'react'
import { v4 } from 'uuid';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useParams } from 'react-router-dom';
import '../Chat/Chat.scss'
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import animation from '../../assets/FINAL.json'
import Lottie from 'lottie-react';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import firebaseConfig from '../../config/firebaseconfig';

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
    const [resizeChatArea, setResizeChatArea] = useState(80);
    const [replyResize, setReplySize] = useState(0);
    const [displayReply, setDisplayReply] = useState('none')
    const [messageReply, setMessageReply] = useState('')
    const chatbox = document.querySelector(".chatBox");
    const [toReply, setToReply] = useState('')
    const [hideVidIcon, setHideVidIcon] = useState(false)

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

    useEffect(() => {
        if (hideVidIcon || window.screen.width <= 800) setHideVidIcon(true);
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 800) setHideVidIcon(true)
            else setHideVidIcon(false)
        })
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
                setMessageList(prevList => [...prevList, { id: v4(), 'role': 'peerB', 'message': JSON.parse(event.data).message, time: fetchTime(), reply: JSON.parse(event.data).reply, replyTo: JSON.parse(event.data).replyTo }]);
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
        setMessageList(prevList => [...prevList, { id: v4(), 'role': 'peerA', 'message': JSON.parse(e.data).message, time: fetchTime(), reply: JSON.parse(e.data).reply, replyTo: JSON.parse(e.data).replyTo }]);
    }
    const sendMessage = async (e) => {
        e.preventDefault();
        if (message === ' ' || message === '') return;

        document.getElementById('input-field').value = '';
        let val = sessionStorage.getItem('peerRole');
        if (val === 'peerA') {
            setMessageList(prevList => [...prevList, { id: v4(), 'role': 'peerA', 'message': message, time: fetchTime(), reply: messageReply, replyTo: toReply }]);

            const sendingMessage = {
                message: message,
                reply: messageReply,
                replyTo: toReply
            }
            messageChannel.send(JSON.stringify(sendingMessage));
            setMessageReply('')
            setReplySize(0);
            setResizeChatArea(80)
            setDisplayReply('none')

        } else {
            const sendingMessage = {
                message: message,
                reply: messageReply,
                replyTo: toReply
            }
            setMessageList(prevList => [...prevList, { id: v4(), 'role': 'peerB', 'message': message, time: fetchTime(), reply: messageReply, replyTo: toReply }]);
            remoteConnection.messageChannel.send(JSON.stringify(sendingMessage));
            setMessageReply('')
        }
        setTimeout(() => {
            chatbox.scrollTop = chatbox.scrollHeight;
        }, 100);

        setMessage('');
        setMessage('');
        setReplySize(0);
        setResizeChatArea(80)
        setDisplayReply('none')
    }

    const fetchAvatar = () => {
        let key = '';
        sessionStorage.getItem('peerRole') === 'peerA' ? key = peerBpfpId : key = peerApfpId
        axios.get(`https://api.multiavatar.com/${key}.png?apikey=${process.env.REACT_APP_AVATAR_API_KEY}`).then((response) => {
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
            setMessageReply('')
            setReplySize(0);
            setResizeChatArea(80)
            setDisplayReply('none')
        } else {
            return;
        }

    }

    return (
        <>
            <div className='daddy' style={{ resize: 'horizontal', backgroundColor: 'transparent', overflow: 'hidden', border: '1px solid white', borderRadius: '15px', height: '80vh', width: '30%', float: 'left' }}>
                <div style={{ backgroundColor: '#1a1a1a', flexDirection: 'row', borderBottom: '1px solid white', height: '10%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                    <div style={{ height: '100%', width: '75%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <img src={avatar} alt="avatar" style={{ height: '80%', marginRight: '5%', borderRadius: '100%' }} />
                        <span id='user-name' style={{ color: 'white', fontSize: '1.2vw', marginLeft: '1.5%', marginRight: '-1%' }}>
                            {sessionStorage.getItem('peerRole') === 'peerA' ? peerBName : peerAName}
                        </span>
                    </div>
                    <div className="video-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {
                            !hideVidIcon &&
                            <button className='videoBtn' title={'Video Call'} style={{ background: 'transparent', border: 'none' }} onClick={handlevideoCallButtonState}>
                                <VideoCallIcon style={{ transform: `scale(${1.4})`, width: '100%', color: 'rgb(26, 240, 161)' }} />
                            </button>
                        }
                        <button className='deleteChatBtn' title={'Clear chat'} style={{ background: 'transparent', border: 'none' }} onClick={removeChat}>
                            <DeleteIcon style={{ transform: `scale(${1.2})`, width: '100%', color: 'rgb(26, 240, 161)' }} />
                        </button>
                    </div>
                </div>


                <div className="chatBox" style={{ height: `${resizeChatArea}%`, overflow: 'scroll', overflowX: 'hidden', position: 'relative' }}>
                    {
                        messageList.length === 0 &&
                        // <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: "100%" }}>
                        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10%' }}>
                            <Lottie style={{ height: '50%' }} animationData={animation} />
                            <div style={{ height: '50%', width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <span id='empty' style={{ fontSize: '1.5vw', color: 'white' }}>IT'S EMPTY IN HERE!</span>
                                {/* <br /> */}
                                <span id='start' style={{ fontSize: '1vw', color: 'white' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Start chatting with your peer&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            </div>
                        </div>
                    }
                    {
                        messageList.map((value) => {
                            let checkPeerRole = sessionStorage.getItem('peerRole');
                            if (checkPeerRole === 'peerA') {
                                if (value.role === 'peerA') {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <div key={value.id} style={{ display: 'flex', maxWidth: '70%', maxHeight: 'fit-content', backgroundColor: '#0A82FD', color: 'white', padding: '1.5%', margin: '0.5%', borderRadius: '15px', flexDirection: 'column' }} className='chatDiv'>
                                                {value.reply !== '' && <div style={{ backgroundColor: 'lightblue', maxWidth: '100%', color: 'black', borderRadius: '15px', padding: '1% 0% 1% 6%' }}>
                                                    {value.replyTo === 'peerA' ? <div>You</div> : <div>Peer</div>}
                                                    <div style={{ color: 'white' }}>{value.reply}</div>
                                                </div>}
                                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <span id='msg' style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <button style={{ justifySelf: 'flex-end', fontSize: '1vw', justifySelf: 'center', WebkitAlignSelf: 'flex-end', cursor: 'pointer', background: 'transparent', border: 'none', color: 'wheat', display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => {
                                                            e.preventDefault();
                                                            let msg = '', cntSpace = 0;
                                                            for (var i = 0; i < value.message.length; i++) {
                                                                msg += value.message[i];
                                                                if (value.message[i] === ' ') {
                                                                    cntSpace++;
                                                                    console.log(cntSpace)

                                                                }
                                                                if (cntSpace === 7) break;

                                                            }
                                                            if (cntSpace >= 7) msg += '..';
                                                            setMessageReply(msg)
                                                            document.querySelector('#input-field').focus();
                                                            setResizeChatArea(64)
                                                            setReplySize(16)
                                                            setDisplayReply('flex')
                                                            setToReply(value.role)

                                                        }} title={'Reply'}>&nbsp;&nbsp;&nbsp;<ReplyIcon style={{ fontSize: '1.3vw' }} className='replyMob' /></button>
                                                        <span id='time' style={{ color: 'wheat', fontSize: '0.6vw', justifySelf: 'flex-end', WebkitAlignSelf: 'flex-end' }}> &nbsp;&nbsp;&nbsp;{value.time}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <div key={value.id} style={{ display: 'flex', maxWidth: '70%', maxHeight: 'fit-content', backgroundColor: '#333333', color: 'white', padding: '1.5%', margin: '0.5%', borderRadius: '15px', flexDirection: 'column' }} className='chatDiv'>
                                                {value.reply !== '' && <div style={{ backgroundColor: 'lightblue', maxWidth: '100%', color: 'black', borderRadius: '15px', padding: '1% 0% 1% 6%' }}>
                                                    {value.replyTo === 'peerA' ? <div>You</div> : <div>Peer</div>}
                                                    <div style={{ color: 'white' }}>{value.reply}</div>
                                                </div>}
                                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <span id='msg' style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <button style={{ justifySelf: 'flex-end', fontSize: '1vw', justifySelf: 'center', WebkitAlignSelf: 'flex-end', cursor: 'pointer', background: 'transparent', border: 'none', color: 'wheat', display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => {
                                                            e.preventDefault();
                                                            let msg = '', cntSpace = 0;
                                                            for (var i = 0; i < value.message.length; i++) {
                                                                msg += value.message[i];
                                                                if (value.message[i] === ' ') {
                                                                    cntSpace++;
                                                                    console.log(cntSpace)
                                                                }
                                                                if (cntSpace === 7) break;
                                                            }
                                                            if (cntSpace >= 7) msg += '..';
                                                            setMessageReply(msg)
                                                            document.querySelector('#input-field').focus();
                                                            setResizeChatArea(64)
                                                            setReplySize(16)
                                                            setDisplayReply('flex')
                                                            setToReply(value.role)
                                                        }} title={'Reply'}>&nbsp;&nbsp;&nbsp;<ReplyIcon style={{ fontSize: '1.3vw' }} className='replyMob' /></button>

                                                        <span id='time' style={{ color: 'wheat', fontSize: '0.6vw', justifySelf: 'flex-end', WebkitAlignSelf: 'flex-end' }}> &nbsp;&nbsp;&nbsp; {value.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            }
                            else {
                                if (value.role === 'peerA') {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <div key={value.id} style={{ display: 'flex', maxWidth: '70%', maxHeight: 'fit-content', backgroundColor: '#333333', color: 'white', padding: '1.5%', margin: '0.5%', borderRadius: '15px', flexDirection: 'column' }}>
                                                {value.reply !== '' && <div style={{ backgroundColor: 'lightblue', maxWidth: '100%', color: 'black', borderRadius: '15px', padding: '1% 0% 1% 6%' }}>
                                                    {value.replyTo === 'peerB' ? <div>You</div> : <div>Peer</div>}
                                                    <div style={{ color: 'white' }}>{value.reply}</div>
                                                </div>}
                                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <span id='msg' style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <button style={{ justifySelf: 'flex-end', fontSize: '1vw', justifySelf: 'center', WebkitAlignSelf: 'flex-end', cursor: 'pointer', background: 'transparent', border: 'none', color: 'wheat', display: 'flex' }} onClick={(e) => {
                                                            e.preventDefault();
                                                            let msg = '', cntSpace = 0;
                                                            for (var i = 0; i < value.message.length; i++) {
                                                                msg += value.message[i];
                                                                if (value.message[i] === ' ') {
                                                                    cntSpace++;
                                                                    console.log(cntSpace)
                                                                }
                                                                if (cntSpace === 7) break;
                                                            }
                                                            if (cntSpace >= 7) msg += '.....';
                                                            setMessageReply(msg)
                                                            document.querySelector('#input-field').focus();
                                                            setResizeChatArea(64)
                                                            setReplySize(16)
                                                            setDisplayReply('flex')
                                                            setToReply(value.role)
                                                        }} title={'Reply'}>&nbsp;&nbsp;&nbsp;<ReplyIcon style={{ fontSize: '1.3vw' }} className='replyMob' /></button>
                                                        <span id='time' style={{ color: 'wheat', fontSize: '0.6vw', justifySelf: 'flex-end', WebkitAlignSelf: 'flex-end' }}> &nbsp;&nbsp;&nbsp;{value.time}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <div key={value.id} style={{ display: 'flex', maxWidth: '70%', maxHeight: 'fit-content', backgroundColor: '#0A82FD', color: 'white', padding: '1.5%', margin: '0.5%', borderRadius: '15px', flexDirection: 'column' }}>
                                                {value.reply !== '' && <div style={{ backgroundColor: 'lightblue', maxWidth: '100%', color: 'black', borderRadius: '15px', padding: '1% 0% 1% 6%' }}>
                                                    <div>{value.replyTo === 'peerB' ? <div>You</div> : <div>Peer</div>}</div>
                                                    <div style={{ color: 'white' }}>{value.reply}</div>
                                                </div>}
                                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <span id='msg' style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <button style={{ justifySelf: 'flex-end', fontSize: '1vw', justifySelf: 'center', WebkitAlignSelf: 'flex-end', cursor: 'pointer', background: 'transparent', border: 'none', color: 'wheat', display: 'flex' }} onClick={(e) => {
                                                            e.preventDefault();
                                                            let msg = '', cntSpace = 0;
                                                            for (var i = 0; i < value.message.length; i++) {
                                                                msg += value.message[i];
                                                                if (value.message[i] === ' ') {
                                                                    cntSpace++;
                                                                    console.log(cntSpace)
                                                                }
                                                                if (cntSpace === 7) break;
                                                            }
                                                            if (cntSpace >= 7) msg += '.....';
                                                            setMessageReply(msg)
                                                            document.querySelector('#input-field').focus();
                                                            setResizeChatArea(64)
                                                            setReplySize(16)
                                                            setDisplayReply('flex')
                                                            setToReply(value.role)
                                                        }} title={'Reply'}>&nbsp;&nbsp;&nbsp;<ReplyIcon style={{ fontSize: '1.3vw' }} className='replyMob' /></button>
                                                        <span id='time' style={{ color: 'wheat', fontSize: '0.6vw', justifySelf: 'flex-end', WebkitAlignSelf: 'flex-end' }}> &nbsp;&nbsp;&nbsp;{value.time}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )
                                }

                            }
                        })
                    }
                </div>
                <div style={{ height: `${replyResize}%`, backgroundColor: '#333333', display: displayReply, justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '90%' }}>
                        {toReply === 'peerA' ? <div style={{ color: 'white', marginLeft: '4%' }}>{peerAName}</div> : <div style={{ color: 'white', marginLeft: '4%' }}>{peerBName}</div>}
                        <div style={{ color: 'white', marginLeft: '3%', backgroundColor: '#1a1a1a', padding: '0.7%', borderRadius: '15px' }}><span style={{ padding: '2%' }}>{messageReply}</span></div>
                    </div>
                    <button onClick={() => {
                        setReplySize(0);
                        setMessageReply('')
                        setResizeChatArea(80)
                        setDisplayReply('none')
                        document.querySelector('#input-field').focus();

                    }} style={{ color: 'white', background: 'transparent', border: 'none' }}>X</button>
                </div>

                <form action="" onSubmit={sendMessage} style={{ backgroundColor: '#1a1a1a', width: '100%', height: '10%' }}>
                    <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <button type='button' onClick={handleCopy} className='copyBtn' style={{ padding: '2%', background: 'transparent', border: 'none', borderRadius: '5px', marginRight: '4%' }}>
                            <ContentPasteIcon style={{ transform: `scale(${1.2})`, width: '100%', color: 'rgb(26, 240, 161)' }} />
                        </button>
                        <input autoFocus autoComplete="off" id='input-field' style={{ height: '50%', fontSize: '1.2vw', color: 'white', width: '70%', backgroundColor: '#333333', border: 'none', borderRadius: '5px' }} type='text' value={message} onChange={handleChange}></input>
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