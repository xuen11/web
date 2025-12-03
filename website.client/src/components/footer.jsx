import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import '/src/App.css';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isHomePage = location.pathname === '/';

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleNavigation = (pageId) => {
        switch (pageId) {
            case 'home':
                if (location.pathname === '/') {
                    scrollToTop();
                } else {
                    navigate('/');
                    setTimeout(scrollToTop, 100);
                }
                break;

            case 'events':
                navigate('/events');
                setTimeout(scrollToTop, 100);
                break;

            case 'services':
                navigate('/services');
                setTimeout(scrollToTop, 100);
                break;

            case 'portfolio':
                navigate('/portfolio');
                setTimeout(scrollToTop, 100);
                break;

            case 'about':
                navigate('/about');
                setTimeout(scrollToTop, 100);
                break;

            case 'contact':
                navigate('/contact');
                setTimeout(scrollToTop, 100);
                break;

            default:
                navigate('/');
                setTimeout(scrollToTop, 100);
        }
    };

    const handleHomeClick = () => {
        if (location.pathname === '/') {
            scrollToTop();
        } else {
            navigate('/');
            setTimeout(scrollToTop, 100);
        }
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
                            <img src='src/public/img/logo.jpg' alt="Sam Sound & Light" />
                            <div className="logo-text">
                                <h2>Sam Sound and Light</h2>
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
                    </div>

                    <div className="footer-links">
                        <div className="footer-column">
                            <h3>Quick Links</h3>
                            <ul>
                                <li>
                                    <a
                                        href="/"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation('home');
                                        }}
                                    >
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/about"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation('about');
                                        }}
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/services"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation('services');
                                        }}
                                    >
                                        Services
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/events"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation('events');
                                        }}
                                    >
                                        Events
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/portfolio"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation('portfolio');
                                        }}
                                    >
                                        Portfolio
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/contact"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation('contact');
                                        }}
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Support</h3>
                            <ul>
                                <li>
                                    <a
                                        href="/contact"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation('contact');
                                        }}
                                    >
                                        Contact Us
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