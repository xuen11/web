import React, { useEffect, useState } from "react";
import "/src/App.css";
import bg from "../img/bg1.jpg";

// Default images
import img1 from "../img/sound1.jpg";
import img2 from "../img/karaokeService.jpg";
import img3 from "../img/lightingSystem.jpg";
import img4 from "../img/ledScreen.jpg";
import img5 from "../img/visualSystem.jpg";
import img6 from "../img/projectionSystem.jpg";
import img7 from "../img/liveBand2.jpg";
import img8 from "../img/localArtist.jpg";
import img9 from "../img/installationService.jpg";
import img10 from "../img/truss.jpg";
import img11 from "../img/stage.jpg";
import img12 from "../img/emcee.jpg";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/service`
    : "http://localhost:8080/api/service";

// Default services
const defaultServices = [
    { id: 0, img: img1, title: "Sound System" },
    { id: 0, img: img2, title: "Karaoke Service" },
    { id: 0, img: img3, title: "Lighting System" },
    { id: 0, img: img4, title: "LED Screen" },
    { id: 0, img: img5, title: "Visual System" },
    { id: 0, img: img6, title: "Projection System" },
    { id: 0, img: img7, title: "Live Band" },
    { id: 0, img: img8, title: "Local Artist" },
    { id: 0, img: img9, title: "Installation Service" },
    { id: 0, img: img10, title: "Truss System" },
    { id: 0, img: img11, title: "Stage" },
    { id: 0, img: img12, title: "Emcee Service" },
];

const Services = () => {
    const [services, setServices] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user.role === "staff";

    // Load services from backend
    const loadServices = async () => {
        try {
            const res = await fetch(API_BASE);
            const data = await res.json();
            if (data && data.length > 0) setServices(data);
            else setServices(defaultServices);
        } catch (err) {
            console.log("Failed to fetch services, using default", err);
            setServices(defaultServices);
        }
    };

    useEffect(() => { loadServices(); }, []);

    const addService = () => {
        setServices([...services, { id: 0, title: "", img: "" }]);
        setEditMode(true);
    };

    const removeService = async (id) => {
        if (id !== 0) await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
        setServices(services.filter(s => s.id !== id));
    };

    const handleChange = (index, field, value) => {
        const updated = [...services];
        updated[index][field] = value;
        setServices(updated);
    };

    const saveServices = async () => {
        setLoading(true);
        for (let service of services) {
            if (service.id === 0) {
                await fetch(API_BASE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(service),
                });
            } else {
                await fetch(`${API_BASE}/${service.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(service),
                });
            }
        }
        setLoading(false);
        setEditMode(false);
        loadServices();
    };

    return (
        <>
            <section className="service-hero">
                <div className="service-hero-background">
                    <img src={bg} alt="Services" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="service-hero-content">
                    <h2 className="service-hero-title fade-in-up">Our <span>Services</span></h2>
                    <h3 className="fade-in-up" style={{ animationDelay: "0.5s" }}>What we offer</h3>
                    {isStaff && (
                        <button onClick={() => setEditMode(!editMode)} className="portfolio-edit-btn">
                            {editMode ? "Exit Edit Mode" : "Edit Services"}
                        </button>
                    )}
                </div>
            </section>

            <section className="services-content">
                <div className="services-grid">
                    {services.map((service, index) => (
                        <div key={index} className="sv-card">
                            <img src={service.img} alt={service.title} className="sv-card-img" />
                            {editMode && (
                                <button onClick={() => removeService(service.id)} className="portfolio-delete-btn">×</button>
                            )}
                            <div className="sv-card-text">
                                {editMode ? (
                                    <>
                                        <input
                                            type="text"
                                            value={service.title}
                                            onChange={(e) => handleChange(index, "title", e.target.value)}
                                            placeholder="Title"
                                        />
                                        <input
                                            type="text"
                                            value={service.img}
                                            onChange={(e) => handleChange(index, "img", e.target.value)}
                                            placeholder="Image URL"
                                        />
                                    </>
                                ) : (
                                    <h3>{service.title}</h3>
                                )}
                            </div>
                        </div>
                    ))}
                    {editMode && (
                        <div className="sv-card add-event-card" onClick={addService}>
                            <div className="add-event-content">
                                <div className="add-event-icon">+</div>
                                <h3>Add New Service</h3>
                            </div>
                        </div>
                    )}
                </div>
                {editMode && (
                    <button onClick={saveServices} disabled={loading} className="save-events-btn">
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                )}
            </section>
        </>
    );
};

export default Services;
