import React, { useState, useEffect } from "react";
import "../App.css";

const API_BASE = "http://localhost:5136/api/banner";

const Banner = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isStaff = user.role === "staff";

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [bgImage, setBgImage] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);

    const loadBanner = async () => {
        try {
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

            const data = await res.json();
            setTitle(data.title || "");
            setSubtitle(data.subtitle || "");

            if (data.imagePath) {
                const imageUrl = `http://localhost:5136/${data.imagePath}`;
                setBgImage(imageUrl);
            } else {
                setBgImage("src/img/services.jpg");
            }
        } catch (err) {
            setTitle("Elevate Your Event Experience");
            setSubtitle("Explore our exclusive Golden and Platinum Packages designed to make your event truly unforgettable.");
            setBgImage("src/img/services.jpg");
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

            const res = await fetch(API_BASE, {
                method: "POST",
                body: formData,
            });

            const responseText = await res.text();
            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error("Invalid response from server");
            }

            if (res.ok && data.success) {
                alert("Banner updated successfully!");
                setEditMode(false);
                setFile(null);
                setPreviewImage(null);

                if (data.banner?.imagePath) {
                    const newImageUrl = `http://localhost:5136/${data.banner.imagePath}?t=${new Date().getTime()}`;
                    setBgImage(newImageUrl);
                }

                await loadBanner();
            } else {
                alert(data.message || "Failed to update banner.");
            }
        } catch (err) {
            alert(`Error updating banner: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const displayImage = previewImage || bgImage;

    return (
        <div
            className="banner-container"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${displayImage})`,
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