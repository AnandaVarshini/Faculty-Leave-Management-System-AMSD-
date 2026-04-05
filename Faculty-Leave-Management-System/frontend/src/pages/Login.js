import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    // Validate input fields
    if (!email || !password) {
      setLoginError("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", email);

      setLoginError("");
      
      // Navigate to appropriate dashboard based on role
      if (res.data.role === "hod") {
        navigate("/hod-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setLoginError("Invalid email or password. Please try again.");
      } else if (error.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else if (error.request) {
        setLoginError("Unable to connect to server. Please check your connection.");
      } else {
        setLoginError("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetMessage("");

    if (!resetEmail) {
      setResetMessage("Please enter your email address");
      setIsLoading(false);
      return;
    }

    try {
      await API.post("/auth/forgot-password", {
        email: resetEmail,
      });
      
      setResetMessage("Password reset link has been sent to your email!");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail("");
        setResetMessage("");
      }, 3000);
    } catch (error) {
      setResetMessage("Email not found or error sending reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon">🎓</div>
          <h1 className="brand-title">Faculty Leave Management System</h1>
          <p className="brand-subtitle">Streamline leave requests and approvals</p>
        </div>
        
        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <p><strong>Easy Leave Requests</strong> - Apply for leaves in minutes</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <p><strong>Instant Notifications</strong> - Get real-time updates on requests</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✓</span>
            <p><strong>Secure Access</strong> - Role-based authentication</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          {!showForgotPassword ? (
            <>
              <div className="auth-header">
                <h2>Welcome Back</h2>
                <p>Sign in to manage your leaves</p>
              </div>

              {loginError && (
                <div className="alert alert-error">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your.email@institution.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="auth-footer">
                <button 
                  type="button"
                  className="link-button"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot your password?
                </button>
              </div>

              <div className="auth-signup">
                <p>Don't have an account? <a href="/register" className="link">Create one</a></p>
              </div>
            </>
          ) : (
            <>
              <div className="auth-header">
                <h2>Reset Password</h2>
                <p>We'll send you a link to reset your password</p>
              </div>

              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your.email@institution.ac.in"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                {resetMessage && (
                  <div className={`alert ${resetMessage.includes("sent") ? "alert-success" : "alert-error"}`}>
                    {resetMessage}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="auth-footer">
                <button 
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage("");
                    setResetEmail("");
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </div>

        <div className="auth-footer-text">
          <p>&copy; 2026 Faculty Leave Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;