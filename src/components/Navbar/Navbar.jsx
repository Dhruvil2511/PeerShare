import React from 'react'
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';
import '../Navbar/Navbar.scss'
const Navbar = () => {
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark navigation">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">PeerShare</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav ms-auto ">
                            <li className="nav-item">
                                <a className="nav-link mx-2 active" aria-current="page" href="#">Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link mx-2" href="#">About</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link mx-2" href="#">Privacy</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link mx-2" href="#">FAQ</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link mx-2" href="#">Contacts</a>
                            </li>
                        </ul>
                        <ul className="navbar-nav ms-auto d-none d-lg-inline-flex">
                            <li className="nav-item mx-2">
                                <a className="nav-link text-dark h5" href="" target="blank"><FacebookIcon /></a>
                            </li>
                            <li className="nav-item mx-2">
                                <a className="nav-link text-dark h5" href="" target="blank"><GitHubIcon /></a>
                            </li>
                            <li className="nav-item mx-2">
                                <a className="nav-link text-dark h5" href="" target="blank"><i className="fab fa-facebook-square"></i></a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar