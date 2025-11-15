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
            image: '/img/event1.jpg', // Changed from ./img/ to /img/
            buttonText: 'Learn More'
        },
        {
            id: 2,
            title: 'Steppin Out 1st Anniversary Competition',
            date: 'Sat, 19 Nov',
            detail: 'Event by Karabaw Martial Arts & Fitness Centre',
            image: '/img/event2.jpg', // Changed from ./img/ to /img/
            buttonText: 'Learn More'
        }
    ];

    const newEventTemplate = {
        id: 0,
        title: 'New Event Title',
        date: 'Date TBA',
        detail: 'Event details here...',
        image: '/img/default-event.jpg', // Use absolute path
        buttonText: 'Learn More'
    };

    // Function to get correct image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/img/default-event.jpg';

        // If it's already a full URL, return as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        // If it starts with /, it's relative to the domain
        if (imagePath.startsWith('/')) {
            return imagePath;
        }

        // For relative paths without leading slash
        return `/${imagePath}`;
    };

    // Load events from backend
    const loadEvents = async () => {
        try {
            console.log('Loading events from:', API_BASE);
            const res = await fetch(API_BASE);

            if (res.ok) {
                const data = await res.json();
                console.log('Events loaded from backend:', data);

                if (data && data.length > 0) {
                    // Ensure image URLs are correct
                    const eventsWithCorrectedImages = data.map(event => ({
                        ...event,
                        image: getImageUrl(event.image)
                    }));
                    setEvents(eventsWithCorrectedImages);
                    return;
                }
            } else {
                console.warn('Failed to load events from backend, status:', res.status);
            }
        } catch (err) {
            console.error("Failed to load from backend:", err);
        }

        // Use default events if backend fails
        console.log("Using default events");
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
            console.log('Saving events:', events);

            const res = await fetch(`${API_BASE}/update-all`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(events),
            });

            const result = await res.json();
            console.log('Save response:', result);

            if (res.ok && result.success) {
                alert("Events updated successfully!");
                setEditMode(false);
                // Reload events to get the updated data from backend
                loadEvents();
            } else {
                alert(result.message || "Failed to update events.");
            }
        } catch (err) {
            console.error('Save error:', err);
            alert("Error saving events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        loadEvents(); // Reload original events
        setEditMode(false);
    };

    return (
        <div
            className="upcoming-events-container"
            id="events"
            onMouseEnter={() => isStaff && setShowEditButton(true)}
            onMouseLeave={() => isStaff && setShowEditButton(false)}
        >
            {/* Floating Edit Button - Only show when staff is logged in and hovering */}
            {isStaff && !editMode && (
                <button
                    className={`events-edit-btn ${showEditButton ? 'visible' : ''}`}
                    onClick={() => setEditMode(true)}
                >
                    Edit Events
                </button>
            )}

            <h2 className="upcoming-events-title">Upcoming Events</h2>

            <div className="events-grid-container">
                <div className="events-grid">
                    {events.map((event, index) => (
                        <div
                            key={event.id || index}
                            className="event-card"
                            onMouseEnter={() => setHoveredEventIndex(index)}
                            onMouseLeave={() => setHoveredEventIndex(null)}
                        >
                            {/* Edit Button for Individual Events */}
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
                                <img
                                    src={getImageUrl(event.image)}
                                    alt={event.title}
                                    className="event-image"
                                    onError={(e) => {
                                        // If image fails to load, use a default
                                        e.target.src = '/img/default-event.jpg';
                                    }}
                                />
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
                                                placeholder="🖼️ Enter image URL or path..."
                                                disabled={loading}
                                            />
                                            <small className="image-url-hint">
                                                Use: /img/filename.jpg or full URL
                                            </small>
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
                                        <input
                                            type="text"
                                            value={event.buttonText}
                                            onChange={(e) => handleEventChange(index, 'buttonText', e.target.value)}
                                            className="edit-button-text"
                                            placeholder="🔘 Button text..."
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