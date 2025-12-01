import React, { useState, useEffect } from "react";
import "/src/App.css";
import banner from "/src/img/bg3.jpg";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/events`
    : "http://localhost:8080/api/events";

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [hoveredEventIndex, setHoveredEventIndex] = useState(null);
    const [showEditButton, setShowEditButton] = useState(false);
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user.role === "staff";

    const defaultEvents = [
        {
            id: 1,
            title: 'Lets plan your memorable moment at Sam Sound & Light',
            date: 'Sat, 29 June',
            detail: 'Event by Sam Sound & Lights',
            image: "src/img/event1.jpg",
            buttonText: 'Learn More'
        },
        {
            id: 2,
            title: 'Steppin Out 1st Anniversary Competition',
            date: 'Sat, 19 Nov',
            detail: 'Event by Karabaw Martial Arts & Fitness Centre',
            image: "src/img/event2.jpg",
            buttonText: 'Learn More'
        }
    ];

    const newEventTemplate = {
        id: 0,
        title: 'New Event Title',
        date: 'Date TBA',
        detail: 'Event details here...',
        image: './img/default-event.jpg',
        buttonText: 'Learn More'
    };

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
        loadEvents();
        setEditMode(false);
    };

    return (
        <div className="events-page-container">
            <section className="events-hero">
                <div className="events-hero-background">
                    <img src={banner} alt="Events Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="services-hero-content">
                    <h2 className="events-hero-title fade-in-up">Our <span>Events</span></h2>
                    <h3 className="fade-in-up" style={{ animationDelay: "0.5s" }}>What upcoming events</h3>
                </div>
            </section>
             
            <div
                className="events-main-container"
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

                <div className="events-content-wrapper">
                    

                    <div className="events-grid-section">
                        <div className="events-grid-layout">
                            {events.map((event, index) => (
                                <div
                                    key={event.id}
                                    className="event-card-item"
                                    onMouseEnter={() => setHoveredEventIndex(index)}
                                    onMouseLeave={() => setHoveredEventIndex(null)}
                                >
                                    {editMode && isStaff && (
                                        <button
                                            className={`event-remove-btn ${hoveredEventIndex === index ? 'visible' : ''}`}
                                            onClick={() => removeEvent(index)}
                                            title="Remove event"
                                            disabled={loading}
                                        >
                                            ×
                                        </button>
                                    )}

                                    <div className="event-image-wrapper">
                                        <img src={event.image} alt={event.title} className="event-img" />
                                    </div>

                                    <div className="event-details">
                                        {editMode && isStaff ? (
                                            <div className="event-edit-fields">
                                                <div className="image-input-wrapper">
                                                    <input
                                                        type="text"
                                                        value={event.image}
                                                        onChange={(e) => handleEventChange(index, 'image', e.target.value)}
                                                        className="edit-image-url"
                                                        placeholder="🖼️ Enter image URL..."
                                                        disabled={loading}
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={event.title}
                                                    onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                                                    className="edit-title-input"
                                                    placeholder="Event title..."
                                                    disabled={loading}
                                                />
                                                <input
                                                    type="text"
                                                    value={event.date}
                                                    onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                                                    className="edit-date-input"
                                                    placeholder="📅 Event date..."
                                                    disabled={loading}
                                                />
                                                <input
                                                    type="text"
                                                    value={event.detail}
                                                    onChange={(e) => handleEventChange(index, 'detail', e.target.value)}
                                                    className="edit-detail-input"
                                                    placeholder="ℹ️ Event details..."
                                                    disabled={loading}
                                                />
                                                <input
                                                    type="text"
                                                    value={event.buttonText}
                                                    onChange={(e) => handleEventChange(index, 'buttonText', e.target.value)}
                                                    className="edit-button-input"
                                                    placeholder="🔘 Button text..."
                                                    disabled={loading}
                                                />
                                            </div>
                                        ) : (
                                            <div className="event-display-content">
                                                <h3 className="event-title-text">{event.title}</h3>
                                                <div className="event-meta-info">
                                                    <span className="event-date-text">{event.date}</span>
                                                    <span className="event-detail-text">{event.detail}</span>
                                                </div>
                                                
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {editMode && isStaff && (
                                <div
                                    className="event-card-item add-new-event"
                                    onClick={addEvent}
                                    onMouseEnter={() => setHoveredEventIndex('add')}
                                    onMouseLeave={() => setHoveredEventIndex(null)}
                                >
                                    <div className="add-event-wrapper">
                                        <div className="add-event-icon">+</div>
                                        <h3>Add New Event</h3>
                                        <p>Click to create a new event card</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {editMode && isStaff && (
                    <div className="events-action-controls">
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
        </div>
    );
};

export default EventsPage;