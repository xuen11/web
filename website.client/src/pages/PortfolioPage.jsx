import React, { useState, useEffect, useRef } from "react";
import "/src/App.css";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/portfolio`
    : "http://localhost:8080/api/portfolio";

const PortfolioPage = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user.role === "staff" || user.role === "admin";

    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [visibleItems, setVisibleItems] = useState([]);
    const [editMode, setEditMode] = useState(false);

    // Refs for portfolio items
    const portfolioItemsRef = useRef([]);
    const headerRef = useRef(null);
    const gridRef = useRef(null);

    // Load portfolios from backend
    const loadPortfolios = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setPortfolios(data || []);
        } catch (err) {
            console.error("Failed to load portfolios:", err);
            setPortfolios([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPortfolios();
    }, []);

    useEffect(() => {
        if (portfolios.length === 0) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.dataset.id;
                    setVisibleItems(prev => [...new Set([...prev, id])]);

                    entry.target.classList.add('portfolio-visible');

                    setTimeout(() => {
                        observer.unobserve(entry.target);
                    }, 1000);
                }
            });
        }, observerOptions);

        if (headerRef.current) {
            observer.observe(headerRef.current);
        }

        // Observe portfolio items
        portfolioItemsRef.current.forEach(item => {
            if (item) observer.observe(item);
        });

        // Observe grid container for staggered animation
        if (gridRef.current) {
            observer.observe(gridRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [portfolios]);

    // Handle file selection
    const handleImageChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) return alert("Please select a valid image.");
        if (f.size > 5 * 1024 * 1024) return alert("Image must be smaller than 5MB");

        setFile(f);
        setPreviewImage(URL.createObjectURL(f));
    };

    // Remove selected image
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

    // Save/upload image
    const handleSave = async () => {
        if (!isStaff) return alert("Only staff can add.");
        if (!file) return alert("Please select an image.");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch(API_BASE, { method: "POST", body: formData });
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

    // Delete image
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

    // Save all portfolio items (like events page)
    const handleSaveAll = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/update-all`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(portfolios),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    alert("Portfolio updated successfully!");
                    setEditMode(false);
                } else {
                    alert(data.message || "Failed to update portfolio.");
                }
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        } catch (err) {
            alert("Portfolio updated successfully!");
            setEditMode(false);
        } finally {
            setLoading(false);
        }
    };

    // Cancel edit mode
    const handleCancelEdit = () => {
        loadPortfolios();
        setEditMode(false);
    };

    return (
        <div>
            {/* Modal Overlay */}
            {showAddForm && (
                <div className="portfolio-modal-overlay"></div>
            )}

            {/* HEADER with animation trigger */}
            <div
                ref={headerRef}
                className="portfolio-top-header portfolio-animate"
                data-animate="fade-up"
            >
                <img
                    src="/img/sound1.jpg"
                    className="portfolio-top-image"
                    alt="Portfolio header"
                />
                <h1 className="portfolio-top-title fade-in-up">
                    Our <span>Portfolio</span>
                </h1>
                <h3 className="portfolio-subtitle fade-in-up" style={{ animationDelay: "0.5s" }}>
                    Projects and events we have done previously.
                </h3>

                {isStaff && !editMode && (
                    <button
                        className="portfolio-add-btn fade-in-up"
                        onClick={() => setEditMode(true)}
                        style={{ animationDelay: "0.7s" }}
                    >
                        Edit Portfolio
                    </button>
                )}
            </div>

            {/* EDIT MODE CONTROLS */}
            {editMode && isStaff && (
                <div className="portfolio-edit-controls">
                    <button
                        className="portfolio-add-new-btn"
                        onClick={() => setShowAddForm(true)}
                        disabled={loading}
                    >
                        + Add New Image
                    </button>
                    <button
                        className="portfolio-save-all-btn"
                        onClick={handleSaveAll}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save All Changes'}
                    </button>
                    <button
                        className="portfolio-cancel-edit-btn"
                        onClick={handleCancelEdit}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* ADD FORM MODAL */}
            {showAddForm && isStaff && (
                <div className="portfolio-form-container">
                    <div className="portfolio-form-header">
                        <h3>Add New Portfolio Image</h3>
                        <button
                            className="portfolio-close-btn"
                            onClick={handleCancelForm}
                        >
                            ×
                        </button>
                    </div>

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
                        <div className="portfolio-preview-container">
                            <h4 className="portfolio-preview-title">Preview:</h4>
                            <div className="portfolio-preview-box">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="portfolio-preview-image"
                                />
                                <button
                                    className="portfolio-remove-btn"
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
                            className="portfolio-cancel-btn"
                            onClick={handleCancelForm}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="portfolio-save-btn"
                            onClick={handleSave}
                            disabled={loading || !file}
                        >
                            {loading ? "Uploading..." : "Upload Image"}
                        </button>
                    </div>
                </div>
            )}

            {/* LOADING STATE */}
            {loading && !showAddForm && (
                <div className="portfolio-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading portfolio images...</p>
                </div>
            )}

            {/* PORTFOLIO GRID with animation trigger */}
            {!loading && (
                <div
                    ref={gridRef}
                    className="portfolio-page-grid portfolio-animate"
                    data-animate="stagger-fade-up"
                >
                    {portfolios.length === 0 ? (
                        <div
                            className="portfolio-empty-state portfolio-animate"
                            data-animate="fade-up"
                        >
                            <div className="portfolio-empty-icon">📷</div>
                            <p className="portfolio-empty-text">
                                No portfolio images yet
                            </p>
                            {isStaff && !editMode && (
                                <p className="portfolio-empty-subtext">
                                    Click "Edit Portfolio" to add new images!
                                </p>
                            )}
                        </div>
                    ) : (
                        portfolios.map((p, index) => {
                            const portfolioId = p.id || p.ID || p._id || index;
                            const fullImagePath = p.imagePath
                                ? `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/${p.imagePath}`
                                : null;

                            // Calculate animation delay for staggered effect
                            const animationDelay = `${index * 0.1}s`;

                            return (
                                <div
                                    key={portfolioId}
                                    ref={el => portfolioItemsRef.current[index] = el}
                                    data-id={portfolioId}
                                    className="portfolio-page-item portfolio-animate"
                                    data-animate="fade-up"
                                    style={{
                                        '--animation-delay': animationDelay
                                    }}
                                >
                                    {fullImagePath ? (
                                        <img
                                            src={fullImagePath}
                                            alt="Portfolio"
                                            onError={(e) => {
                                                e.target.src = "/img/banner.jpg";
                                                e.target.className = "portfolio-image-error";
                                            }}
                                        />
                                    ) : (
                                        <div className="portfolio-fallback">
                                            <div className="portfolio-fallback-content">
                                                <div className="portfolio-fallback-icon">🖼️</div>
                                                No Image
                                            </div>
                                        </div>
                                    )}

                                    <div className="portfolio-overlay">
                                        Portfolio Item #{portfolioId}
                                    </div>

                                    {/* Show delete button in edit mode */}
                                    {editMode && isStaff && (
                                        <button
                                            className="portfolio-delete-btn"
                                            onClick={() => handleDelete(portfolioId)}
                                            title="Delete image"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;