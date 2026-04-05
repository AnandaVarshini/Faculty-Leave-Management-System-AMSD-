import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Notifications from "../components/Notifications";
import "../styles/HODDashboard.css";

const HODDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
    fetchLeaves();
  }, []);

  const fetchUserInfo = () => {
    const email = localStorage.getItem("email") || "user@example.com";
    const role = localStorage.getItem("role") || "hod";
    setUser({ email, role });
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leave/all");
      setAllLeaves(res.data);
      
      // Separate pending leaves
      const pending = res.data.filter(leave => leave.status === "pending");
      setPendingLeaves(pending);
      setError("");
    } catch (err) {
      setError("Failed to fetch leaves");
      console.log("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      setLoading(true);
      await API.put(`/leave/${leaveId}/approve`);
      setMessage("Leave approved successfully!");
      fetchLeaves();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to approve leave");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    try {
      setLoading(true);
      await API.put(`/leave/${leaveId}/reject`, { reason: rejectReason });
      setMessage("Leave rejected successfully!");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedLeave(null);
      fetchLeaves();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to reject leave");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "pending":
        return "status-pending";
      default:
        return "";
    }
  };

  const getFilteredLeaves = () => {
    let filtered = allLeaves;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(leave => leave.status === filterStatus);
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(leave => leave.type === filterType);
    }

    // Search by faculty name or email
    if (searchQuery) {
      filtered = filtered.filter(leave =>
        leave.facultyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const leaveStats = {
    total: allLeaves.length,
    pending: allLeaves.filter(l => l.status === "pending").length,
    approved: allLeaves.filter(l => l.status === "approved").length,
    rejected: allLeaves.filter(l => l.status === "rejected").length
  };

  return (
    <div className="hod-dashboard-wrapper">
      {/* Sidebar */}
      <div className="hod-sidebar">
        <div className="hod-sidebar-logo">
          <div className="logo-icon">📚</div>
          <span>Leave Manager</span>
        </div>

        <nav className="hod-sidebar-nav">
          <button
            className={`hod-nav-item ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            <span className="nav-icon">⏳</span>
            <span>Pending Requests</span>
            {leaveStats.pending > 0 && (
              <span className="badge">{leaveStats.pending}</span>
            )}
          </button>
          <button
            className={`hod-nav-item ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <span className="nav-icon">📁</span>
            <span>Leave History</span>
          </button>
          <button
            className={`hod-nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <span className="nav-icon">📊</span>
            <span>Reports</span>
          </button>
        </nav>

        <div className="hod-sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <p className="user-name">HOD</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button className="sign-out-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="hod-main-content">
        <div className="content-header">
          <h1>Leave Management Dashboard</h1>
          <Notifications />
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon total">📋</div>
            <div className="stat-text">
              <p className="stat-label">Total Requests</p>
              <p className="stat-value">{leaveStats.total}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-text">
              <p className="stat-label">Pending</p>
              <p className="stat-value">{leaveStats.pending}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon approved">✓</div>
            <div className="stat-text">
              <p className="stat-label">Approved</p>
              <p className="stat-value">{leaveStats.approved}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rejected">✕</div>
            <div className="stat-text">
              <p className="stat-label">Rejected</p>
              <p className="stat-value">{leaveStats.rejected}</p>
            </div>
          </div>
        </div>

        {/* Pending Leave Requests */}
        {activeTab === "pending" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Pending Leave Requests</h2>
              <p>Review and approve/reject faculty leave requests</p>
            </div>

            {loading ? (
              <div className="loading">Loading leaves...</div>
            ) : pendingLeaves.length === 0 ? (
              <div className="no-data">
                <p>No pending leave requests</p>
              </div>
            ) : (
              <div className="leaves-table-container">
                <table className="leaves-table">
                  <thead>
                    <tr>
                      <th>Faculty Name</th>
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td className="faculty-name">{leave.facultyName}</td>
                        <td>{leave.type || leave.reason}</td>
                        <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                        <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                        <td>
                          {Math.ceil(
                            (new Date(leave.toDate) - new Date(leave.fromDate)) /
                              (1000 * 60 * 60 * 24)
                          ) + 1}{" "}
                          days
                        </td>
                        <td>{leave.reason}</td>
                        <td className="actions">
                          <button
                            className="btn-approve"
                            onClick={() => handleApproveLeave(leave._id)}
                            disabled={loading}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowRejectModal(true);
                            }}
                            disabled={loading}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Leave History */}
        {activeTab === "history" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Leave History</h2>
              <p>View all leave requests with status</p>
            </div>

            <div className="filter-section">
              <div className="filter-group">
                <label>Filter by Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Search Faculty:</label>
                <input
                  type="text"
                  placeholder="Search by faculty name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading leaves...</div>
            ) : getFilteredLeaves().length === 0 ? (
              <div className="no-data">
                <p>No leave requests found</p>
              </div>
            ) : (
              <div className="leaves-table-container">
                <table className="leaves-table">
                  <thead>
                    <tr>
                      <th>Faculty Name</th>
                      <th>Leave Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredLeaves().map((leave) => (
                      <tr key={leave._id}>
                        <td className="faculty-name">{leave.facultyName}</td>
                        <td>{leave.type || leave.reason}</td>
                        <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                        <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                        <td>{leave.reason}</td>
                        <td>
                          <span className={`status ${getStatusColor(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td>{new Date(leave.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reports */}
        {activeTab === "reports" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Leave Reports</h2>
              <p>Analytics and statistics on faculty leave requests</p>
            </div>

            <div className="filter-section">
              <div className="filter-group">
                <label>Filter by Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Earned">Earned Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                </select>
              </div>
            </div>

            <div className="reports-grid">
              <div className="report-card">
                <h3>Leave Distribution by Type</h3>
                <div className="report-content">
                  {["Sick", "Casual", "Earned", "Maternity"].map((type) => {
                    const count = allLeaves.filter(l => l.type === type || l.reason?.includes(type)).length;
                    return (
                      <div key={type} className="report-item">
                        <span className="type-label">{type} Leave:</span>
                        <span className="type-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="report-card">
                <h3>Leave Status Distribution</h3>
                <div className="report-content">
                  <div className="report-item">
                    <span className="status-label">Pending:</span>
                    <span className="status-count pending">{leaveStats.pending}</span>
                  </div>
                  <div className="report-item">
                    <span className="status-label">Approved:</span>
                    <span className="status-count approved">{leaveStats.approved}</span>
                  </div>
                  <div className="report-item">
                    <span className="status-label">Rejected:</span>
                    <span className="status-count rejected">{leaveStats.rejected}</span>
                  </div>
                </div>
              </div>

              <div className="report-card">
                <h3>Approval Rate</h3>
                <div className="report-content">
                  <div className="approval-rate">
                    {leaveStats.approved + leaveStats.rejected > 0
                      ? (
                          (leaveStats.approved /
                            (leaveStats.approved + leaveStats.rejected)) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                  <p className="approval-desc">of processed requests approved</p>
                </div>
              </div>

              <div className="report-card">
                <h3>Total Leave Days</h3>
                <div className="report-content">
                  <div className="total-days">
                    {allLeaves.reduce((sum, leave) => {
                      const days =
                        Math.ceil(
                          (new Date(leave.toDate) - new Date(leave.fromDate)) /
                            (1000 * 60 * 60 * 24)
                        ) + 1;
                      return sum + days;
                    }, 0)}
                  </div>
                  <p className="days-desc">days approved or pending</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Leave Request</h3>
              <button
                className="close-btn"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Faculty:</strong> {selectedLeave.facultyName}
              </p>
              <p>
                <strong>Date Range:</strong>{" "}
                {new Date(selectedLeave.fromDate).toLocaleDateString()} -{" "}
                {new Date(selectedLeave.toDate).toLocaleDateString()}
              </p>
              <div className="form-group">
                <label>Reason for Rejection:</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows="4"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={() => handleRejectLeave(selectedLeave._id)}
                disabled={loading}
              >
                {loading ? "Rejecting..." : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;
