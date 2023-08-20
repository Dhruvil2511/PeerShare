import React, { useEffect, useState } from 'react'

import axios from 'axios';
import { name } from '../../utils/name';
import { useParams } from 'react-router-dom';


let messageChannel;
let channel;
// let message = null;

const Chat = ({ localConnection, remoteConnection }) => {
    const [avatar, setAvatar] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const [message, setMessage] = useState('');
    // let {id} = useParams();

    useEffect(() => {
        fetchAvatar();
        let checkPeerRole = localStorage.getItem('peerRole');
        if (checkPeerRole === 'peerA') {
            initializeLocalConnection();
        } else {
            initializeRemoteConnection();
            console.log(remoteConnection);
        }

    }, []);


    function initializeLocalConnection() {
        console.log(localConnection)
            ;
        messageChannel = localConnection.createDataChannel('messageChannel');

        messageChannel.bufferedAmountLowThreshold = 15 * 1024 * 1024;
        messageChannel.addEventListener('open', () => {
            console.log('Message channel opened');
        });
        messageChannel.addEventListener('message', (event) => {
            if (event.data) {
                console.log(typeof (event.data));
                // messageList.push({ id: Math.floor(Math.random() * 100), 'role': 'peerB', 'message': event.data });
                setMessageList(prevList => [...prevList, { id: Math.floor(Math.random() * 100), 'role': 'peerB', 'message': event.data }]);
                console.log(messageList);
            }
        });

        messageChannel.addEventListener('close', (event) => {
            console.log('Message channel closed');
        });
    }
    function initializeRemoteConnection() {

        remoteConnection.addEventListener('datachannel', (event) => {
            channel = event.channel;
            if (channel.label === 'messageChannel') {
                remoteConnection.messageChannel = channel;
                channel.onmessage = recieveMessage;
            }
            channel.onopen = event => console.log(channel.label + " opened");
            channel.onclose = event => console.log(channel.label + " closed");
        });
    }

    function recieveMessage(e) {
        if (e.currentTarget.label === 'messageChannel') {
            if (typeof (e.data) !== 'undefined') {
                console.log(typeof (e.data));
                setMessageList(prevList => [...prevList, { id: Math.floor(Math.random() * 100), 'role': 'peerA', 'message': e.data }]);
                console.log(messageList);
            }
        }
    }
    const sendMessage = (e) => {
        e.preventDefault();
        if (message === ' ' || message === '') return;

        document.getElementById('input-field').value = '';
        let val = localStorage.getItem('peerRole');
        if (val === 'peerA') {
            // setMessageList([...messageList, { 'role': 'peerA', 'message': message }]);
            setMessageList(prevList => [...prevList, { id: Math.floor(Math.random() * 100), 'role': 'peerA', 'message': message }]);

            console.log(messageList);
            messageChannel.send(message);

        } else {
            // setMessageList([...messageList, { 'role': 'peerB', 'message': message }]);
            setMessageList(prevList => [...prevList, { id: Math.floor(Math.random() * 100), 'role': 'peerB', 'message': message }]);
            remoteConnection.messageChannel.send(message);
        }
        setMessage('');
    }

    const fetchAvatar = () => {
        axios.get(`https://api.multiavatar.com/1.png?apikey=GlfxOwCHERyz56`).then((response) => {
            console.log(response)
            setAvatar(response.config.url)

        }).catch((error) => {
            console.log(error)
        });
    }
    function handleChange(event) {
        setMessage(event.target.value);
    }

    return (
        <>

            <div style={{ backgroundColor: 'blanchedalmond', height: '85vh', width: '30%', float: 'left' }}>
                <header style={{ backgroundColor: 'black', height: '10%', display: 'flex', alignItems: 'center' }}>
                    <img src={avatar} alt="" style={{ height: '80%', margin: '1.5%' }} />
                    <h5 style={{ color: 'white', position: 'relative' }}>Connected to : {name}</h5>
                </header>


                <div className="chatBox" style={{ backgroundColor: 'white', height: '80%' }}>
                    {
                        messageList.map((value) => {
                            let checkPeerRole = localStorage.getItem('peerRole');
                            console.log(value);
                            if (checkPeerRole === 'peerA') {
                                if (value.role === 'peerA') {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <div key={value.id} style={{ backgroundColor: 'red' }}>
                                                {`${value.message}`}
                                            </div>

                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <div key={value.id} style={{ backgroundColor: 'pink' }}>{`${value.message}`}</div>

                                        </div>
                                    )
                                }
                            }
                            else {
                                if (value.role === 'peerA') {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <div key={value.id} style={{ backgroundColor: 'red' }}>
                                                {`${value.message}`}
                                            </div>

                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <div key={value.id} style={{ backgroundColor: 'pink' }}>{`${value.message}`}</div>
                                        </div>
                                    )
                                }

                            }
                        })
                    }
                </div>

                <footer style={{ backgroundColor: 'pink', width: '100%', height: '10%' }}>

                    <input id='input-field' style={{ width: '70%', align: 'center' }} type='text' onChange={handleChange}></input>
                    <button id='sendBtn' value='send' onClick={sendMessage}>Send</button>

                </footer>
            </div>
        </>
    );
}

export default Chat;
