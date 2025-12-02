import React, { useEffect, useRef, useState } from "react";
import "/src/App.css";
import banner from "/src/img/sound1.jpg";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/portfolio`
    : "http://localhost:8080/api/portfolio";

const PortfolioPage = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const imgRefs = useRef([]);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user.role === "staff";

    // Load images from backend
    const loadImages = async () => {
        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setImages(data);
            }
        } catch (err) {
            console.log("Failed to load images", err);
        }
    };

    useEffect(() => {
        loadImages();
    }, []);

    // Intersection observer for animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add("show");
                });
            },
            { threshold: 0.2 }
        );

        imgRefs.current.forEach((img) => {
            if (img) observer.observe(img);
        });

        return () => {
            imgRefs.current.forEach((img) => {
                if (img) observer.unobserve(img);
            });
        };
    }, [images]);

    // Upload image
    const handleUpload = async () => {
        if (!file) return alert("Please select a file");
        const formData = new FormData();
        formData.append("image", file);

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setImages([data.data, ...images]);
                setFile(null);
            } else {
                alert(data.message || "Failed to upload image");
            }
        } catch (err) {
            console.log(err);
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    // Delete image
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            const res = await fetch(`${API_BASE}/delete/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setImages(images.filter((img) => img.id !== id));
            } else {
                alert(data.message || "Failed to delete image");
            }
        } catch (err) {
            console.log(err);
            alert("Delete failed");
        }
    };

    return (
        <div>
            <div className="portfolio-top-header">
                <img src={banner} alt="Portfolio Banner" className="portfolio-top-image" />
                <h1 className="portfolio-top-title fade-in-up">
                    Our <span>Portfolio</span>
                </h1>
                <h3 className="fade-in-up" style={{ animationDelay: "0.5s" }}>
                    Projects and events we have done previously.
                </h3>
            </div>

            {isStaff && (
                <div className="portfolio-upload-section">
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        disabled={loading}
                    />
                    <button onClick={handleUpload} disabled={loading}>
                        {loading ? "Uploading..." : "Upload Image"}
                    </button>
                </div>
            )}

            <div className="portfolio-content">
                <div className="portfolio-page-grid">
                    {images.map((img, index) => (
                        <div
                            className="portfolio-page-item flip-in"
                            key={img.id}
                            ref={(el) => (imgRefs.current[index] = el)}
                        >
                            <img src={img.imagePath} alt={`Portfolio ${index + 1}`} />
                            {isStaff && (
                                <button
                                    className="portfolio-delete-btn"
                                    onClick={() => handleDelete(img.id)}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PortfolioPage;
