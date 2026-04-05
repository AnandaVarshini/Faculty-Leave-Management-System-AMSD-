const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");

const createOrUpdateHOD = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "hod@example.com";
    const password = "hod@123";
    const name = "Jane HOD";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if HOD user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user
      user.password = hashedPassword;
      user.name = name;
      user.role = "hod";
      await user.save();
      console.log("HOD user updated successfully!");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    } else {
      // Create new HOD user
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: "hod"
      });
      console.log("HOD user created successfully!");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createOrUpdateHOD();
