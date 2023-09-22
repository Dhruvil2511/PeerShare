import React from 'react'
import { useEffect } from 'react';
import linktree from '../../assets/linktree-logo-icon.png';
import { ReactComponent as ReactLogo } from '../../assets/logo.svg';
import './Home.scss'
const LandingNavigation = () => {
    useEffect(() => {

        const svgElement = document.querySelector(".img");
        const name = document.querySelector(".name");
        svgElement.addEventListener('click', () => {
            window.location.href = '/';
        });
        name.addEventListener('click', () => {
            window.location.href = '/';
        });

    }, []);

    return (
        <>
            <div className="container-fluid-md  ms-3 me-3">
                <div className="navbar sticky">
                    <div className="logo">
                        <div className="logo_name">

                            <ReactLogo className='img' style={{ cursor: 'pointer' }} />

                            <div className="name-motive">
                                <span className='name' style={{ cursor: 'pointer' }}>PeerShare</span>
                                <span className='motive'>Your Files, Your Way, PeerShare Today!</span>
                            </div>
                        </div>

                    </div>
                    <div className="empty"></div>
                    <div className="navigation">
                        <div className="d-flex justify-content-evenly align-items-center" style={{ width: '100%' }}>
                            <div className="nav-item">
                                <a class="nav-link  link" aria-current="page" href="/" style={{ fontSize: '1.1vw' }}>Home</a>
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
                                <a class="nav-link  link" aria-current="page" href="/" style={{ fontSize: '1.1vw' }}>
                                    <img src={linktree} alt="X" srcset="" style={{ width: '15px' }} />
                                </a>
                            </div>
                            <div className="nav-item">
                                <form action="/join">
                                    <button class="join nav-link" aria-current="page" href="/join" style={{ backgroundColor: '#1AF1A0' }}>Start Sharing</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default LandingNavigation