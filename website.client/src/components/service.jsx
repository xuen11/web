import React, { useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import '/src/App.css';

const ServicePage = () => {
    const navigate = useNavigate();
    const textRef = useRef(null);
    const cardRefs = useRef([]);

    const audioServices = [
        { image: "src/public/img/soundSystem.jpg", title: 'Sound System' },
        { image: "src/public/img/karaoke.jpg", title: 'Karaoke Service' },
        { image: "src/public/img/lighting.jpg", title: 'Lighting System' },
        { image: "src/public/img/LED.jpg", title: 'LED Screen' },
        { image: "src/public/img/visual.jpg", title: 'Visual System' },
        { image: "src/public/img/projection.jpg", title: 'Projection System' },
        { image: "src/public/img/liveBand.jpg", title: 'Live Band' },
        { image: "src/public/img/artist.jpg", title: 'Local Artist' },
        { image: "src/public/img/installation.jpg", title: 'Installation Service' }
    ];

    const handleLearnMore = () => {
        navigate("/services");
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('show');
                    }
                });
            },
            { threshold: 0.2 }
        );

        // Observe all cards
        cardRefs.current.forEach(card => {
            if (card) observer.observe(card);
        });

        // Observe the text
        if (textRef.current) observer.observe(textRef.current);

        return () => {
            cardRefs.current.forEach(card => {
                if (card) observer.unobserve(card);
            });
            if (textRef.current) observer.unobserve(textRef.current);
        };
    }, []);

    return (
        <div className="services-section">

            <div className="services-container">
                <div className="services-contents">
                    <div className="services-grid">
                        {audioServices.map((service, index) => (
                            <div
                                key={index}
                                className="service-card slide-card"
                                ref={el => cardRefs.current[index] = el}
                                style={{ transitionDelay: `${index * 0.1}s` }}
                            >
                                <div className="icon-wrapper">
                                    {service.image && (
                                        <img src={service.image} alt={service.title} className="service-image" />
                                    )}
                                </div>
                                <h3 className="service-title">{service.title}</h3>
                            </div>
                        ))}
                    </div>

                    <div className="learn-more">
                        <span className="learn-more-line"></span>
                        <a href="#" className="learn-more-link" onClick={handleLearnMore}>Learn more</a>
                    </div>
                </div>
            </div>

            <div className="what-we-do-section">
                <div className="accent-line"></div>
                <h2>OUR SERVICES</h2>
                <p className="description">WHAT WE DO</p>
                <p>Having in your mind of doing an event coming up? We provide a wide range of service needs for your event, from audio, stage light, ambience light, LED screens, staging and many more.. </p>
                <h1 className="fade-right" ref={textRef}>"Your Events Solution"</h1>
            </div>
        </div>
    );
};

export default ServicePage;
