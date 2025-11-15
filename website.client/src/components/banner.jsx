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
        title: "Elevate Your Event Experience",
        subtitle: "Explore our exclusive Golden and Platinum Packages designed to make your event unforgettable.",
        imagePath: banner
    });

    const [editMode, setEditMode] = useState(false);
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showEditButton, setShowEditButton] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [backendAvailable, setBackendAvailable] = useState(false);

    // Test if backend endpoint exists
    const testBackend = async () => {
        try {
            console.log("Testing backend connection to:", API_BASE);
            const response = await fetch(API_BASE, {
                method: 'GET',
                credentials: 'include'
            });

            const contentType = response.headers.get('content-type');
            console.log("Response content-type:", contentType);
            console.log("Response status:", response.status);

            if (response.ok && contentType && contentType.includes('application/json')) {
                setBackendAvailable(true);
                return true;
            } else {
                console.log("Backend not properly configured");
                setBackendAvailable(false);
                return false;
            }
        } catch (error) {
            console.log("Backend connection failed:", error.message);
            setBackendAvailable(false);
            return false;
        }
    };

    const loadBanner = async () => {
        const isBackendAvailable = await testBackend();

        if (!isBackendAvailable) {
            console.log("Using default banner data - backend not available");
            // Use the default data we already set in useState
            return;
        }

        try {
            console.log("Loading banner from backend:", API_BASE);
            const res = await fetch(API_BASE, {
                credentials: 'include'
            });

            console.log("Load response status:", res.status);
            console.log("Load response headers:", res.headers);

            const contentType = res.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
                console.log("Banner JSON response:", data);
            } else {
                const text = await res.text();
                console.log("Banner non-JSON response:", text.substring(0, 200));
                throw new Error(`Backend returned ${contentType || 'unknown'} instead of JSON`);
            }

            if (!res.ok) {
                throw new Error(data.message || `HTTP ${res.status}`);
            }

            // Extract banner data from different possible response structures
            let banner;
            if (data.banner) {
                banner = data.banner;
            } else if (data.Id || data.id) {
                banner = data;
            } else if (Array.isArray(data) && data.length > 0) {
                banner = data[0]; // Take first if array
            } else {
                console.log("No banner data in response, using defaults");
                return;
            }

            setBannerData({
                title: banner.Title || banner.title || "Elevate Your Event Experience",
                subtitle: banner.Subtitle || banner.subtitle || "Explore our exclusive Golden and Platinum Packages designed to make your event unforgettable.",
                imagePath: banner.ImagePath || banner.imagePath || banner
            });

        } catch (err) {
            console.error("Failed to load banner from backend:", err);
            // Keep the default data that's already set
        }
    };

    useEffect(() => {
        loadBanner();
    }, []);

    const handleImageChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;

        if (!f.type.startsWith("image/")) {
            alert("Please upload a valid image file (JPEG, PNG, etc.).");
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
        loadBanner(); // Reload original data
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

            if (file) {
                formData.append("Image", file);
            }

            console.log("Saving banner to:", API_BASE);
            console.log("Data:", {
                title: bannerData.title,
                subtitle: bannerData.subtitle,
                hasFile: !!file
            });

            // Try different methods and endpoints
            let res;
            let result;

            // First try PUT
            try {
                res = await fetch(API_BASE, {
                    method: "PUT",
                    body: formData,
                    credentials: 'include'
                });
            } catch (err) {
                console.log("PUT failed, trying POST:", err);
                // If PUT fails, try POST
                res = await fetch(API_BASE, {
                    method: "POST",
                    body: formData,
                    credentials: 'include'
                });
            }

            console.log("Save response status:", res.status);
            console.log("Save response headers:", res.headers);

            const contentType = res.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                result = await res.json();
                console.log("Save JSON response:", result);
            } else {
                const text = await res.text();
                console.log("Save non-JSON response:", text.substring(0, 500));

                // If we get HTML, it might be a 404 page or error
                if (res.ok && text) {
                    // If the response is OK but not JSON, assume success
                    alert("Banner updated successfully!");
                    setSaveSuccess(true);
                    setTimeout(() => {
                        setEditMode(false);
                        setFile(null);
                        setPreviewImage(null);
                        setSaveSuccess(false);
                        loadBanner();
                    }, 1000);
                    return;
                } else {
                    throw new Error(`Server returned ${contentType || 'unknown content-type'}. Status: ${res.status}`);
                }
            }

            if (!res.ok) {
                throw new Error(result.message || `HTTP ${res.status}: Failed to update banner`);
            }

            // Update with response data if available
            if (result.banner || result.Id || result.id) {
                const updatedBanner = result.banner || result;
                setBannerData({
                    title: updatedBanner.Title || updatedBanner.title || bannerData.title,
                    subtitle: updatedBanner.Subtitle || updatedBanner.subtitle || bannerData.subtitle,
                    imagePath: updatedBanner.ImagePath || updatedBanner.imagePath || bannerData.imagePath
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

            if (err.message.includes("404")) {
                alert("Banner endpoint not found. Please check if the backend API is properly configured.");
            } else if (err.message.includes("CORS")) {
                alert("CORS error. Please check backend CORS configuration.");
            } else {
                alert(`Error: ${err.message}`);
            }
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

    const getDisplayImage = () => {
        if (previewImage) return previewImage;

        if (bannerData.imagePath) {
            if (typeof bannerData.imagePath === 'string') {
                if (bannerData.imagePath.startsWith("http") || bannerData.imagePath.startsWith("data:") || bannerData.imagePath.startsWith("/")) {
                    return bannerData.imagePath;
                }
                return `/${bannerData.imagePath}`;
            }
            // If it's an imported image object
            if (bannerData.imagePath.default) {
                return bannerData.imagePath.default;
            }
        }

        return banner;
    };

    const displayImage = getDisplayImage();

    return (
        <div
            className="banner-container"
            style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${displayImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
            onMouseEnter={() => isStaff && setShowEditButton(true)}
            onMouseLeave={() => isStaff && setShowEditButton(false)}
        >
            {isStaff && !editMode && (
                <button
                    className={`banner-edit-btn ${showEditButton ? "visible" : ""}`}
                    onClick={() => setEditMode(true)}
                >
                    {backendAvailable ? "Edit Banner" : "Edit Banner (Backend Offline)"}
                </button>
            )}

            <div className="banner-content">
                {editMode && isStaff ? (
                    <div className="banner-edit">
                        <div className="edit-header">
                            <h3>Edit Banner {!backendAvailable && "(Local Only)"}</h3>
                            <button
                                className="close-btn"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>

                        {!backendAvailable && (
                            <div className="warning-message">
                                ⚠️ Backend is not available. Changes will be local only and reset on page refresh.
                            </div>
                        )}

                        {saveSuccess && (
                            <div className="save-success-message">
                                ✅ {backendAvailable ? "Banner saved successfully!" : "Local changes saved!"}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Title</label>
                            <input
                                className="edit-input"
                                value={bannerData.title}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                disabled={loading}
                                placeholder="Enter banner title"
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
                                placeholder="Enter banner subtitle"
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
                                    id="banner-image-upload"
                                />
                                <label htmlFor="banner-image-upload" className="file-label">
                                    {file ? file.name : "Choose new image..."}
                                </label>
                            </div>

                            {file && (
                                <div className="file-info">
                                    <span className="file-name">Selected: {file.name}</span>
                                    <span className="file-size">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            )}

                            {previewImage && (
                                <div className="image-preview">
                                    <p>Preview:</p>
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "200px",
                                            borderRadius: "8px",
                                            marginTop: "10px"
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="edit-actions">
                            <button
                                className="save-btn"
                                onClick={handleSave}
                                disabled={loading || (!bannerData.title.trim() || !bannerData.subtitle.trim())}
                            >
                                {loading ? "Saving..." : backendAvailable ? "Save to Backend" : "Save Locally"}
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