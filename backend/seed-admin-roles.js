const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./db/Database");
const User = require("./model/user");

// Load environment variables
dotenv.config({
  path: path.join(__dirname, "config", ".env"),
});

// Admin users to create
const adminUsers = [
  {
    name: "SubAdmin User",
    email: "subadmin@wanttar.in",
    password: "SubAdmin@123",
    role: "SubAdmin",
    phoneNumber: 9876543210,
    addresses: [
      {
        addressType: "Office",
        address1: "SubAdmin Office, Building A",
        address2: "Tech Park",
        zipCode: 560001,
        city: "Bangalore",
        country: "India"
      }
    ],
    avatar: {
      url: "https://res.cloudinary.com/dkzfopuco/image/upload/v1683299454/avatar_gfxgav.png",
      public_id: "avatar_gfxgav"
    }
    // Don't set permissions - let it use role-based defaults
  },
  {
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
    // Don't set permissions - let it use role-based defaults
  }
];

const seedAdminRoles = async () => {
  try {
    console.log("🔗 Connecting to database...");
    await connectDatabase();
    console.log("✅ Database connected successfully\n");

    for (const adminData of adminUsers) {
      console.log(`\n📝 Processing ${adminData.role}: ${adminData.email}`);

      // Check if user already exists
      const existingUser = await User.findOne({ email: adminData.email });

      if (existingUser) {
        console.log(`⚠️  User already exists with email: ${adminData.email}`);
        console.log(`   Current role: ${existingUser.role}`);
        
        // Update existing user
        existingUser.name = adminData.name;
        existingUser.role = adminData.role;
        existingUser.phoneNumber = adminData.phoneNumber;
        existingUser.addresses = adminData.addresses;
        existingUser.avatar = adminData.avatar;
        // Remove all permissions to use role-based defaults
        existingUser.permissions = undefined;
        
        // Don't update password if it already exists (user may have changed it)
        // existingUser.password = adminData.password;
        
        await existingUser.save();
        console.log(`✅ Updated existing user to ${adminData.role} role`);
      } else {
        // Create new user
        const newUser = await User.create(adminData);
        console.log(`✅ Created new ${adminData.role}`);
        console.log(`   ID: ${newUser._id}`);
        console.log(`   Name: ${newUser.name}`);
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Password: ${adminData.password}`);
        console.log(`   Role: ${newUser.role}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Admin roles seed completed successfully!");
    console.log("=".repeat(60));
    
    console.log("\n📋 Login Credentials:");
    console.log("\n🔹 SubAdmin:");
    console.log("   Email: subadmin@wanttar.in");
    console.log("   Password: SubAdmin@123");
    console.log("   Permissions: Vendor/Product/Ad Approvals, Review Moderation");
    
    console.log("\n🔹 Manager:");
    console.log("   Email: manager@wanttar.in");
    console.log("   Password: Manager@123");
    console.log("   Permissions: Orders, Products, Coupons, Categories, Users, Content");
    
    console.log("\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding admin roles:");
    console.error(error);
    process.exit(1);
  }
};

// Run the seed function
seedAdminRoles();
