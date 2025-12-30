const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./db/Database");
const User = require("./model/user");

// Load environment variables
dotenv.config({
  path: path.join(__dirname, "config", ".env"),
});

// Manager user configuration
const managerUser = {
  name: "Manager User",
  email: "manager@wanttar.in",
  password: "Manager@123",
  role: "Manager",
  phoneNumber: 9876543211,
  addresses: [
    {
      addressType: "Office",
      address1: "Manager Office, Building B",
      address2: "Tech Park",
      zipCode: 560002,
      city: "Bangalore",
      country: "India"
    }
  ],
  avatar: {
    url: "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
    public_id: "avatar_gfxgav"
  }
  // Don't set permissions - uses role-based defaults from rolePermissions.js
};

const seedManager = async () => {
  try {
    console.log("=".repeat(60));
    console.log("🔧 MANAGER ACCOUNT SEED SCRIPT");
    console.log("=".repeat(60));
    
    console.log("\n🔗 Connecting to database...");
    await connectDatabase();
    console.log("✅ Database connected successfully\n");

    console.log(`📝 Processing Manager: ${managerUser.email}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email: managerUser.email });

    if (existingUser) {
      console.log(`⚠️  User already exists with email: ${managerUser.email}`);
      console.log(`   Current role: ${existingUser.role}`);
      
      // Update existing user to Manager role
      existingUser.name = managerUser.name;
      existingUser.role = managerUser.role;
      existingUser.phoneNumber = managerUser.phoneNumber;
      existingUser.addresses = managerUser.addresses;
      existingUser.avatar = managerUser.avatar;
      // Remove all custom permissions to use role-based defaults
      existingUser.permissions = undefined;
      
      await existingUser.save();
      console.log(`✅ Updated existing user to Manager role`);
    } else {
      // Create new Manager user
      const newUser = await User.create(managerUser);
      console.log(`✅ Created new Manager account`);
      console.log(`   ID: ${newUser._id}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ MANAGER SEED COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    
    console.log("\n📋 Manager Login Credentials:");
    console.log("─".repeat(40));
    console.log("   Email:    manager@wanttar.in");
    console.log("   Password: Manager@123");
    console.log("─".repeat(40));
    
    console.log("\n🔑 Manager Permissions (Role-Based Defaults):");
    console.log("─".repeat(40));
    console.log("   ✅ canManageOrders      - Manage all orders");
    console.log("   ✅ canManageProducts    - Manage all products");
    console.log("   ✅ canManageCoupons     - Manage discount coupons");
    console.log("   ✅ canManageCategories  - Manage product categories");
    console.log("   ✅ canManageUsers       - Manage customer accounts");
    console.log("   ✅ canManageVendors     - Manage seller accounts");
    console.log("   ✅ canViewAnalytics     - View analytics & reports");
    console.log("   ✅ canManageContent     - Manage banners, FAQs, legal pages");
    console.log("   ❌ canAccessSetup       - NO access to setup/configuration");
    console.log("   ❌ canApproveVendors    - NO vendor approval rights");
    console.log("   ❌ canApproveProducts   - NO product approval rights");
    console.log("   ❌ canApproveAds        - NO ad approval rights");
    console.log("   ❌ canModerateReviews   - NO review moderation rights");
    console.log("─".repeat(40));
    
    console.log("\n📌 Manager Menu Access:");
    console.log("   • Dashboard");
    console.log("   • All Sellers (manage, not approve)");
    console.log("   • All Orders");
    console.log("   • All Products (manage, not approve)");
    console.log("   • Categories");
    console.log("   • All Users");
    console.log("   • Home Banner");
    console.log("   • All Video Banners");
    console.log("   • Legal Pages");
    console.log("   • FAQ Management");
    console.log("   • Withdraw Requests");
    console.log("   • Analytics");
    
    console.log("\n🚫 Manager CANNOT Access:");
    console.log("   • Pending Sellers (approval section)");
    console.log("   • Pending Products (approval section)");
    console.log("   • Pending Video Banners (approval section)");
    console.log("   • Review Management (moderation)");
    console.log("   • Site Settings");
    console.log("   • Plan Management");
    console.log("   • Subscription Management");
    console.log("   • Admin Staff Management");
    console.log("   • Ad Plan Management");
    
    console.log("\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding Manager:");
    console.error(error);
    process.exit(1);
  }
};

// Run the seed function
seedManager();
