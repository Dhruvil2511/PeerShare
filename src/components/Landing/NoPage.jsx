import React from 'react'
import peer_cry from '../../assets/peer_crying.png'
import LandingNavigation from './LandingNavigation'
const NoPage = () => {
    return (
        <>
            <LandingNavigation />
            <div className="container d-flex justify-content-center align-items-center flex-column">
                <h1 className='text-white mt-5' style={{fontSize:'5vw'}}>No Page found</h1>
                <img src={peer_cry} alt="X"  style={{width:'60%'}}/>
            </div>
        </>
    )
}

export default NoPage