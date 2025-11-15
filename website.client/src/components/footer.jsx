import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import '../App.css';
import logoImg from '../img/logo.jpg';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    //check if we're on the home page
    const isHomePage = location.pathname === '/';

    const handleNavClick = (sectionId) => {
        if (isHomePage) {
            const section = document.getElementById(sectionId);
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate(`/#${sectionId}`);
        }
    };

    const handleContactClick = () => {
        if (isHomePage) {
            const contactSection = document.getElementById('contact');
            if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/#contact');
        }
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    const socialLinks = {
        facebook: 'https://www.facebook.com/samsoundlight/',
        instagram: 'https://instagram.com/samssoundnlight?igshid=1bkr3f38xwq30',
        youtube: 'https://www.youtube.com/watch?v=TRXTrQe6hRM'
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-main">
                        <div className="footer-logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                            <img src={logoImg} alt="Sam Sound & Light" />
                            <div className="logo-text">
                                <h2>Sam Sound & Light</h2>
                            </div>
                        </div>

                        <div className="footer-contact">
                            <p>
                                <a href="tel:+6014-6769866">+6014-6769866</a>
                            </p>
                            <p>
                                No. 2A-12-20, Lot 20, 12th FLOOR,
                            </p>
                            <p>
                                WISMA MERDEKA, JALAN TUN RAZAK,
                            </p>
                            <p>
                                88000 KOTA KINABALU, SABAH.
                            </p>
                            <p>
                                <a href="mailto:samsoundnlight@gmail.com">samsoundnlight@gmail.com</a>
                            </p>
                        </div>

                        {/* Social Media Icons */}
                        <div className="footer-social">
                            <h3>Follow Us</h3>
                            <div className="social-icons">
                                <a
                                    href={socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    aria-label="Facebook"
                                >
                                    <Facebook size={20} />
                                </a>
                                <a
                                    href={socialLinks.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={20} />
                                </a>
                                <a
                                    href={socialLinks.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    aria-label="YouTube"
                                >
                                    <Youtube size={20} />
                                </a>
                            </div>
                        </div>

                        <a
                            href="#about"
                            className="learn-more-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick('about');
                            }}
                        >
                            LEARN MORE
                        </a>
                    </div>

                    <div className="footer-links">
                        <div className="footer-column">
                            <h3>About</h3>
                            <ul>
                                <li>
                                    <a
                                        href="#about"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick('about');
                                        }}
                                    >
                                        About
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Events</h3>
                            <ul>
                                <li>
                                    <a
                                        href="#events"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick('events');
                                        }}
                                    >
                                        Upcoming Events
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Services</h3>
                            <ul>
                                <li>
                                    <a
                                        href="#services"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick('services');
                                        }}
                                    >
                                        Our Services
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Contact</h3>
                            <ul>
                                <li>
                                    <a
                                        href="#contact"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleContactClick();
                                        }}
                                    >
                                        Contact us
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-copyright">
                    <p>@ 2025 Sam Sound & Light</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;