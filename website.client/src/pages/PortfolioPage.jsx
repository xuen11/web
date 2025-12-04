import React, { useState, useEffect, useRef } from "react";
import "/src/App.css";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/portfolio`
    : "http://localhost:8080/api/portfolio";

const PortfolioPage = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [hoveredPortfolioIndex, setHoveredPortfolioIndex] = useState(null);
    const [showEditButton, setShowEditButton] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user.role === "staff" || user.role === "admin";

    // Load portfolios from backend
    const loadPortfolios = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setPortfolios(data); // always use backend
                return;
            }
        } catch (err) {
            console.log("Failed to load from backend");
        }
        setPortfolios([]);
    };

    useEffect(() => {
        loadPortfolios();
    }, []);

    const handleImageChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            alert("Please select a valid image.");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            alert("Image must be smaller than 5MB");
            return;
        }

        setFile(f);
        setPreviewImage(URL.createObjectURL(f));
    };

    const handleRemoveImage = () => {
        if (previewImage) URL.revokeObjectURL(previewImage);
        setFile(null);
        setPreviewImage(null);
        const fileInput = document.getElementById('portfolioFileInput');
        if (fileInput) fileInput.value = '';
    };

    const handleCancelForm = () => {
        setShowAddForm(false);
        handleRemoveImage();
    };

    const handleSave = async () => {
        if (!isStaff) return alert("Only staff can add.");
        if (!file) return alert("Please select an image.");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch(API_BASE, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Upload failed");
            }

            alert("Image uploaded successfully!");
            handleCancelForm();
            loadPortfolios();
        } catch (err) {
            console.error("Upload error:", err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isStaff) return alert("Only staff can delete.");
        if (!window.confirm("Delete this portfolio image?")) return;

        try {
            const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Delete failed");
            }
            alert("Deleted successfully!");
            loadPortfolios();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCancel = () => {
        loadPortfolios(); // Reload from backend
        setEditMode(false);
    };

    return (
        <div className="portfolio-page-container">
            {/* Hero Section - Same as Events */}
            <section className="portfolio-hero">
                <div className="portfolio-hero-background">
                    <img
                        src="/img/bg3.jpg"
                        alt="Portfolio Banner"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </div>
                <div className="portfolio-hero-content">
                    <h2 className="portfolio-hero-title fade-in-up">Our <span>Portfolio</span></h2>
                    <h3 className="fade-in-up" style={{ animationDelay: "0.5s" }}>
                        Projects and events we have done previously.
                    </h3>
                </div>
            </section>

            {/* Main Content */}
            <div
                className="portfolio-main-container"
                id="portfolio"
                onMouseEnter={() => isStaff && setShowEditButton(true)}
                onMouseLeave={() => isStaff && setShowEditButton(false)}
            >
                {isStaff && !editMode && (
                    <button
                        className={`portfolio-edit-btn ${showEditButton ? 'visible' : ''}`}
                        onClick={() => setShowAddForm(true)}
                    >
                        + Add Portfolio Image
                    </button>
                )}

                <div className="portfolio-content-wrapper">
                    <div className="portfolio-grid-section">
                        <div className="portfolio-grid-layout">
                            {portfolios.map((portfolio, index) => {
                                const imagePath = portfolio.imagePath;
                                const fullImagePath = imagePath
                                    ? `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/${imagePath}`
                                    : null;

                                return (
                                    <div
                                        key={portfolio.id}
                                        className="portfolio-card-item"
                                        onMouseEnter={() => setHoveredPortfolioIndex(index)}
                                        onMouseLeave={() => setHoveredPortfolioIndex(null)}
                                    >
                                        {isStaff && (
                                            <button
                                                className={`portfolio-remove-btn ${hoveredPortfolioIndex === index ? 'visible' : ''}`}
                                                onClick={() => handleDelete(portfolio.id)}
                                                title="Delete portfolio image"
                                                disabled={loading}
                                            >
                                                ×
                                            </button>
                                        )}

                                        <div className="portfolio-image-wrapper">
                                            {fullImagePath ? (
                                                <img
                                                    src={fullImagePath}
                                                    alt="Portfolio"
                                                    className="portfolio-img"
                                                    onError={(e) => {
                                                        e.target.src = "/img/banner.jpg";
                                                    }}
                                                />
                                            ) : (
                                                <div className="portfolio-img-placeholder">
                                                    <span>🖼️</span>
                                                    <p>No Image</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="portfolio-details">
                                            <div className="portfolio-display-content">
                                                <div className="portfolio-meta-info">
                                                    <span className="portfolio-id-text">
                                                        Portfolio #{portfolio.id}
                                                    </span>
                                                    <span className="portfolio-date-text">
                                                        Added: {new Date(portfolio.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {showAddForm && isStaff && (
                                <div
                                    className="portfolio-card-item add-new-portfolio"
                                    onMouseEnter={() => setHoveredPortfolioIndex('add')}
                                    onMouseLeave={() => setHoveredPortfolioIndex(null)}
                                >
                                    <div className="add-portfolio-form">
                                        <h3>Add New Portfolio Image</h3>

                                        <div
                                            className="portfolio-upload-area"
                                            onClick={() => document.getElementById('portfolioFileInput').click()}
                                        >
                                            <input
                                                id="portfolioFileInput"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="portfolio-file-input"
                                            />
                                            <div className="portfolio-upload-icon">📁</div>
                                            <p className="portfolio-upload-text">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="portfolio-upload-hint">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </div>

                                        {previewImage && (
                                            <div className="portfolio-preview-section">
                                                <h4>Preview:</h4>
                                                <div className="portfolio-preview-box">
                                                    <img
                                                        src={previewImage}
                                                        alt="Preview"
                                                        className="portfolio-preview-image"
                                                    />
                                                    <button
                                                        className="portfolio-remove-preview-btn"
                                                        onClick={handleRemoveImage}
                                                        title="Remove image"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="portfolio-form-actions">
                                            <button
                                                className="portfolio-cancel-form-btn"
                                                onClick={handleCancelForm}
                                                disabled={loading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="portfolio-save-form-btn"
                                                onClick={handleSave}
                                                disabled={loading || !file}
                                            >
                                                {loading ? "Uploading..." : "Upload Image"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {portfolios.length === 0 && !showAddForm && (
                    <div className="no-portfolios-message">
                        <p>No portfolio images yet.</p>
                        {isStaff && (
                            <p>Click "Add Portfolio Image" to showcase your work!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioPage;