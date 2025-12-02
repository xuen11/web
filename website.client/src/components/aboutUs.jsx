import React, { useEffect, useRef } from 'react';
import '/src/App.css';
import aboutImg1 from '/img/banner2.jpg';
import aboutImg2 from '/img/banner3.jpg';
import aboutImg3 from '/img/banner4.jpg';

const About = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    } else {
                        entry.target.classList.remove('animate');
                    }
                });
            },
            {
                threshold: 0.3,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <div ref={sectionRef}>
            <div className="top-banner"></div>

            <div className="who-we-are-section">
                <div className="content-left">
                    <div className="accent-line"></div>
                    <h2 className="section-title">WHO WE ARE</h2>

                    <p className="content-text">
                        Sam's Sound & Light provides a wide range of services to suit any need, including short and long term hire and installation.
                    </p>

                    <p className="content-text">
                        SSL's experienced staff can specify, deliver, setup and operate with 24hour 7day a week service to match your specific requirements.
                    </p>
                </div>

                <div className="content-right">
                    <div className="image-collage">
                        <div className="collage-frame">
                            <div className="collage-grid">
                                <div className="collage-item large">
                                    <img src={aboutImg1} alt="Project Img" />
                                </div>
                                <div className="collage-item small">
                                    <img src={aboutImg2} alt="Project Img" />
                                </div>
                                <div className="collage-item small">
                                    <img src={aboutImg3} alt="Project Img" />
                                </div>
                            </div>
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
    );
};

export default About;