const Leave = require("../models/Leave");
const Notification = require("../models/Notification");

// ✅ Create Leave
exports.createLeave = async (req, res) => {
  try {
    const fromDate = new Date(req.body.fromDate);
    const currentMonth = fromDate.getMonth();
    const currentYear = fromDate.getFullYear();

    // Count leaves for the current user in the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const leaveCount = await Leave.countDocuments({
      user: req.user.id,
      fromDate: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $in: ["pending", "approved"] }
    });

    // Check if limit is reached
    if (leaveCount >= 5) {
      return res.status(400).json({ message: "Limit reached: You can only apply for 5 leaves per month" });
    }

    const leave = await Leave.create({
      ...req.body,
      user: req.user.id
    });

    // Create notification for the user
    await Notification.create({
      userId: req.user.id,
      type: "leave_applied",
      title: "Leave Request Submitted",
      message: `Your leave request from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been submitted successfully.`,
      relatedLeaveId: leave._id
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get My Leaves (Faculty)
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Leaves (Admin)
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Approve Leave
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { 
        status: "approved",
        approvedBy: req.user.id,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // Create notification for the user
    await Notification.create({
      userId: leave.user,
      type: "leave_approved",
      title: "Leave Request Approved",
      message: `Your leave request from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been approved.`,
      relatedLeaveId: leave._id
    });

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Reject Leave
exports.rejectLeave = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { 
        status: "rejected",
        rejectionReason: reason || "No reason provided",
        approvedBy: req.user.id,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // Create notification for the user
    await Notification.create({
      userId: leave.user,
      type: "leave_rejected",
      title: "Leave Request Rejected",
      message: `Your leave request from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been rejected. Reason: ${reason || "No reason provided"}`,
      relatedLeaveId: leave._id
    });

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Leave
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    res.status(200).json({ message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};