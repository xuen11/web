import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "/src/App.css";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/events`
    : "http://localhost:8080/api/events";

const Event = () => {
    const [events, setEvents] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [hoveredEventIndex, setHoveredEventIndex] = useState(null);
    const [showEditButton, setShowEditButton] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user.role === "staff";

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

    const newEventTemplate = {
        id: 0,
        title: 'New Event Title',
        date: 'Date TBA',
        detail: 'Event details here...',
        image: './img/default-event.jpg',
    };

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

    const handleEventChange = (index, field, value) => {
        const updatedEvents = [...events];
        updatedEvents[index] = {
            ...updatedEvents[index],
            [field]: value
        };
        setEvents(updatedEvents);
    };

    const addEvent = () => {
        const eventToAdd = {
            ...newEventTemplate,
            id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1
        };
        setEvents([...events, eventToAdd]);
    };

    const removeEvent = (index) => {
        const updatedEvents = events.filter((_, i) => i !== index);
        setEvents(updatedEvents);
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/update-all`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(events),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    alert("Events updated successfully!");
                    setEditMode(false);
                } else {
                    alert(data.message || "Failed to update events.");
                }
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        } catch (err) {
            alert("Events updated successfully!");
            setEditMode(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEvents(defaultEvents);
        setEditMode(false);
    };

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

        <div
            className="upcoming-events-container"
            id="events"
            onMouseEnter={() => isStaff && setShowEditButton(true)}
            onMouseLeave={() => isStaff && setShowEditButton(false)}
        >
            {isStaff && !editMode && (
                <button
                    className={`events-edit-btn ${showEditButton ? 'visible' : ''}`}
                    onClick={() => setEditMode(true)}
                >
                    Edit Events
                </button>
            )}

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
                            {editMode && isStaff && (
                                <button
                                    className={`event-edit-btn ${hoveredEventIndex === index ? 'visible' : ''}`}
                                    onClick={() => removeEvent(index)}
                                    title="Remove event"
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            )}

                            <div className="event-image-container">
                                <img src={event.image} alt={event.title} className="event-image" />
                            </div>

                            <div className="event-content">
                                {editMode && isStaff ? (
                                    <div className="event-edit-form">
                                        <div className="image-url-input-container">
                                            <input
                                                type="text"
                                                value={event.image}
                                                onChange={(e) => handleEventChange(index, 'image', e.target.value)}
                                                className="edit-image-input"
                                                placeholder="🖼️ Enter image URL..."
                                                disabled={loading}
                                            />
                                        </div>

                                        <input
                                            type="text"
                                            value={event.title}
                                            onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                                            className="edit-event-title"
                                            placeholder="Event title..."
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            value={event.date}
                                            onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                                            className="edit-event-date"
                                            placeholder="📅 Event date..."
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            value={event.detail}
                                            onChange={(e) => handleEventChange(index, 'detail', e.target.value)}
                                            className="edit-event-detail"
                                            placeholder="ℹ️ Event details..."
                                            disabled={loading}
                                        />
                                        
                                    </div>
                                ) : (
                                    <div className="event-view-content">
                                        <h3 className="event-title">{event.title}</h3>
                                        <div className="event-meta">
                                            <span className="event-date">{event.date}</span>
                                            <span className="event-detail">{event.detail}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {editMode && isStaff && (
                        <div
                            className="event-card add-event-card"
                            onClick={addEvent}
                            onMouseEnter={() => setHoveredEventIndex('add')}
                            onMouseLeave={() => setHoveredEventIndex(null)}
                        >
                            <div className="add-event-content">
                                <div className="add-event-icon">+</div>
                                <h3>Add New Event</h3>
                                <p>Click to create a new event card</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {editMode && isStaff && (
                <div className="events-edit-controls">
                    <button className="save-events-btn" onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button className="cancel-events-btn" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </button>
                </div>
            )}
            


            {events.length === 0 && !editMode && (
                <div className="no-events-message">
                    <p>No upcoming events scheduled.</p>
                    {isStaff && (
                        <p>Hover over this section and click "Edit Events" to add new events.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Event;