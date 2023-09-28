import React from 'react'
import { useEffect, useState } from 'react';
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

    const [isCollapsed, setIsCollapsed] = useState(true); // Initialize the menu as collapsed

    useEffect(() => {
        // Handle clicks on the logo and name to navigate to the home page
        const svgElement = document.querySelector(".img");
        const name = document.querySelector(".name");
        svgElement.addEventListener('click', () => {
            window.location.href = '/';
        });
        name.addEventListener('click', () => {
            window.location.href = '/';
        });
    }, []);

    // Toggle the menu when the button is clicked
    const toggleMenu = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            {/* <nav className="navbar navbar-expand-lg navbar-light static-navbar ms-3 me-3 mt-3">
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="logo" style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div className="logo_name">
                            <ReactLogo className='img' style={{ cursor: 'pointer' }} />
                            <div className="name-motive">
                                <span className='name' style={{ cursor: 'pointer' }}>PeerShare</span>
                                <span className='motive'>Your Files, Your Way, PeerShare Today!</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded={!isCollapsed ? 'true' : 'false'}
                        aria-label="Toggle navigation"
                        style={{ backgroundColor: '#1AF1A0', fontSize: '1.5vw', marginRight: '2%' }}
                        onClick={toggleMenu}

                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>
                <div className={`collapse navbar-collapse ${isCollapsed ? 'd-none' : ''}`} id="navbarNav" style={{ marginRight: '2%' }}>
                    <ul className="navbar-nav ms-auto text-center">
                        <li className="nav-item">
                            <a className="nav-link link" aria-current="page" href="/" >Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link link" aria-current="page" href="/about" >About</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link link" aria-current="page" href="/faq" >FAQ</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link link" aria-current="page" href="/privacy" >Privacy</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link link" aria-current="page" href="/" >
                                <img src={linktree} alt="X" srcSet="" style={{ width: '15px' }} />
                            </a>
                        </li>
                        <li className="nav-item">
                            <button className="join nav-link btn2" aria-current="page" style={{ backgroundColor: '#1AF1A0', width: '11vw' }}>
                                <a href="/join" style={{ color: 'white', textDecoration: 'none' }}>Start Sharing</a>
                            </button>
                        </li>
                    </ul>
                </div>
            </nav> */}
            <nav className="navbar navbar-expand-lg navbar-light static-navbar mt-4">
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="logo" style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div className="logo_name">
                            <ReactLogo className='img' style={{ cursor: 'pointer' }} />
                            <div className="name-motive">
                                <span className='name' style={{ cursor: 'pointer' }}>PeerShare</span>
                                <span className='motive'>Your Files, Your Way, PeerShare Today!</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded={!isCollapsed ? 'true' : 'false'}
                        aria-label="Toggle navigation"
                        style={{ backgroundColor: '#1AF1A0', fontSize: '1.5vw', marginRight: '2%' }}
                        onClick={toggleMenu}

                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>
                <div className={`collapse navbar-collapse ${isCollapsed ? 'd-none' : ''}`} id="navbarNav" style={{marginRight:"10%"}}>
                    <ul className="navbar-nav ms-auto text-center">
                        <li className="nav-item" style={{ marginRight: '5%' }}>
                            <a className="nav-link link spaces" aria-current="page" href="/" >Home</a>
                        </li>
                        <li className="nav-item" style={{ marginRight: '5%' }}>
                            <a className="nav-link link" aria-current="page" href="/about" >About</a>
                        </li>
                        <li className="nav-item" style={{ marginRight: '5%' }}>
                            <a className="nav-link link" aria-current="page" href="/faq" >FAQ</a>
                        </li>
                        <li className="nav-item" style={{ marginRight: '5%' }}>
                            <a className="nav-link link" aria-current="page" href="/privacy" >Privacy</a>
                        </li>
                        <li className="nav-item" style={{ marginRight: '5%' }}>
                            <a className="nav-link link" aria-current="page" href="/" >
                                <img src={linktree} alt="X" srcSet="" style={{ width: '15px' }} />
                            </a>
                        </li>
                        <li className="nav-item spaces">
                            <button className="join nav-link btn2" aria-current="page" style={{ backgroundColor: '#1AF1A0', width: '11vw' }}>
                                <a href="/join" style={{ color: 'white', textDecoration: 'none' }}>Start Sharing</a>
                            </button>
                        </li>

                    </ul>
                </div>
            </nav>
            {/* <div className="container-fluid-md ms-3 me-3">
                <div className="navbar ">
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
            </div> */}

        </>
    )
}

export default LandingNavigation