import React, { useEffect, useState } from "react";
import "/src/App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const PortfolioPage = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // ======================
    // Load Portfolio Items
    // ======================
    const fetchPortfolio = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/portfolio`);

            if (!res.ok) {
                console.error("Failed to fetch portfolio");
                return;
            }

            const data = await res.json();
            setPortfolios(data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    // ======================
    // On File Select
    // ======================
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    // ======================
    // Upload Portfolio Image
    // ======================
    const handleUpload = async () => {
        if (!file) {
            alert("Please select an image.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/portfolio`, {
                method: "POST",
                body: formData,
            });

            setLoading(false);

            if (!res.ok) {
                alert("Upload failed.");
                return;
            }

            alert("Uploaded successfully!");

            setFile(null);
            setPreview(null);
            fetchPortfolio();
        } catch (error) {
            setLoading(false);
            console.error("Upload error:", error);
        }
    };

    // ======================
    // Delete Portfolio Item
    // ======================
    const handleDelete = async (id) => {
        if (!confirm("Are you sure want to delete?")) return;

        try {
            const res = await fetch(`${API_BASE}/api/portfolio/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                alert("Delete failed.");
                return;
            }

            alert("Deleted successfully.");
            fetchPortfolio();
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    // ======================
    // Resolve Image URL
    // ======================
    const resolveImageUrl = (path) => {
        if (!path) return "";

        // If backend returns "/uploads/xxx.jpg"
        if (!path.startsWith("http")) {
            return `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;
        }

        return path;
    };

    return (
        <div className="portfolio-container">
            <h1>Portfolio</h1>

            {/* Upload Section */}
            <div className="portfolio-upload-box">
                <input type="file" accept="image/*" onChange={handleFileChange} />

                {preview && (
                    <img src={preview} alt="Preview" className="portfolio-preview" />
                )}

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="portfolio-upload-btn"
                >
                    {loading ? "Uploading..." : "Upload Image"}
                </button>
            </div>

            {/* Display Portfolio Items */}
            <div className="portfolio-grid">
                {portfolios.map((item) => (
                    <div key={item.id} className="portfolio-card">
                        <img
                            src={resolveImageUrl(item.imagePath)}
                            alt="Portfolio"
                            className="portfolio-card-img"
                        />

                        <button
                            onClick={() => handleDelete(item.id)}
                            className="portfolio-delete-btn"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PortfolioPage;
