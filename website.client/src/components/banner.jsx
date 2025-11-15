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
                    await loadEvents(); // Reload to get fresh data
                } else {
                    alert(data.message || "Failed to update events.");
                }
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        } catch (err) {
            alert("Events updated locally! Backend not available.");
            setEditMode(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        loadEvents(); // Reload original data
        setEditMode(false);
    };

    // Handle image loading errors - same style as Banner
    const handleImageError = (e) => {
        console.error('Failed to load event image:', e.target.src);
        e.target.src = '/img/default-event.jpg';
        e.target.style.objectFit = 'cover';
    };

    // Handle image load success - same style as Banner
    const handleImageLoad = (e) => {
        e.target.style.objectFit = 'cover';
    };

    return (
        <div
            className="upcoming-events-container"
            id="events"
            onMouseEnter={() => isStaff && setShowEditButton(true)}
            onMouseLeave={() => isStaff && setShowEditButton(false)}
        >
            {/* Floating Edit Button - Same style as Banner */}
            {isStaff && !editMode && (
                <button
                    className={`events-edit-btn ${showEditButton ? "visible" : ""}`}
                    onClick={() => setEditMode(true)}
                >
                    <span className="edit-icon">✏️</span>
                    Edit Events
                </button>
            )}

            <h2 className="upcoming-events-title">Upcoming Events</h2>

            <div className="events-grid-container">
                <div className="events-grid">
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            className="event-card"
                            onMouseEnter={() => setHoveredEventIndex(index)}
                            onMouseLeave={() => setHoveredEventIndex(null)}
                        >
                            {/* Edit Button for Individual Events - Same style as Banner */}
                            {editMode && isStaff && (
                                <button
                                    className={`event-edit-btn ${hoveredEventIndex === index ? "visible" : ""}`}
                                    onClick={() => removeEvent(index)}
                                    title="Remove event"
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            )}

                            <div className="event-image-container">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="event-image"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            </div>

                            <div className="event-content">
                                {editMode && isStaff ? (
                                    <div className="event-edit-form">
                                        {/* Image URL Input - Same style as Banner */}
                                        <div className="form-group">
                                            <label>Image URL</label>
                                            <div className="image-url-input-container">
                                                <input
                                                    type="text"
                                                    value={event.image}
                                                    onChange={(e) => handleEventChange(index, 'image', e.target.value)}
                                                    className="edit-image-input"
                                                    placeholder="Enter image URL or path (e.g., /img/event1.jpg)"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                value={event.title}
                                                onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                                                className="edit-event-title"
                                                placeholder="Enter event title"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Date</label>
                                            <input
                                                type="text"
                                                value={event.date}
                                                onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                                                className="edit-event-date"
                                                placeholder="Enter event date"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Details</label>
                                            <input
                                                type="text"
                                                value={event.detail}
                                                onChange={(e) => handleEventChange(index, 'detail', e.target.value)}
                                                className="edit-event-detail"
                                                placeholder="Enter event details"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Button Text</label>
                                            <input
                                                type="text"
                                                value={event.buttonText}
                                                onChange={(e) => handleEventChange(index, 'buttonText', e.target.value)}
                                                className="edit-button-text"
                                                placeholder="Enter button text"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="event-view-content">
                                        <h3 className="event-title">{event.title}</h3>
                                        <div className="event-meta">
                                            <span className="event-date">{event.date}</span>
                                            <span className="event-detail">{event.detail}</span>
                                        </div>
                                        <button className="event-btn">
                                            {event.buttonText}
                                        </button>
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

            {/* Save/Cancel Buttons - Same style as Banner */}
            {editMode && isStaff && (
                <div className="events-edit-controls">
                    <button
                        className="save-events-btn"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                    <button
                        className="cancel-events-btn"
                        onClick={handleCancel}
                        disabled={loading}
                    >
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