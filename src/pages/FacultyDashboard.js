import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Notifications from "../components/Notifications";
import "../styles/Dashboard.css";

const FacultyDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [monthlyLeavesCount, setMonthlyLeavesCount] = useState(0);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formData, setFormData] = useState({
    facultyName: "",
    fromDate: "",
    toDate: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
    fetchUserInfo();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leave/my");
      setLeaves(res.data);
      
      // Calculate statistics
      const total = res.data.length;
      const pending = res.data.filter(l => l.status === "pending").length;
      const approved = res.data.filter(l => l.status === "approved").length;
      const rejected = res.data.filter(l => l.status === "rejected").length;
      
      setStats({ total, pending, approved, rejected });

      // Calculate leaves for current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const currentMonthLeaves = res.data.filter(leave => {
        const leaveDate = new Date(leave.fromDate);
        return leaveDate.getMonth() === currentMonth && 
               leaveDate.getFullYear() === currentYear &&
               (leave.status === "pending" || leave.status === "approved");
      });

      setMonthlyLeavesCount(currentMonthLeaves.length);
    } catch (err) {
      console.log("Error fetching leaves");
    }
  };

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email") || "user@example.com";
    setUser({ email, role });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.facultyName || !formData.fromDate || !formData.toDate || !formData.reason) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await API.post("/leave/apply", formData);
      setMessage("Leave applied successfully!");
      setFormData({ facultyName: "", fromDate: "", toDate: "", reason: "" });
      setTimeout(() => {
        fetchLeaves();
        setActiveTab("dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">📚</div>
          <span>Leave Manager</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === "apply" ? "active" : ""}`}
            onClick={() => setActiveTab("apply")}
          >
            <span className="nav-icon">📝</span>
            <span>Apply Leave</span>
          </button>
          <button
            className={`nav-item ${activeTab === "leaves" ? "active" : ""}`}
            onClick={() => setActiveTab("leaves")}
          >
            <span className="nav-icon">📋</span>
            <span>My Leaves</span>
          </button>
          <button
            className={`nav-item`}
            onClick={() => navigate("/profile")}
          >
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </button>
          {user?.role === "hod" && (
            <button
              className={`nav-item`}
              onClick={() => navigate("/hod-dashboard")}
            >
              <span className="nav-icon">📊</span>
              <span>Leave Management</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <p className="user-name">{user?.email}</p>
            </div>
          </div>
          <button className="sign-out-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <Notifications />
        </div>
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="tab-content">
            <h1>Faculty Dashboard</h1>

            {/* Stats Cards */}
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-icon calendar">📅</div>
                <div className="stat-text">
                  <p className="stat-label">Total Requests</p>
                  <p className="stat-value">{stats.total}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending">⏳</div>
                <div className="stat-text">
                  <p className="stat-label">Pending</p>
                  <p className="stat-value">{stats.pending}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon approved">✓</div>
                <div className="stat-text">
                  <p className="stat-label">Approved</p>
                  <p className="stat-value">{stats.approved}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon rejected">✕</div>
                <div className="stat-text">
                  <p className="stat-label">Rejected</p>
                  <p className="stat-value">{stats.rejected}</p>
                </div>
              </div>
            </div>

            {/* Leave Balances */}
            <div className="leave-balances-section">
              <h3>Leave Balances</h3>
              <p className="no-data">No leave balances allocated yet.</p>
            </div>
          </div>
        )}

        {/* Apply Leave Tab */}
        {activeTab === "apply" && (
          <div className="tab-content">
            <h1>Apply for Leave</h1>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            {monthlyLeavesCount >= 5 && (
              <div className="error-message limit-reached" style={{ fontSize: "16px", marginBottom: "20px", padding: "15px", borderRadius: "4px" }}>
                ⚠️ Limit reached: You have already applied for 5 leaves this month. No more leaves can be applied.
              </div>
            )}

            {monthlyLeavesCount > 0 && monthlyLeavesCount < 5 && (
              <div style={{ fontSize: "14px", marginBottom: "20px", padding: "10px 15px", backgroundColor: "#e7f3ff", borderLeft: "4px solid #2196F3", borderRadius: "4px", color: "#0066cc" }}>
                📊 You have applied for <strong>{monthlyLeavesCount}</strong> out of <strong>5</strong> leaves this month. Remaining: <strong>{5 - monthlyLeavesCount}</strong>
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="apply-leave-form">
              <div className="form-group">
                <label>Faculty Name</label>
                <input
                  type="text"
                  name="facultyName"
                  value={formData.facultyName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>From Date</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>To Date</label>
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Leave</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for leave"
                  rows="4"
                ></textarea>
              </div>

              <button type="submit" disabled={loading || monthlyLeavesCount >= 5} className="btn-primary">
                {loading ? "Applying..." : "Apply Leave"}
              </button>
            </form>
          </div>
        )}

        {/* My Leaves Tab */}
        {activeTab === "leaves" && (
          <div className="tab-content">
            <h1>My Leaves</h1>

            {leaves.length === 0 ? (
              <div className="no-data-container">
                <p>You haven't applied for any leaves yet.</p>
              </div>
            ) : (
              <div className="leaves-table-container">
                <table className="leaves-table">
                  <thead>
                    <tr>
                      <th>Faculty Name</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>{leave.facultyName}</td>
                        <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                        <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                        <td>{leave.reason}</td>
                        <td>
                          <span className={`status status-${leave.status}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td>
                          {leave.status === "pending" && (
                            <button
                              onClick={() => {
                                if (window.confirm("Delete this leave request?")) {
                                  API.delete(`/leave/${leave._id}`).then(() => fetchLeaves());
                                }
                              }}
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
