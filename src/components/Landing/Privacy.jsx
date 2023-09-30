import React from 'react'
import LandingNavigation from './LandingNavigation'

const Privacy = () => {
    return (
        <>

            <div className="privacy" style={{ background: '../../assets/background_grainy.jpg',color:'white', backgroundSize: 'cover', backgroundRepeat: 'repeat', overflowX: 'hidden', height: "100vh", widht: '100vw' }}>
                <LandingNavigation />
                <div className="container mt-5">
                    <h1 className='mt-5 text-center'>Privacy Policy</h1>
                    <p style={{fontSize:'1vw'}}>
                        <strong>Last Updated: 9th September, 2023</strong>
                        <hr />

                        <h3>Welcome to PeerShare</h3> This Privacy Policy outlines our practices concerning the collection, use, and sharing of personal information when you use our app. We take your privacy seriously and are committed to protecting your personal information.
                        <br />
                        <ol>
                            <li>
                                Information We Collect <br />
                                a. File Information <br />
                                b. IP Address
                            </li>
                            <li>
                                How We Use Your Information <br />

                                a. File Information: We use file size and file names solely to enable file sharing within the app. We do not access or store the file content. <br />
                                b. IP Address: We collect and store IP addresses for security and protection against malicious activities.
                            </li>

                            <li>
                                Sharing of Information <br />
                                a. Live Chat and Video Call: Our application provides live chat and video call features. We do not record or store these communications. Conversations and video calls are peer-to-peer and not accessible to us. <br />
                                b. We do not share or sell your personal information with third parties.
                            </li>
                            <li>
                                Changes to this Privacy Policy
                                We may update this Privacy Policy from time to time. The date of the most recent revision will be indicated at the top of this page.
                            </li>
                            <li>Security <br />
                                We take appropriate measures to protect your data from unauthorized access, disclosure, alteration, or destruction. However, please be aware that no online platform is entirely secure, and we cannot guarantee the security of your data.
                            </li>
                            <li>
                                Contact us <br />
                                If you have any questions, concerns, or requests related to this Privacy Policy or your personal information, please contact us at <a href="/">Contact</a>.
                            </li>
                        </ol>
                    </p>
                </div>
            </div>
        </>
    )
}

export default Privacy;