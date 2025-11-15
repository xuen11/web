import React, { useState, useEffect } from "react";
import "../App.css";
import { useAuth } from "./AuthContext";
import banner from "../img/services.jpg";

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/banner`
    : "http://localhost:8080/api/banner";

const Banner = () => {
    const { user, token } = useAuth();
    const isStaff = user?.role === "staff";

    const [bannerData, setBannerData] = useState({
        title: "",
        subtitle: "",
        imagePath: ""
    });

    const [editMode, setEditMode] = useState(false);
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const loadBanner = async () => {
        try {
            console.log("Loading banner from:", API_BASE);
            const res = await fetch(API_BASE, {
                credentials: 'include'
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status} - ${await res.text()}`);
            }

            const data = await res.json();
            console.log("Banner API response:", data);

            let banner;
            if (data.banner) {
                banner = data.banner;
            } else if (data.Id || data.id) {
                banner = data;
            } else {
                throw new Error("No banner data found in response");
            }

            setBannerData({
                title: banner.Title || banner.title || "",
                subtitle: banner.Subtitle || banner.subtitle || "",
                imagePath: banner.ImagePath || banner.imagePath || ""
            });

            if (banner.ImagePath || banner.imagePath) {
                const imagePath = banner.ImagePath || banner.imagePath;
                const fullUrl = imagePath.startsWith("http")
                    ? imagePath
                    : `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/${imagePath.replace(/^\/+/, "")}`;
                console.log("Setting banner image:", fullUrl);
            }
        } catch (err) {
            console.error("Failed to load banner:", err);
            setBannerData({
                title: "Elevate Your Event Experience",
                subtitle: "Explore our exclusive Golden and Platinum Packages designed to make your event unforgettable.",
                imagePath: banner
            });
        }
    };

    useEffect(() => {
        loadBanner();
    }, []);

    useEffect(() => {
        if (editMode) {
            loadBanner();
        }
    }, [editMode]);

    const handleImageChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;

        if (!f.type.startsWith("img/")) {
            alert("Please upload a valid image file.");
            return;
        }

        if (f.size > 5 * 1024 * 1024) {
            alert("Image must be smaller than 5MB.");
            return;
        }

        setFile(f);
        setPreviewImage(URL.createObjectURL(f));
    };

    const handleCancel = () => {
        setEditMode(false);
        setFile(null);
        setPreviewImage(null);
        setSaveSuccess(false);
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
            formData.append("Title", bannerData.title);
            formData.append("Subtitle", bannerData.subtitle);
            if (file) formData.append("Image", file);

            console.log("Saving banner data:", {
                title: bannerData.title,
                subtitle: bannerData.subtitle,
                hasFile: !!file
            });

            const res = await fetch(API_BASE, {
                method: "POST",
                headers: token ? {
                    Authorization: `Bearer ${token}`,
                } : {},
                body: formData,
                credentials: 'include'
            });

            const result = await res.json();
            console.log("Update response:", result);

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Failed to update banner");
            }

            if (result.banner) {
                setBannerData({
                    title: result.banner.Title || result.banner.title || bannerData.title,
                    subtitle: result.banner.Subtitle || result.banner.subtitle || bannerData.subtitle,
                    imagePath: result.banner.ImagePath || result.banner.imagePath || bannerData.imagePath
                });
            }

            setSaveSuccess(true);
            alert("Banner updated successfully!");

            setTimeout(() => {
                setEditMode(false);
                setFile(null);
                setPreviewImage(null);
                setSaveSuccess(false);
                loadBanner();
            }, 1000);

        } catch (err) {
            console.error("Update error:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setBannerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const displayImage = previewImage || (
        bannerData.imagePath && bannerData.imagePath.startsWith("http")
            ? bannerData.imagePath
            : `${import.meta.env.VITE_API_URL || "http://localhost:8080"}${bannerData.imagePath?.startsWith("/") ? "" : "/"}${bannerData.imagePath}`
    );

    return (
        <div
            className="banner-container"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${displayImage || "/img/services.jpg"})`,
            }}
            onMouseEnter={() => isStaff && setShowEditButton(true)}
            onMouseLeave={() => isStaff && setShowEditButton(false)}
        >
            {isStaff && !editMode && (
                <button
                    className={`banner-edit-btn ${showEditButton ? "visible" : ""}`}
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

                        {saveSuccess && (
                            <div className="save-success-message">
                                ✅ Banner saved successfully!
                            </div>
                        )}

                        <div className="form-group">
                            <label>Title</label>
                            <input
                                className="edit-input"
                                value={bannerData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Subtitle</label>
                            <textarea
                                rows="3"
                                className="edit-textarea"
                                value={bannerData.subtitle}
                                onChange={(e) => handleInputChange("subtitle", e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Background Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                            />
                            {previewImage && (
                                <div className="image-preview">
                                    <p>Preview:</p>
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        style={{ maxWidth: "300px" }}
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
                                {loading ? "Saving..." : "Save Changes"}
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
                        <h1 className="banner-title">{bannerData.title}</h1>
                        <p className="banner-subtitle">{bannerData.subtitle}</p>
                        <button className="cta-btn">Book Now</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Banner;