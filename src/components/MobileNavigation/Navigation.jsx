import React, { useEffect, useState, useMemo } from 'react'
import { BottomNavigation, BottomNavigationAction, useScrollTrigger } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import DuoIcon from '@mui/icons-material/Duo';
import Transfer from '../Transfer/Transfer';
import Chat from '../Chat/Chat';
import VideoChat from '../Video/VideoChat';

const Navigation = ({ localConnection, remoteConnection, peerAName, peerBName, peerApfpId, peerBpfpId }) => {
    const [value, setValue] = useState(0);

    const renderSelectedComponent = useMemo(() => {
        switch (value) {
            case 0:
                return <Transfer localConnection={localConnection} remoteConnection={remoteConnection} />;
            case 1:
                return <Chat peerAName={peerAName} peerBName={peerBName} peerApfpId={peerApfpId} peerBpfpId={peerBpfpId} localConnection={localConnection} remoteConnection={remoteConnection} />;
            case 2:
                return <VideoChat peerApfpId={peerApfpId} peerBpfpId={peerBpfpId} localConnection={localConnection} remoteConnection={remoteConnection} />;
            default:
                return null;
        }
    }, [value, localConnection, remoteConnection, peerAName, peerBName, peerApfpId, peerBpfpId]);
    return (
        <>

            <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                }}
            >
                <BottomNavigationAction label="Share" icon={<FolderSharedIcon />} />
                <BottomNavigationAction label="Chat" icon={<ChatIcon />} />
                <BottomNavigationAction label="Call" icon={<DuoIcon />} />
            </BottomNavigation>
            {renderSelectedComponent}
        </>
    )
}

export default Navigation