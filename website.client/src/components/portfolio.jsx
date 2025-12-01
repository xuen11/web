import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "/src/App.css";
import img1 from "/src/img/banner.jpg";
import img2 from "/src/img/event4.jpg";
import img3 from "/src/img/event5.jpg";
import img4 from "/src/img/event6.jpg";
import img5 from "/src/img/event7.jpg";
import img6 from "/src/img/event8.jpg";

const Portfolio = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const portfolioItems = [
        { id: 1, image: img1, title: "Wedding" },
        { id: 2, image: img5, title: "Suriagroup Kaamatan Raya" },
        { id: 3, image: img3, title: "IEM Dinner" },
        { id: 4, image: img4, title: "Desa Appreciation Night" },
        { id: 5, image: img2, title: "Cultural Celebration" },
        { id: 6, image: img6, title: "Majlis Apresiasi Ko-Nelayan 2024" }
    ];

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const animateChange = (newIndex) => {
        setIsAnimating(true);

        setTimeout(() => {
            setCurrentIndex(newIndex);
        }, 150);
        setTimeout(() => {
            setIsAnimating(false);
        }, 300);
    };

    const showNext = () => {
        if (isMobile) {
            // Mobile: Show next single card
            if (currentIndex < portfolioItems.length - 1) {
                animateChange(currentIndex + 1);
            }
        } else {
            // Desktop: Show next 3 cards
            if (currentIndex + 3 < portfolioItems.length) {
                animateChange(currentIndex + 3);
            }
        }
    };

    const showPrev = () => {
        if (isMobile) {
            // Mobile: Show previous single card
            if (currentIndex > 0) {
                animateChange(currentIndex - 1);
            }
        } else {
            // Desktop: Show previous 3 cards
            if (currentIndex - 3 >= 0) {
                animateChange(currentIndex - 3);
            }
        }
    };

    const handleViewMore = () => {
        navigate("/portfolio");
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    };

    // Get items to display based on device
    const getDisplayItems = () => {
        if (isMobile) {
            // Mobile: Only show current item
            return [portfolioItems[currentIndex]];
        } else {
            // Desktop: Show 3 items starting from currentIndex
            return portfolioItems.slice(currentIndex, currentIndex + 3);
        }
    };

    return (
        <section className="portfolio-section" id="portfolio">
            <div className="portfolio-bg-top"></div>

            <div className="portfolio-container">
                <div className="portfolio-header">
                    <div className="portfolio-title-wrapper">
                        <div className="portfolio-label">OUR PORTFOLIO</div>
                        <h3 className="portfolio-title">What projects we have done</h3>
                    </div>
                    <button className="view-more-btn" onClick={handleViewMore}>
                        View More
                        <span className="arrow-icon">→</span>
                    </button>
                </div>

                <div className="portfolio-carousel-wrapper">
                    <button
                        className="carousel-btn left"
                        onClick={showPrev}
                        disabled={isMobile ? currentIndex === 0 : currentIndex === 0}
                    >
                        ←
                    </button>

                    <div className={`portfolio-grid ${isAnimating ? "animating" : "animating-done"}`}>
                        {getDisplayItems().map((item, index) => (
                            <div
                                key={item.id}
                                className={`portfolio-card ${isMobile && index === 0 ? 'active' : ''}`}
                            >
                                <div className="portfolio-image">
                                    <img src={item.image} alt={item.title} />
                                    <div className="portfolio-title-overlay">{item.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="carousel-btn right"
                        onClick={showNext}
                        disabled={isMobile ? currentIndex === portfolioItems.length - 1 : currentIndex + 3 >= portfolioItems.length}
                    >
                        →
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Portfolio;