
const configuration = {
    iceServers: [
        {
            urls: [process.env.REACT_APP_ICE_STUN_SERVER, 'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',],
        },
        {
            urls: process.env.REACT_APP_ICE_TURN_SERVER_1,
            username: process.env.REACT_APP_ICE_USERNAME,
            credential: process.env.REACT_APP_ICE_PASSWORD,
        },
        {
            urls: process.env.REACT_APP_ICE_TURN_SERVER_2,
            username: process.env.REACT_APP_ICE_USERNAME,
            credential: process.env.REACT_APP_ICE_PASSWORD,
        },
        {
            urls: process.env.REACT_APP_ICE_TURN_SERVER_3,
            username: process.env.REACT_APP_ICE_USERNAME,
            credential: process.env.REACT_APP_ICE_PASSWORD,
        },
        {
            urls: process.env.REACT_APP_ICE_TURN_SERVER_4,
            username: process.env.REACT_APP_ICE_USERNAME,
            credential: process.env.REACT_APP_ICE_PASSWORD,
        },
    ],
    // To prefetch ice Candidate before setting local description range(0-255) more better but use more resource
    iceCandidatePoolSize: 10,
};

export default configuration;