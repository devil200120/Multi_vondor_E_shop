const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./db/Database");
const User = require("./model/user");

// Load environment variables
dotenv.config({
  path: path.join(__dirname, "config", ".env"),
});

const fixAdminPermissions = async () => {
  try {
    console.log("🔗 Connecting to database...");
    await connectDatabase();
    console.log("✅ Database connected successfully\n");

    // Remove permissions field from SubAdmin and Manager users using $unset
    const result = await User.updateMany(
      { role: { $in: ["SubAdmin", "Manager"] } },
      { $unset: { permissions: "" } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);
    console.log("   Removed explicit permissions to use role-based defaults");

    // Verify the changes
    const subAdmin = await User.findOne({ email: "subadmin@wanttar.in" });
    const manager = await User.findOne({ email: "manager@wanttar.in" });

    console.log("\n📋 Verification:");
    console.log("\nSubAdmin User:");
    console.log("  Role:", subAdmin.role);
    console.log("  Permissions field exists:", subAdmin.permissions !== undefined);
    console.log("  Permissions value:", subAdmin.permissions);

    console.log("\nManager User:");
    console.log("  Role:", manager.role);
    console.log("  Permissions field exists:", manager.permissions !== undefined);
    console.log("  Permissions value:", manager.permissions);

    console.log("\n✅ Done! Please logout and login again to get new token with correct permissions.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error fixing permissions:");
    console.error(error);
    process.exit(1);
  }
};

fixAdminPermissions();
