import React, { createContext, useContext, useEffect, useState, useParams } from 'react'
import Transfer from '../Transfer/Transfer';
import axios from 'axios';

import { name } from '../../utils/name';
import { render } from '@testing-library/react';

const MessageToBeSent = createContext();

const Chat = () => {
    const [avatar, setAvatar] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const [message, setMessage] = useState('');


    useEffect(() => {
        fetchAvatar();

    }, []);
    const sendMessage = (e) => {
        e.preventDefault();
        document.getElementById('input-field').value = '';
        let val = localStorage.getItem('peerRole');
        if (val === 'peerA') {
            console.log('eeeeeeeeeeee')
            setMessageList([...messageList, { 'role': 'peerA', 'message': message }]);
        } else {
            setMessageList([...messageList, { 'role': 'peerB', 'message': message }]);
        }
    }

    const fetchAvatar = () => {
        axios.get(`https://api.multiavatar.com/1.png?apikey=GlfxOwCHERyz56`).then((response) => {
            console.log(response)
            setAvatar(response.config.url)

        }).catch((error) => {
            console.log(error)
        });
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
                        messageList.map((message) => {
                            if (message.role === 'peerA') {
                                return (
                                    <div>
                                        <MessageToBeSent.Provider value={message}>
                                            <Transfer />
                                        </MessageToBeSent.Provider>
                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                            <div style={{ backgroundColor: 'red' }}>
                                                {`${message.message}`}
                                            </div>

                                        </div>

                                    </div>

                                )
                            }
                            else {
                                return (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <div style={{ backgroundColor: 'pink' }}>{`${message.message}`}</div>

                                    </div>
                                )
                            }
                        })
                    }

                </div>

                <footer style={{ backgroundColor: 'pink', width: '100%', height: '10%' }}>
                    <form action="" onSubmit={sendMessage}>
                        <input id='input-field' style={{ width: '70%', align: 'center' }} type='text' onChange={e => setMessage(e.target.value)}></input>
                        <input type="submit" value='send'></input>
                    </form>

                </footer>
            </div>
        </>
    );
}

export default Chat;
export { MessageToBeSent };