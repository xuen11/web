// In App.jsx
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Banner from './components/banner';
import Event from './components/event';
import Services from './components/services';
import About from './components/about';
import Contact from './components/contact';
import Footer from './components/footer';
import Login from './components/login';
import { AuthProvider } from './components/AuthContext'; 

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
                                <Banner />
                                <Event />
                                <Services />
                                <About />
                                <Contact />
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