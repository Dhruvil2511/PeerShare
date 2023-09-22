import React from 'react'
import LandingNavigation from './LandingNavigation'
import { ReactComponent as ReactLogo } from '../../assets/big-logo.svg';
import "./About.scss"
const About = () => {
    return (
        <>
            <LandingNavigation />
            <div className="container mt-5">
                <div className="about">
                    <div className="first">
                        <div className="circle"><ReactLogo /></div>
                        <div className="circle-title">
                            Your File, Your Way, PeerShare today!
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default About