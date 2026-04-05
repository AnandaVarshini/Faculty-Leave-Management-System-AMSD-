const express = require("express");
const router = express.Router();

const { authMiddleware, hodMiddleware } = require("../middleware/authMiddleware");

const {
  createLeave,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  deleteLeave,
  getMyLeaves
} = require("../controllers/leaveController");

// Faculty routes
router.post("/apply", authMiddleware, createLeave);
router.get("/my", authMiddleware, getMyLeaves);

// HOD routes
router.get("/all", authMiddleware, hodMiddleware, getAllLeaves);
router.put("/:id/approve", authMiddleware, hodMiddleware, approveLeave);
router.put("/:id/reject", authMiddleware, hodMiddleware, rejectLeave);

// Faculty delete route (only for pending leaves)
router.delete("/:id", authMiddleware, deleteLeave);

module.exports = router;