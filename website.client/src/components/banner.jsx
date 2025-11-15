import React, { useState, useEffect } from "react";
import "../App.css";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/banner`
    : "http://localhost:8080/api/banner";

const Banner = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("authToken");
    const isStaff = user.role === "staff";

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [bgImage, setBgImage] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);

    // Load banner from backend
    const loadBanner = async () => {
        try {
            console.log("Loading banner from:", API_BASE);
            const res = await fetch(API_BASE);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${await res.text()}`);
            }

            const data = await res.json();
            console.log("Banner data received:", data);

            setTitle(data.title || "");
            setSubtitle(data.subtitle || "");

            // Use the imagePath directly from the response
            if (data.imagePath) {
                setBgImage(data.imagePath);
            } else {
                setBgImage("./img/services.jpg");
            }
        } catch (err) {
            console.error("Failed to load banner:", err);
            setTitle("Elevate Your Event Experience");
            setSubtitle(
                "Explore our exclusive Golden and Platinum Packages designed to make your event truly unforgettable."
            );
            setBgImage("./img/services.jpg");
        }
    };

    useEffect(() => {
        loadBanner();
    }, []);

    const handleImageChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;

        if (!f.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            alert("Image must be less than 5MB.");
            return;
        }

        setFile(f);
        setPreviewImage(URL.createObjectURL(f));
    };

    const handleCancel = () => {
        setEditMode(false);
        setFile(null);
        setPreviewImage(null);
        loadBanner();
    };

    const handleSave = async () => {
        if (!isStaff) {
            alert("Only staff can edit the banner.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("Title", title);
            formData.append("Subtitle", subtitle);
            if (file) {
                formData.append("Image", file);
            }

            console.log("Saving banner with:", { title, subtitle, file: file?.name });

            const res = await fetch(API_BASE, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });

            console.log("Save response status:", res.status);

            // Handle response
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Save error response:", errorText);
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();
            console.log("Save response data:", data);

            if (data.success) {
                alert("Banner updated successfully!");
                setEditMode(false);
                setFile(null);
                setPreviewImage(null);

                // Update the background image with the new URL from response
                if (data.banner?.imagePath) {
                    setBgImage(data.banner.imagePath);
                }

                // Reload the banner to get fresh data
                await loadBanner();
            } else {
                alert(data.message || "Failed to update banner.");
            }
        } catch (err) {
            console.error("Error updating banner:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const displayImage = previewImage || bgImage;

    return (
        <div
            className="banner-container"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${displayImage})`,
            }}
            onMouseEnter={() => isStaff && setShowEditButton(true)}
            onMouseLeave={() => isStaff && setShowEditButton(false)}
        >
            {isStaff && !editMode && (
                <button
                    className={`banner-edit-btn ${showEditButton ? 'visible' : ''}`}
                    onClick={() => setEditMode(true)}
                >
                    Edit Banner
                </button>
            )}

            <div className="banner-content">
                {editMode && isStaff ? (
                    <div className="banner-edit">
                        <div className="edit-header">
                            <h3>Edit Banner</h3>
                            <button
                                className="close-btn"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter banner title"
                                disabled={loading}
                                className="edit-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Subtitle</label>
                            <textarea
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder="Enter banner subtitle"
                                disabled={loading}
                                rows="3"
                                className="edit-textarea"
                            />
                        </div>

                        <div className="form-group">
                            <label>Background Image</label>
                            <div className="file-upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={loading}
                                    id="banner-image"
                                    className="file-input"
                                />
                                <label htmlFor="banner-image" className="file-label">
                                    <span className="file-label-text">
                                        {file ? 'Change Image' : 'Choose Image'}
                                    </span>
                                </label>
                                {file && (
                                    <div className="file-info">
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                )}
                                {!file && (
                                    <div className="file-help">
                                        Recommended: 1920x1080px, max 5MB
                                    </div>
                                )}
                            </div>
                            {previewImage && (
                                <div className="image-preview">
                                    <p>Preview:</p>
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        style={{
                                            maxWidth: "300px",
                                            maxHeight: "200px",
                                            marginTop: "10px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px"
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="edit-actions">
                            <button
                                className="save-btn"
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
                                className="cancel-btn"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="banner-title">{title}</h1>
                        <p className="banner-subtitle">{subtitle}</p>
                        <button className="cta-btn">Book Now</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Banner;