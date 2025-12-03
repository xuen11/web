import React, { useState, useEffect } from "react";
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
        const fileInput = document.querySelector('input[type="file"]');
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
        console.log("Editing service:", service);
        setEditingService(service);

        // Set title
        setTitle(service.Title || service.title || "");

        // Preload current image as preview
        const currentImage = service.ImagePath || service.imagePath || service.image || service.Image || "";
        if (currentImage) {
            setPreviewImage(currentImage.startsWith("http") || currentImage.startsWith("/")
                ? currentImage
                : `/${currentImage}`);
        } else {
            setPreviewImage(null);
        }

        setFile(null); // No new file yet
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

        const url = isEdit ? `${API_BASE}/${editingService.Id}` : API_BASE;
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

    // Test function to check if backend is working
    const testBackend = async () => {
        try {
            console.log("Testing backend connection...");
            const res = await fetch(API_BASE);
            console.log("GET test status:", res.status);
            const data = await res.json();
            console.log("GET test data:", data);

            // Also test a simple POST without file
            const testFormData = new FormData();
            testFormData.append("Title", "Test Service");

            // Create a simple test image
            const canvas = document.createElement('canvas');
            canvas.width = 10;
            canvas.height = 10;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, 10, 10);

            canvas.toBlob(async (blob) => {
                const testFile = new File([blob], 'test.png', { type: 'image/png' });
                testFormData.append("Image", testFile);

                const testRes = await fetch(API_BASE, {
                    method: 'POST',
                    body: testFormData
                });
                console.log("POST test status:", testRes.status);
                const testData = await testRes.text();
                console.log("POST test response:", testData);
            }, 'image/png');

        } catch (err) {
            console.error("Test error:", err);
        }
    };

    return (
        <div>

            {/* HEADER */}
            <div className="portfolio-top-header">
                <img src="src/public/img/sound1.jpg" className="portfolio-top-image" alt="Services header" />
                <h1 className="portfolio-top-title fade-in-up">
                    Our <span>Services</span>
                </h1>
                <h3 className="fade-in-up" style={{ animationDelay: "0.5s" }}>
                    Professional services we offer to our clients.
                </h3>

                {isStaff && (
                    <button
                        className="portfolio-edit-btn"
                        onClick={() => setShowAddForm(true)}
                        style={{
                            position: "absolute",
                            top: "75%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            padding: "12px 30px",
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                            cursor: "pointer",
                        }}
                    >
                        + Add Service Image
                    </button>
                )}

                {/* Debug button */}
                <button
                    onClick={testBackend}
                    style={{
                        position: "absolute",
                        top: "85%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "8px 15px",
                        background: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        fontSize: "12px",
                        cursor: "pointer",
                        marginTop: "10px"
                    }}
                >
                    Test Backend
                </button>
            </div>

            {/* ADD/EDIT FORM */}
            {(showAddForm || showEditForm) && isStaff && (
                <div style={{
                    maxWidth: "600px",
                    margin: "40px auto",
                    padding: "30px",
                    background: "white",
                    borderRadius: "10px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    position: "relative",
                    zIndex: 1000
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "2px solid #007bff",
                        marginBottom: "25px",
                        paddingBottom: "15px"
                    }}>
                        <h3>{showEditForm ? "Edit Service" : "Add New Service"}</h3>
                        <button onClick={handleCancel} style={{
                            background: "none",
                            border: "none",
                            fontSize: "28px",
                            cursor: "pointer",
                            color: "#666",
                            lineHeight: "1"
                        }}>
                            ×
                        </button>
                    </div>

                    <div style={{ marginBottom: "25px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "10px",
                            fontWeight: "bold",
                            color: "#333"
                        }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter service title"
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "5px"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "25px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "10px",
                            fontWeight: "bold",
                            color: "#333"
                        }}>
                            {showEditForm ? "Image (Leave empty to keep current)" : "Image *"}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "5px"
                            }}
                        />
                        <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                            Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF
                        </p>
                    </div>

                    {/* PREVIEW WITH REMOVE BUTTON */}
                    {previewImage && (
                        <div style={{
                            marginTop: "20px",
                            marginBottom: "25px",
                            position: "relative"
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "10px"
                            }}>
                                <h4 style={{ margin: 0, color: "#333" }}>Preview:</h4>
                            </div>
                            <div style={{
                                position: "relative",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                overflow: "hidden"
                            }}>
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{
                                        width: "100%",
                                        height: "300px",
                                        objectFit: "contain",
                                        backgroundColor: "#f8f9fa"
                                    }}
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        background: "rgba(220, 53, 69, 0.9)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "36px",
                                        height: "36px",
                                        cursor: "pointer",
                                        fontSize: "20px",
                                        lineHeight: "1",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                                    }}
                                    title="Remove image"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* No image selected message */}
                    {!previewImage && showAddForm && (
                        <div style={{
                            textAlign: "center",
                            padding: "30px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px",
                            marginBottom: "25px"
                        }}>
                            <p style={{
                                color: "#6c757d",
                                margin: 0
                            }}>
                                No image selected. Please choose an image to upload.
                            </p>
                        </div>
                    )}

                    {/* Current image for edit */}
                    {showEditForm && !previewImage && editingService && (
                        <div style={{ marginBottom: "25px" }}>
                            <h4 style={{ marginBottom: "10px", color: "#333" }}>Current Image:</h4>
                            <img
                                src={editingService.ImagePath || editingService.imagePath}
                                alt="Current"
                                style={{
                                    width: "100%",
                                    maxHeight: "300px",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd"
                                }}
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML = '<p style="color: #999; padding: 40px; text-align: center;">No image available</p>';
                                }}
                            />
                        </div>
                    )}

                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "20px"
                    }}>
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: "10px 20px",
                                background: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "16px",
                                minWidth: "100px"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleSave(showEditForm)}
                            disabled={loading}
                            style={{
                                padding: "10px 30px",
                                background: loading ? "#6c757d" : "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontSize: "16px",
                                opacity: loading ? 0.7 : 1,
                                minWidth: "100px"
                            }}
                        >
                            {loading ? "Saving..." : showEditForm ? "Update" : "Save"}
                        </button>
                    </div>
                </div>
            )}

            {/* LOADING STATE */}
            {loading && !showAddForm && !showEditForm && (
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    fontSize: "18px",
                    color: "#666"
                }}>
                    Loading services...
                </div>
            )}

            {/* SERVICES GRID */}
            <div className="portfolio-page-grid">
                {services.length === 0 && !loading ? (
                    <div style={{
                        textAlign: "center",
                        padding: "40px",
                        gridColumn: "1 / -1"
                    }}>
                        <p style={{ fontSize: "18px", color: "#666" }}>
                            No services yet.
                            {isStaff && " Click 'Add Service Image' to get started!"}
                        </p>
                    </div>
                ) : (
                    services.map((service, index) => {
                        const imagePath =
                            service.ImagePath ||
                            service.imagePath ||
                            service.image ||
                            service.Image ||
                            service.filename ||
                            "";

                        let fullImagePath = imagePath;
                        if (imagePath && !imagePath.startsWith("/") && !imagePath.startsWith("http")) {
                            fullImagePath = `/${imagePath}`;
                        }

                        const serviceTitle = service.Title || service.title || "";
                        const serviceId = service.Id || service.id || service.ID || service._id || index;

                        return (
                            <div key={serviceId} className="portfolio-page-item">
                                {fullImagePath ? (
                                    <img
                                        src={fullImagePath}
                                        alt={serviceTitle}
                                        onError={(e) => {
                                            console.error("Failed to load image:", fullImagePath);
                                            e.target.src = "/img/placeholder.jpg";
                                        }}
                                        style={{
                                            width: "100%",
                                            height: "300px",
                                            objectFit: "cover",
                                            borderRadius: "8px"
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: "100%",
                                        height: "300px",
                                        backgroundColor: "#f0f0f0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "8px",
                                        color: "#999"
                                    }}>
                                        No Image
                                    </div>
                                )}

                                {/* TITLE OVERLAY */}
                                <div className="portfolio-overlay">
                                    <h4>{serviceTitle}</h4>
                                </div>

                                {/* ACTION BUTTONS (for staff) */}
                                {isStaff && (
                                    <div style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        display: "flex",
                                        gap: "5px"
                                    }}>
                                        <button
                                            onClick={() => handleEdit(service)}
                                            style={{
                                                background: "#28a745",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "30px",
                                                height: "30px",
                                                cursor: "pointer",
                                                fontSize: "16px",
                                                lineHeight: "1",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.transform = "scale(1.1)";
                                                e.target.style.background = "#218838";
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.transform = "scale(1)";
                                                e.target.style.background = "#28a745";
                                            }}
                                            title="Edit service"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => handleDelete(serviceId)}
                                            style={{
                                                background: "#dc3545",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "30px",
                                                height: "30px",
                                                cursor: "pointer",
                                                fontSize: "20px",
                                                lineHeight: "1",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.transform = "scale(1.1)";
                                                e.target.style.background = "#c82333";
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.transform = "scale(1)";
                                                e.target.style.background = "#dc3545";
                                            }}
                                            title="Delete service"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
};

export default ServicePage;