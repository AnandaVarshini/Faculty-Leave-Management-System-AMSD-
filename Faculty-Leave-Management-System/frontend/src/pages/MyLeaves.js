import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Notifications from "../components/Notifications";
import "../styles/MyLeaves.css";

function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leave/my");
      setLeaves(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        await API.delete(`/leave/${id}`);
        setLeaves(leaves.filter(leave => leave._id !== id));
        alert("Leave deleted successfully");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete leave");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return "status-approved";
      case "rejected": return "status-rejected";
      default: return "status-pending";
    }
  };

  return (
    <div className="myleaves-container">
      <div className="leaves-header">
        <div className="header-left">
          <h1>My Leave Requests</h1>
        </div>
        <div className="header-right">
          <Notifications />
          <div className="header-buttons">
            <button onClick={() => navigate("/dashboard")} className="btn-secondary">
              Back to Dashboard
            </button>
            <button onClick={() => navigate("/profile")} className="btn-secondary">
              View Profile
            </button>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading your leaves...</div>
      ) : leaves.length === 0 ? (
        <div className="no-data">
          <p>You haven't applied for any leaves yet.</p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">
            Apply for Leave
          </button>
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
                    <span className={`status ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    {leave.status === "pending" && (
                      <button
                        onClick={() => handleDelete(leave._id)}
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
  );
}

export default MyLeaves;