import React, { useEffect, useRef, useState } from 'react';
import "/src/App.css";
import banner from "/src/img/event12.jpg";
import aboutVideo from "/src/public/about.mp4"; 

const stats = [
    {
        icon: "/src/img/fastService.jpg",
        label: "Fast Services",
        description: "Quick setup and professional execution",
    },
    {
        icon: "/src/img/team.jpg",
        label: "Professional Team",
        description: "Experienced and skilled event specialists",
    },
    {
        icon: "/src/img/price.jpg",
        label: "Affordable Price",
        description: "Quality services at competitive rates",
    },
];

const features = [
    {
        image: "/src/img/wedding.jpg",
        title: "Wedding",
    },
    {
        image: "/src/img/seminar.jpg",
        title: "Seminar",
    },
    {
        image: "/src/img/concert.jpg",
        title: "Concerts",
    },
    {
        image: "/src/img/launching.jpg",
        title: "Product Launches",
    },
    {
        image: "/src/img/festival.jpg",
        title: "Festivals",
    },
    {
        image: "/src/img/annualDinner.jpg",
        title: "Annual Dinner",
    },
    {
        image: "/src/img/openHouse.jpg",
        title: "Open House",
    },
    {
        image: "/src/img/competition.jpg",
        title: "Competition",
    },
    {
        image: "/src/img/meeting.jpg",
        title: "Meeting",
    },
    {
        image: "/src/img/birthday.jpg",
        title: "Birthday Parties",
    },
    {
        image: "/src/img/party.jpg",
        title: "Party",
    },
];


const AboutPage = () => {
    const statsRef = useRef(null);
    const featuresRef = useRef(null);
    const videoInfoRef = useRef(null);
    const [showVideo, setShowVideo] = useState(false); 

    useEffect(() => {
        const observers = [];

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.3 });

        const featuresObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.2 });

        const videoInfoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.3 });

        if (statsRef.current) {
            statsObserver.observe(statsRef.current);
            observers.push(statsObserver);
        }

        if (featuresRef.current) {
            featuresObserver.observe(featuresRef.current);
            observers.push(featuresObserver);
        }

        if (videoInfoRef.current) {
            videoInfoObserver.observe(videoInfoRef.current);
            observers.push(videoInfoObserver);
        }

        return () => {
            observers.forEach(observer => observer.disconnect());
        };
    }, []);

    return (
        <div className="about-page">
            <div className="about-top-header">
                <img
                    src={banner}
                    alt="About Banner"
                    className="about-top-image"
                />
                <div className="about-top-content">
                    <h1 className="about-top-title">
                        About <span>Us</span>
                    </h1>
                    <h3 className="about-top-subtitle">
                        Learn more about our mission and journey.
                    </h3>
                </div>
            </div>

            <section
                className="advantages-section"
                ref={statsRef}
            >
                <div className="container">
                    <h2 className="advantage-title slide-in-left">Why Choose Us</h2>
                    <p className="advantage-subtitle slide-in-right">
                        To provide our clients with them most amazing events experience and service,
                        Sam Sound & Light promises to make any event the most memorable event ever
                        with our trained skills.
                    </p>

                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div
                                className="stat-item fade-in-up"
                                key={index}
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <div className="stat-icon">
                                    <img
                                        src={stat.icon}
                                        alt={stat.label}
                                        className="stat-icon-image"
                                    />
                                </div>
                                <div className="stat-label">{stat.label}</div>
                                <p className="stat-description">{stat.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section
                className="feature-section"
                ref={featuresRef}
            >
                <div className="container">
                    <h2 className="eventTitle slide-in-left">Event We Specializes In</h2>
                    <p className="eventSubtitle slide-in-right">
                        Make your dream Event with Sam Sound & Lights
                    </p>

                    <div className="feature-cards-wrapper">
                        <div className="feature-cards">
                            {features.concat(features).map((feature, index) => (
                                <div
                                    className="feature-card fade-in"
                                    key={index}
                                    style={{ animationDelay: `${(index % features.length) * 0.1}s` }}
                                >
                                    <div className="feature-image-container">
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="feature-image"
                                        />
                                        <div className="feature-overlay">
                                            <h3>{feature.title}</h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="container">
                <div className="video-info-section" ref={videoInfoRef}>
                    <div className="info-content">
                        <h3>Complete Event Solutions</h3>
                        <p>
                            Sam Sound & Light offers comprehensive event production services.
                            We handle everything from equipment rental to technical operation,
                            ensuring your event runs smoothly from start to finish.
                        </p>

                        <div className="info-list">
                            {["Sound System Rental", "Lighting System", "Installation Service", "More..."].map(
                                (item, index) => (
                                    <div className="info-item" key={index}>
                                        {item}
                                    </div>
                                )
                            )}
                        </div>

                       
                    </div>

                    <div className="video-wrapper">
                        <div className="video-container">
                            {!showVideo ? (
                                <button
                                    className="play-button"
                                    onClick={() => setShowVideo(true)}
                                >
                                    <div className="play-icon"></div>
                                </button>
                            ) : (
                                <video
                                    width="100%"
                                    height="100%"
                                    controls
                                    autoPlay
                                >
                                    <source src={aboutVideo} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;