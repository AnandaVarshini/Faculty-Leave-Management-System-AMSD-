const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["leave_approved", "leave_rejected", "policy_announcement", "pending_reminder", "leave_applied"],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedLeaveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Leave",
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
