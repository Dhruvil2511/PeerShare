import React, { useEffect, useState, useRef, CSSProperties } from 'react'

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useParams } from 'react-router-dom';
import '../Transfer/Transfer.scss'
import LinearProgress from '@mui/material/LinearProgress';
import { v4 } from 'uuid';
import { toast, ToastContainer } from 'react-toastify';

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



let dataChannel = null;
let channel = null;
let receivedSize = 0;
let receivedFileSize = null;
const chunkSize = 16 * 1024;
let file = null;
let receivedFile;
let fileInfo = null;
let data;
let fileSize = ''

const worker = new Worker("../worker.js");
const Transfer = ({ localConnection, remoteConnection }) => {
  const [fileInput, setFileInput] = useState('');
  const [isShrunk, setIsShrunk] = useState(false);
  const [videoCallButtonClicked, setVideoCallButtonClicked] = useState({ clicked: false, clickedBy: null });
  const [isFileHistory, setIsFileHistory] = useState(false)
  const [fileHistory, setFileHistory] = useState([]);
  let { id } = useParams();


  useEffect(() => {
    let checkPeerRole = sessionStorage.getItem('peerRole');
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

    receivedSize = 0;
    if (fileInput === '') {
      toast('Please select a file', { theme: 'dark' });
      return;
    };

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
      setIsFileHistory(true)
      setFileHistory(fileHistory => [...fileHistory, { id: v4(), filename: file.name, filesize: file.size / 1000000, color: 'green' }]);
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
      setIsFileHistory(true);
      setFileHistory(fileHistory => [...fileHistory, { id: v4(), filename: file.name, filesize: file.size / 1000000, color: 'green' }])
    }
    setFileInput('');
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
      setIsFileHistory(true);
      setFileHistory(fileHistory => [...fileHistory, { id: v4(), filename: fileInfo.file.name, filesize: fileInfo.file.size / 1000000, color: 'red' }]);
    }
    else {
      worker.postMessage(e.data);
      receivedSize += e.data.byteLength;
      if (receivedSize === receivedFileSize) download();
    }
  }
  function download() {
    setIsFileHistory(true);
    worker.addEventListener('message', async (event) => {
      const url = URL.createObjectURL(event.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = receivedFile;
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

    await sessionStorage.removeItem('peerRole');

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
  function dragAndDrop(event) {
    event.preventDefault();
    setFileInput(event.dataTransfer.files[0]);
    document.querySelector('.input-div').classList.remove('blur');
  }

  function convert(size) {
    if (!size) return '';
    if (parseInt(size) === 0) return ` | ${parseFloat(size * 1000).toFixed(2)}KB`;
    else if (parseInt(size) < 1000) return ` | ${parseFloat(size).toFixed(2)}MB`;
    else return `| ${parseFloat(size / 1000).toFixed(2)}GB`;
  }
  function removeFileHistory(fileid) {
    setFileHistory(fileHistory.filter((file) => file.id !== fileid));

  }
  return (
    <>
      <div className={`shrinkable-div ${isShrunk ? 'shrink' : ''}`}>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme="dark"
        />
        <div style={{ height: '100%' }}>
          <div className="input-div" onDragOver={(event) => {
            event.preventDefault();
            document.querySelector('.input-div').classList.add('blur');
          }} onDrop={dragAndDrop} onDragLeave={(event) => {
            event.preventDefault();
            document.querySelector('.input-div').classList.remove('blur');
          }}>
            <label htmlFor="actual-btn" style={{ backgroundColor: 'red', width: '50%', alignSelf: 'center', cursor: 'pointer', height: '40%', marginBottom: '0.5%', marginTop: '1%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div>Select A File From Here</div></label>
            <input multiple type='file' className='fileInput' id='actual-btn' onChange={handleFile} />
            <div id='file-selected' style={{ alignSelf: 'center' }}>{fileInput.name}{convert(fileInput.size / 1000000)}</div>
            <button className='sendFileBtn' onClick={sendFile}>Send</button>
            <div style={{ display: 'flex' }}>
              <div style={{ fontSize: '2vw', marginLeft: '2%' }}>Sender</div>
              <LinearProgress variant="buffer" value={70} valueBuffer={70 + 5} style={{ height: '30%', width: '72%', marginTop: '1%', alignSelf: 'center', marginLeft: '4.1%' }} />
            </div>
          </div>
          <div className='flexTransferBottom'>
            <div className='fileHistory'>
              {
                isFileHistory ? <div className='fileHistoryDiv'>{
                  fileHistory.map((v) => {

                    if (parseInt(v.filesize) == 0) fileSize = `${parseFloat(v.filesize * 1000).toFixed(2)}KB`

                    else if (parseInt(v.filesize) < 1000) fileSize = `${parseFloat(v.filesize).toFixed(2)}MB`

                    else fileSize = `${parseFloat(v.filesize / 1000).toFixed(2)}GB`

                    return (
                      <div className='fileHistorySingleComponent' style={{ backgroundColor: v.color }}>
                        <div className="file-info">
                          <div className="file-name"> File Name : {v.filename} </div>
                          <div className="file-size">  File Size : {fileSize}</div>
                        </div>
                        <div className="delete-file">
                          <button className='delete-file-btn' onClick={() => removeFileHistory(v.id)}>X</button>
                        </div>
                      </div>
                    )
                  })}</div> : <div style={{ color: 'white' }}>No File History</div>
              }
            </div>
            <div className='leaveRef'>
              <button id='hangUpBtn' onClick={hangUp} style={{ backgroundColor: 'red' }} className='leaveBtn'> Leave </button>
              <button className='btn-danger' id='retry' onClick={retryConnect}> Retry </button>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}

export default Transfer;