import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    //check if we're on the home page
    const isHomePage = location.pathname === '/';

    //check login status
    useEffect(() => {
        const checkLoginStatus = () => {
            const user = localStorage.getItem('user');
            setIsLoggedIn(!!user);
        };

        checkLoginStatus();
        window.addEventListener('storage', checkLoginStatus);

        return () => {
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleContactClick = () => {
        if (isHomePage) {
            const contactSection = document.getElementById('contact');
            if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/#contact');
        }
        setIsMobileMenuOpen(false);
    };

    const handleProfileClick = () => {
        setIsMobileMenuOpen(false);
        navigate('/login');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setIsMobileMenuOpen(false);
        window.location.reload();
    };

    const handleNavClick = (sectionId) => {
        if (isHomePage) {
            const section = document.getElementById(sectionId);
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate(`/#${sectionId}`);
        }
        setIsMobileMenuOpen(false);
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <>
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    <div className="logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                        <img src="src/img/logo.jpg" alt="Sam Sound and Light" className="logo-img" />
                        <span className="logo-text">SAM SOUND & LIGHT</span>
                    </div>

                    <nav className="navigation">
                        <a
                            href="#about"
                            className="nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick('about');
                            }}
                        >
                            About
                        </a>
                        <a
                            href="#events"
                            className="nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick('events');
                            }}
                        >
                            Events
                        </a>
                        <a
                            href="#services"
                            className="nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick('services');
                            }}
                        >
                            Services
                        </a>

                        <div className="header-actions">
                            <button className="cta-button" onClick={handleContactClick}>
                                Get Contact
                            </button>

                            {isLoggedIn ? (
                                <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
                                    Logout
                                </button>
                            ) : (
                                <button className="profile-btn" onClick={handleProfileClick} aria-label="User Profile">
                                    <img src="src/img/profile.jpg" alt="User Profile" className="profile-img" />
                                </button>
                            )}
                        </div>
                    </nav>

                    <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </header>

            <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
                <a
                    href="#about"
                    className="mobile-nav-link"
                    onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('about');
                    }}
                >
                    About
                </a>
                <a
                    href="#services"
                    className="mobile-nav-link"
                    onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('services');
                    }}
                >
                    Services
                </a>
                <a
                    href="#events"
                    className="mobile-nav-link"
                    onClick={(e) => {
                        e.preventDefault();
                        handleNavClick('events');
                    }}
                >
                    Events
                </a>

                <button className="mobile-cta-button" onClick={handleContactClick}>
                    Get Contact
                </button>

                {isLoggedIn ? (
                    <button className="mobile-logout-btn" onClick={handleLogout}>
                        <div className="mobile-logout-content">
                            <span className="logout-icon">🚪</span>
                            Logout
                        </div>
                    </button>
                ) : (
                    <button className="mobile-profile-btn" onClick={handleProfileClick}>
                        <div className="mobile-profile-content">
                            <img src="src/img/profile.jpg" alt="User Profile" className="mobile-profile-img" />
                            Profile
                        </div>
                    </button>
                )}
            </div>
        </>
    );
};

export default Header;