const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: "./config/.env" });

// Import User model
const User = require("./model/user");

const createAdminAccount = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to database\n");

    const adminEmail = "mallofcayman@mallofcayman.com";
    const adminPassword = "Wabbitt1970";
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("⚠️  Admin account already exists!");
      console.log("Admin ID:", existingAdmin._id);
      console.log("Name:", existingAdmin.name);
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      
      // Update password if needed
      console.log("\n🔄 Updating password...");
      // Don't hash manually - the pre-save hook will do it
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      
      console.log("✅ Password updated successfully!");
      console.log("\n🎉 You can now login with:");
      console.log("Email:", adminEmail);
      console.log("Password:", adminPassword);
      console.log("\n🔗 Login at: http://localhost:3000/admin-login");
      
      await mongoose.connection.close();
      console.log("\n✅ Database connection closed");
      return;
    }

    console.log("📝 Creating new admin account...\n");

    // Don't hash password manually - the User model's pre-save hook will hash it
    // Create admin account
    const newAdmin = await User.create({
      name: "Mall of Cayman Admin",
      email: adminEmail,
      password: adminPassword, // Pass plain password - model will hash it
      phoneNumber: "1234567890",
      addresses: [],
      role: "Admin",
      avatar: {
        public_id: "default",
        url: "https://via.placeholder.com/150",
      },
    });

    console.log("✅ Admin account created successfully!");
    console.log("Admin ID:", newAdmin._id);
    console.log("Name:", newAdmin.name);
    console.log("Email:", newAdmin.email);
    console.log("Role:", newAdmin.role);
    console.log("Password:", adminPassword);

    console.log("\n🎉 All done! You can now login with:");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("\n🔗 Login at: http://localhost:3000/admin-login");

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the script
createAdminAccount();
