import React, { useState } from 'react';
import axios from 'axios';
import './Feedback.scss'
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import LandingNavigation from './LandingNavigation';
function Feedback() {
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [eid, setEmailid] = useState('');
    const [emoji11, setEmoji11] = useState('white')
    const [emoji12, setEmoji12] = useState('white')
    const [emoji13, setEmoji13] = useState('white')
    const [emoji14, setEmoji14] = useState('white')
    const [emoji15, setEmoji15] = useState('white')
    const [emoji1, setEmoji1] = useState('')
    const [emoji21, setEmoji21] = useState('white')
    const [emoji22, setEmoji22] = useState('white')
    const [emoji23, setEmoji23] = useState('white')
    const [emoji24, setEmoji24] = useState('white')
    const [emoji25, setEmoji25] = useState('white')
    const [emoji2, setEmoji2] = useState('')
    const [review, setReview] = useState('')
    const [suggestion, setSuggestion] = useState('')
    const [find, setFind] = useState('')
    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/process', {
                eid, fname, lname, emoji1, emoji2, review, suggestion, find
            });
            alert('Thank You For Your Valuable Feedback.');
        } catch (error) {
            console.error('There Has Been An Error In Format:', error);
            alert('There Has Been An Error In Form Format.');
        }
    };
    return (
        <div className='papa'>
            <LandingNavigation />
            <div className="container">
                <div className="cont">
                    <div className='feedbackform'>Feedback Form</div>
                    <form onSubmit={handleSignup} class='formIrl'>
                        <div className="firstRow">
                            <label for='text' className='emailText'>First Name</label><br />
                            <input className='feed-inp' type="text" placeholder="Ryan" value={fname} onChange={(e) => setFname(e.target.value)} name='fname' /><br />
                        </div>
                        <br />
                        <div className="firstRow">
                            <label for='text' className='emailText'>Last Name</label><br />
                            <input className='feed-inp' type="text" placeholder="Gosling" value={lname} onChange={(e) => setLname(e.target.value)} name='lname' /><br />
                        </div>
                        <br />
                        <div className="firstRow">
                            <label for='email' className='emailText'>Email</label><br />
                            <input className='feed-inp' type="email" placeholder="pd@gmail.com" value={eid} onChange={(e) => setEmailid(e.target.value)} name='email' /><br />
                        </div>
                        <br />
                        <div className='d-flex align-content-center justify-content-start' style={{ width: '100%' }}>
                            <label style={{fontSize:'1.3vw'}}htmlFor="">How Did You Find Us</label>
                            <select className='feed-inp' name="find" id="" style={{ marginLeft: '2%', width: '30%', height: '5vh', fontSize: '1.3vw', marginBottom: '2%' }} onChange={(e) => { setFind(e.target.value) }}>
                                <option value="--Select--" selected disabled>--Select--</option>
                                <option value="Google">Google</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Instagram">Instagram</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Friend Referal">Friend Referal</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <br />
                        <div className="Thoughts1Row1 ">
                            <label style={{fontSize:'1.3vw'}}>Your Thoughts On The Functionalities Of PeerShare</label><br />
                        </div>
                        <div className='mt-2' style={{ border: '4px solid white', maxWidth: 'fit-content', display: 'flex', marginBottom: '1.2%' }}>
                            <span style={{ background: 'transparent', border: 'none', borderRight: '4px solid white' }} onClick={() => {
                                setEmoji11('yellow');
                                setEmoji12('white');
                                setEmoji13('white');
                                setEmoji14('white');
                                setEmoji15('white');
                                setEmoji1('Very Bad')
                            }} >
                                <SentimentVeryDissatisfiedIcon style={{ color: `${emoji11}`, fontSize: '2vw' }} />
                            </span>
                            <span style={{ background: 'transparent', border: 'none', borderRight: '4px solid white' }} onClick={() => {
                                setEmoji11('white');
                                setEmoji12('yellow');
                                setEmoji13('white');
                                setEmoji14('white');
                                setEmoji15('white');
                                setEmoji1('Bad')
                            }}  ><SentimentDissatisfiedIcon style={{ color: `${emoji12}`, fontSize: '2vw' }} /></span>
                            <span style={{ background: 'transparent', border: 'none', borderRight: '4px solid white' }} onClick={() => {
                                setEmoji11('white');
                                setEmoji12('white');
                                setEmoji13('yellow');
                                setEmoji14('white');
                                setEmoji15('white');
                                setEmoji1('Average')
                            }}  ><SentimentSatisfiedIcon style={{ color: `${emoji13}`, fontSize: '2vw' }} /></span>
                            <span style={{ background: 'transparent', border: 'none', borderRight: '4px solid white' }} onClick={() => {
                                setEmoji11('white');
                                setEmoji12('white');
                                setEmoji13('white');
                                setEmoji14('yellow');
                                setEmoji15('white');
                                setEmoji1('Good')
                            }} ><SentimentNeutralIcon style={{ color: `${emoji14}`, fontSize: '2vw' }} /></span>
                            <span style={{ background: 'transparent', border: 'none' }} onClick={() => {
                                setEmoji11('white');
                                setEmoji12('white');
                                setEmoji13('white');
                                setEmoji14('white');
                                setEmoji15('yellow');
                                setEmoji1('Very Good')
                            }}  ><SentimentSatisfiedAltIcon style={{ color: `${emoji15}`, fontSize: '2vw' }} /></span>
                        </div>
                        <br />
                        <div className="Thoughts1Row1">
                            <label style={{fontSize:'1.3vw'}}>Your Thoughts On The UI Of PeerShare</label><br />
                        </div>
                        <div className='mt-2' style={{ border: '4px solid white', maxWidth: 'fit-content', display: 'flex', marginBottom: '2.7%' }}>
                            <span style={{ background: 'transparent', border: 'none', borderRight: '4px solid white' }} onClick={() => {
                                setEmoji21('yellow');
                                setEmoji22('white');
                                setEmoji23('white');
                                setEmoji24('white');
                                setEmoji25('white');
                                setEmoji2('Very Bad')
                            }} >
                                <SentimentVeryDissatisfiedIcon style={{ color: `${emoji21}`, fontSize: '2vw' }} />
                            </span>
                            <span style={{ background: 'transparent', border: 'none', borderRight: '4px solid white' }} onClick={() => {
                                setEmoji21('white');
                                setEmoji22('yellow');
                                setEmoji23('white');
                                setEmoji24('white');
                                setEmoji25('white');
                                setEmoji2('Bad')
                            }}  ><SentimentDissatisfiedIcon style={{ color: `${emoji22}`, fontSize: '2vw' }} /></span>
                            <span style={{ background: 'transparent', border: 'none', borderRight: '4px solid white' }} onClick={() => {
                                setEmoji21('white');
                                setEmoji22('white');
                                setEmoji23('yellow');
                                setEmoji24('white');
                                setEmoji25('white');
                                setEmoji2('Average')
                            }}  ><SentimentSatisfiedIcon style={{ color: `${emoji23}`, fontSize: '2vw' }} /></span>
                            <span style={{ background: 'transparent', border: 'none', borderRight: '4px solid white' }} onClick={() => {
                                setEmoji21('white');
                                setEmoji22('white');
                                setEmoji23('white');
                                setEmoji24('yellow');
                                setEmoji25('white');
                                setEmoji2('Good')
                            }} ><SentimentNeutralIcon style={{ color: `${emoji24}`, fontSize: '2vw' }} /></span>
                            <span style={{ background: 'transparent', border: 'none' }} onClick={() => {
                                setEmoji21('white');
                                setEmoji22('white');
                                setEmoji23('white');
                                setEmoji24('white');
                                setEmoji25('yellow');
                                setEmoji2('Very Good')
                            }}  ><SentimentSatisfiedAltIcon style={{ color: `${emoji25}`, fontSize: '2vw' }} /></span>
                        </div>
                        <div className="d-flex flex-column">
                            <label style={{fontSize:'1.3vw'}} for='feedback'>Feedback</label><br />
                            <textarea className='feed-inp' name='feedback' cols='70' rows='8' placeholder='Enter Feedback' onChange={(e) => { setReview(e.target.value) }}></textarea>
                        </div><br />
                        <button type="submit" style={{ backgroundColor: '#1AF1A0', width: '50%', fontSize: '1.2vw', padding: '2%', fontWeight: '600', color: 'black', borderRadius: '20px' }}>Submit Feedback</button>
                        <br />
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Feedback;