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
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';


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
  const [sendBtnClicked, setSendBtnClicked] = useState('');
  const [fileAccept, setFileAccept] = useState(false);
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [disableSendBtn, setDisableSendBtn] = useState(false);
  let { id } = useParams();



  useEffect(() => {
    val = sessionStorage.getItem('peerRole');
    worker.addEventListener('message', (event) => {
      download(event.data);
    });
    let checkPeerRole = sessionStorage.getItem('peerRole');
    if (checkPeerRole === 'peerA') {
      signalChannel = localConnection.createDataChannel('signallingChannel');
      dataChannel = localConnection.createDataChannel('fileChannel');
      initializeDataChannelListeners(dataChannel);
      initializeDataChannelListeners(signalChannel);
    }
    if (checkPeerRole === 'peerB') {

      remoteConnection.addEventListener('datachannel', (event) => {
        channel = event.channel;
        channel.binaryType = 'arraybuffer';

        if (channel.label === 'fileChannel') {
          remoteConnection.dataChannel = channel;
          channel.onmessage = recieveData;
          channel.onopen = event => console.log(channel.label + " opened");
          channel.onclose = event => console.log(channel.label + " closed");
        }
        else if (channel.label === 'signallingChannel') {
          remoteConnection.signalChannel = channel;
          channel.onmessage = handleSignalling;
          channel.onopen = event => console.log(channel.label + " opened");
          channel.onclose = event => console.log(channel.label + " closed");
        }
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

  useEffect(() => {
    const db = firebase.firestore();
    let userRef = db.collection('users').doc(`${id}`);
    val = sessionStorage.getItem('peerRole');
    userRef.onSnapshot(async (snapshot) => {
      data = snapshot.data();
      if (data && data.file && file) {
        if (data.file.verdict === 'accepted') {
          if (val === 'peerA' && data.file.clickedBy === 'peerB') send(file);
          else if (val === 'peerB' && data.file.clickedBy === 'peerA') sendFromRemote(file);
        }
        else if (data.file.verdict === 'rejected') {
          if (val === 'peerA' && data.file.clickedBy === 'peerB') toast('File rejected by Peer B ', { theme: 'dark' });
          else if (val === 'peerB' && data.file.clickedBy === 'peerA') toast('File rejected by Peer A ', { theme: 'dark' });
          await userRef.update({ file: { verdict: '', clickedBy: '' } });
        }
      }
    });

  }, []);

  async function send(file) {
    const db = firebase.firestore();
    let userRef = db.collection('users').doc(`${id}`);
    await userRef.update({ file: { verdict: '', clickedBy: '' } });


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
    const db = firebase.firestore();
    let userRef = db.collection('users').doc(`${id}`);
    await userRef.update({ file: { verdict: '', clickedBy: '' } });


    fileReader = new FileReader();
    let offset = 0;

    remoteConnection.dataChannel.bufferedAmountLowThreshold = chunkSize * 8;

    fileReader.onload = function () {
      if (remoteConnection.dataChannel.readyState !== 'open')
        return;
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
    val = sessionStorage.getItem('peerRole');
    if (val === 'peerA') setSendBtnClicked('peerA');
    else if (val === 'peerB') setSendBtnClicked('peerB');
    const db = firebase.firestore();
    let userRef = db.collection('users').doc(`${id}`);
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

      setIsFileHistory(true)
      setFileHistory(fileHistory => [...fileHistory, { id: v4(), filename: file.name, filesize: file.size / 1000000, color: '#0A82FD', sender: 'peerA', receiver: 'peerB', downloaded: false }]);
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
      setIsFileHistory(true);
      setFileHistory(fileHistory => [...fileHistory, { id: v4(), filename: file.name, filesize: file.size / 1000000, color: '#0A82FD', sender: 'peerB', receiver: 'peerA', downloaded: false }])
    }
    setFileInput('');

  }

  async function handleSignalling(event) {

    const message = JSON.parse(event.data);
    if (message.type === 'peerA_aborted_file') {
      receivedSize = 0;
      toast('File aborted by peer A', { theme: 'dark' });
      setTimeout(() => {
        setRecvFileProgress(0);
        worker.postMessage('file aborted');
      }, 1000);
    }
    else if (message.type === 'peerA_aborted_receiving_file') {
      toast(`file aborted by peer A `, { theme: 'dark' });
      if (fileReader != null) {
        fileReader.onload = null;
        fileReader.abort();
        fileReader = null;
      }
      setTimeout(() => {
        setFileProgress(0)
      }, 1000);
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
      val = sessionStorage.getItem('peerRole');
      setDisableSendBtn(true);
      setFileHistory(fileHistory => [...fileHistory, { id: v4(), filename: fileInfo.file.name, filesize: fileInfo.file.size / 1000000, color: '#333333', sender: val === 'peerA' ? 'peerB' : 'peerA', receiver: val, downloaded: false }]);
    }
    else {
      setFileHistory(fileHistory => {
        // Make a copy of the existing fileHistory array
        const updatedFileHistory = [...fileHistory];

        // Find the last item in the array
        const lastIndex = updatedFileHistory.length - 1;

        // Check if there are items in the array
        if (lastIndex >= 0) {
          // Modify the 'downloaded' property of the last item
          updatedFileHistory[lastIndex].downloaded = true;
        }

        return updatedFileHistory;
      });
      worker.postMessage(e.data);
      receivedSize += e.data.byteLength;
      setRecvFileProgress((receivedSize / totalFileSize) * 100);
      console.log(parseInt((receivedSize / totalFileSize) * 100));
      if (parseInt((receivedSize / totalFileSize) * 100) >= 100) {
        setRecvFileProgress(100)
        setTimeout(() => {
          setFileDownloaded(false);
          setRecvFileProgress(0)
        }, 1000)
      }
      if (receivedSize === receivedFileSize) {
        receivedSize = 0;
      }
    }
  }
  async function download(data) {

    const db = firebase.firestore();
    let userRef = db.collection('users').doc(`${id}`);
    await userRef.update({ file: { verdict: '' } });

    setTimeout(() => {
      setFileProgress(0);
      setRecvFileProgress(0)
    }, 1000)
    setIsFileHistory(true);
    const url = URL.createObjectURL(data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = receivedFile;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setFileDownloaded(true);
    return;
  }

  function initializeDataChannelListeners(channel) {
    channel.bufferedAmountLowThreshold = 15 * 1024 * 1024;
    channel.addEventListener('open', () => {
      if (channel.label === 'fileChannel')
        console.log('Data channel opened');
      else console.log('signalling channel opened');
    });
    channel.addEventListener('message', async (event) => {

      if (channel.label === 'fileChannel') recieveData(event);

      else if (channel.label === 'signallingChannel') {

        const message = JSON.parse(event.data);

        if (message.type === 'peerB_aborted_file') {
          await dataChannel.close();
          receivedSize = 0;
          toast(`File aborted by peer B `, { theme: 'dark' });
          setTimeout(() => {
            setRecvFileProgress(0);
            worker.postMessage('file aborted');
          }, 1000);
        }
        else if (message.type === 'peerB_aborted_receiving_file') {
          await dataChannel.close();
          if (fileReader != null) {
            fileReader.onload = null;
            fileReader.abort();
            fileReader = null;
          }
          toast(`File aborted by peer B `, { theme: 'dark' });
          setTimeout(() => {
            setFileProgress(0);
          }, 1000);
        }
      }

    });

    channel.addEventListener('close', (event) => {
      if (channel.label === 'fileChannel') {
        setTimeout(() => {
          dataChannel = localConnection.createDataChannel('fileChannel');
          initializeDataChannelListeners(dataChannel);
        }, 1000);
      }
      else console.log('signalling channel closed');
    });
  }



  function handleFile(event) {
    setFileInput(event.target.files[0]);
    document.querySelector('.fileInput').value = '';
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
    if (fileHistory.length === 1) setIsFileHistory(false);
  }

  async function handleSendAbort(event) {
    event.preventDefault();
    val = sessionStorage.getItem('peerRole');

    if (val === 'peerA') {
      setTimeout(() => {
        setFileProgress(0);
      }, 1000);
      await dataChannel.close();
      if (fileReader != null) {
        fileReader.onload = null;
        fileReader.abort();
        fileReader = null;
      }
      const abortMessage = {
        type: 'peerA_aborted_file',
      };
      signalChannel.send(JSON.stringify(abortMessage));
    }
    else {
      const abortMessage = {
        type: 'peerB_aborted_file',
      };
      if (fileReader != null) {
        fileReader.onload = null;
        fileReader.abort();
        fileReader = null;
      }
      remoteConnection.signalChannel.send(JSON.stringify(abortMessage));
      setTimeout(() => {
        setFileProgress(0);
      }, 1000);
    }
  }

  async function handleReceiveAbort(event) {
    event.preventDefault();

    val = sessionStorage.getItem('peerRole');
    if (val === 'peerB') {
      const abortMessage = {
        type: 'peerB_aborted_receiving_file',
      };
      await remoteConnection.signalChannel.send(JSON.stringify(abortMessage));
      receivedSize = 0;
      setTimeout(() => {
        setRecvFileProgress(0);
        worker.postMessage('file aborted');
      }, 1000);
    }
    else {
      await dataChannel.close();
      const abortMessage = {
        type: 'peerA_aborted_receiving_file',
      };
      signalChannel.send(JSON.stringify(abortMessage));
      receivedSize = 0;
      setTimeout(() => {
        setRecvFileProgress(0);
        worker.postMessage('file aborted');
      }, 1000);
    }

  }
  async function handleFileAccept(event) {
    setDisableSendBtn(false);
    event.preventDefault();
    const db = firebase.firestore();
    let userRef = db.collection('users').doc(`${id}`);
    val = sessionStorage.getItem('peerRole');
    const message = {
      file: {
        verdict: 'accepted',
        clickedBy: val
      }
    };
    await userRef.update(message);

  }

  async function handleFileReject(fileId) {
    setDisableSendBtn(false);
    const db = firebase.firestore();
    let userRef = db.collection('users').doc(`${id}`);
    val = sessionStorage.getItem('peerRole');
    const message = {
      file: {
        verdict: 'rejected',
        clickedBy: val
      }
    };
    await userRef.update(message);
    removeFileHistory(fileId);
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
              <button disabled={parseInt(fileProgress) || parseInt(recvFileProgress) || disableSendBtn} className='sendFileBtn' onClick={(sendFile)}>Send</button>
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
                            {
                              (val === 'peerA' && v.sender === 'peerA' && v.receiver === 'peerB') && <button className='reject-file-icon' onClick={() => removeFileHistory(v.id)}><CloseIcon /></button>
                            }
                            {
                              (val === 'peerB' && v.sender === 'peerB' && v.receiver === 'peerA') && <button className='reject-file-icon' onClick={() => removeFileHistory(v.id)}><CloseIcon /></button>
                            }
                            {
                              ((val === 'peerA' && v.receiver === 'peerA') || (val === 'peerB' && v.receiver === 'peerB')) && !v.downloaded && (<>
                                <button className='accept-file-icon' onClick={handleFileAccept}><CheckIcon /></button>
                                <button className='reject-file-icon' onClick={() => handleFileReject(v.id)}><CloseIcon /></button>
                              </>)
                            }
                            {
                              ((val === 'peerA' && v.receiver === 'peerA') || (val === 'peerB' && v.receiver === 'peerB')) && v.downloaded &&
                              <button className='reject-file-icon' onClick={() => removeFileHistory(v.id)}><CloseIcon /></button>
                            }
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