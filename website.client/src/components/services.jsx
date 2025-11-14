import React, { useRef, useEffect, useState } from 'react';
import '../App.css';

const Services = () => {
    const containerRef = useRef(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [showNavDots, setShowNavDots] = useState(false);

    const services = [
        {
            id: 1,
            title: "Sound Systems",
            description: "As a professional Sound and Lighting Services, we take your requirements very seriously. That's why when you book this service, we will leave no stone unturned and do all that's necessary to make sure that your expectations are not just met, but exceeded. To find out more and start collaborating, get in touch today.",
            image: "./img/sound2.jpg"
        },
        {
            id: 2,
            title: "Professional Staff",
            description: "Experienced staff can specify, deliver, setup and operate with 24hour 7day a week service to match your specific requirement.",
            image: "./img/staff.jpg"
        },
        {
            id: 3,
            title: "Stage Lighting",
            description: "We are extremely passionate about every production and project we take on. When you book this service, we'll help you make the perfect plan and take care of all the details. Call or get in touch with a member of our team today and book an initial consultation so we can start working together.",
            image: "./img/light.jpg"
        },
    ];

    const eventTypes = [
        "Weddings", "Conferences", "Concerts", "Fashion Shows",
        "Product Launches", "Exhibition Sporting Events", "Live Bands",
        "Corporate Events", "Gala Dinner", "Social Event", "Workshop",
        "Home Party", "Variety Show", "Company Opening", "and more.."
    ];

    const totalSlides = 1 + services.length + 1;

    // Scroll to contact function
    const scrollToContact = () => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Handle scroll events
    useEffect(() => {
        const container = containerRef.current;

        const handleScroll = () => {
            if (container) {
                const scrollTop = container.scrollTop;
                const sectionHeight = container.clientHeight;
                const newSection = Math.round(scrollTop / sectionHeight);
                setCurrentSection(newSection);

                // Show navigation dots only in first, service, or last sections
                if (newSection === 0 || newSection === services.length + 1 || (newSection >= 1 && newSection <= services.length)) {
                    setShowNavDots(true);
                } else {
                    setShowNavDots(false);
                }
            }
        };

        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [services.length]);

    const scrollToSection = (sectionIndex) => {
        setCurrentSection(sectionIndex);
        const container = containerRef.current;
        if (container) {
            container.scrollTo({
                top: sectionIndex * container.clientHeight,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="services" className="services-section">
            <div className="services-background">
                <div className="bg-overlay"></div>
            </div>

            <div ref={containerRef} className="services-scroll-container">
                <div className="service-section services-first-slide">
                    <div className="services-hero-content">
                        <h1 className="services-hero-title">Our Services</h1>
                        <div className="services-events-grid">
                            {eventTypes.map((event, index) => (
                                <div key={index} className="event-type">
                                    {event}
                                </div>
                            ))}
                        </div>
                        <div className="scroll-indicator">
                            <div className="scroll-arrow"></div>
                            <span>Scroll to explore</span>
                        </div>
                    </div>
                </div>

                {/* Service Sections */}
                {services.map((service, index) => (
                    <div key={service.id} className="service-section">
                        <div className="section-content">
                            <div className="service-container">
                                <div className="service-info">
                                    <div className="service-number">0{index + 1}</div>
                                    <h3 className="service-title">{service.title}</h3>
                                    <p className="service-description">{service.description}</p>
                                </div>
                                <div className="service-visual">
                                    <div className="image-container">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="service-image"
                                        />
                                        <div className="image-frame"></div>
                                        <div className="image-overlay"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="service-section">
                    <div className="section-content">
                        <div className="cta-container">
                            <h3>Ready to Elevate Your Event?</h3>
                            <p>Let's create something amazing together. Get in touch for a custom quote.</p>
                            <div className="cta-buttons">
                                <button
                                    className="cta-primary"
                                    onClick={scrollToContact}
                                >
                                    Get Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showNavDots && (
                <div className="service-section-nav">
                    {[...Array(totalSlides)].map((_, index) => (
                        <button
                            key={index}
                            className={`services-nav-dot ${currentSection === index ? 'active' : ''}`}
                            onClick={() => scrollToSection(index)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Services;