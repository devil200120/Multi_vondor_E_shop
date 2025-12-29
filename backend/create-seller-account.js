const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: "./config/.env" });

// Import models
const Shop = require("./model/shop");
const Subscription = require("./model/subscription");

const createSellerAccount = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to database\n");

    const sellerEmail = "subhankardash45585@gmail.com";
    
    // Check if seller already exists
    const existingSeller = await Shop.findOne({ email: sellerEmail });
    if (existingSeller) {
      console.log("✅ Found existing seller account!");
      console.log("Shop ID:", existingSeller._id);
      console.log("Shop Name:", existingSeller.name);
      console.log("Email:", existingSeller.email);
      
      // Check subscription
      const existingSubscription = await Subscription.findOne({ shop: existingSeller._id });
      if (existingSubscription) {
        console.log("\n📦 Current Subscription:");
        console.log("Plan:", existingSubscription.plan);
        console.log("Status:", existingSubscription.status);
        console.log("Max Products:", existingSubscription.maxProducts);
        console.log("Valid Until:", existingSubscription.endDate.toDateString());
        
        // Update to Gold subscription
        console.log("\n⬆️  Upgrading to Gold subscription...");
        await upgradeSubscription(existingSubscription);
      } else {
        console.log("\n❌ No subscription found. Creating Gold subscription...");
        await createSubscription(existingSeller._id);
      }
      
      console.log("\n🎉 All done! You can now login with:");
      console.log("Email:", sellerEmail);
      console.log("Password: password123");
      console.log("\n🔗 Login at: http://localhost:3000/shop-login");
      
      await mongoose.connection.close();
      console.log("\n✅ Database connection closed");
      return;
    }

    console.log("📝 Creating new seller account...\n");

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create seller account
    const newShop = await Shop.create({
      name: "Test Shop",
      email: sellerEmail,
      password: hashedPassword,
      phoneNumber: "1234567890",
      address: "Test Address, Bangalore, Karnataka",
      zipCode: "560001",
      avatar: {
        public_id: "default",
        url: "https://via.placeholder.com/150",
      },
      paypalEmail: sellerEmail, // Required for payments
      accountHolderName: "Subhankar Dash",
      accountNumber: "1234567890",
      bankName: "Test Bank",
      ifscCode: "TEST0001234",
      accountType: "savings",
      latitude: "12.9716",
      longitude: "77.5946",
      role: "Seller",
      availableBalance: 0,
      transections: [],
    });

    console.log("✅ Seller account created successfully!");
    console.log("Shop ID:", newShop._id);
    console.log("Shop Name:", newShop.name);
    console.log("Email:", newShop.email);
    console.log("Password: password123");
    console.log("PayPal Email:", newShop.paypalEmail);

    // Create subscription
    await createSubscription(newShop._id);

    console.log("\n🎉 All done! You can now login with:");
    console.log("Email:", sellerEmail);
    console.log("Password: password123");
    console.log("\n🔗 Login at: http://localhost:3000/shop-login");

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
};

const createSubscription = async (shopId) => {
  try {
    // Create a premium subscription (Gold plan)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12); // 1 year subscription

    const subscription = await Subscription.create({
      shop: shopId, // Changed from shopId to shop
      plan: "gold", // Changed from planName/planId to plan
      maxProducts: 100, // Required field
      features: {
        businessProfile: true,
        logo: true,
        pdfUpload: true,
        imagesPerProduct: 8,
        videoOption: true,
        contactSeller: true,
        htmlCssEditor: true,
        adPreApproval: true,
      },
      monthlyPrice: 0, // Required field - free for testing
      billingCycle: "12-months", // Changed from "annual" to valid enum
      discountPercent: 0,
      finalPrice: 0, // Required field - free for testing
      status: "active",
      startDate: startDate,
      endDate: endDate,
      paymentMethod: "admin", // Manual activation
      lastPaymentDate: new Date(),
      lastPaymentAmount: 0,
    });

    console.log("\n✅ Subscription created successfully!");
    console.log("Plan:", subscription.plan);
    console.log("Status:", subscription.status);
    console.log("Valid Until:", subscription.endDate.toDateString());
    console.log("Max Products:", subscription.maxProducts);

    return subscription;
  } catch (error) {
    console.error("❌ Error creating subscription:", error.message);
    throw error;
  }
};

const upgradeSubscription = async (subscription) => {
  try {
    // Upgrade to Gold plan
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12); // Extend 1 year from now

    subscription.plan = "gold";
    subscription.maxProducts = 100;
    subscription.features = {
      businessProfile: true,
      logo: true,
      pdfUpload: true,
      imagesPerProduct: 8,
      videoOption: true,
      contactSeller: true,
      htmlCssEditor: true,
      adPreApproval: true,
    };
    subscription.monthlyPrice = 300; // Gold plan monthly price
    subscription.billingCycle = "12-months";
    subscription.discountPercent = 20; // 20% discount for 12-months
    subscription.finalPrice = 2880; // 300 * 12 * 0.8 = 2880 (with 20% discount)
    subscription.status = "active";
    subscription.endDate = endDate;
    subscription.lastPaymentDate = new Date();
    subscription.lastPaymentAmount = 2880;

    await subscription.save();

    console.log("✅ Successfully upgraded to Gold!");
    console.log("Plan:", subscription.plan);
    console.log("Status:", subscription.status);
    console.log("Max Products:", subscription.maxProducts);
    console.log("Monthly Price: $" + subscription.monthlyPrice);
    console.log("Final Price (12-months): $" + subscription.finalPrice);
    console.log("Valid Until:", subscription.endDate.toDateString());

    return subscription;
  } catch (error) {
    console.error("❌ Error upgrading subscription:", error.message);
    throw error;
  }
};

// Run the script
createSellerAccount();
