import React, { useEffect, useState } from 'react'
import Lottie from 'lottie-react';
import { useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebaseConfig from '../../config/firebaseconfig';
import SendIcon from '@mui/icons-material/Send';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import animation from '../../assets/FINAL.json'
import '../Chat/Chat.scss'

firebase.initializeApp(firebaseConfig);

let messageChannel;
let channel;

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

    function handleReply(e, value) {
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
    }
    function replyClose() {
        setReplySize(0);
        setMessageReply('')
        setResizeChatArea(80)
        setDisplayReply('none')
        document.querySelector('#input-field').focus();
    }
    return (
        <>
            <div className='daddy'>
                <div className='navBarChat'>
                    <div className='NameImageNav' >
                        <img src={avatar} alt="avatar" className="navImage" />
                        <span id='user-name'>
                            {sessionStorage.getItem('peerRole') === 'peerA' ? peerBName : peerAName}
                        </span>
                    </div>
                    <div className="video-button">
                        {
                            !hideVidIcon &&
                            <button className='videoBtn' title={'Video Call'} onClick={handlevideoCallButtonState}>
                                <VideoCallIcon className='videoCallIcon' />
                            </button>
                        }
                        <button className='deleteChatBtn' title={'Clear chat'} onClick={removeChat}>
                            <DeleteIcon className='deleteIcon' />
                        </button>
                    </div>
                </div>


                <div className="chatBox" style={{ height: `${resizeChatArea}%` }}>
                    {
                        messageList.length === 0 &&
                        <div className='emptyChat'>
                            <Lottie animationData={animation} className='roboAnimation' />
                            <div className='textBelowRobo'>
                                <span id='empty'>IT'S EMPTY IN HERE!</span>
                                <span id='start'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Start Chatting With Your Peer&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            </div>
                        </div>
                    }
                    {
                        messageList.map((value) => {
                            let checkPeerRole = sessionStorage.getItem('peerRole');
                            if (checkPeerRole === 'peerA') {
                                if (value.role === 'peerA') {
                                    return (
                                        <div className='peer1Orientation'>
                                            <div key={value.id} className='chatDiv1 chatDiv'>
                                                {value.reply !== '' && <div className='replyOuter'>
                                                    {value.replyTo === 'peerA' ? <div>You</div> : <div>Peer</div>}
                                                    <div className='reply'>{value.reply}</div>
                                                </div>}
                                                <div className='bottomMessage'>
                                                    <span id='msg' style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                    <div className="shareTime">
                                                        <button className='replyBtn' onClick={(e) => { handleReply(e, value) }} title={'Reply'}>&nbsp;&nbsp;&nbsp;
                                                            <ReplyIcon className='replyMob' />
                                                        </button>
                                                        <span id='time'> &nbsp;&nbsp;&nbsp;{value.time}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div className='peer2Orientation'>
                                            <div key={value.id} className='chatDiv2 chatDiv'>
                                                {value.reply !== '' && <div className='replyOuter'>
                                                    {value.replyTo === 'peerA' ? <div>You</div> : <div>Peer</div>}
                                                    <div>{value.reply}</div>
                                                </div>}
                                                <div className='bottomMessage'>
                                                    <span id='msg' style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                    <div className="shareTime">
                                                        <button className='replyBtn' onClick={(e) => { handleReply(e, value) }} title={'Reply'}>
                                                            &nbsp;&nbsp;&nbsp;<ReplyIcon className='replyMob' />
                                                        </button>
                                                        <span id='time'> &nbsp;&nbsp;&nbsp; {value.time}</span>
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
                                        <div className='peer2Orientation'>
                                            <div key={value.id} className='chatDiv chatDiv2'>
                                                {value.reply !== '' && <div className='replyOuter'>
                                                    {value.replyTo === 'peerB' ? <div>You</div> : <div>Peer</div>}
                                                    <div className='reply'>{value.reply}</div>
                                                </div>}
                                                <div className='bottomMessage'>
                                                    <span id='msg' style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                    <div className="shareTime">
                                                        <button className='replyBtn' onClick={(e) => { handleReply(e, value) }} title={'Reply'}>
                                                            &nbsp;&nbsp;&nbsp;<ReplyIcon className='replyMob' />
                                                        </button>
                                                        <span id='time'> &nbsp;&nbsp;&nbsp;{value.time}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div className="peer1Orientation">
                                            <div key={value.id} className='chatDiv chatDiv1'>
                                                {value.reply !== '' && <div className='replyOuter'>
                                                    <div>{value.replyTo === 'peerB' ? <div>You</div> : <div>Peer</div>}</div>
                                                    <div className='reply'>{value.reply}</div>
                                                </div>}
                                                <div className='bottomMessage'>
                                                    <span id='msg' style={{ wordWrap: 'anywhere' }}>{`${value.message}`}</span>
                                                    <div className="shareTime">
                                                        <button className='replyBtn' onClick={(e) => { handleReply(e, value) }} title={'Reply'}>
                                                            &nbsp;&nbsp;&nbsp;<ReplyIcon className='replyMob' />
                                                        </button>
                                                        <span id='time'> &nbsp;&nbsp;&nbsp;{value.time}</span>
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
                <div style={{ height: `${replyResize}%`, display: displayReply}} className='replyDiv'>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '90%' }}>
                        {toReply === 'peerA' ? <div className='Name'>{peerAName}</div> : <div className='Name'>{peerBName}</div>}
                        <div className='msgOuter'><span className='msgInner'>{messageReply}</span></div>
                    </div>
                    <button onClick={() => { replyClose()}} className='cross'>X</button>
                </div>
                <form action="" className="navbarBottom" onSubmit={sendMessage}>
                    <footer className='footer'>
                        <button type='button' onClick={handleCopy} className='copyBtn commonBottom'>
                            <ContentPasteIcon className='commonIcon' />
                        </button>
                        <input autoFocus autoComplete="off" id='input-field' type='text' value={message} onChange={handleChange}/>
                        <button type="submit" id='sendBtn' className='commonBottom'>
                            <SendIcon className='commonIcon' />
                        </button>
                    </footer>
                </form>
            </div>
        </>
    );
}

export default Chat;
