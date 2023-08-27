import React, { useEffect, useState, useRef, CSSProperties } from 'react'

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useParams } from 'react-router-dom';
import '../Transfer/Transfer.scss'

const firebaseConfig = {
  apiKey: "AIzaSyDp2oKcwTulKcY-PGLSwNmCTqjtx8zyXiw",
  authDomain: "peershare2425.firebaseapp.com",
  projectId: "peershare2425",
  storageBucket: "peershare2425.appspot.com",
  messagingSenderId: "308108699413",
  appId: "1:308108699413:web:94b0d16825b57b93d6ab1c",
  measurementId: "G-721QV10KH1"
};

firebase.initializeApp(firebaseConfig);



let dataChannel = null;
let channel = null;
let receivedSize = 0;
let receivedFileSize = null;
const chunkSize = 16 * 1024;
let file = null;
let receivedFile;
let fileInfo = null;
let data;


const worker = new Worker("../worker.js");

const Transfer = ({ localConnection, remoteConnection }) => {
  const [fileInput, setFileInput] = useState([]);
  const [isShrunk, setIsShrunk] = useState(false);
  const [videoCallButtonClicked, setVideoCallButtonClicked] = useState({ clicked: false, clickedBy: null });

  let { id } = useParams();


  useEffect(() => {
    let checkPeerRole = localStorage.getItem('peerRole');
    if (checkPeerRole === 'peerA') {
      dataChannel = localConnection.createDataChannel('fileChannel');
      initializeDataChannelListeners(dataChannel);
    }
    else {
      remoteConnection.addEventListener('datachannel', async (event) => {
        channel = event.channel;
        channel.binaryType = 'arraybuffer';

        if (channel.label === 'fileChannel') {
          remoteConnection.dataChannel = channel;
          channel.onmessage = recieveData;
        }
        channel.onopen = event => console.log(channel.label + " opened");
        channel.onclose = event => console.log(channel.label + " closed");
      });
    }
  }, []);

  useEffect(() => {
    const db = firebase.firestore();
    let userRef = db.collection('users').doc(`${id}`);
    const unsubscribe = userRef.onSnapshot(async (snapshot) => {
      data = snapshot.data();
      if (data && data.videoCallHandle) {
        setVideoCallButtonClicked(data.videoCallHandle);
        if (data.videoCallHandle.clicked) {
          setIsShrunk(true);
        } else {
          setIsShrunk(false);
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  async function send(file) {

    let fileReader = new FileReader();
    let offset = 0;

    dataChannel.bufferedAmountLowThreshold = chunkSize * 8;

    fileReader.onload = function () {
      dataChannel.send(this.result);
      offset += chunkSize;
      if (offset < file.size) {
        if (dataChannel.bufferedAmount > chunkSize * 8) {
          dataChannel.addEventListener('bufferedamountlow', () => {
            readSlice(offset);
          }, { once: true });
        } else {
          readSlice(offset);
        }
      }
    };

    fileReader.onerror = function (err) {
      console.error('FileReader error' + err);
    };

    function readSlice(o) {
      const slice = file.slice(offset, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    }

    readSlice(0);

  }
  async function sendFile() {
    // console.log(file);
    receivedSize = 0;
    if (dataChannel && dataChannel.readyState === 'open') {
      file = fileInput;
      const fileInfo = {
        'file': {
          name: file.name,
          size: file.size
        },
      };
      dataChannel.send(JSON.stringify(fileInfo));
      console.log('Sending', file);
      send(file);

    } else {
      file = fileInput;
      const fileInfo = {
        'file': {
          name: file.name,
          size: file.size
        },
      };
      remoteConnection.dataChannel.send(JSON.stringify(fileInfo));
      console.log('Sending', file);
      sendFromRemote(file);

    }
  }
  async function sendFromRemote(file) {

    let fileReader = new FileReader();
    let offset = 0;

    remoteConnection.dataChannel.bufferedAmountLowThreshold = chunkSize * 8;

    fileReader.onload = function () {
      remoteConnection.dataChannel.send(this.result);
      offset += chunkSize;
      if (offset < file.size) {
        if (remoteConnection.dataChannel.bufferedAmount > chunkSize * 8) {
          remoteConnection.dataChannel.addEventListener('bufferedamountlow', () => {
            readSlice(offset);
          }, { once: true });
        } else {
          readSlice(offset);
        }
      }
    };

    fileReader.onerror = function (err) {
      console.error('FileReader error' + err);
    };

    function readSlice(o) {
      const slice = file.slice(offset, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    }

    readSlice(0);

  }

  async function recieveData(e) {

    if (typeof (e.data) === 'string') {
      fileInfo = JSON.parse(e.data);
      receivedFile = fileInfo.file.name;
      receivedFileSize = fileInfo.file.size;
      worker.postMessage(receivedFileSize);
    }
    else {
      worker.postMessage(e.data);
      receivedSize += e.data.byteLength;
      if (receivedSize === receivedFileSize) download();
    }
  }
  function download() {
    worker.addEventListener('message', async (event) => {
      const url = URL.createObjectURL(event.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = receivedFile; // Set the desired file name here
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      return;
    });
  }



  function initializeDataChannelListeners(dataChannel) {
    dataChannel.bufferedAmountLowThreshold = 15 * 1024 * 1024;
    dataChannel.addEventListener('open', () => {
      // console.log(channel);
      console.log('Data channel opened');
    });
    dataChannel.addEventListener('message', (event) => {
      recieveData(event);
    });

    dataChannel.addEventListener('close', (event) => {
      console.log('Data channel closed');
    });
  }

  async function hangUp() {
    if (localConnection) localConnection.close();
    if (remoteConnection) remoteConnection.close();

    await localStorage.removeItem('senderId');
    await localStorage.removeItem('peerRole');

    if (id) {
      const db = firebase.firestore();
      const userRef = db.collection('users').doc(id);
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
  }

  function handleFile(event) {
    setFileInput(event.target.files[0]);
  }
  function retryConnect(event) {
    window.location.reload();
  }
  return (
    <>

      <div className={`shrinkable-div ${isShrunk ? 'shrink' : ''}`}>
        <div>
          <div className="input-div">
            <input className="input" id="fileInput" multiple name="file" type="file" onChange={handleFile} />
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" strokeLinejoin="round" strokeLinecap="round" viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor" className="icon"><polyline points="16 16 12 12 8 16"></polyline><line y2="21" x2="12" y1="12" x1="12"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
          </div>
          <button id='sendFileBtn' onClick={sendFile}> Send</button>
          <button id='hangUpBtn' onClick={hangUp} style={{ backgroundColor: 'red' }} > Leave </button>
          <br />
          <span style={{ backgroundColor: 'white' }} id='state'></span>

          <button className='btn-danger' id='retry' onClick={retryConnect}> Retry </button>
          {/* <button id='connectionBtn' onClick={handleConnection}>{connectionBtnState}</button> */}
        </div>
      </div>
    </>

  )
}

export default Transfer;
