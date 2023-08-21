import React, { useEffect, useState, useRef } from 'react'

import img1 from '../Transfer/testing.png'

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import '../Transfer/Transfer.css'
import { useParams } from 'react-router-dom';
import { Player, Controls } from '@lottiefiles/react-lottie-player';



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
let localConnection = null;
let idField = null;
let receiveChannel = null;
let userRef = null;
let channel = null;
let remoteConnection = null;
let receieveMessageChannel = null;
let fileReader = null;
let receivedSize = 0;
let receivedFileSize = null;
const chunkSize = 64 * 1024;
let fileChunks = [];
let file = null;
let receivedFile;
let fileInfo = null;
let answer = null;

const Transfer = ({ localConnection, remoteConnection }) => {
  const [connectionId, setConnectionId] = useState(null);
  const [isButtonDisabled, setDisabled] = useState(false);
  const [userEnteredId, setUserEnteredId] = useState('');
  const [fileInput, setFileInput] = useState([]);
  const [connectionBtnState, setConnectionBtnState] = useState('Connect');

  let { id } = useParams();


  useEffect(() => {
    let checkPeerRole = localStorage.getItem('peerRole');
    if (checkPeerRole === 'peerA') {
      dataChannel = localConnection.createDataChannel('fileChannel');
      initializeDataChannelListeners(dataChannel);
    }
    else {
      remoteConnection.addEventListener('datachannel', (event) => {
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

  // useEffect(() => {
  //   const removeConnnection = async () => {
  //     const db = firebase.firestore();
  //     const userRef = await db.collection('users').doc(id);
  //     const peerA = await userRef.collection('peerA').get();
  //     const roomID = await userRef.get();

  //     peerA.forEach(async candidate => {
  //       await candidate.ref.delete();
  //     });
  //     const peerB = await userRef.collection('peerB').get();
  //     peerB.forEach(async candidate => {
  //       await candidate.ref.delete();
  //     });

  //     if (roomID && roomID.data().offer && roomID.data().answer) {
  //       const updateData = {
  //         offer: firebase.firestore.FieldValue.delete(),
  //         answer: firebase.firestore.FieldValue.delete(),
  //       };

  //       userRef.update(updateData)
  //         .then(() => {
  //           console.log('Document updated successfully without the field');
  //         })
  //         .catch((error) => {
  //           console.error('Error updating document:', error);
  //         });
  //     }

  //   }
  //   removeConnnection();

  //   let checkPeerRole = localStorage.getItem('peerRole');
  //   if (checkPeerRole === 'peerA') {
  //     generateID();
  //   } else if (checkPeerRole === 'peerB') {
  //     joinRoom();
  //   } else {
  //     // If peerRole is not set, assume Peer B by default
  //     localStorage.setItem('peerRole', 'peerB');
  //     joinRoom();
  //   }
  // }, []);




  // useEffect(() => {
  //   let checkSender = localStorage.getItem('senderId');
  //   // console.log(typeof (checkSender));
  //   if (checkSender === 'notset') {
  //     check();
  //   }
  //   else if (checkSender === null) {
  //     joinRoom();
  //   }
  //   // Disconnect sender from sender 
  //   else {
  //     const removeListener = async () => {
  //       const db = firebase.firestore();
  //       const userRef = db.collection('users').doc(id);
  //       const peerA = await userRef.collection('peerA').get();
  //       peerA.forEach(async candidate => {
  //         await candidate.ref.delete();
  //       });
  //       const peerB = await userRef.collection('peerB').get();
  //       peerB.forEach(async candidate => {
  //         await candidate.ref.delete();
  //       });
  //     }
  //     removeListener();
  //     generateID();
  //   }
  //   async function check() {
  //     const db = firebase.firestore();
  //     userRef = db.collection('users').doc(`${id}`);
  //     const roomId = await userRef.get();
  //     console.log('Got room:', roomId.exists);
  //     if (!roomId.exists) {
  //       generateID();
  //     }
  //   }
  // }, []);


  function send(file) {

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
  function sendFromRemote(file) {

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

  // async function generateID() {

  //   const db = firebase.firestore();
  //   userRef = await db.collection('users').doc(`${id}`);
  //   console.log('generate id called');
  //   console.log('Creating local connection');
  //   localConnection = new RTCPeerConnection(configuration);
  //   initializeIceListeners(localConnection);

  //   dataChannel = localConnection.createDataChannel('fileChannel');

  //   initializeDataChannelListeners(dataChannel);

  //   localConnection.addEventListener('icecandidate', event => {
  //     if (!event.candidate) {
  //       console.log('Got final candidate!');
  //       return;
  //     }
  //     console.log('Got candidate: ', event.candidate);
  //     peerA.add(event.candidate.toJSON());
  //   });

  //   const peerA = userRef.collection('peerA');

  //   const offer = await localConnection.createOffer();
  //   // console.log(offer.type);
  //   await localConnection.setLocalDescription(offer);
  //   console.log('Got offer: ', offer);
  //   // creating room schema object 
  //   const peerOffer = {
  //     'offer': {
  //       type: offer.type,
  //       sdp: offer.sdp
  //     },
  //   };
  //   // setting offer in firestore for roomID
  //   await userRef.set(peerOffer);
  //   setConnectionId(userRef.id);

  //   userRef.onSnapshot(async (snapshot) => {
  //     console.log('hello');
  //     const data = snapshot.data();
  //     if (data && data.answer) {
  //       console.log('We got remote description: ', data.answer);
  //       if (localConnection)
  //         await localConnection.setRemoteDescription(data.answer);
  //     }
  //   });

  //   userRef.collection('peerB').onSnapshot(async (snapshot) => {
  //     snapshot.docChanges().forEach(async change => {
  //       if (change.type === 'added') {
  //         let data = change.doc.data();
  //         console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
  //         if (localConnection.remoteDescription)
  //           await localConnection.addIceCandidate(new RTCIceCandidate(data));
  //       }
  //     });
  //   });
  //   localStorage.setItem('senderId', id);
  // }


  // async function joinRoom() {
  //   // steps 1: create databse var and create fireebase instance
  //   const db = firebase.firestore();
  //   // check if id exists 
  //   userRef = db.collection('users').doc(`${id}`);
  //   const peerB = userRef.collection('peerB');
  //   const roomId = await userRef.get();
  //   console.log('Got room:', roomId.exists);

  //   if (roomId.exists) {

  //     remoteConnection = new RTCPeerConnection(configuration);
  //     initializeIceListeners(remoteConnection);
  //     remoteConnection.addEventListener('icecandidate', (event) => {
  //       if (!event.candidate) {
  //         console.log('Got final candidate!');
  //         return;
  //       }
  //       console.log('Got candidate: ', event.candidate);
  //       peerB.add(event.candidate.toJSON());

  //     });
  //     remoteConnection.addEventListener('datachannel', (event) => {
  //       channel = event.channel;
  //       channel.onmessage = recieveData;
  //       if (channel.label === 'messageChannel') {
  //         remoteConnection.messageChannel = channel;
  //       }
  //       else {
  //         remoteConnection.dataChannel = channel;
  //       }
  //       channel.onopen = event => console.log(channel.label + " opened");
  //       channel.onclose = event => console.log(channel.label + " closed");
  //     });



  //     const receivedOffer = await roomId.data().offer;
  //     console.log('Got offer: ', receivedOffer);
  //     if (receivedOffer) {
  //       await remoteConnection.setRemoteDescription(receivedOffer);
  //       answer = await remoteConnection.createAnswer();
  //       await remoteConnection.setLocalDescription(answer);

  //       const peerAnswer = {
  //         answer: {
  //           type: answer.type,
  //           sdp: answer.sdp
  //         },
  //       }

  //       await userRef.update(peerAnswer);
  //     }


  //     userRef.collection('peerA').onSnapshot(snapshot => {
  //       snapshot.docChanges().forEach(async change => {
  //         if (change.type === 'added') {
  //           let data = change.doc.data();
  //           console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
  //           if (remoteConnection.remoteDescription) await remoteConnection.addIceCandidate(new RTCIceCandidate(data));
  //         }
  //       });
  //     });
  //   }
  // }
  async function recieveData(e) {

    if (typeof (e.data) === 'string') {
      fileInfo = JSON.parse(e.data);
      receivedFile = fileInfo.file.name;
      receivedFileSize = fileInfo.file.size;
    }
    else {
      fileChunks.push(e.data);
      receivedSize += e.data.byteLength;
      console.log("messsage received!!!" + e.data)
      console.log(receivedSize);
      if (receivedFile && receivedSize === receivedFileSize) {
        const file = new Blob(fileChunks);
        fileChunks = []
        receivedSize = 0;
        const url = URL.createObjectURL(file);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = receivedFile; // Set the desired file name here
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }
    }
  }





  // function initializeIceListeners(connection) {
  //   connection.addEventListener('icegatheringstatechange', () => {
  //     console.log(
  //       `ICE gathering state changed: ${connection.iceGatheringState}`);
  //   });

  //   // connection state change -> event for checking wheter connection failed or success
  //   connection.addEventListener('connectionstatechange', () => {
  //     if (connection.connectionState === 'disconnected') {
  //       localStorage.removeItem('senderId');
  //       document.getElementById('state').innerText = 'Disconnected';
  //     }

  //     console.log(`Connection state change: ${connection.connectionState}`);
  //   });

  //   // event for checking stability of signaling
  //   connection.addEventListener('signalingstatechange', () => {
  //     console.log(`Signaling state change: ${connection.signalingState}`);
  //   });

  //   // event for noticing whenever we get new ice candidate
  //   connection.addEventListener('iceconnectionstatechange', () => {
  //     console.log(
  //       `ICE connection state change: ${connection.iceConnectionState}`);
  //   });
  // }
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

  async function hangUp(event) {
    if (localConnection) localConnection.close();
    if (remoteConnection) remoteConnection.close();

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

  // function handleConnection(event) {
  //   if (connectionBtnState === 'Connect') {
  //     generateID();
  //     setConnectionBtnState('Disconnect');
  //   } else {
  //     // hangUp();
  //     setConnectionBtnState('Connect');
  //   }
  // }


  function handleFile(event) {
    setFileInput(event.target.files[0]);
  }
  function retryConnect(event) {
    window.location.reload();
  }
  return (
    <>

      <div style={{ float: 'left', paddingTop: '2%', position: 'relative', backgroundColor: 'black', width: '40%', height: '85vh' }}>
        {/* <img style={{width: '100%', height: '100%'}} src={img1}></img> */}
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


          <span style={{ backgroundColor: 'white' }}>Animation to check ui lag</span>
          <Player
            autoplay
            loop
            src="https://lottie.host/2534c503-7643-4575-a5d5-1eac232a8004/Q7y3wRvx93.json"
            style={{ height: '300px', width: '300px' }}
          >
            <Controls visible={true} buttons={['play', 'repeat', 'frame', 'debug']} />
          </Player>
        </div>
      </div>
    </>

  )
}

export default Transfer;
