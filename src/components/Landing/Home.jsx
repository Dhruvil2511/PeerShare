import React from 'react'
import { ReactComponent as ReactLogo } from '../../assets/logo.svg';
import './Home.scss'
import { ReactComponent as Network } from '../../assets/network.svg';
// import { ReactComponent as Peer } from '../../assets/peer-peer.svg';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import PublicIcon from '@mui/icons-material/Public';
import MessageIcon from '@mui/icons-material/Message';
import DuoIcon from '@mui/icons-material/Duo';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
const Home = () => {
    return (
        <>
            <div className="container-fluid-md  ms-3 me-3">
                <div className="navbar sticky">
                    <div className="logo">
                        <div className="logo_name">
                            <ReactLogo className='.img' />
                            <div className="name-motive">
                                <span className='name'>PeerShare</span>
                                <span className='motive'>Your Files, Your Way, PeerShare Today!</span>
                            </div>

                        </div>

                    </div>
                    <div className="empty"></div>
                    <div className="navigation">
                        <div className="d-flex justify-content-evenly align-items-center" style={{ width: '100%' }}>
                            <div className="nav-item">
                                <a class="nav-link  link" aria-current="page" href="/" style={{ fontSize: '1.1vw' }}>linktree</a>
                            </div>
                            <div className="nav-item">
                                <a class="nav-link  link" aria-current="page" href="/about" style={{ fontSize: '1.1vw' }}>About</a>
                            </div>
                            <div className="nav-item">
                                <a class="nav-link  link" aria-current="page" href="/faq" style={{ fontSize: '1.1vw' }}>FAQ</a>
                            </div>
                            <div className="nav-item">
                                <a class="nav-link link" aria-current="page" href="/privacy" style={{ fontSize: '1.1vw' }}>Privacy</a>
                            </div>
                            <div className="nav-item">
                                <button class="join nav-link" aria-current="page" href="/join" style={{ backgroundColor: '#1AF1A0' }}>Start Sharing</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mt-5">
                <div className="row">
                    <div className="col left">
                        <div className="content">
                            <div className="info">

                                <h1>Your data, your control
                                    <br />
                                    <h4>~no third-party servers involved.</h4>
                                </h1>
                                <br />
                                <p>
                                    Send files of any size directly from your device without storing anything online.
                                </p>
                            </div>
                            <div className="features">
                                <div className="feature-left">
                                    <div className="peer">
                                        <PeopleAltIcon style={{ color: '#0A82FD' }} />
                                        &nbsp;<span style={{ fontWeight: 'bolder' }}>Peer To Peer</span>
                                    </div>
                                    <div className="no-limit">
                                        <AllInclusiveIcon style={{ color: '#0A82FD' }} />
                                        &nbsp;<span style={{ fontWeight: 'bolder' }}>No Size Limit</span>
                                    </div>
                                </div>
                                <div className="feature-middle">
                                    <div className="chat-feature">
                                        <MessageIcon style={{ color: '#0A82FD' }} />
                                        &nbsp;<span style={{ fontWeight: 'bolder' }}>Chat section </span>
                                    </div>
                                    <div className="video-feature">
                                        <DuoIcon style={{ color: '#0A82FD' }} />&nbsp;
                                        &nbsp;<span style={{ fontWeight: 'bolder' }}>Video Chat</span>
                                    </div>
                                </div>
                                <div className="feature-right">
                                    <div className="fast">
                                        <ElectricBoltIcon style={{ color: '#0A82FD' }} />
                                        &nbsp;<span style={{ fontWeight: 'bolder' }}>Rapid Transfer</span>
                                    </div>
                                    <div className="worldwide">
                                        <PublicIcon style={{ color: '#0A82FD' }} />&nbsp;
                                        &nbsp;<span style={{ fontWeight: 'bolder' }}>World Wide</span>

                                    </div>
                                </div>
                            </div>
                            <br />
                            <br />
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <button class="join" href="/join" style={{ backgroundColor: '#1AF1A0', width: '40%', fontSize: '1.2vw' }}>Start Sharing</button>
                            </div>
                        </div>
                    </div>
                    <div className="col right">
                        <div className="animation">
                            <Network />
                        </div>
                    </div>
                </div>
            </div>
            <div className="scroll">
                <ExpandCircleDownIcon style={{ color: 'white', fontSize: '80px' }} />
            </div>

            <div className="container mt-5 details">
                <h2>How it Works?</h2>
                <div className="container-fluid how-it-works">
                    
                </div>
            </div>

        </>
    )
}

export default Home;