import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "/src/App.css";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/events`
    : "http://localhost:8080/api/events";

const Event = () => {
    const [events, setEvents] = useState([]);
   
    const navigate = useNavigate();

    const defaultEvents = [
        {
            id: 1,
            title: 'Lets plan your memorable moment at Sam Sound & Light',
            date: 'Sat, 29 June',
            detail: 'Event by Sam Sound & Lights',
            image: "/img/event1.jpg",
        },
        {
            id: 2,
            title: 'Steppin Out 1st Anniversary Competition',
            date: 'Sat, 19 Nov',
            detail: 'Event by Karabaw Martial Arts & Fitness Centre',
            image: "/img/event2.jpg",
        }
    ];

    // Load events from backend
    const loadEvents = async () => {
        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    setEvents(data);
                    return;
                }
            }
        } catch (err) {
            console.log("Failed to load from backend, using default");
        }
        setEvents(defaultEvents);
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleViewAll = () => {
        navigate("/events");
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    };

    return (
        <div className="upcoming-events-container" id="events">
            <div className="events-header">
                <div className="events-header-content">
                    <div className="events-label">OUR EVENTS</div>
                    <h3 className="upcoming-events-title">
                        What <span>upcoming event</span>
                    </h3>
                    <button className="view-all-btn" onClick={handleViewAll}>
                        View All <span className="arrow">→</span>
                    </button>
                </div>
            </div>

            <div className="events-grid-container">
                <div className="events-grid">
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            className="event-card"
                            onMouseEnter={() => setHoveredEventIndex(index)}
                            onMouseLeave={() => setHoveredEventIndex(null)}
                        >
                            <div className="event-image-container">
                                <img src={event.image} alt={event.title} className="event-image" />
                            </div>

                            <div className="event-content">
                                <div className="event-view-content">
                                    <h3 className="event-title">{event.title}</h3>
                                    <div className="event-meta">
                                        <span className="event-date">{event.date}</span>
                                        <span className="event-detail">{event.detail}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {events.length === 0 && (
                <div className="no-events-message">
                    <p>No upcoming events scheduled.</p>
                </div>
            )}
        </div>
    );
};

export default Event;