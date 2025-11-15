import React, { useState, useEffect } from "react";
import "../App.css";
import { useAuth } from "./AuthContext";

import event1 from "../img/event1.jpg";
import event2 from "../img/event2.jpg";
import defaultEvent from "../img/banner.jpg";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/events`
    : "http://localhost:8080/api/events";

const defaultEvents = [
    {
        id: 1,
        title: "Lets plan your memorable moment at Sam Sound & Light",
        date: "Sat, 29 June",
        detail: "Event by Sam Sound & Lights",
        image: event1, 
        buttonText: "Learn More",
    },
    {
        id: 2,
        title: "Steppin Out 1st Anniversary Competition",
        date: "Sat, 19 Nov",
        detail: "Event by Karabaw Martial Arts & Fitness Centre",
        image: event2, 
        buttonText: "Learn More",
    },
];

const Event = () => {
    const { user } = useAuth();
    const isStaff = user?.role === "staff";

    const [events, setEvents] = useState(defaultEvents);
    const [editMode, setEditMode] = useState(false);
    const [hoveredEventIndex, setHoveredEventIndex] = useState(null);
    const [showEditButton, setShowEditButton] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backendAvailable, setBackendAvailable] = useState(false);

    // Helper function to handle image paths
    const getImageUrl = (imagePath) => {
        // If it's already an imported image (object with default property), use it
        if (typeof imagePath === 'object' && imagePath.default) {
            return imagePath.default;
        }
        // If it's a string path from backend
        if (typeof imagePath === 'string') {
            // Remove leading slash if present
            const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            // Check if it's a local image we can import
            if (cleanPath.includes('event1.jpg')) return event1;
            if (cleanPath.includes('event2.jpg')) return event2;
            if (cleanPath.includes('default-event.jpg')) return defaultEvent;

            // For other images, try to construct the path
            return `/${cleanPath}`;
        }
        // Fallback to default event image
        return defaultEvent;
    };

    // Test backend connection
    const testBackendConnection = async () => {
        try {
            console.log("Testing backend connection...");
            const response = await fetch(API_BASE, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                console.log("Backend is available");
                setBackendAvailable(true);
                return true;
            }
        } catch (error) {
            console.log("Backend is not available:", error.message);
            setBackendAvailable(false);
        }
        return false;
    };

    // Load events from backend or use defaults
    const loadEvents = async () => {
        const isBackendAvailable = await testBackendConnection();

        if (!isBackendAvailable) {
            console.log("Using default events - backend not available");
            setEvents(defaultEvents);
            return;
        }

        try {
            console.log("Loading events from backend:", API_BASE);
            const res = await fetch(API_BASE, {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Events loaded from backend:", data);

                if (Array.isArray(data) && data.length > 0) {
                    // Process images from backend
                    const processedEvents = data.map(event => ({
                        ...event,
                        image: getImageUrl(event.image)
                    }));
                    setEvents(processedEvents);
                } else {
                    console.log("No events in backend, using defaults");
                    setEvents(defaultEvents);
                }
            } else {
                console.log("Backend response not OK, using defaults");
                setEvents(defaultEvents);
            }
        } catch (err) {
            console.error("Error loading events from backend:", err);
            setEvents(defaultEvents);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleEventChange = (index, field, value) => {
        const updatedEvents = [...events];
        updatedEvents[index] = { ...events[index], [field]: value };
        setEvents(updatedEvents);
    };

    const addEvent = () => {
        const newEvent = {
            id: events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1,
            title: "New Event Title",
            date: "Date TBA",
            detail: "Event details here...",
            image: defaultEvent, // Use imported default image
            buttonText: "Learn More",
        };

        setEvents([...events, newEvent]);
    };

    const removeEvent = (index) => {
        const updated = events.filter((_, i) => i !== index);
        setEvents(updated);
    };

    const handleSave = async () => {
        setLoading(true);

        // If backend is not available, just update UI
        if (!backendAvailable) {
            alert("Backend not available. Changes are only local and will reset on page refresh.");
            setEditMode(false);
            setLoading(false);
            return;
        }

        try {
            console.log("Saving events to backend:", events);

            // Prepare events for backend - convert images to string paths
            const eventsForBackend = events.map(event => ({
                ...event,
                image: typeof event.image === 'string' ? event.image : 'img/default-event.jpg'
            }));

            const res = await fetch(`${API_BASE}/update-all`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(eventsForBackend),
                credentials: 'include'
            });

            const data = await res.json();
            console.log("Save response:", data);

            if (res.ok && data.success) {
                alert("Events updated successfully in backend!");
                setEditMode(false);
                await loadEvents();
            } else {
                alert(data.message || "Failed to update events in backend.");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to connect to backend. Changes are only local.");
        }

        setLoading(false);
    };

    const handleCancel = () => {
        loadEvents(); // Reload original data
        setEditMode(false);
    };

    // Handle image loading errors
    const handleImageError = (e) => {
        console.error('Failed to load event image:', e.target.src);
        e.target.src = defaultEvent;
    };

    return (
        <div
            className="upcoming-events-container"
            id="events"
            onMouseEnter={() => isStaff && setShowEditButton(true)}
            onMouseLeave={() => isStaff && setShowEditButton(false)}
        >
            {/* Floating Edit Button */}
            {isStaff && !editMode && (
                <button
                    className={`events-edit-btn ${showEditButton ? "visible" : ""}`}
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
                            {/* Delete button (only in edit mode) */}
                            {editMode && isStaff && (
                                <button
                                    className={`event-edit-btn ${hoveredEventIndex === index ? "visible" : ""}`}
                                    onClick={() => removeEvent(index)}
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
                                    onError={handleImageError}
                                />
                            </div>

                            <div className="event-content">
                                {editMode && isStaff ? (
                                    <div className="event-edit-form">
                                        <input
                                            type="text"
                                            value={typeof event.image === 'string' ? event.image : 'img/default-event.jpg'}
                                            onChange={(e) =>
                                                handleEventChange(index, "image", e.target.value)
                                            }
                                            className="edit-image-input"
                                            placeholder="Image URL or path (e.g., img/event1.jpg)"
                                        />
                                        <input
                                            type="text"
                                            value={event.title}
                                            onChange={(e) =>
                                                handleEventChange(index, "title", e.target.value)
                                            }
                                            className="edit-event-title"
                                            placeholder="Title"
                                        />
                                        <input
                                            type="text"
                                            value={event.date}
                                            onChange={(e) =>
                                                handleEventChange(index, "date", e.target.value)
                                            }
                                            className="edit-event-date"
                                            placeholder="Date"
                                        />
                                        <input
                                            type="text"
                                            value={event.detail}
                                            onChange={(e) =>
                                                handleEventChange(index, "detail", e.target.value)
                                            }
                                            className="edit-event-detail"
                                            placeholder="Details"
                                        />
                                        <input
                                            type="text"
                                            value={event.buttonText}
                                            onChange={(e) =>
                                                handleEventChange(index, "buttonText", e.target.value)
                                            }
                                            className="edit-button-text"
                                            placeholder="Button Text"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="event-title">{event.title}</h3>
                                        <div className="event-meta">
                                            <span className="event-date">{event.date}</span>
                                            <span className="event-detail">{event.detail}</span>
                                        </div>
                                        <button className="event-btn">{event.buttonText}</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add new event */}
                    {editMode && isStaff && (
                        <div className="event-card add-event-card" onClick={addEvent}>
                            <div className="add-event-content">
                                <div className="add-event-icon">+</div>
                                <h3>Add New Event</h3>
                                <p>Create another event card</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save/cancel buttons */}
            {editMode && isStaff && (
                <div className="events-edit-controls">
                    <button className="save-events-btn" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : backendAvailable ? "Save to Backend" : "Save Locally"}
                    </button>
                    <button className="cancel-events-btn" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default Event;