import React, { useState, useEffect } from "react";
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

    const loadPortfolios = async () => {
        try {
            setLoading(true);
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

    // NEW FUNCTION: Remove selected image
    const handleRemoveImage = () => {
        if (previewImage) {
            URL.revokeObjectURL(previewImage); // Clean up memory
        }
        setFile(null);
        setPreviewImage(null);

        // Also reset the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleCancelForm = () => {
        setShowAddForm(false);
        handleRemoveImage(); // Clear the image too
    };

   const handleSave = async () => {
    if (!isStaff) return alert("Only staff can add.");
    if (!file) return alert("Please select an image.");

    setLoading(true);

    try {
        const formData = new FormData();
        formData.append("image", file); // MUST MATCH BACKEND NAME

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

            if (res.ok) {
                alert("Deleted successfully!");
                loadPortfolios();
            } else {
                const errorText = await res.text();
                throw new Error(errorText || "Delete failed");
            }
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div>

            {/* HEADER */}
            <div className="portfolio-top-header">
                <img src="src/public/img/sound1.jpg" className="portfolio-top-image" alt="Portfolio header" />
                <h1 className="portfolio-top-title fade-in-up">
                    Our <span>Portfolio</span>
                </h1>
                <h3 className="fade-in-up" style={{ animationDelay: "0.5s" }}>
                    Projects and events we have done previously.
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
                        + Add Portfolio Image
                    </button>
                )}
            </div>

            {/* ADD FORM */}
            {showAddForm && isStaff && (
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
                        <h3>Add New Portfolio Image</h3>
                        <button
                            onClick={handleCancelForm}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: "28px",
                                cursor: "pointer",
                                color: "#666",
                                lineHeight: "1"
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* IMAGE UPLOAD */}
                    <div style={{ marginBottom: "25px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "10px",
                            fontWeight: "bold",
                            color: "#333"
                        }}>
                            Image *
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
                            id="portfolio-image-upload"
                        />
                        <p style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "5px"
                        }}>
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
                                {/* Remove button on top-right of image */}
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
                    {!previewImage && (
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

                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "20px"
                    }}>
                        <button
                            onClick={handleCancelForm}
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
                            onClick={handleSave}
                            disabled={loading || !file}
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
                            {loading ? "Uploading..." : "Save"}
                        </button>
                    </div>
                </div>
            )}

            {/* LOADING STATE */}
            {loading && !showAddForm && (
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    fontSize: "18px",
                    color: "#666"
                }}>
                    Loading portfolio images...
                </div>
            )}

            {/* PORTFOLIO GRID */}
            <div className="portfolio-page-grid">
                {portfolios.length === 0 && !loading ? (
                    <div style={{
                        textAlign: "center",
                        padding: "40px",
                        gridColumn: "1 / -1"
                    }}>
                        <p style={{ fontSize: "18px", color: "#666" }}>
                            No portfolio images yet.
                            {isStaff && " Click 'Add Portfolio Image' to get started!"}
                        </p>
                    </div>
                ) : (
                    portfolios.map((portfolio, index) => {
                        const imagePath =
                            portfolio.imagePath ||
                            portfolio.ImagePath ||
                            portfolio.image ||
                            portfolio.Image ||
                            portfolio.filename ||
                            "";

                        let fullImagePath = imagePath;
                        if (imagePath && !imagePath.startsWith("/") && !imagePath.startsWith("http")) {
                            fullImagePath = `/${imagePath}`;
                        }

                        const portfolioId = portfolio.id || portfolio.ID || portfolio._id || index;

                        return (
                            <div key={portfolioId} className="portfolio-page-item">
                                {fullImagePath ? (
                                    <img
                                        src={fullImagePath}
                                        alt={`Portfolio ${index + 1}`}
                                        onError={(e) => {
                                            console.error("Failed to load image:", fullImagePath);
                                            e.target.src = "src/public/banner.jpg";
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

                                {isStaff && (
                                    <button
                                        onClick={() => handleDelete(portfolioId)}
                                        style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
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

            {/* Add some CSS styles */}
            <style>{`
                .portfolio-page-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 25px;
                    padding: 30px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .portfolio-page-item {
                    position: relative;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .portfolio-page-item:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                
                .portfolio-top-header {
                    position: relative;
                    height: 400px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-align: center;
                    overflow: hidden;
                }
                
                .portfolio-top-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: -1;
                }
                
                .portfolio-top-title {
                    font-size: 3rem;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                }
                
                .portfolio-top-title span {
                    color: #007bff;
                }
                
                .fade-in-up {
                    animation: fadeInUp 1s ease-out;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default PortfolioPage;