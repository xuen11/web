import React, { useState } from "react";
import "../App.css";

export default function Contact() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        eventDetails: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

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
        <div className="contact-container" id="contact">
            <div className="contact-background">
                <div className="contact-light-blue"></div>
                <div className="contact-light-purple"></div>
            </div>

            <div className="contact-content">
                <h1 className="contact-title">
                    Contact <span>Sam Sound and Light</span>
                </h1>

                <p className="contact-subtitle">
                    Have an event coming up? Let's make it shine bright and sound amazing!
                </p>

                {message && (
                    <div className={`message ${message.includes("Thank you") ? "success" : "error"}`}>
                        {message}
                    </div>
                )}

                <div className="contact-grid">
                    <div className="contact-info">
                        <div className="contact-item">
                            <div className="contact-icon">📞</div>
                            <span>+60 14-6769866</span>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon">✉️</div>
                            <span>samssoundlight.ssl@gmail.com</span>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon">📍</div>
                            <span>Likas, 88400 Kota Kinabalu, Malaysia</span>
                        </div>

                        <div className="contact-description">
                            <p className="contact-description-title">
                                Let's Light Up Your Next Event!
                            </p>
                            <p>
                                Whether it's a concert, wedding, or corporate event, our expert
                                lighting and sound engineers will bring your vision to life with
                                state-of-the-art equipment and professional service.
                            </p>
                        </div>
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                className="form-input"
                                placeholder="Enter your phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Event Details</label>
                            <textarea
                                name="eventDetails"
                                rows="5"
                                className="form-input"
                                placeholder="Tell us about your event - date, venue, type of event, and any special requirements..."
                                value={formData.eventDetails}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}