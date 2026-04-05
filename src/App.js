import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FacultyDashboard from "./pages/FacultyDashboard";
import MyLeaves from "./pages/MyLeaves";
import Profile from "./pages/Profile";
import HODDashboard from "./pages/HODDashboard";

function ProtectedRoute({ element }) {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" />;
}

function RoleBasedRoute({ element, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && role !== requiredRole) {
    // Redirect to appropriate dashboard
    if (role === "hod") {
      return <Navigate to="/hod-dashboard" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }
  
  return element;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<RoleBasedRoute element={<FacultyDashboard />} requiredRole="faculty" />} />
        <Route path="/my-leaves" element={<ProtectedRoute element={<MyLeaves />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/hod-dashboard" element={<RoleBasedRoute element={<HODDashboard />} requiredRole="hod" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
