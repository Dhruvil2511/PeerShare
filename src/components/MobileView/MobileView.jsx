import React from 'react'
import TransferMobile from './TransferMobile';
import ChatMobile from './ChatMobile'
import VideoChatMobile from './VideoChatMobile';

function MobileView({localConnection,remoteConnection}) {
  return (
    <>
        <div style={{display:'flex',flexDirection:'row'}}>
            <div id='transfer' style={{width:'100vw'}}><TransferMobile localConnection={localConnection} remoteConnection={remoteConnection}/></div>
            <div id='chat' style={{width:'100vw',display:'none'}}><ChatMobile localConnection={localConnection} remoteConnection={remoteConnection} id='chat'/></div>
            <div id='videochat' style={{width:'100vw',display:'none'}}><VideoChatMobile/></div>
        </div>
        <div style={{display:'flex',flexDirection:'row'}}>
            <button onClick={()=>{
                document.getElementById('transfer').style.display='block';
                document.getElementById('chat').style.display='none';
                document.getElementById('videochat').style.display='none';
            }}>Transfer</button>
            <button onClick={()=>{
                document.getElementById('transfer').style.display='none'
                document.getElementById('chat').style.display='block'
                document.getElementById('videochat').style.display='none'
            }}>Chat</button>
            <button onClick={()=>{
                document.getElementById('transfer').style.display='none'
                document.getElementById('chat').style.display='none'
                document.getElementById('videochat').style.display='block'
            }}>Video Chat</button>
        </div>
    </>
  )
}

export default MobileView