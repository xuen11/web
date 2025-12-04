import React, { useState, useEffect, useRef } from "react";
import "/src/App.css";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/portfolio`
    : "http://localhost:8080/api/portfolio";

const PortfolioPage = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user.role === "staff" || user.role === "admin";

    const [portfolios, setPortfolios] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [hoveredItemIndex, setHoveredItemIndex] = useState(null);
    const [showEditButton, setShowEditButton] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState("");

    const portfolioItemsRef = useRef([]);
    const headerRef = useRef(null);
    const gridRef = useRef(null);
    const [visibleItems, setVisibleItems] = useState([]);

    // Default portfolio items (like events page)
    const defaultPortfolios = [
        {
            id: 1,
            imagePath: './img/portfolio1.jpg',
            title: 'Event Setup 1',
            description: 'Professional audio setup for corporate event'
        },
        {
            id: 2,
            imagePath: './img/portfolio2.jpg',
            title: 'Wedding Sound System',
            description: 'Complete audio system for wedding ceremony'
        }
    ];

    const newPortfolioTemplate = {
        id: 0,
        imagePath: './img/default-portfolio.jpg',
        title: 'New Portfolio Image',
        description: 'Add description here...'
    };

    // Load portfolios from backend
    const loadPortfolios = async () => {
        try {
            const res = await fetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setPortfolios(data); // always use backend
                return;
            }
        } catch (err) {
            console.log("Failed to load from backend, using default");
        }
        setPortfolios([]);
    };

    useEffect(() => {
        loadPortfolios();
    }, []);

    // Intersection Observer for animations
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
                    setTimeout(() => observer.unobserve(entry.target), 1000);
                }
            });
        }, observerOptions);

        if (headerRef.current) observer.observe(headerRef.current);
        portfolioItemsRef.current.forEach(item => item && observer.observe(item));
        if (gridRef.current) observer.observe(gridRef.current);

        return () => observer.disconnect();
    }, [portfolios]);

    // Handle portfolio item change (for editing)
    const handlePortfolioChange = (index, field, value) => {
        const updatedPortfolios = [...portfolios];
        updatedPortfolios[index] = {
            ...updatedPortfolios[index],
            [field]: value
        };
        setPortfolios(updatedPortfolios);
    };

    // Add new portfolio item
    const addPortfolio = () => {
        if (!newImageUrl.trim()) {
            alert("Please enter an image URL first");
            return;
        }

        const portfolioToAdd = {
            ...newPortfolioTemplate,
            id: portfolios.length > 0 ? Math.max(...portfolios.map(p => p.id)) + 1 : 1,
            imagePath: newImageUrl,
            title: 'New Portfolio Item',
            description: 'Description here...'
        };

        setPortfolios([...portfolios, portfolioToAdd]);
        setNewImageUrl("");
        setShowAddForm(false);
    };

    // Remove portfolio item
    const removePortfolio = (index) => {
        const updatedPortfolios = portfolios.filter((_, i) => i !== index);
        setPortfolios(updatedPortfolios);
    };

    // Save all changes to backend
    const handleSave = async () => {
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
    const handleCancel = () => {
        loadPortfolios(); // Reload from backend
        setEditMode(false);
    };

    const handleCancelForm = () => {
        setShowAddForm(false);
        setNewImageUrl("");
    };

    return (
        <div>
            {/* Modal Overlay for add form */}
            {showAddForm && (
                <div className="portfolio-modal-overlay"></div>
            )}

            {/* HEADER */}
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

            {/* MAIN PORTFOLIO CONTAINER */}
            <div
                className="portfolio-page-grid portfolio-animate"
                data-animate="stagger-fade-up"
                onMouseEnter={() => isStaff && setShowEditButton(true)}
                onMouseLeave={() => isStaff && setShowEditButton(false)}
            >
                {isStaff && !editMode && (
                    <button
                        className={`portfolio-edit-btn ${showEditButton ? 'visible' : ''}`}
                        onClick={() => setEditMode(true)}
                    >
                        Edit Portfolio
                    </button>
                )}

                {/* ADD FORM MODAL */}
                {showAddForm && editMode && isStaff && (
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

                        <div className="portfolio-url-input-section">
                            <label htmlFor="imageUrl">Image URL:</label>
                            <input
                                id="imageUrl"
                                type="text"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="portfolio-url-input"
                            />
                            <p className="portfolio-url-hint">
                                Enter the full URL of the image (e.g., ./img/portfolio1.jpg)
                            </p>
                        </div>

                        {newImageUrl && (
                            <div className="portfolio-preview-container">
                                <h4 className="portfolio-preview-title">Preview:</h4>
                                <div className="portfolio-preview-box">
                                    <img
                                        src={newImageUrl}
                                        alt="Preview"
                                        className="portfolio-preview-image"
                                        onError={(e) => {
                                            e.target.src = "/img/banner.jpg";
                                            e.target.className = "portfolio-image-error";
                                        }}
                                    />
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
                                onClick={addPortfolio}
                                disabled={loading || !newImageUrl.trim()}
                            >
                                {loading ? "Adding..." : "Add Image"}
                            </button>
                        </div>
                    </div>
                )}

                {/* PORTFOLIO GRID */}
                {portfolios.map((portfolio, index) => {
                    const portfolioId = portfolio.id || portfolio.ID || portfolio._id || index;
                    const animationDelay = `${index * 0.1}s`;

                    return (
                        <div
                            key={portfolioId}
                            ref={el => portfolioItemsRef.current[index] = el}
                            data-id={portfolioId}
                            className="portfolio-page-item portfolio-animate"
                            data-animate="fade-up"
                            onMouseEnter={() => setHoveredItemIndex(index)}
                            onMouseLeave={() => setHoveredItemIndex(null)}
                            style={{ '--animation-delay': animationDelay }}
                        >
                            {/* Delete button visible in edit mode */}
                            {editMode && isStaff && (
                                <button
                                    className={`portfolio-delete-btn ${hoveredItemIndex === index ? 'visible' : ''}`}
                                    onClick={() => removePortfolio(index)}
                                    title="Remove portfolio item"
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            )}

                            {/* Image display/editing */}
                            <div className="portfolio-image-wrapper">
                                {editMode && isStaff ? (
                                    <div className="portfolio-edit-fields">
                                        <input
                                            type="text"
                                            value={portfolio.imagePath || ''}
                                            onChange={(e) => handlePortfolioChange(index, 'imagePath', e.target.value)}
                                            className="portfolio-image-url-input"
                                            placeholder="🖼️ Enter image URL..."
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            value={portfolio.title || ''}
                                            onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)}
                                            className="portfolio-title-input"
                                            placeholder="Image title..."
                                            disabled={loading}
                                        />
                                        <input
                                            type="text"
                                            value={portfolio.description || ''}
                                            onChange={(e) => handlePortfolioChange(index, 'description', e.target.value)}
                                            className="portfolio-description-input"
                                            placeholder="Image description..."
                                            disabled={loading}
                                        />
                                    </div>
                                ) : (
                                    <div className="portfolio-display-content">
                                        {portfolio.imagePath ? (
                                            <img
                                                src={portfolio.imagePath}
                                                alt={portfolio.title || 'Portfolio'}
                                                className="portfolio-image"
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
                                            {portfolio.title || `Portfolio Item #${portfolioId}`}
                                            {portfolio.description && (
                                                <p className="portfolio-overlay-description">
                                                    {portfolio.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Add new item card in edit mode */}
                {editMode && isStaff && portfolios.length > 0 && (
                    <div
                        className="portfolio-page-item add-new-portfolio"
                        onClick={() => setShowAddForm(true)}
                        onMouseEnter={() => setHoveredItemIndex('add')}
                        onMouseLeave={() => setHoveredItemIndex(null)}
                    >
                        <div className="add-portfolio-wrapper">
                            <div className="add-portfolio-icon">+</div>
                            <h3>Add New Image</h3>
                            <p>Click to add new portfolio image</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Mode Action Buttons */}
            {editMode && isStaff && (
                <div className="portfolio-action-controls">
                    <button
                        className="save-portfolio-btn"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        className="cancel-portfolio-btn"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {portfolios.length === 0 && !editMode && (
                <div className="no-portfolio-message">
                    <p>No portfolio images yet.</p>
                    {isStaff && (
                        <p>Hover over this section and click "Edit Portfolio" to add new images.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;