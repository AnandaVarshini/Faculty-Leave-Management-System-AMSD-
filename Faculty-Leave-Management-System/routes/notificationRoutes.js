const express = require("express");
const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  broadcastNotification
} = require("../controllers/notificationController");

const { authMiddleware } = require("../middleware/authMiddleware");

// Get all notifications for current user
router.get("/", authMiddleware, getNotifications);

// Get unread count
router.get("/unread/count", authMiddleware, getUnreadCount);

// Mark specific notification as read
router.put("/:notificationId/read", authMiddleware, markAsRead);

// Mark all notifications as read
router.put("/read/all", authMiddleware, markAllAsRead);

// Delete notification
router.delete("/:notificationId", authMiddleware, deleteNotification);

// Create notification (admin only)
router.post("/", authMiddleware, createNotification);

// Broadcast notification (admin only)
router.post("/broadcast", authMiddleware, broadcastNotification);

module.exports = router;
