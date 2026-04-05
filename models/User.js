const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ""
  },
  designation: {
    type: String,
    default: ""
  },
  joiningDate: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ["faculty", "hod"],
    default: "faculty"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
