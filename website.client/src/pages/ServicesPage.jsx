import React, { useState, useEffect, useRef } from "react";
import "/src/App.css";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/service`
    : "http://localhost:8080/api/service";

const ServicePage = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user.role === "staff" || user.role === "admin";

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingService, setEditingService] = useState(null);

    // Form states
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    // Refs for animations
    const serviceItemsRef = useRef([]);
    const headerRef = useRef(null);
    const gridRef = useRef(null);

    const loadServices = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setServices(data || []);
        } catch (err) {
            console.error("Failed to load services:", err);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    // Set up Intersection Observer for scroll animations
    useEffect(() => {
        if (services.length === 0) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class
                    entry.target.classList.add('services-visible');

                    // Optional: Unobserve after animation
                    setTimeout(() => {
                        observer.unobserve(entry.target);
                    }, 1000);
                }
            });
        }, observerOptions);

        // Observe header
        if (headerRef.current) {
            observer.observe(headerRef.current);
        }

        // Observe service items
        serviceItemsRef.current.forEach(item => {
            if (item) observer.observe(item);
        });

        // Observe grid container
        if (gridRef.current) {
            observer.observe(gridRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [services]);

    const handleImageChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;

        if (!f.type.startsWith("image/")) {
            alert("Please select a valid image.");
            return;
        }

        if (f.size > 5 * 1024 * 1024) {
            alert("Image must be < 5MB");
            return;
        }

        // Revoke old preview if it was a blob URL
        if (previewImage && !previewImage.startsWith("http") && !previewImage.startsWith("/")) {
            URL.revokeObjectURL(previewImage);
        }

        setFile(f);
        setPreviewImage(URL.createObjectURL(f));
    };

    const handleRemoveImage = () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
        }
        setFile(null);
        setPreviewImage(null);
        const fileInput = document.getElementById('servicesFileInput');
        if (fileInput) fileInput.value = '';
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setShowEditForm(false);
        resetForm();
    };

    const resetForm = () => {
        setTitle("");
        setFile(null);

        if (previewImage && !previewImage.startsWith("http") && !previewImage.startsWith("/")) {
            URL.revokeObjectURL(previewImage);
        }

        setPreviewImage(null);
        setEditingService(null);
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setTitle(service.title || service.Title || ""); // Handle both cases

        // FIX: Use correct property name - it's imagePath (lowercase) from your backend
        const currentImage = service.imagePath || service.ImagePath || "";

        if (currentImage) {
            // Construct the full URL for preview
            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

            // If it's already a full URL or starts with /, use as-is
            // Otherwise prepend the base URL
            if (currentImage.startsWith("http") || currentImage.startsWith("/")) {
                setPreviewImage(currentImage);
            } else {
                setPreviewImage(`${baseUrl}/${currentImage}`);
            }
        } else {
            setPreviewImage(null);
        }

        setFile(null);
        setShowEditForm(true);
    };

    const handleSave = async (isEdit = false) => {
        if (!title.trim()) {
            return alert("Please enter a title.");
        }
        if (!isEdit && !file) {
            return alert("Please select an image.");
        }

        const formData = new FormData();
        formData.append("Title", title);
        if (file) formData.append("Image", file);

        const url = isEdit ? `${API_BASE}/${editingService.id}` : API_BASE;
        const method = isEdit ? "PUT" : "POST";

        try {
            setLoading(true);

            const res = await fetch(url, { method, body: formData });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || `HTTP ${res.status}`);
            }

            const data = await res.json();
            alert(data.message || (isEdit ? "Service updated!" : "Service added!"));

            // Reload services
            await loadServices();

            // Reset form and close modal
            resetForm();
            setShowAddForm(false);
            setShowEditForm(false);

        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isStaff) return alert("Only staff can delete.");
        if (!window.confirm("Delete this service?")) return;

        try {
            const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });

            if (res.ok) {
                alert("Service deleted!");
                loadServices();
            } else {
                const errorText = await res.text();
                throw new Error(errorText || "Delete failed");
            }
        } catch (err) {
            alert(err.message);
        }
    };

    // Group services into rows of 3 for staggered layout
    const groupedServices = [];
    for (let i = 0; i < services.length; i += 3) {
        groupedServices.push(services.slice(i, i + 3));
    }

    return (
        <div>
            {/* Modal Overlay */}
            {(showAddForm || showEditForm) && (
                <div className="services-modal-overlay"></div>
            )}

            {/* HEADER */}
            <div ref={headerRef} className="service-top-header">
                <img
                    src="src/public/img/sound1.jpg"
                    className="service-top-image"
                    alt="Services header"
                />
                <h1 className="service-top-title fade-in-up">
                    Our <span>Services</span>
                </h1>
                <h3 className="service-subtitle fade-in-up" style={{ animationDelay: "0.5s" }}>
                    Professional services we offer to our clients.
                </h3>

                {isStaff && (
                    <button
                        className="service-add-btn fade-in-up"
                        onClick={() => setShowAddForm(true)}
                        style={{ animationDelay: "0.7s" }}
                    >
                        + Add Service
                    </button>
                )}
            </div>

            {/* ADD/EDIT FORM MODAL */}
            {(showAddForm || showEditForm) && isStaff && (
                <div className="services-form-container">
                    <div className="services-form-header">
                        <h3>{showEditForm ? "Edit Service" : "Add New Service"}</h3>
                        <button
                            className="services-close-btn"
                            onClick={handleCancel}
                        >
                            ×
                        </button>
                    </div>

                    {/* Title Input */}
                    <div className="services-title-input-container">
                        <label className="services-title-label">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter service title"
                            className="services-title-input"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="services-upload-area" onClick={() => document.getElementById('servicesFileInput').click()}>
                        <input
                            id="servicesFileInput"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="services-file-input"
                        />
                        <div className="services-upload-icon">📁</div>
                        <p className="services-upload-text">
                            Click to upload or drag and drop
                        </p>
                        <p className="services-upload-hint">
                            PNG, JPG, GIF up to 5MB
                        </p>
                    </div>

                    {/* Preview Image */}
                    {previewImage && (
                        <div className="services-preview-container">
                            <h4 className="services-preview-title">Preview:</h4>
                            <div className="services-preview-box">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="services-preview-image"
                                />
                                <button
                                    className="services-remove-btn"
                                    onClick={handleRemoveImage}
                                    title="Remove image"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* No image selected message */}
                    {!previewImage && showAddForm && (
                        <div className="services-no-image-message">
                            <p className="services-no-image-text">
                                No image selected. Please choose an image to upload.
                            </p>
                        </div>
                    )}

                    
                    {/*{showEditForm && !previewImage && editingService && (*/}
                    {/*    <div className="services-current-image-container">*/}
                    {/*        <h4 className="services-current-image-title">Current Image:</h4>*/}
                    {/*        <div className="services-current-image-box">*/}
                    {/*            <img*/}
                    {/*                src={editingService.imagePath || editingService.ImagePath} // FIXED*/}
                    {/*                alt="Current"*/}
                    {/*                className="services-current-image"*/}
                    {/*                onError={(e) => {*/}
                    {/*                    e.target.style.display = "none";*/}
                    {/*                    e.target.parentElement.innerHTML = '<p style="color: #999; padding: 20px; text-align: center; font-size: 0.9rem;">No image available</p>';*/}
                    {/*                }}*/}
                    {/*            />*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/* Form Actions */}
                    <div className="services-form-actions">
                        <button
                            className="services-cancel-btn"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="services-save-btn"
                            onClick={() => handleSave(showEditForm)}
                            disabled={loading || (!previewImage && showAddForm)}
                        >
                            {loading ? "Saving..." : showEditForm ? "Update" : "Save"}
                        </button>
                    </div>
                </div>
            )}

            {/* LOADING STATE */}
            {loading && !showAddForm && !showEditForm && (
                <div className="services-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading services...</p>
                </div>
            )}

            {/* STAGGERED SERVICES GRID */}
            {!loading && (
                <div
                    ref={gridRef}
                    className="services-grid-container services-animate"
                    data-animate="stagger-fade-up"
                >
                    {services.length === 0 ? (
                        <div className="services-empty-state">
                            <div className="services-empty-icon">🔧</div>
                            <p className="services-empty-text">
                                No services available
                            </p>
                            {isStaff && (
                                <p className="services-empty-subtext">
                                    Click "Add Service" to get started!
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="services-staggered-grid">
                            {groupedServices.map((row, rowIndex) => (
                                <div key={rowIndex} className="services-staggered-row">
                                    {row.map((service, colIndex) => {
                                        const serviceId = service.id;
                                        const serviceTitle = service.title;

                                        const imagePath = service.imagePath;
                                        let fullImagePath = imagePath;
                                        if (imagePath) {
                                            // Since images are stored in wwwroot with just filename, prepend with base URL
                                            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
                                            fullImagePath = `${baseUrl}/${imagePath}`;
                                        }

                                        const animationDelay = `${(rowIndex * 3 + colIndex) * 0.1}s`;

                                        return (
                                            <div
                                                key={serviceId}
                                                ref={el => serviceItemsRef.current[rowIndex * 3 + colIndex] = el}
                                                data-id={serviceId}
                                                className="services-item-container services-animate"
                                                data-animate="fade-up"
                                                style={{ '--animation-delay': animationDelay }}
                                            >
                                                <div className="services-card">
                                                    {fullImagePath ? (
                                                        <img
                                                            src={fullImagePath}
                                                            alt={serviceTitle}
                                                            className="services-image"
                                                            onError={(e) => {
                                                                e.target.style.display = "none";
                                                                e.target.parentElement.innerHTML = `
            <div class="services-fallback">
                <div class="services-fallback-content">
                    <div class="services-fallback-icon">🔧</div>
                    <div>No Image</div>
                </div>
            </div>
        `;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="services-fallback">
                                                            <div className="services-fallback-content">
                                                                <div className="services-fallback-icon">🔧</div>
                                                                <div>No Image</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="services-title-overlay">
                                                        <h3 className="services-item-title">{serviceTitle}</h3>
                                                    </div>

                                                    {isStaff && (
                                                        <div className="services-actions">
                                                            <button
                                                                className="services-edit-btn"
                                                                onClick={() => handleEdit(service)}
                                                                title="Edit service"
                                                            >
                                                                ✎
                                                            </button>
                                                            <button
                                                                className="services-delete-btn"
                                                                onClick={() => handleDelete(serviceId)}
                                                                title="Delete service"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ServicePage;