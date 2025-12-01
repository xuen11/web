import './App.css';
import { Routes, Route } from 'react-router-dom';
import Intro from './components/Intro';
import Header from './components/Header1';
import Event from './components/event';
import Services2 from './components/service';
import About from './components/aboutUs';
import Portfolio from './components/portfolio';
import Contact from './components/contactUs';
import Footer from './components/footer';
import Login from './components/login';
import { AuthProvider } from './components/AuthContext';

import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactUsPage from './pages/ContactUsPage';
import PortfolioPage from './pages/PortfolioPage';
import EventsPage from './pages/EventsPage';

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <Header />
                                <Intro />
                                <About />
                                <div id="services-section">
                                    <Services2 />
                                </div>
                                <Event />
                                <Portfolio />
                                <Contact />
                                <Footer />
                            </>
                        }
                    />

                    {/* Separate Pages */}
                    <Route
                        path="/services"
                        element={
                            <>
                                <Header />
                                <ServicesPage />
                                <Footer />
                            </>
                        }
                    />
                    <Route
                        path="/about"
                        element={
                            <>
                                <Header />
                                <AboutPage />
                                <Footer />
                            </>
                        }
                    />
                    <Route
                        path="/contact"
                        element={
                            <>
                                <Header />
                                <ContactUsPage />
                                <Footer />
                            </>
                        }
                    />
                    <Route
                        path="/portfolio"
                        element={
                            <>
                                <Header />
                                <PortfolioPage />
                                <Footer />
                            </>
                        }
                    />
                    <Route
                        path="/events"
                        element={
                            <>
                                <Header />
                                <EventsPage />
                                <Footer />
                            </>
                        }
                    />

                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;