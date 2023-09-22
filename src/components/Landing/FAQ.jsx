import React from 'react'
import LandingNavigation from './LandingNavigation'
import visual from '../../assets/visual.png'
import chrome from '../../assets/chrome.png'
import edge from '../../assets/microsoft.png'
import firefox from '../../assets/firefox.png'
import brave from '../../assets/brave.png'
import './Home.scss'


const FAQ = () => {
    return (
        <>
            <div className="faq" style={{ background: '../../assets/background_grainy.jpg', backgroundSize: 'cover', backgroundRepeat: 'repeat', overflowX: 'hidden', height: "100vh", widht: '100vw' }}>
                <LandingNavigation />
                <div className="container mt-5">
                    <div className="start text-white text-center">
                        <h1>FAQs</h1>
                    </div>

                    <div class="accordion mt-5" id="accordionPanelsStayOpenExample" style={{ border: '2px solid #1BF0A0', boxShadow: '0 0 25px #1BF0A0', borderRadius: '16px', overflow: 'hidden' }} >
                        <div class="accordion-item bg-black">
                            <h2 class="accordion-header" id="panelsStayOpen-headingOne">
                                <button class="accordion-button bg-black text-white" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                                    <h4>Why peer to peer?</h4>
                                </button>
                            </h2>
                            <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
                                <div class="accordion-body text-white">
                                    <strong>Peer to peer communication means the communication flows directly between two devices rather than via an intermediate server. </strong>
                                    It can be more private and secure because information goes straight between you and the other person, not through a company's server.
                                    PeerShare achieve this via <a href="https://en.wikipedia.org/wiki/WebRTC" rel="noreferrer" target='_blank'>WebRTC</a> Technology.
                                    <br />
                                    <strong>Check out this image for Visual representation.</strong>
                                    <br />
                                    <div className="visual d-flex justify-content-center align-items-center" style={{ width: '100%', height: '100%' }}>
                                        <img src={visual} alt="X" style={{ height: '10%', width: "50%" }} />
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
                                <button class="accordion-button bg-black text-white collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                                    <h4>Why is it slower than my maximum network speed?</h4>
                                </button>
                            </h2>
                            <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingTwo">
                                <div class="accordion-body text-white bg-black">
                                    <ul style={{ listStyleType: 'circle' }}>
                                        <li>The maximum transfer speed is determined by the upload speed of the sender or download speed of the receiver, whichever is slower.</li>
                                        <li>Firewalls and Network Address Translation (NAT) devices can introduce additional latency and complexity to Peer connections.</li>
                                        <li>The physical distance between users can affect latency. Users in different geographic locations may experience higher latency due to the time it takes for data to travel between them.</li>
                                        <li>Some Browser extensions or add-ons can interfere with WebRTC performance. It's essential to check for any extensions that may be causing issues</li>
                                    </ul>

                                </div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="panelsStayOpen-headingThree">
                                <button class="accordion-button text-white bg-black collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                                    <h4>How long is file gonna be stored on internt or server?</h4>
                                </button>
                            </h2>
                            <div id="panelsStayOpen-collapseThree" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingThree">
                                <div class="accordion-body text-white bg-black">
                                    <strong>We don't store anything except file name and file size.</strong>
                                    <br />
                                    Your file is either send directly to your peer or if you stop in between your data chunks are destroyed totally.
                                    <br />
                                    So no need to worry about your file. If you lost it make sure you got backup.
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item">
                            <h2 class="accordion-header" id="panelsStayOpen-headingFour">
                                <button class="accordion-button bg-black text-white collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFour" aria-expanded="false" aria-controls="panelsStayOpen-collapseFour">
                                    <h4>What browsers do you support?</h4>
                                </button>
                            </h2>
                            <div id="panelsStayOpen-collapseFour" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingFour">
                                <div class="accordion-body bg-black text-white">
                                    <strong>Currently PeerShare has been tested in following browsers</strong>
                                    <div className="d-flex justify-content-evenly align-items-center mt-2">
                                        <img src={chrome} alt="X" style={{ height: '5%', width: "5%" }} />
                                        <img src={edge} alt="X" style={{ height: '5%', width: "5%" }} />
                                        <img src={brave} alt="X" style={{ height: '5%', width: "5%" }} />
                                        <img src={firefox} alt="X" style={{ height: '5%', width: "5%" }} />

                                    </div>
                                </div>
                            </div>
                        </div>



                        <div class="accordion-item">
                            <h2 class="accordion-header" id="panelsStayOpen-headingFive">
                                <button class="accordion-button collapsed text-white bg-black" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFive" aria-expanded="false" aria-controls="panelsStayOpen-collapseFive">
                                    <h4>Can I use the app on mobile devices or just on desktop?</h4>
                                </button>
                            </h2>
                            <div id="panelsStayOpen-collapseFive" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingFive">
                                <div class="accordion-body text-white bg-black">
                                    <strong>Yes it is comaptible on mobile devices and  most of tabs.</strong>
                                    However, best experience will be on desktop/laptop.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mail d-flex mt-5 text-white  justify-content-center align-items-center flex-column">
                        <span className='fs-1'>Couldn't find your question?</span>
                        <br />
                        <span className='fs-3'>Mail here: <a href="mailto:dhruvilprajapati2003@gmail.com">PeerShare</a></span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default FAQ