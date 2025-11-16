import React, { useState, useEffect } from "react";
import "../App.css";

// Import images directly
import event1Image from "../img/event1.jpg";
import event2Image from "../img/event2.jpg";
import defaultEventImage from "../img/default-event.jpg";

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
            image: event1Image, // Use imported image directly
            buttonText: 'Learn More'
        },
        {
            id: 2,
            title: 'Steppin Out 1st Anniversary Competition',
            date: 'Sat, 19 Nov',
            detail: 'Event by Karabaw Martial Arts & Fitness Centre',
            image: event2Image, // Use imported image directly
            buttonText: 'Learn More'
        }
    ];

    const newEventTemplate = {
        id: 0,
        title: 'New Event Title',
        date: 'Date TBA',
        detail: 'Event details here...',
        image: defaultEventImage, // Use imported image directly
        buttonText: 'Learn More'
    };

    // Load events from backend
    const loadEvents = async () => {
        try {
            console.log("Loading events from:", API_BASE);
            const res = await fetch(API_BASE);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${await res.text()}`);
            }

            const data = await res.json();
            console.log("Events data received:", data);

            if (data && data.length > 0) {
                // Map backend properties to frontend properties
                const mappedEvents = data.map(event => ({
                    id: event.Id || event.id,
                    title: event.Title || event.title,
                    date: event.Date || event.date,
                    detail: event.Detail || event.detail,
                    image: event.Image || event.image, // Use image directly
                    buttonText: event.ButtonText || event.buttonText
                }));
                setEvents(mappedEvents);
                return;
            }
        } catch (err) {
            console.error("Failed to load events:", err);
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
            console.log("Saving events with:", events);

            // Map frontend properties to backend properties
            const eventsToSave = events.map(event => ({
                Id: event.id,
                Title: event.title,
                Date: event.date,
                Detail: event.detail,
                Image: event.image, // Save image path directly
                ButtonText: event.buttonText,
                CreatedAt: new Date().toISOString(),
                UpdatedAt: new Date().toISOString()
            }));

            const res = await fetch(`${API_BASE}/update-all`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventsToSave),
            });

            console.log("Save response status:", res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Save error response:", errorText);
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();
            console.log("Save response data:", data);

            if (data.success) {
                alert("Events updated successfully!");
                setEditMode(false);
                await loadEvents();
            } else {
                alert(data.message || "Failed to update events.");
            }
        } catch (err) {
            console.error("Error updating events:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        loadEvents();
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
                                {/* Use image directly - no URL conversion */}
                                <img
                                    src={event.image || defaultEventImage}
                                    alt={event.title}
                                    className="event-image"
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
                                                placeholder="🖼️ Enter image path (e.g., ../img/your-image.jpg)"
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
                                            placeholder="Event details..."
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            value={event.buttonText}
                                            onChange={(e) => handleEventChange(index, 'buttonText', e.target.value)}
                                            className="edit-button-text"
                                            placeholder="Button text..."
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
                    <button
                        className="save-events-btn"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
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