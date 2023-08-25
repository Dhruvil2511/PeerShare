import React, { useEffect, useState } from 'react';
import anime from 'animejs';
import '../Loader/Preloader.scss'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import { ToastContainer, toast } from 'react-toastify';
let val;
const Preloader = () => {
    const [peer, setPeer] = useState('');
    useEffect(() => {
        val = localStorage.getItem('peerRole');
        if (val === 'peerA') setPeer('Peer B');
        else if (val === 'peerB') setPeer('Peer A');

        anime({
            targets: '#loader-svg path',
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'linear',
            duration: 10000,
            direction: 'alternate-reverse',
            loop: true
        });
        setInterval(async () => {
            toast("Reload page to initiate connection again", { theme: 'dark' });
        }, 15000);
    }, []);
    function handleBack(event) {
        window.history.back();
    }
    function handleRetry() {
        window.location.reload();
    }

    return (
        <>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme="dark"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'start', margin: '0.5em' }}>
                <button style={{ backgroundColor: 'transparent', border: 'none', WebkitAlignSelf: 'flex-start' }} onClick={handleBack} >
                    <ArrowBackOutlinedIcon style={{ color: 'white', fontSize: '2em' }} />
                </button>
                <button style={{ backgroundColor: 'transparent', border: 'none', WebkitAlignSelf: 'flex-end', margin: '0.5em' }} onClick={handleRetry} >
                    <ReplayOutlinedIcon style={{ color: 'white', fontSize: '2em' }} />
                </button>
            </div>
            <div className="target-element">
                <div className='user'>Waiting for {peer} to connect...</div>
                <svg id='loader-svg' viewBox="0 0 1850 1800" x='50%' y='50%' height='85%' width='80%' preserveAspectRatio="xMidYMid meet">
                    <path stroke='rgb(26, 240, 161)' strokeWidth='3' fill='none' d="M458.437,720.312h19.735V660.7h37.536q27.161,0,41.5-11.7t14.344-34.281a46.267,46.267,0,0,0-7.223-25.381,33.054,33.054,0,0,0-19.582-14.75q-12.36-3.407-30.67-3.408H458.437v149.13Zm19.735-131.429h37.333q12.918,0,19.786,1.831t11.342,8.748a28.575,28.575,0,0,1,4.476,15.869q0,13.428-8.087,20.549T515.912,643h-37.74V588.883ZM672.111,713.8q12.867-9.053,15.106-25.736H667.381a17.284,17.284,0,0,1-8.494,14.6,33.151,33.151,0,0,1-18.158,5.137,30.563,30.563,0,0,1-22.431-9.053q-9.105-9.052-10.325-27.771h81.279V666.4q0-26.955-13.784-41.707t-36.876-14.75q-22.582,0-36.57,15T588.035,666.4q0,26.654,14.445,41.555t38.249,14.9Q659.242,722.855,672.111,713.8ZM608.38,655.919q2.236-15.663,10.478-23.345a29.384,29.384,0,0,1,39.673.05q8.136,7.732,10.477,23.295H608.38Zm179.6,57.882q12.867-9.053,15.106-25.736H783.246a17.284,17.284,0,0,1-8.494,14.6,33.151,33.151,0,0,1-18.158,5.137,30.563,30.563,0,0,1-22.431-9.053q-9.105-9.052-10.325-27.771h81.279V666.4q0-26.955-13.784-41.707t-36.875-14.75q-22.584,0-36.571,15T703.9,666.4q0,26.654,14.445,41.555t38.249,14.9Q775.107,722.855,787.976,713.8Zm-63.731-57.882q2.236-15.663,10.478-23.345a29.384,29.384,0,0,1,39.673.05q8.138,7.732,10.477,23.295H724.245Zm158.386-45.166a51.279,51.279,0,0,0-8.748-.813q-15.972,0-28.076,17.5V612.381H826.581V720.312h19.226V644.018q10.476-15.36,25.126-15.361a42.955,42.955,0,0,1,11.7,1.221V610.753Zm112.051,99.386q15.312-12.715,15.308-31.942,0-15.156-8.34-24.159a50.58,50.58,0,0,0-20.04-13.276q-11.7-4.272-31.586-8.646t-27.16-9.054q-7.275-4.677-7.274-14.038,0-10.274,9.054-16.479t25.533-6.206q34.077,0,37.028,27.059h19.225q-0.915-21.361-16.377-33.06t-40.69-11.7q-24.009,0-38.5,11.6t-14.5,29.7q0,16.074,11.139,25.736t36.723,15.106q25.582,5.443,36.062,11.038t10.477,17.9q0,11.7-10.121,18.514t-26.7,6.816q-17.5,0-29.857-7.986T910.2,672.4H891.176q0.813,22.177,16.429,36.316t47.15,14.14Q979.372,722.855,994.682,710.139Zm59.458-138.957h-19.23v149.13h19.23V643q14.655-17.292,29.3-17.293,10.77,0,15.51,5.8,4.725,5.8,4.73,19.023v69.784h19.23v-70.6q0-39.773-36.52-39.774-17.91,0-32.25,16.174V571.182ZM1205.2,703.527a41.639,41.639,0,0,1-18.31,4.272q-10.38,0-16.48-4.425t-6.1-12.665q0-22.683,41.71-22.684h13.12v23.9A35.151,35.151,0,0,1,1205.2,703.527Zm13.94,16.785h19.12V650.528q0-24.11-11.59-32.349-11.61-8.239-32.35-8.239-44.46,0-46.59,33.264h19.12q0.81-18.311,26.45-18.311,12.21,0,17.8,3.459t6.82,8.7q1.215,5.241,1.22,16.836h-9.36q-65.205,0-65.21,37.842a27.92,27.92,0,0,0,10.38,22.43q10.38,8.7,26.45,8.7,23.085,0,37.74-13.632v11.089Zm103.55-109.559a51.208,51.208,0,0,0-8.74-.813q-15.975,0-28.08,17.5V612.381h-19.23V720.312h19.23V644.018q10.47-15.36,25.13-15.361a42.9,42.9,0,0,1,11.69,1.221V610.753ZM1413.28,713.8q12.87-9.053,15.11-25.736h-19.84a17.278,17.278,0,0,1-8.49,14.6,33.163,33.163,0,0,1-18.16,5.137,30.555,30.555,0,0,1-22.43-9.053q-9.1-9.052-10.33-27.771h81.28V666.4q0-26.955-13.78-41.707t-36.88-14.75q-22.575,0-36.57,15T1329.21,666.4q0,26.654,14.44,41.555t38.25,14.9Q1400.41,722.855,1413.28,713.8Zm-63.73-57.882q2.235-15.663,10.48-23.345a29.38,29.38,0,0,1,39.67.05q8.145,7.732,10.48,23.295h-60.63Z">
                    </path>
                </svg>
            </div>

        </>
    );
};

export default Preloader;
