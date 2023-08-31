import React, { useEffect, useState, useRef, CSSProperties } from 'react'

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { json, useParams } from 'react-router-dom';
import '../Transfer/Transfer.scss'
import LinearProgress from '@mui/material/LinearProgress';
import { v4 } from 'uuid';
import { toast, ToastContainer } from 'react-toastify';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


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
let totalFileSize = 0;
let fileReader = null;
let signalChannel = null;
let val = '';

const worker = new Worker("../worker.js");
const Transfer = ({ localConnection, remoteConnection }) => {

  const [fileInput, setFileInput] = useState('');
  const [isShrunk, setIsShrunk] = useState(false);
  const [videoCallButtonClicked, setVideoCallButtonClicked] = useState({ clicked: false, clickedBy: null });
  const [isFileHistory, setIsFileHistory] = useState(false)
  const [fileHistory, setFileHistory] = useState([]);
  const [fileProgress, setFileProgress] = useState(0);
  const [recvFileProgress, setRecvFileProgress] = useState(0);
  let { id } = useParams();



  useEffect(() => {
    val = sessionStorage.getItem('peerRole');
    worker.addEventListener('message', (event) => {
      download(event.data);
    });
    let checkPeerRole = sessionStorage.getItem('peerRole');
    if (checkPeerRole === 'peerA') {
      dataChannel = localConnection.createDataChannel('fileChannel');
      signalChannel = localConnection.createDataChannel('signallingChannel');
      initializeDataChannelListeners(dataChannel);
      initializeDataChannelListeners(signalChannel);
    }
    else {

      remoteConnection.addEventListener('datachannel', (event) => {
        channel = event.channel;
        channel.binaryType = 'arraybuffer';

        if (channel.label === 'fileChannel') {
          remoteConnection.dataChannel = channel;
          channel.onmessage = recieveData;
        }
        else if (channel.label === 'signallingChannel') {
          remoteConnection.signalChannel = channel;
          channel.onmessage = handleSignalling;
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

    fileReader = new FileReader();
    let offset = 0;

    dataChannel.bufferedAmountLowThreshold = chunkSize * 8;

    fileReader.onload = function () {
      dataChannel.send(this.result);
      offset += chunkSize;
      setFileProgress((offset / totalFileSize) * 100);
      if (parseInt((offset / totalFileSize) * 100) >= 100) {
        setFileProgress(100);
        setTimeout(() => {
          setFileProgress(0)
        }, 1000)
      }
      console.log(parseInt((offset / totalFileSize) * 100))
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
  async function sendFromRemote(file) {


    fileReader = new FileReader();
    let offset = 0;

    remoteConnection.dataChannel.bufferedAmountLowThreshold = chunkSize * 8;

    fileReader.onload = function () {
      remoteConnection.dataChannel.send(this.result);
      offset += chunkSize;
      setFileProgress((offset / totalFileSize) * 100);
      if (parseInt((offset / totalFileSize) * 100) >= 100) {
        setFileProgress(100);
        setTimeout(() => {
          setFileProgress(0)
        }, 1000)
      }
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
      console.log(fileInput.size, typeof (fileInput.size))
      totalFileSize = fileInput.size;
      dataChannel.send(JSON.stringify(fileInfo));
      console.log('Sending', file);
      send(file);
      setIsFileHistory(true)
      setFileHistory(fileHistory => [...fileHistory, { id: v4(), filename: file.name, filesize: file.size / 1000000, color: '#0A82FD' }]);
    } else {
      file = fileInput;
      const fileInfo = {
        'file': {
          name: file.name,
          size: file.size
        },
      };
      remoteConnection.dataChannel.send(JSON.stringify(fileInfo));
      totalFileSize = fileInput.size;
      console.log('Sending', file);
      sendFromRemote(file);
      setIsFileHistory(true);
      setFileHistory(fileHistory => [...fileHistory, { id: v4(), filename: file.name, filesize: file.size / 1000000, color: '#0A82FD' }])
    }
    setFileInput('');
  }

  async function handleSignalling(event) {
    const message = JSON.parse(event.data);
    if (message.type === 'sender_file_aborted') {
      toast(`File Aborted by ${message.clickedBy} `, { theme: 'dark' });
      worker.postMessage('file aborted');
      receivedSize = 0;
      setTimeout(() => {
        setRecvFileProgress(0)
      }, 1000)
    }
    else if (message.type === 'receiver_file_aborted') {
      if (fileReader) {
        toast(`File Aborted by ${message.clickedBy} `, { theme: 'dark' });
        fileReader.abort();
        setTimeout(() => {
          setFileProgress(0)
        }, 1000);
      }
    }
  }
  async function recieveData(e) {
    if (typeof (e.data) === 'string') {
      fileInfo = JSON.parse(e.data);
      receivedFile = fileInfo.file.name;
      receivedFileSize = fileInfo.file.size;
      totalFileSize = fileInfo.file.size;
      worker.postMessage(receivedFileSize);
      setIsFileHistory(true);
      setFileHistory(fileHistory => [...fileHistory, { id: v4(), filename: fileInfo.file.name, filesize: fileInfo.file.size / 1000000, color: '#333333' }]);
    }
    else {
      worker.postMessage(e.data);
      receivedSize += e.data.byteLength;
      setRecvFileProgress((receivedSize / totalFileSize) * 100);
      console.log(parseInt((receivedSize / totalFileSize) * 100))
      if (parseInt((receivedSize / totalFileSize) * 100) >= 100) {
        setRecvFileProgress(100)
        setTimeout(() => {
          setRecvFileProgress(0)
        }, 1000)
      }
      if (receivedSize === receivedFileSize) {
        receivedSize = 0;
      }
    }
  }
  function download(data) {
    setIsFileHistory(true);
    const url = URL.createObjectURL(data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = receivedFile;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return;
  }

  function initializeDataChannelListeners(channel) {
    channel.bufferedAmountLowThreshold = 15 * 1024 * 1024;
    channel.addEventListener('open', () => {
      if (channel.label === 'fileChannel')
        console.log('Data channel opened');
      else console.log('signalling channel opened');
    });
    channel.addEventListener('message', (event) => {
      if (channel.label === 'fileChannel')
        recieveData(event);
      else if (channel.label === 'signallingChannel') {
        const message = JSON.parse(event.data);
        if (message.type === 'sender_file_aborted') {
          receivedSize = 0;
          toast(`File Aborted by ${message.clickedBy} `, { theme: 'dark' });
          worker.postMessage('file aborted');
          setTimeout(() => {
            setRecvFileProgress(0);
          }, 1000);
        }
        else if (message.type === 'receiver_file_aborted') {
          if (fileReader) {
            fileReader.abort();
            toast(`File Aborted by ${message.clickedBy} `, { theme: 'dark' });
            setTimeout(() => {
              setFileProgress(0);
            }, 1000);
          }
        }
      }

    });

    channel.addEventListener('close', (event) => {
      if (channel.label === 'fileChannel')
        console.log('Data channel closed');
      else console.log('signalling channel closed');
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
    document.querySelector('.fileInput').value = '';
  }
  function retryConnect(event) {
    window.location.reload();
  }
  function dragAndDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setFileInput(event.dataTransfer.files[0]);
    document.querySelector('.input-label').classList.remove('blur');
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
  async function handleSendAbort(event) {
    event.preventDefault();
    if (fileReader) {
      fileReader.abort();
      setTimeout(() => {
        setFileProgress(0)
      }, 1000);

      val = sessionStorage.getItem('peerRole');
      const abortMessage = {
        type: 'sender_file_aborted',
        clickedBy: val,
      };
      if (val === 'peerA') signalChannel.send(JSON.stringify(abortMessage));
      else remoteConnection.signalChannel.send(JSON.stringify(abortMessage));
    }
  }
  async function handleReceiveAbort(event) {
    event.preventDefault();
    const abortMessage = {
      type: 'receiver_file_aborted',
      clickedBy: val,
    };
    if (val === 'peerA') await signalChannel.send(JSON.stringify(abortMessage));
    else await remoteConnection.signalChannel.send(JSON.stringify(abortMessage));

    setTimeout(() => {
      setRecvFileProgress(0);
    }, 1000);
    setTimeout(() => {
      receivedSize = 0;
      worker.postMessage('file aborted');
    }, 1000);

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
          <div className="input-div">
            <label className='input-label' onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              document.querySelector('.fileInput').classList.add('blur');
            }} onDrop={dragAndDrop} onDragLeave={(event) => {
              event.stopPropagation();
              event.preventDefault();
              document.querySelector('.fileInput').classList.remove('blur');
            }}
              htmlFor="actual-btn">
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <AddCircleOutlineIcon sx={{ fontSize: { xs: 20, sm: 25, md: 30, lg: 40 } }} color='primary' />
                <span style={{ padding: '2% 5% 2% 5%', fontSize: '1vw' }}>
                  Click to browse or drag files to start sharing
                </span>
              </div>
            </label>
            <input type='file' className='fileInput' id='actual-btn' onChange={handleFile} />
            <div id='file-selected' style={{ alignSelf: 'center', fontSize: '1vw' }}>{fileInput && fileInput.name}{fileInput && convert(fileInput.size / 1000000)}</div>
            <div className="buttons">
              <button disabled={!parseInt(fileProgress)} className='abort-sending-file' onClick={handleSendAbort}>Stop sending</button>
              {/* <button className='retry-btn' id='retry' onClick={retryConnect}> Retry Connection </button> */}
              <button disabled={parseInt(fileProgress) || parseInt(recvFileProgress)} className='sendFileBtn' onClick={sendFile}>Send</button>
              <button disabled={!parseInt(recvFileProgress)} className='abort-receiving-file' onClick={handleReceiveAbort}>Stop receiving</button>
              {/* <button id='hangUpBtn' onClick={hangUp} style={{ backgroundColor: 'red' }} className='leaveBtn'> Leave Room </button> */}
            </div>


            <div className="progress-bar">
              <div className="send-bar">
                <div className='sender-label'><pre style={{ margin: '0%' }}>Sender  </pre></div>
                <LinearProgress variant="determinate" value={fileProgress} style={{ height: '30%', width: '72%', alignSelf: 'center' }} />
                <div className='sender-percentage'>{parseInt(fileProgress)} %</div>
              </div>
              <div className="receive-bar">
                <div className='receiver-label'><pre style={{ margin: '0%' }}>Receiver</pre></div>
                <LinearProgress variant="determinate" value={recvFileProgress} style={{ height: '30%', width: '72%', alignSelf: 'center' }} />
                <div className='receiver-percentage'>{parseInt(recvFileProgress)} %</div>
              </div>
            </div>
          </div>
          <div className='flexTransferBottom'>
            {isFileHistory ?
              <div className='fileHistory'>
                {
                  <div className='fileHistoryDiv'>{
                    fileHistory.map((v) => {

                      if (parseInt(v.filesize) === 0) fileSize = `${parseFloat(v.filesize * 1000).toFixed(2)}KB`

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
                    })}</div>
                }
              </div>
              : <div style={{ color: 'white' }}>No File History</div>
            }
          </div>
        </div>
      </div>
    </>

  )
}

export default Transfer;