const mongoose = require("mongoose");
const Shop = require("./model/shop");
const Subscription = require("./model/subscription");
const path = require("path");

// Load environment variables from config/.env
require("dotenv").config({
  path: path.join(__dirname, "config", ".env")
});

// Connect to database
const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`MongoDB connected with server: ${data.connection.host}`);
    });
};

const SELLER_EMAIL = "devildecent716@gmail.com";

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  bronze: {
    plan: 'bronze',
    maxProducts: 50,
    features: {
      businessProfile: true,
      logo: true,
      pdfUpload: true,
      imagesPerProduct: 3,
      videoOption: false,
      contactSeller: false,
      htmlCssEditor: false,
      adPreApproval: false,
    },
    monthlyPrice: 25,
  },
  silver: {
    plan: 'silver',
    maxProducts: 100,
    features: {
      businessProfile: true,
      logo: true,
      pdfUpload: true,
      imagesPerProduct: 5,
      videoOption: true,
      contactSeller: true,
      htmlCssEditor: false,
      adPreApproval: false,
    },
    monthlyPrice: 50,
  },
  gold: {
    plan: 'gold',
    maxProducts: 999999, // unlimited
    features: {
      businessProfile: true,
      logo: true,
      pdfUpload: true,
      imagesPerProduct: 10,
      videoOption: true,
      contactSeller: true,
      htmlCssEditor: true,
      adPreApproval: true,
    },
    monthlyPrice: 100,
  },
  'revenue-share': {
    plan: 'revenue-share',
    maxProducts: 999999, // unlimited
    features: {
      businessProfile: true,
      logo: true,
      pdfUpload: true,
      imagesPerProduct: 10,
      videoOption: true,
      contactSeller: true,
      htmlCssEditor: true,
      adPreApproval: true,
    },
    monthlyPrice: 25, // minimum monthly payment
  },
};

const calculateEndDate = (billingCycle) => {
  const now = new Date();
  switch (billingCycle) {
    case '3-months':
      return new Date(now.setMonth(now.getMonth() + 3));
    case '6-months':
      return new Date(now.setMonth(now.getMonth() + 6));
    case '12-months':
      return new Date(now.setMonth(now.getMonth() + 12));
    default: // monthly
      return new Date(now.setMonth(now.getMonth() + 1));
  }
};

const calculateDiscount = (billingCycle) => {
  switch (billingCycle) {
    case '3-months':
      return 5; // 5% discount
    case '6-months':
      return 10; // 10% discount
    case '12-months':
      return 15; // 15% discount
    default:
      return 0;
  }
};

const createSubscription = async () => {
  try {
    connectDatabase();

    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find the seller by email
    const seller = await Shop.findOne({ email: SELLER_EMAIL });
    
    if (!seller) {
      console.error(`❌ Seller with email ${SELLER_EMAIL} not found!`);
      console.log("Please make sure the seller is registered in the system.");
      process.exit(1);
    }

    console.log(`✅ Found seller: ${seller.name} (${seller.email})`);

    // Choose subscription plan (you can change this to 'bronze', 'silver', 'gold', or 'revenue-share')
    const planType = 'gold'; // Change this to desired plan
    const billingCycle = '12-months'; // Change this to 'monthly', '3-months', '6-months', or '12-months'
    
    const planConfig = SUBSCRIPTION_PLANS[planType];
    const discountPercent = calculateDiscount(billingCycle);
    const startDate = new Date();
    const endDate = calculateEndDate(billingCycle);

    // Calculate billing months
    let billingMonths = 1;
    switch (billingCycle) {
      case '3-months':
        billingMonths = 3;
        break;
      case '6-months':
        billingMonths = 6;
        break;
      case '12-months':
        billingMonths = 12;
        break;
    }

    // Calculate final price
    const basePrice = planConfig.monthlyPrice * billingMonths;
    const finalPrice = basePrice * (1 - discountPercent / 100);

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({ shop: seller._id });
    
    if (existingSubscription) {
      console.log(`⚠️  Subscription already exists for this seller. Updating...`);
      
      // Update existing subscription
      existingSubscription.plan = planConfig.plan;
      existingSubscription.maxProducts = planConfig.maxProducts;
      existingSubscription.features = planConfig.features;
      existingSubscription.monthlyPrice = planConfig.monthlyPrice;
      existingSubscription.billingCycle = billingCycle;
      existingSubscription.discountPercent = discountPercent;
      existingSubscription.finalPrice = finalPrice;
      existingSubscription.status = 'active';
      existingSubscription.startDate = startDate;
      existingSubscription.endDate = endDate;
      existingSubscription.nextBillingDate = endDate;
      existingSubscription.paymentMethod = 'manual';
      existingSubscription.lastPaymentDate = new Date();
      existingSubscription.lastPaymentAmount = finalPrice;
      
      // Add payment history entry
      existingSubscription.paymentHistory.push({
        amount: finalPrice,
        date: new Date(),
        status: 'success',
        transactionId: `MANUAL_SEED_${Date.now()}`,
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate,
      });
      
      await existingSubscription.save();
      
      console.log(`✅ Subscription updated successfully!`);
      console.log(`   Plan: ${planConfig.plan.toUpperCase()}`);
      console.log(`   Billing Cycle: ${billingCycle}`);
      console.log(`   Base Price: $${basePrice}`);
      console.log(`   Discount: ${discountPercent}%`);
      console.log(`   Final Price: $${finalPrice.toFixed(2)}`);
      console.log(`   Start Date: ${startDate.toLocaleDateString()}`);
      console.log(`   End Date: ${endDate.toLocaleDateString()}`);
      console.log(`   Status: ${existingSubscription.status}`);
      
      // Update shop reference
      seller.currentSubscription = existingSubscription._id;
      seller.subscriptionPlan = planConfig.plan;
      await seller.save();
      
      console.log(`✅ Shop subscription reference updated!`);
      
    } else {
      // Create new subscription
      const subscription = await Subscription.create({
        shop: seller._id,
        plan: planConfig.plan,
        maxProducts: planConfig.maxProducts,
        features: planConfig.features,
        monthlyPrice: planConfig.monthlyPrice,
        billingCycle: billingCycle,
        discountPercent: discountPercent,
        finalPrice: finalPrice,
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        nextBillingDate: endDate,
        paymentMethod: 'manual',
        lastPaymentDate: new Date(),
        lastPaymentAmount: finalPrice,
        paymentHistory: [
          {
            amount: finalPrice,
            date: new Date(),
            status: 'success',
            transactionId: `MANUAL_SEED_${Date.now()}`,
            billingPeriodStart: startDate,
            billingPeriodEnd: endDate,
          }
        ],
      });

      console.log(`✅ Subscription created successfully!`);
      console.log(`   Plan: ${planConfig.plan.toUpperCase()}`);
      console.log(`   Billing Cycle: ${billingCycle}`);
      console.log(`   Base Price: $${basePrice}`);
      console.log(`   Discount: ${discountPercent}%`);
      console.log(`   Final Price: $${finalPrice.toFixed(2)}`);
      console.log(`   Start Date: ${startDate.toLocaleDateString()}`);
      console.log(`   End Date: ${endDate.toLocaleDateString()}`);
      console.log(`   Status: ${subscription.status}`);

      // Update shop with subscription reference
      seller.currentSubscription = subscription._id;
      seller.subscriptionPlan = planConfig.plan;
      await seller.save();

      console.log(`✅ Shop subscription reference updated!`);
    }

    console.log("\n🎉 Subscription setup completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error creating subscription:", error);
    process.exit(1);
  }
};

// Run the script
createSubscription();
