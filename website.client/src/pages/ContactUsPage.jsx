import React, { useState, useEffect, useRef } from "react";
import "/src/App.css";
import contactBgImage from '/img/services.jpg';
import {
    Phone,
    Mail,
    Globe,
    MapPin,
    Facebook,
    Instagram,
    Youtube
} from "lucide-react";

function ContactUsPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        eventDetails: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);

    // Refs for animation observers
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const taglineRef = useRef(null);
    const panelRef = useRef(null);
    const formRef = useRef(null);
    const infoRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        // Set animating state after component mounts
        setIsAnimating(true);

        // Create observer for scroll animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.target === heroRef.current) {
                            entry.target.classList.add('animate-hero');
                        }
                        if (entry.target === titleRef.current) {
                            entry.target.classList.add('animate-title');
                        }
                        if (entry.target === taglineRef.current) {
                            entry.target.classList.add('animate-tagline');
                        }
                        if (entry.target === panelRef.current) {
                            entry.target.classList.add('animate-panel');
                        }
                        if (entry.target === formRef.current) {
                            entry.target.classList.add('animate-form');
                        }
                        if (entry.target === infoRef.current) {
                            entry.target.classList.add('animate-info');
                        }
                        if (entry.target === mapRef.current) {
                            entry.target.classList.add('animate-map');
                        }
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        // Observe elements
        if (heroRef.current) observer.observe(heroRef.current);
        if (titleRef.current) observer.observe(titleRef.current);
        if (taglineRef.current) observer.observe(taglineRef.current);
        if (panelRef.current) observer.observe(panelRef.current);
        if (formRef.current) observer.observe(formRef.current);
        if (infoRef.current) observer.observe(infoRef.current);
        if (mapRef.current) observer.observe(mapRef.current);

        // Auto-animate on mount (for elements already in view)
        setTimeout(() => {
            if (heroRef.current) heroRef.current.classList.add('animate-hero');
            if (titleRef.current) titleRef.current.classList.add('animate-title');
            if (taglineRef.current) taglineRef.current.classList.add('animate-tagline');
        }, 100);

        return () => {
            observer.disconnect();
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        try {
            const API_BASE = import.meta.env.VITE_API_URL
                ? `${import.meta.env.VITE_API_URL}/api/contact`
                : "http://localhost:8080/api/contact";

            console.log('Sending request to:', API_BASE);

            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    eventDetails: formData.eventDetails
                })
            });

            console.log('Response status:', response.status);

            const result = await response.json();
            console.log('Response data:', result);

            if (response.ok && result.success) {
                setMessage(result.message || "Thank you for your message! We'll get back to you soon.");
                setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    eventDetails: ""
                });
            } else {
                setMessage(result.message || "An error occurred. Please try again.");
            }
        } catch (error) {
            console.error('Network error details:', error);
            setMessage("Cannot connect to server. Make sure your backend is running on localhost:8080");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cp-page-wrapper" id="contact">
            <div className="cp-hero-zone" ref={heroRef}>
                <div
                    className="cp-hero-visual"
                    style={{ backgroundImage: `url(${contactBgImage})` }}
                ></div>
                <h1 className="cp-hero-headline" ref={titleRef}>
                    Contact <span>Us</span>
                </h1>

                <p className="cp-hero-tagline" ref={taglineRef}>
                    Have an event coming up? Let's make it shine bright and sound amazing!
                </p>
            </div>

            <div className="cp-main-interface">
                <div className="cp-content-block">
                    {message && (
                        <div className={`cp-feedback-alert ${message.includes("Thank you") ? "success" : "error"}`}>
                            {message}
                        </div>
                    )}

                    <div className="cp-dual-panel" ref={panelRef}>
                        <form className="cp-form-panel" onSubmit={handleSubmit} ref={formRef}>
                            <div className="cp-input-group">
                                <label className="cp-field-label">Your Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className="cp-form-control"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="cp-input-group">
                                <label className="cp-field-label">Your Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="cp-form-control"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="cp-input-group">
                                <label className="cp-field-label">Your Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    className="cp-form-control"
                                    placeholder="Subject"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="cp-input-group">
                                <label className="cp-field-label">Your Message</label>
                                <textarea
                                    name="eventDetails"
                                    className="cp-form-control"
                                    placeholder="Message"
                                    value={formData.eventDetails}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="cp-action-button" disabled={isSubmitting}>
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </button>
                        </form>

                        <div className="cp-info-panel" ref={infoRef}>
                            <div className="cp-info-header">
                                <div className="cp-info-badge">Contact Us</div>
                                <h3 className="cp-info-title">Get In Touch</h3>
                                <h3 className="cp-info-desc">
                                    Have questions or need assistance? Reach out to us through any of the channels below.
                                </h3>
                            </div>

                            <div className="cp-details-grid">
                                <div className="cp-detail-entry">
                                    <div className="cp-entry-icon">
                                        <Phone size={20} />
                                    </div>
                                    <div className="cp-entry-content">
                                        <div className="cp-entry-category">Call Us</div>
                                        <div className="cp-entry-value">+60 14-6769866</div>
                                    </div>
                                </div>
                                <div className="cp-detail-entry">
                                    <div className="cp-entry-icon">
                                        <Mail size={20} />
                                    </div>
                                    <div className="cp-entry-content">
                                        <div className="cp-entry-category">Email Us</div>
                                        <div className="cp-entry-value">samssoundlight.ssl@gmail.com</div>
                                    </div>
                                </div>
                                <div className="cp-detail-entry">
                                    <div className="cp-entry-icon">
                                        <Globe size={20} />
                                    </div>
                                    <div className="cp-entry-content">
                                        <div className="cp-entry-category">Website</div>
                                        <div className="cp-entry-value">https://samsoundnlight.wixsite.com/website</div>
                                    </div>
                                </div>
                                <div className="cp-detail-entry">
                                    <div className="cp-entry-icon">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="cp-entry-content">
                                        <div className="cp-entry-category">Address</div>
                                        <div className="cp-entry-value">Likas, 88400 Kota Kinabalu</div>
                                    </div>
                                </div>
                            </div>

                            <div className="cp-social-zone">
                                <div className="cp-social-label">Follow Us On</div>
                                <div className="cp-icon-cluster">
                                    <a href="https://www.facebook.com/samsoundlight/" className="cp-social-icon">
                                        <Facebook size={18} />
                                    </a>
                                    <a href="https://instagram.com/samssoundnlight?igshid=1bkr3f38xwq30" className="cp-social-icon">
                                        <Instagram size={18} />
                                    </a>
                                    <a href="https://www.youtube.com/watch?v=TRXTrQe6hRM" className="cp-social-icon">
                                        <Youtube size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="cp-map-viewer" ref={mapRef}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3968.126024383545!2d116.0881557744777!3d5.9773790292697235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x323b69764f84e557%3A0x87b9f494a3fb1667!2s88%2C%20Lorong%20Burung%20Ruai%201%2C%20Taman%20Yakim%20Jaya%2C%2088450%20Kota%20Kinabalu%2C%20Sabah!5e0!3m2!1sen!2smy!4v1763994391308!5m2!1sen!2smy"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="cp-map-frame"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}

export default ContactUsPage;