import React from 'react';
import { useNavigate } from "react-router-dom";
import '/src/App.css';
import contact from "/img/contact.jpg";

const Contact = () => {
    const navigate = useNavigate();

    const handleContactUs = () => {
        navigate("/contact");
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    };

    return (
        <section className="contact-section">
            <div className="contact-content">
                <div className="section-label">CONTACT US</div>
                <h2 className="contactTitle">
                    Have an event coming up? Let's make it shine bright and sound amazing!
                </h2>
                <div className="button-group">
                    <a className="btn btn-primary" onClick={handleContactUs}>Contact Us</a>
                </div>
            </div>

            <div className="contact-image">
                <div className="image-container">
                    <div className="placeholder-img">
                        
                        <img src={contact} alt="Contact" />
                        
                    </div>
                </div>
            </div>

            <div className="wave-container">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
            </div>
        </section>
    );
};

export default Contact;