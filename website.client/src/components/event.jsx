import React, { useState, useEffect } from "react";
import "../App.css";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/events`
    : "http://localhost:8080/api/events";

const Event = () => {
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
            image: '/img/event1.jpg',
            buttonText: 'Learn More'
        },
        {
            id: 2,
            title: 'Steppin Out 1st Anniversary Competition',
            date: 'Sat, 19 Nov',
            detail: 'Event by Karabaw Martial Arts & Fitness Centre',
            image: '/img/event2.jpg',
            buttonText: 'Learn More'
        }
    ];

    const newEventTemplate = {
        id: 0,
        title: 'New Event Title',
        date: 'Date TBA',
        detail: 'Event details here...',
        image: '/img/default-event.jpg',
        buttonText: 'Learn More'
    };

    const getImageUrl = (path) => {
        if (!path) return "/img/default-event.jpg";
        if (path.startsWith("http")) return path;  // full URL
        return path.startsWith("/") ? path : `/${path}`; // local images
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
        } catch {
            console.log("Failed to load from backend, using default");
        }
        setEvents(defaultEvents);
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleEventChange = (index, field, value) => {
        const updatedEvents = [...events];
        updatedEvents[index][field] = value;
        setEvents(updatedEvents);
    };

    const addEvent = () => {
        const newId = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
        setEvents([...events, { ...newEventTemplate, id: newId }]);
    };

    const removeEvent = (index) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/update-all`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(events),
            });
            const data = await res.json();
            if (data.success) alert("Events updated successfully!");
            setEditMode(false);
        } catch {
            alert("Failed to save events");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEvents(defaultEvents);
        setEditMode(false);
    };

    return (
        <div className="upcoming-events-container"
            id="events"
            onMouseEnter={() => isStaff && setShowEditButton(true)}
            onMouseLeave={() => isStaff && setShowEditButton(false)}>
            {isStaff && !editMode && (
                <button className={`events-edit-btn ${showEditButton ? 'visible' : ''}`}
                    onClick={() => setEditMode(true)}>Edit Events</button>
            )}
            <h2 className="upcoming-events-title">Upcoming Events</h2>
            <div className="events-grid-container">
                <div className="events-grid">
                    {events.map((event, index) => (
                        <div key={event.id} className="event-card"
                            onMouseEnter={() => setHoveredEventIndex(index)}
                            onMouseLeave={() => setHoveredEventIndex(null)}>
                            {editMode && isStaff && (
                                <button className={`event-edit-btn ${hoveredEventIndex === index ? 'visible' : ''}`}
                                    onClick={() => removeEvent(index)}>×</button>
                            )}
                            <div className="event-image-container">
                                <img src={getImageUrl(event.image)} alt={event.title} className="event-image" />
                            </div>
                            <div className="event-content">
                                {editMode && isStaff ? (
                                    <div className="event-edit-form">
                                        <input type="text" value={event.image}
                                            onChange={(e) => handleEventChange(index, 'image', e.target.value)}
                                            disabled={loading} />
                                        <input type="text" value={event.title}
                                            onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                                            disabled={loading} />
                                        <input type="text" value={event.date}
                                            onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                                            disabled={loading} />
                                        <input type="text" value={event.detail}
                                            onChange={(e) => handleEventChange(index, 'detail', e.target.value)}
                                            disabled={loading} />
                                        <input type="text" value={event.buttonText}
                                            onChange={(e) => handleEventChange(index, 'buttonText', e.target.value)}
                                            disabled={loading} />
                                    </div>
                                ) : (
                                    <div className="event-view-content">
                                        <h3>{event.title}</h3>
                                        <div className="event-meta">
                                            <span>{event.date}</span>
                                            <span>{event.detail}</span>
                                        </div>
                                        <button>{event.buttonText}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {editMode && isStaff && (
                        <div className="event-card add-event-card" onClick={addEvent}>
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
                    <button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                    <button onClick={handleCancel} disabled={loading}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default Event;
