import React, { useEffect } from "react";
import "/src/App.css"; 
import bg from "/src/img/bg1.jpg";
import img1 from "/src/img/sound1.jpg";
import img2 from "/src/img/karaokeService.jpg";
import img3 from "/src/img/lightingSystem.jpg";
import img4 from "/src/img/ledScreen.jpg";
import img5 from "/src/img/visualSystem.jpg";
import img6 from "/src/img/projectionSystem.jpg";
import img7 from "/src/img/liveBand2.jpg";
import img8 from "/src/img/localArtist.jpg";
import img9 from "/src/img/installationService.jpg";
import img10 from "/src/img/truss.jpg";
import img11 from "/src/img/stage.jpg";
import img12 from "/src/img/emcee.jpg";

const Services = () => {
    const serviceList = [
        {
            img: img1,
            title: "Sound System",
        },
        {
            img: img2,
            title: "Karaoke Service",
        },
        {
            img: img3,
            title: "Lighting System",
        },
        {
            img: img4,
            title: "LED Screen",
        },
        {
            img: img5,
            title: "Visual System",
        },
        {
            img: img6,
            title: "Projection System",
        },
        {
            img: img7,
            title: "Live Band",
        },
        {
            img: img8,
            title: "Local Artist",
        },
        {
            img: img9,
            title: "Installation Service",
        },
        {
            img: img10,
            title: "Truss System",
        },
        {
            img: img11,
            title: "Stage",
        },
     
        {
            img: img12,
            title: "Emcee Service",
        },

        
    ];

    useEffect(() => {
        const cards = document.querySelectorAll(".sv-card");

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        cards.forEach(card => observer.observe(card));
    }, []);

    return (
        <>
            <section className="service-hero">
                <div className="service-hero-background">
                    <div className="placeholder-bg"></div>
                    <img src={bg} alt="Services" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> 
                </div>

                <div className="service-hero-content">
                    <h2 className="service-hero-title fade-in-up">Our <span>Services</span></h2>
                    <h3 className="fade-in-up" style={{ animationDelay: "0.5s" }}>What we offer</h3>
                </div>


            </section>

            <section className="services-content">
                <div className="services-content-card">
                        <h2 className="services-content-title">
                        Leave it to us at Sam Sound & Lights, for a one-stop service to help you get everything settle!
                        </h2>

                        <div className="sv-grid">
                            {serviceList.map((service, index) => (
                                <div key={index} className="sv-card">
                                    <img src={service.img} alt={service.title} className="sv-card-img" />
                                    <div className="sv-card-overlay"></div>

                                    <div className="sv-card-text">
                                        <h3>{service.title}</h3>
                                        <p>{service.desc}</p>
                                    </div>
                                </div>
                            ))}

                    </div>

                    
                    </div>
            </section>
        </>
    );
};

export default Services;
