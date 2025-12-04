import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '/src/App.css';

const Header = () => {
    const [activePage, setActivePage] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // check login status
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

    // update active nav
    useEffect(() => {
        const path = location.pathname;

        if (path === '/') setActivePage('home');
        else if (path === '/services') setActivePage('services');
        else if (path === '/portfolio') setActivePage('portfolio');
        else if (path === '/about') setActivePage('about');
        else if (path === '/contact') setActivePage('contact');
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleNavigation = (pageId) => {
        setActivePage(pageId);
        setIsMobileMenuOpen(false);

        switch (pageId) {
            case 'home':
                if (location.pathname === '/') {
                    scrollToTop();
                } else {
                    // Navigate to home and scroll to top after navigation
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

    const handleProfileClick = () => {
        setIsMobileMenuOpen(false);
        navigate('/login');
        setTimeout(scrollToTop, 100);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setIsMobileMenuOpen(false);
        window.location.reload();
    };

    const handleHomeClick = () => {
        setActivePage('home');

        if (location.pathname === '/') {
            // Already on home page - scroll to top
            scrollToTop();
        } else {
            // Navigate to home and scroll to top
            navigate('/');
            setTimeout(scrollToTop, 100);
        }
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
    };

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'services', label: 'Services' },
        { id: 'events', label: 'Events' },
        { id: 'portfolio', label: 'Portfolio' },
        { id: 'about', label: 'About' },
        { id: 'contact', label: 'Contact' }
    ];

    return (
        <nav className={`header-nav ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">

                {/* LOGO */}
                <div className="logo-container" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                    <img
                        src='/img/logo.jpg'
                        className="logo-img"
                        alt="Logo"
                        onError={handleImageError}
                    />
                    <div className="logo-text">Sam Sound and Light</div>
                </div>

                {/* RIGHT SECTION */}
                <div className="right-group">

                    {/* NAV LINKS */}
                    <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        {navItems.map(item => (
                            <li key={item.id}>
                                <a
                                    href={`/${item.id === 'home' ? '' : item.id}`}
                                    className={activePage === item.id ? 'active' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation(item.id);
                                    }}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* SINGLE LOGIN BUTTON */}
                    <div className="header-actions">
                        {isLoggedIn ? (
                            <button className="login-btn" onClick={handleLogout}>LOGOUT</button>
                        ) : (
                            <button className="login-btn" onClick={handleProfileClick}>LOGIN</button>
                        )}
                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                </div>
            </div>
        </nav>
    );
};

export default Header;