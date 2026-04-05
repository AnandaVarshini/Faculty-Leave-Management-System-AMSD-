const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");

const verifyHOD = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check HOD user
    const hodUser = await User.findOne({ email: "hod@example.com" });
    
    if (hodUser) {
      console.log("\n✓ HOD user found:");
      console.log(`  Name: ${hodUser.name}`);
      console.log(`  Email: ${hodUser.email}`);
      console.log(`  Role: ${hodUser.role}`);
      console.log(`  Role is 'hod'?: ${hodUser.role === "hod" ? "YES ✓" : "NO ✗"}`);
    } else {
      console.log("\n✗ HOD user NOT found in database");
    }

    // Check all users
    const allUsers = await User.find({}, { name: 1, email: 1, role: 1 });
    console.log("\n\nAll users in database:");
    console.log("------------------------");
    allUsers.forEach(user => {
      console.log(`Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

verifyHOD();
