import React, { useEffect, useState } from 'react'
import { Link, } from 'react-router-dom';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';
import '../JoinRoom/RoomPage.scss'
import LandingNavigation from "../Landing/LandingNavigation"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import firebaseConfig from '../../config/firebaseconfig';

firebase.initializeApp(firebaseConfig);
let userRef = null;
let db = null;

var scale = 'scale(1)';
const RoomPage = () => {
    const [roomName, setRoomName] = useState('');
    const [id, setId] = useState(null);
    const [generateIDClicked, setGenerateIDClicked] = useState(false);
    useEffect(() => {
        db = firebase.firestore();
        sessionStorage.clear();
    }, []);

    async function generateID(event) {
        userRef = await db.collection('users').doc();
        document.querySelector('.instant-room-join').hidden = true;
        setId(userRef.id);
        setGenerateIDClicked(true);
        sessionStorage.setItem('peerRole', 'peerA');
    }
    function copyURL() {
        
        var url = `https://peershare-x.web.app/room/${id}`;
        navigator.clipboard.writeText(url);
        toast("URL copied to clipboard! ", { theme: 'dark' });
    }
    async function handleCustomRoom(event) {
        userRef = db.collection('users').doc(`${id}`);
        const roomId = await userRef.get();

        if (roomName === '' || roomName === ' ') {
            toast('Room name cannot be blank! ', { theme: 'dark' });
            return;
        }

        if (roomId.exists) {
            toast('This room is already in use!', { theme: 'dark' })
            return;
        }
        setId(roomName);
        sessionStorage.setItem('peerRole', 'peerA');
    }

    return (
        <div className='main'>
            <ToastContainer />
            <LandingNavigation />
            <div className="flex-room-box">
                <div className="create-room-box">
                    <div className='content'>
                        <div className="instant-room">
                            <div className='instant-room-title'>Join instant room</div>
                            <div className='instant-room-description'>
                                <p className='instant-room-description-text'>
                                    Instant rooms allows you to quickly join room with random url made by us.
                                </p>
                            </div>
                            <button className='instant-room-join' onClick={generateID}>Generate instant link</button>
                            {
                                generateIDClicked &&
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'center', width: '75%' }}>
                                        <span className='copy-link' style={{ color: 'rgb(239,209,118)', marginTop: '5px', fontSize: '1vw' }}>{`https://signalling-28129.web.app/room/${id}`}</span>
                                        <Tooltip title='Copy link'>
                                            <button onClick={copyURL} style={{ backgroundColor: 'rgb(26, 240, 161)', marginLeft: '2%', width: '8%', borderRadius: '10px' }} >
                                                <ContentCopyIcon sx={{ fontSize: { xs: 12, sm: 16, md: 25, lg: 30 } }} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                    <Link className='instant-room-join' to={`/room/${id}`}>
                                        Join Room
                                    </Link>
                                </>

                            }
                        </div>

                        <div><hr /></div>
                        <div className="custom-room">
                            <div className='custom-room-title'>Create Custom room</div>
                            <div className='custom-room-description'>
                                <p className='custom-room-description-text'>
                                    Custom rooms allows you to create your own public room with custom name
                                </p>

                            </div>
                            <input className='custom-room-input' placeholder='Room Name' type="text" onChange={(e) => setRoomName(e.target.value)} />
                            <Link className='custom-room-join' onClick={handleCustomRoom} to={`/room/${roomName}`}>
                                Join Room
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
}

export default RoomPage;