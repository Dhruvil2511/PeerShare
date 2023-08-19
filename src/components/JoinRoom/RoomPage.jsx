import React, { useState } from 'react'
import Navbar from '../Navbar/Navbar';
import { Link, Route, Routes } from 'react-router-dom';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';
// import { v4 as uuid } from 'uuid';

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


const RoomPage = () => {
    const [roomName, setRoomName] = useState('');
    const [id, setId] = useState(null);


    async function generateID() {
        const db = firebase.firestore();
        userRef = await db.collection('users').doc();
        document.getElementById('span').hidden= false;
        console.log(userRef.id);
        setId(userRef.id);
        localStorage.setItem('peerRole', 'peerA');
    }
    return (
        <div className='main' style={{ backgroundColor: 'black', height: '100vh' }} >
            <Navbar />
            <div className="container" style={{ backgroundColor: 'yellow', height: '80vh' }}>

                <center>
                    <div>
                        <section>
                            <h1>Create own public room</h1>
                            <span>Public rooms allow file sharing to any device connected to the internet in the same room.</span>
                            <input type="text" onChange={(e) => setRoomName(e.target.value)} />
                            {/* <button     >Create Room</button> */}
                            
                            <Link to={`/room/${roomName}`}>
                                Join
                            </Link>

                        </section>
                        <div>------</div>
                        <section>
                            <h1>Join instant room</h1>
                            <button onClick={generateID}> generate id</button>
                            <span id='span' hidden>Share this : {`https://signalling-28129.web.app/room/${id}`}</span>
                            <br />
                            <Link to={`/room/${id}`}>
                                Click here to Join Room 
                            </Link>
                        </section>
                    </div>
                </center>

            </div>

        </div >
    );
}

export default RoomPage;