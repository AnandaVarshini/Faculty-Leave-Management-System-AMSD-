import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Notifications from "../components/Notifications";
import "../styles/Profile.css";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    joiningDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/profile");
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        designation: res.data.designation || "",
        joiningDate: res.data.joiningDate ? new Date(res.data.joiningDate).toISOString().split('T')[0] : "",
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    if (!formData.name || !formData.email) {
      setError("Name and Email are required");
      setSaving(false);
      return;
    }

    try {
      await API.put("/auth/profile", formData);
      setMessage("Profile updated successfully!");
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="profile-page-container">
      <div className="profile-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <div className="logo-text">Leave Manager</div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                onClick={() => navigate("/dashboard")}
                className="nav-item"
              >
                📊 Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/apply-leave")}
                className="nav-item"
              >
                ✏️ Apply Leave
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/my-leaves")}
                className="nav-item"
              >
                📋 My Leaves
              </button>
            </li>
            <li>
              <button className="nav-item active">
                👤 Profile
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{formData.name?.charAt(0).toUpperCase() || "U"}</div>
            <div className="user-details">
              <p className="user-name">{formData.name || "User"}</p>
              <p className="user-email">{formData.email || "user@gmail.com"}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            ↪️ Sign Out
          </button>
        </div>
      </div>

      <div className="profile-main-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <Notifications />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {loading ? (
          <div className="loading">Loading profile...</div>
        ) : (
          <div className="profile-form-container">
            <form onSubmit={handleSaveChanges} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="designation">Designation</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Enter your designation"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="joiningDate">Joining Date</label>
                <input
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>

              <button
                type="submit"
                className="btn-save"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
