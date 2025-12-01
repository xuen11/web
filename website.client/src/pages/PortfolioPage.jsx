import React, { useEffect, useRef } from 'react';
import "/src/App.css";
import banner from "/src/img/sound1.jpg";
import img1 from "/src/img/event3.jpg";
import img2 from "/src/img/event4.jpg";
import img3 from "/src/img/event6.jpg";
import img4 from "/src/img/event7.jpg";
import img5 from "/src/img/event8.jpg";
import img6 from "/src/img/event9.jpg";
import img7 from "/src/img/event10.jpg";
import img8 from "/src/img/event11.jpg";

const PortfolioPage = () => {
    const images = [img1, img2, img3, img4, img5, img6, img7, img8];
    const imgRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('show');
                    }
                });
            }, { threshold: 0.2 }
        );

        imgRefs.current.forEach(img => {
            if (img) observer.observe(img);
        });

        return () => {
            imgRefs.current.forEach(img => {
                if (img) observer.unobserve(img);
            });
        };
    }, []);

    return (
        <div>
            <div className="portfolio-top-header">
                <img src={banner} alt="Portfolio Banner" className="portfolio-top-image" />
                <h1 className="portfolio-top-title fade-in-up">Our <span>Portfolio</span></h1>
                <h3 className="fade-in-up" style={{ animationDelay: "0.5s" }}>
                    Projects and events we have done previously.
                </h3>
            </div>

            <div className="portfolio-content">
                <div className="portfolio-page-grid"> 
                    {images.map((img, index) => (
                        <div
                            className="portfolio-page-item flip-in" 
                            key={index}
                            ref={el => imgRefs.current[index] = el}
                        >
                            <img src={img} alt={`Portfolio ${index + 1}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PortfolioPage;