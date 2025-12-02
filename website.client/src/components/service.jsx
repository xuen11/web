import React, { useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import '/src/App.css';
import sound from "../img/soundSystem.jpg";
import karaoke from "../img/karaoke.jpg";
import lighting from "../img/lighting.jpg";
import led from "../img/LED.jpg";
import visual from "../img/visual.jpg";
import projection from "../img/projection.jpg";
import band from "../img/liveBand.jpg";
import artist from "../img/artist.jpg";
import installation from "../img/installation.jpg";


const ServicePage = () => {
    const navigate = useNavigate();
    const textRef = useRef(null);
    const cardRefs = useRef([]);

    const audioServices = [
        { image: {sound}, title: 'Sound System' },
        { image: { karaoke }, title: 'Karaoke Service' },
        { image: { lighting }, title: 'Lighting System' },
        { image: {led }, title: 'LED Screen' },
        { image: { visual }, title: 'Visual System' },
        { image: { projection }, title: 'Projection System' },
        { image: { band }, title: 'Live Band' },
        { image: { artist }, title: 'Local Artist' },
        { image: { installation }, title: 'Installation Service' }
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
