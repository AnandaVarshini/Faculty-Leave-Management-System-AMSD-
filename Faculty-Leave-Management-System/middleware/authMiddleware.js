const jwt = require("jsonwebtoken");

// Authentication middleware to verify JWT token
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// HOD/Admin role check middleware
function hodMiddleware(req, res, next) {
  if (req.user && req.user.role === "hod") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. HOD only." });
}

module.exports = { authMiddleware, hodMiddleware };