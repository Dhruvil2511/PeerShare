import React from 'react'

import './Home.scss'
import { ReactComponent as Network } from '../../assets/network.svg';
import { ReactComponent as FooterLogo } from '../../assets/footer-logo.svg';

import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import PublicIcon from '@mui/icons-material/Public';
import MessageIcon from '@mui/icons-material/Message';
import DuoIcon from '@mui/icons-material/Duo';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import animation from '../../assets/transfer.json'
import earth from '../../assets/save_earth.json'
import secure from '../../assets/secure.json'
import globe from '../../assets/globe.json'
import video from '../../assets/video.json'
import Lottie from 'lottie-react';
import LandingNavigation from './LandingNavigation';

const Home = () => {


    return (
        <>
            <div className="landing">
                <LandingNavigation />
                <div className="container mt-5 zoomer">
                    <div className="row d-flex" >
                        <div className="col left">
                            <div className="content">
                                <div className="info">

                                    <h1>Your data, your control
                                        <br />
                                        <h4>One-One Collaboration Platform</h4>
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
                                            &nbsp;<span style={{ fontWeight: 'bolder', color: "#0A82FD" }}>Peer To Peer</span>
                                        </div>
                                        <div className="no-limit">
                                            <AllInclusiveIcon style={{ color: '#0A82FD' }} />
                                            &nbsp;<span style={{ fontWeight: 'bolder', color: "#0A82FD" }}>No Size Limit</span>
                                        </div>
                                    </div>
                                    <div className="feature-middle">
                                        <div className="chat-feature">
                                            <MessageIcon style={{ color: '#0A82FD' }} />
                                            &nbsp;<span style={{ fontWeight: 'bolder', color: "#0A82FD" }}>Live Chat </span>
                                        </div>
                                        <div className="video-feature">
                                            <DuoIcon style={{ color: '#0A82FD' }} />
                                            &nbsp;<span style={{ fontWeight: 'bolder', color: "#0A82FD" }}>Video Chat</span>
                                        </div>
                                    </div>
                                    <div className="feature-right">
                                        <div className="fast">
                                            <ElectricBoltIcon style={{ color: '#0A82FD' }} />
                                            &nbsp;<span style={{ fontWeight: 'bolder', color: "#0A82FD" }}>Rapid Transfer</span>
                                        </div>
                                        <div className="worldwide">
                                            <PublicIcon style={{ color: '#0A82FD' }} />&nbsp;
                                            &nbsp;<span style={{ fontWeight: 'bolder', color: "#0A82FD" }}>World Wide</span>

                                        </div>
                                    </div>
                                </div>
                                <br />
                                <br />
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <form action="/join">
                                        <button class="join" href="/join" style={{ backgroundColor: '#1AF1A0', width: '100%', fontSize: '1.2vw' }}>Start Sharing</button>
                                    </form>
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
                    <h2>What is PeerShare?</h2>
                    <div className="container-fluid mt-5 how-it-works">
                        <Lottie animationData={animation} style={{ width: '50%' }} />
                        <div className="how-it-works-explain">
                            <h3>Files are shared straight from your device</h3>
                            <ul style={{ listStyleType: 'none' }}>
                                <li>Peer Share uses WebRtc Technology to to find the <strong>shortest path
                                </strong> and<strong> make direct connection.</strong></li>
                                <li> Peer share is commonly used in real-time collaboration tools such as file transfer, live chat & video chat.</li>
                                <li><strong>We don't store anything</strong>! User shares the files without the need for intermediate servers.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="container-fluid mt-5 how-it-works">
                        <div className="how-it-works-explain">
                            <h3>Live Chat & Video Call</h3>
                            <ul style={{ listStyleType: 'none' }}>
                                <li>Experience Seamless Live Chat and Video Chat with Our App.</li>
                                <li>In a world that's constantly evolving, communication has never been more critical.</li>
                                <li>Our app offers you a seamless experience like no other, combining file-transfer, live  <br />chat & video calls  into one powerful platform.</li>
                                <li>PeerShare has Cross-Platform Compatibility</li>
                            </ul>
                        </div>
                        <Lottie animationData={video} style={{ width: '30%' }} />
                    </div>

                    <div className="container-fluid mt-5 how-it-works">
                        <Lottie animationData={earth} style={{ width: '50%' }} />
                        <div className="how-it-works-explain">
                            <h3>Low environmental impact</h3>
                            <ul style={{ listStyleType: 'none' }}>
                                <li style={{ fontWeight: 'bolder' }}>Peer Share don't store your data in any server, so we don't have those enormous bulky servers.</li>
                                <li>Serverless file transfer eliminates the need for these energy-intensive facilities, leading to<strong> reduced energy consumption.</strong></li>
                                <li>Data centers and servers contribute to carbon emissions. By bypassing these centralized infrastructures, serverless file transfer<strong> reduces the carbon footprint</strong> associated with data storage and transfer.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="container-fluid mt-5 how-it-works">
                        <div className="how-it-works-explain">
                            <h3>Only the receiver can access your files</h3>
                            <ul style={{ listStyleType: 'none' }}>
                                <li>Peer Share uses WebRtc Technology and it uses encryption to secure data transmission. </li>
                                <li>Data is passed through channels and it is encrypted with <a href="https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security" target='_blank' rel="noreferrer">(DTLS)</a> Protcol.</li>
                                <li>WebRTC supports end-to-end encryption, meaning that data is encrypted on the sender's device and only decrypted on the recipient's device.</li>
                            </ul>
                        </div>
                        <Lottie animationData={secure} style={{ width: '50%' }} />
                    </div>
                    <div className="container-fluid mt-5 how-it-works">
                        <Lottie animationData={globe} style={{ width: '30%' }} />
                        <div className="how-it-works-explain">
                            <h3>Share you files Anywhere around globe</h3>
                            <ul style={{ listStyleType: 'none' }}>
                                <li>Peer Share is built on modern web technologies, allowing it to work on devices far away from each other.</li>
                                <li> It just needs to be connected to the internet.</li>
                                <li>When you close the browser tab your files are no longer accessible, minimising the risk of anyone getting unwanted access.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <hr style={{ color: '#1AF1A0' }} />
                <div class="container-fluid-md  mt-5 ms-3 me-3 footer">

                    <footer
                        class="text-center text-lg-start text-white"
                        style={{ background: 'transparent' }}>
                        <section
                            class="d-flex justify-content-center p-4"
                            style={{ backgroundColor: "none" }}>

                            <div class="d-flex justify-content-center align-items-center" style={{ width: '100%' }}>

                                <h3>Your Files, Your Way , PeerShare Today!</h3>
                                <form action="/join">
                                    <button class="join ms-5" href="/join" style={{ backgroundColor: '#1AF1A0', width: '100%', fontSize: '1.2vw' }}>Start Sharing</button>
                                </form>
                            </div>

                        </section>
                        <hr style={{ color: '#1AF1A0' }} />


                        <section class="">
                            <div class="container text-center text-md-start mt-5">

                                <div class="row mt-3">

                                    <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">

                                        <h6 class="text-uppercase fw-bold">About</h6>
                                        <hr class="mb-4 mt-0 d-inline-block mx-auto" style={{ width: " 60px", backgroundColor: "#7c4dff", height: "2px" }} />

                                        <p>
                                            <a href="#!" class="text-white link">Developers</a>
                                        </p>
                                        <p>
                                            <a href="#!" class="text-white link ">Donate</a>
                                        </p>
                                        <p>
                                            <a href="#!" class="text-white link">Share</a>
                                        </p>
                                    </div>

                                    <div class="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">

                                        <h6 class="text-uppercase fw-bold ">Contact</h6>
                                        <hr class="mb-4 mt-0 d-inline-block mx-auto" style={{ width: " 60px", backgroundColor: "#7c4dff", height: "2px" }} />

                                        <p>
                                            <a href="mailto:" class="text-white link">Report Bug</a>
                                        </p>
                                        <p>
                                            <a href="/feedback" class="text-white link">Feedback form</a>
                                        </p>
                                        <p>
                                            <a href="mailto:" class="text-white link">Contact us</a>
                                        </p>
                                    </div>

                                    <div class="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
                                        <h6 class="text-uppercase fw-bold">Features</h6>
                                        <hr class="mb-4 mt-0 d-inline-block mx-auto" style={{ width: " 60px", backgroundColor: "#7c4dff", height: "2px" }} />

                                        <p><i class="fas fa-home mr-3 link"></i> File Transfer</p>
                                        <p><i class="fas fa-envelope mr-3 link"></i>Live Chat</p>
                                        <p><i class="fas fa-phone mr-3 link"></i>Video Chat</p>
                                    </div>
                                    <div class="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4" style={{ width: 'fit-content' }}>
                                        <h5>Subscribe?</h5>
                                        <h6>To get Latest Updates</h6>
                                        <form action="/" method='POST' className='d-flex'>
                                            <input type="text" name="email" id="" />
                                            <button class="ms-3" type="submit" style={{ padding: '2%', border: 'none', borderRadius: '26px', backgroundColor: '#1AF1A0', fontSize: '0.8vw' }}>Subscribe</button>
                                        </form>
                                    </div>
                                </div>

                            </div>
                        </section>

                        <div class="text-center p-3">
                            <div className='d-flex justify-content-center align-items-center'>
                                ©2023 Copyright:
                                <a class="text-white" href="/">PeerShare</a>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <FooterLogo />
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    )
}

export default Home;