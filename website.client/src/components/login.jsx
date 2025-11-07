import React, { useState } from "react";
import { Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Header from "./header";
import Footer from "./footer";
import { useAuth } from "./AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email || !password) {
            setError("Please enter both email and password.");
            setLoading(false);
            return;
        }

        console.log("Starting login process...");

        const result = await login(email, password);
        console.log("Login result:", result);

        if (result.success) {
            alert("Login successful!");
            navigate("/");
        } else {
            setError(result.message || "Login failed. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div>
            <div className="login-page">
                <Header />
                <div className="login-card">
                    <h2>Staff Login</h2>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <label>Email</label>
                            <div className="input-box">
                                <User className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="staff@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-box">
                                <Lock className="input-icon" />
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                       
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;