import React from "react";
import "/src/App.css";

import heroVideo from "../public/bgVideo.mp4"; 

const Intro = () => {
    return (
        <section className="hero-wrapper">
            <div className="hero">

                <div className="hero-left">
                    <h1 className="hero-title">
                        "A symphony <br />
                         of light and sound."<br />
                         
                    </h1>
                    <p className="hero-desc">
                        Sound and light rentals for any event.
                    </p>
                </div>

                <div className="hero-right">
                    <video
                        className="hero-video full-img"
                        src={heroVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                </div>

            </div>
        </section>
    );
};

export default Intro;
