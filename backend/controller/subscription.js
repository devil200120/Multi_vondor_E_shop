const express = require("express");
const router = express.Router();
const Subscription = require("../model/subscription");
const SubscriptionPlan = require("../model/subscriptionPlan");
const Shop = require("../model/shop");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const axios = require("axios");

// PayPal Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA";
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || "EH0vP4NgiaX9xhw8LDoZJaPkh6sw1lostSYjeQJQxjegPWyHlCYLQxlONQ11B03W3SrxzvKB6pD-gsdI";
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || "https://api-m.paypal.com"; // Use https://api-m.sandbox.paypal.com for sandbox

// Get PayPal access token
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('PayPal token error:', error.response?.data || error.message);
    throw new Error('Failed to get PayPal access token');
  }
};

// Default Subscription Plans (used for initial database seeding)
const DEFAULT_PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    maxProducts: 3,
    features: {
      businessProfile: true,
      logo: true,
      pdfUpload: false,
      imagesPerProduct: 2,
      videoOption: false,
      contactSeller: false,
      htmlCssEditor: false,
      adPreApproval: false,
    },
    sortOrder: 0,
  },
  bronze: {
    name: 'Bronze',
    monthlyPrice: 100,
    maxProducts: 5,
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
    sortOrder: 1,
  },
  silver: {
    name: 'Silver',
    monthlyPrice: 200,
    maxProducts: 15,
    features: {
      businessProfile: true,
      logo: true,
      pdfUpload: true,
      imagesPerProduct: 6,
      videoOption: true,
      contactSeller: true,
      htmlCssEditor: false,
      adPreApproval: false,
    },
    sortOrder: 2,
  },
  gold: {
    name: 'Gold',
    monthlyPrice: 300,
    maxProducts: 30,
    features: {
      businessProfile: true,
      logo: true,
      pdfUpload: true,
      imagesPerProduct: 6,
      videoOption: true,
      contactSeller: true,
      htmlCssEditor: true,
      adPreApproval: true,
    },
    sortOrder: 3,
  },
};

// Initialize default plans in database if they don't exist
const initializeDefaultPlans = async () => {
  try {
    // Check and add missing plans (including free plan for existing databases)
    for (const [planKey, planData] of Object.entries(DEFAULT_PLANS)) {
      const existingPlan = await SubscriptionPlan.findOne({ planKey });
      if (!existingPlan) {
        console.log(`Creating ${planKey} subscription plan...`);
        await SubscriptionPlan.create({
          planKey,
          ...planData,
          isActive: true,
        });
        console.log(`${planKey} plan created successfully`);
      }
    }
  } catch (error) {
    console.error('Error initializing default plans:', error.message);
  }
};

// Initialize plans on module load
initializeDefaultPlans();

// Helper function to get plans as object (for backward compatibility)
const getPlansAsObject = async () => {
  const plans = await SubscriptionPlan.find().sort({ sortOrder: 1 });
  const plansObject = {};
  for (const plan of plans) {
    plansObject[plan.planKey] = {
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      maxProducts: plan.maxProducts,
      features: plan.features,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    };
  }
  return plansObject;
};

// Get billing cycle discount
const getBillingCycleDiscount = (cycle) => {
  const discounts = {
    'monthly': 0,
    '3-months': 10,
    '6-months': 15,
    '12-months': 20,
  };
  return discounts[cycle] || 0;
};

// Calculate subscription end date
const calculateEndDate = (startDate, billingCycle) => {
  const endDate = new Date(startDate);
  switch (billingCycle) {
    case '3-months':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case '6-months':
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case '12-months':
      endDate.setMonth(endDate.getMonth() + 12);
      break;
    default: // monthly
      endDate.setMonth(endDate.getMonth() + 1);
  }
  return endDate;
};

// Get available subscription plans (for sellers - only active plans)
router.get(
  "/get-plans",
  catchAsyncErrors(async (req, res, next) => {
    // Get active plans from database
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ sortOrder: 1 });
    const activePlans = {};
    for (const plan of plans) {
      activePlans[plan.planKey] = {
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        maxProducts: plan.maxProducts,
        features: plan.features,
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
      };
    }
    
    res.status(200).json({
      success: true,
      plans: activePlans,
    });
  })
);

// Get seller's current subscription
router.get(
  "/my-subscription",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const Subscription = require('../model/subscription');
      const subscription = await Subscription.findOne({ shop: req.seller._id });
      
      if (!subscription) {
        return res.status(200).json({
          success: true,
          subscription: null,
          message: 'No active subscription',
        });
      }

      res.status(200).json({
        success: true,
        subscription: subscription,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create PayPal subscription
router.post(
  "/create-paypal-subscription",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { plan, billingCycle } = req.body;

      // Get plan from database
      const planDoc = await SubscriptionPlan.findOne({ planKey: plan, isActive: true });
      if (!planDoc) {
        return next(new ErrorHandler('Invalid subscription plan', 400));
      }

      const planDetails = planDoc;
      const discount = getBillingCycleDiscount(billingCycle);
      const monthlyPrice = planDetails.monthlyPrice;
      
      // Calculate months for billing cycle
      const months = billingCycle === '3-months' ? 3 : billingCycle === '6-months' ? 6 : billingCycle === '12-months' ? 12 : 1;
      const totalBeforeDiscount = monthlyPrice * months;
      const discountAmount = (totalBeforeDiscount * discount) / 100;
      const finalPrice = totalBeforeDiscount - discountAmount;

      // Get PayPal access token
      const accessToken = await getPayPalAccessToken();

      // Create PayPal order for subscription payment
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: finalPrice.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: totalBeforeDiscount.toFixed(2),
              },
              discount: {
                currency_code: 'USD',
                value: discountAmount.toFixed(2),
              },
            },
          },
          description: `${planDetails.name} Plan - ${billingCycle} (${discount}% discount)`,
        }],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/seller/subscription-success`,
          cancel_url: `${process.env.FRONTEND_URL}/seller/subscription-cancel`,
          brand_name: 'Mall of Cayman',
          user_action: 'PAY_NOW',
        },
      };

      const response = await axios.post(
        `${PAYPAL_API_URL}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Store subscription details temporarily (will be activated after payment)
      const startDate = new Date();
      const endDate = calculateEndDate(startDate, billingCycle);

      const subscription = await Subscription.create({
        shop: req.seller._id,
        plan,
        maxProducts: planDetails.maxProducts,
        features: planDetails.features,
        monthlyPrice,
        billingCycle,
        discountPercent: discount,
        finalPrice,
        status: 'pending',
        startDate,
        endDate,
        nextBillingDate: endDate,
        paypalSubscriptionId: response.data.id,
      });

      res.status(200).json({
        success: true,
        orderId: response.data.id,
        approvalUrl: response.data.links.find(link => link.rel === 'approve')?.href,
        subscription: subscription._id,
      });
    } catch (error) {
      console.error('PayPal subscription creation error:', error.response?.data || error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Capture PayPal payment and activate subscription
router.post(
  "/activate-subscription",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { orderId, subscriptionId } = req.body;

      // Get PayPal access token
      const accessToken = await getPayPalAccessToken();

      // Capture the payment
      const captureResponse = await axios.post(
        `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (captureResponse.data.status !== 'COMPLETED') {
        return next(new ErrorHandler('Payment not completed', 400));
      }

      // Update subscription status
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        return next(new ErrorHandler('Subscription not found', 404));
      }

      subscription.status = 'active';
      subscription.lastPaymentDate = new Date();
      subscription.lastPaymentAmount = subscription.finalPrice;
      subscription.paymentHistory.push({
        amount: subscription.finalPrice,
        status: 'success',
        transactionId: captureResponse.data.id,
        billingPeriodStart: subscription.startDate,
        billingPeriodEnd: subscription.endDate,
      });
      await subscription.save();

      // Update shop subscription
      const shop = await Shop.findById(req.seller._id);
      shop.subscriptionPlan = subscription.plan;
      shop.currentSubscription = subscription._id;
      await shop.save();

      res.status(200).json({
        success: true,
        message: 'Subscription activated successfully',
        subscription,
      });
    } catch (error) {
      console.error('Subscription activation error:', error.response?.data || error.message);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Cancel subscription (at end of billing cycle)
router.post(
  "/cancel-subscription",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { reason } = req.body;
      const shop = await Shop.findById(req.seller._id).populate('currentSubscription');

      if (!shop.currentSubscription) {
        return next(new ErrorHandler('No active subscription found', 404));
      }

      const subscription = shop.currentSubscription;
      subscription.cancellationRequested = true;
      subscription.cancellationDate = subscription.endDate; // Cancel at end of cycle
      subscription.cancellationReason = reason;
      await subscription.save();

      res.status(200).json({
        success: true,
        message: `Subscription will be cancelled on ${subscription.endDate.toDateString()}`,
        subscription,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get all subscriptions
router.get(
  "/admin/all-subscriptions",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const subscriptions = await Subscription.find()
        .populate('shop', 'name email subscriptionPlan')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        subscriptions,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get subscription statistics
router.get(
  "/admin/subscription-stats",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const stats = await Subscription.aggregate([
        {
          $group: {
            _id: '$plan',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$finalPrice' },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
          },
        },
      ]);

      const totalSubscriptions = await Subscription.countDocuments();
      const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
      const expiringSubscriptions = await Subscription.countDocuments({
        status: 'active',
        endDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Within 7 days
      });

      res.status(200).json({
        success: true,
        stats: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          expiringSoon: expiringSubscriptions,
          byPlan: stats,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Cancel subscription immediately
router.put(
  "/admin/cancel-subscription/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const subscription = await Subscription.findById(req.params.id).populate('shop');

      if (!subscription) {
        return next(new ErrorHandler('Subscription not found', 404));
      }

      if (subscription.status === 'cancelled') {
        return next(new ErrorHandler('Subscription is already cancelled', 400));
      }

      // Update subscription status
      subscription.status = 'cancelled';
      subscription.cancellationRequested = true;
      subscription.cancellationDate = new Date();
      subscription.cancellationReason = 'Cancelled by admin';
      await subscription.save();

      // Update shop subscription status
      if (subscription.shop) {
        const shop = await Shop.findById(subscription.shop._id);
        if (shop) {
          shop.subscriptionPlan = null;
          shop.currentSubscription = null;
          await shop.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully',
        subscription,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Change seller subscription plan (upgrade/downgrade)
router.put(
  "/admin/change-subscription/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { newPlan, billingCycle, reason } = req.body;
      const subscriptionId = req.params.id;

      // Validate new plan exists
      const planDoc = await SubscriptionPlan.findOne({ planKey: newPlan, isActive: true });
      if (!planDoc) {
        return next(new ErrorHandler('Invalid subscription plan', 400));
      }

      // Get current subscription
      const subscription = await Subscription.findById(subscriptionId).populate('shop');
      if (!subscription) {
        return next(new ErrorHandler('Subscription not found', 404));
      }

      const oldPlan = subscription.plan;
      const cycle = billingCycle || subscription.billingCycle;
      const discount = getBillingCycleDiscount(cycle);
      const monthlyPrice = planDoc.monthlyPrice;
      
      // Calculate months for billing cycle
      const months = cycle === '3-months' ? 3 : cycle === '6-months' ? 6 : cycle === '12-months' ? 12 : 1;
      const totalBeforeDiscount = monthlyPrice * months;
      const discountAmount = (totalBeforeDiscount * discount) / 100;
      const finalPrice = totalBeforeDiscount - discountAmount;

      // Update subscription with new plan
      subscription.plan = newPlan;
      subscription.maxProducts = planDoc.maxProducts;
      subscription.features = planDoc.features;
      subscription.monthlyPrice = monthlyPrice;
      if (billingCycle) subscription.billingCycle = billingCycle;
      subscription.discountPercent = discount;
      subscription.finalPrice = finalPrice;
      subscription.status = 'active';
      subscription.updatedAt = new Date();
      
      // Add to payment history as admin change
      subscription.paymentHistory.push({
        amount: 0,
        date: new Date(),
        status: 'success',
        transactionId: `ADMIN_CHANGE_${Date.now()}`,
        billingPeriodStart: subscription.startDate,
        billingPeriodEnd: subscription.endDate,
      });

      await subscription.save();

      // Update shop subscription plan
      if (subscription.shop) {
        const shop = await Shop.findById(subscription.shop._id);
        if (shop) {
          shop.subscriptionPlan = newPlan;
          await shop.save();
        }
      }

      res.status(200).json({
        success: true,
        message: `Subscription changed from ${oldPlan} to ${newPlan} successfully`,
        subscription,
        changes: {
          oldPlan,
          newPlan,
          reason: reason || 'Admin change',
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Create subscription for a shop (assign free or paid plan)
router.post(
  "/admin/create-subscription",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { shopId, plan, billingCycle, durationMonths, isFree, reason } = req.body;

      // Validate shop exists
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler('Shop not found', 404));
      }

      // Check if shop already has an active subscription
      const existingSubscription = await Subscription.findOne({
        shop: shopId,
        status: 'active',
      });

      if (existingSubscription) {
        return next(new ErrorHandler('Shop already has an active subscription. Please change or cancel it first.', 400));
      }

      // Validate plan exists
      const planDoc = await SubscriptionPlan.findOne({ planKey: plan, isActive: true });
      if (!planDoc) {
        return next(new ErrorHandler('Invalid subscription plan', 400));
      }

      const cycle = billingCycle || 'monthly';
      const discount = getBillingCycleDiscount(cycle);
      const monthlyPrice = isFree ? 0 : planDoc.monthlyPrice;
      
      // Calculate months for billing cycle or custom duration
      let months;
      if (durationMonths) {
        months = durationMonths;
      } else {
        months = cycle === '3-months' ? 3 : cycle === '6-months' ? 6 : cycle === '12-months' ? 12 : 1;
      }
      
      const totalBeforeDiscount = monthlyPrice * months;
      const discountAmount = (totalBeforeDiscount * discount) / 100;
      const finalPrice = isFree ? 0 : (totalBeforeDiscount - discountAmount);

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);

      // Create new subscription
      const subscription = await Subscription.create({
        shop: shopId,
        plan,
        maxProducts: planDoc.maxProducts,
        features: planDoc.features,
        monthlyPrice: isFree ? 0 : planDoc.monthlyPrice,
        billingCycle: cycle,
        discountPercent: discount,
        finalPrice,
        status: 'active',
        startDate,
        endDate,
        nextBillingDate: endDate,
        paymentMethod: 'admin',
        paypalSubscriptionId: `ADMIN_ASSIGNED_${Date.now()}`,
        lastPaymentDate: new Date(),
        lastPaymentAmount: finalPrice,
        paymentHistory: [{
          amount: finalPrice,
          date: new Date(),
          status: 'success',
          transactionId: `ADMIN_ASSIGNED_${Date.now()}`,
          billingPeriodStart: startDate,
          billingPeriodEnd: endDate,
        }],
      });

      // Update shop with new subscription
      shop.subscriptionPlan = plan;
      shop.currentSubscription = subscription._id;
      await shop.save();

      res.status(201).json({
        success: true,
        message: `${isFree ? 'Free' : ''} ${plan} subscription assigned to ${shop.name} successfully`,
        subscription,
        details: {
          shop: shop.name,
          plan,
          duration: `${months} month(s)`,
          price: isFree ? 'Free (assigned by admin)' : `$${finalPrice}`,
          startDate,
          endDate,
          reason: reason || 'Assigned by admin',
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get shops without active subscription
router.get(
  "/admin/shops-without-subscription",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Get all shop IDs that have active subscriptions
      const activeSubscriptions = await Subscription.find({ status: 'active' }).select('shop');
      const shopsWithSubscription = activeSubscriptions.map(sub => sub.shop.toString());

      // Get all shops without active subscription (including pending approval)
      const shopsWithoutSubscription = await Shop.find({
        _id: { $nin: shopsWithSubscription },
      }).select('_id name email avatar phoneNumber createdAt subscriptionPlan approvalStatus');

      res.status(200).json({
        success: true,
        shops: shopsWithoutSubscription,
        count: shopsWithoutSubscription.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get all subscription plans
router.get(
  "/admin/manage-plans",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const plans = await SubscriptionPlan.find().sort({ sortOrder: 1 });
      const plansObject = {};
      for (const plan of plans) {
        plansObject[plan.planKey] = {
          name: plan.name,
          monthlyPrice: plan.monthlyPrice,
          maxProducts: plan.maxProducts,
          features: plan.features,
          isActive: plan.isActive,
          sortOrder: plan.sortOrder,
        };
      }
      res.status(200).json({
        success: true,
        plans: plansObject,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Create new subscription plan
router.post(
  "/admin/create-plan",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { planKey, name, monthlyPrice, maxProducts, features, isActive, sortOrder } = req.body;

      if (!planKey || !name || monthlyPrice === undefined || maxProducts === undefined) {
        return next(new ErrorHandler('Missing required fields', 400));
      }

      // Check if plan already exists
      const existingPlan = await SubscriptionPlan.findOne({ planKey: planKey.toLowerCase() });
      if (existingPlan) {
        return next(new ErrorHandler('Plan with this key already exists', 400));
      }

      // Get highest sort order
      const lastPlan = await SubscriptionPlan.findOne().sort({ sortOrder: -1 });
      const newSortOrder = sortOrder || (lastPlan ? lastPlan.sortOrder + 1 : 1);

      // Create new plan in database
      const newPlan = await SubscriptionPlan.create({
        planKey: planKey.toLowerCase(),
        name,
        monthlyPrice,
        maxProducts,
        features: features || {},
        isActive: isActive !== false,
        sortOrder: newSortOrder,
      });

      res.status(201).json({
        success: true,
        message: 'Subscription plan created successfully',
        plan: {
          name: newPlan.name,
          monthlyPrice: newPlan.monthlyPrice,
          maxProducts: newPlan.maxProducts,
          features: newPlan.features,
          isActive: newPlan.isActive,
          sortOrder: newPlan.sortOrder,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Update subscription plan
router.put(
  "/admin/update-plan/:planKey",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { planKey } = req.params;
      const { name, monthlyPrice, maxProducts, features, isActive, sortOrder } = req.body;

      const plan = await SubscriptionPlan.findOne({ planKey });
      if (!plan) {
        return next(new ErrorHandler('Plan not found', 404));
      }

      // Update plan details
      if (name !== undefined) plan.name = name;
      if (monthlyPrice !== undefined) plan.monthlyPrice = monthlyPrice;
      if (maxProducts !== undefined) plan.maxProducts = maxProducts;
      if (features !== undefined) plan.features = features;
      if (isActive !== undefined) plan.isActive = isActive;
      if (sortOrder !== undefined) plan.sortOrder = sortOrder;

      await plan.save();

      res.status(200).json({
        success: true,
        message: 'Subscription plan updated successfully',
        plan: {
          name: plan.name,
          monthlyPrice: plan.monthlyPrice,
          maxProducts: plan.maxProducts,
          features: plan.features,
          isActive: plan.isActive,
          sortOrder: plan.sortOrder,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Toggle plan active status
router.put(
  "/admin/toggle-plan/:planKey",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { planKey } = req.params;
      const { isActive } = req.body;

      const plan = await SubscriptionPlan.findOne({ planKey });
      if (!plan) {
        return next(new ErrorHandler('Plan not found', 404));
      }

      plan.isActive = isActive;
      await plan.save();

      res.status(200).json({
        success: true,
        message: `Plan ${isActive ? 'activated' : 'deactivated'} successfully`,
        plan: {
          name: plan.name,
          monthlyPrice: plan.monthlyPrice,
          maxProducts: plan.maxProducts,
          features: plan.features,
          isActive: plan.isActive,
          sortOrder: plan.sortOrder,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Delete subscription plan
router.delete(
  "/admin/delete-plan/:planKey",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { planKey } = req.params;

      const plan = await SubscriptionPlan.findOne({ planKey });
      if (!plan) {
        return next(new ErrorHandler('Plan not found', 404));
      }

      // Check if any active subscriptions use this plan
      const activeSubscriptions = await Subscription.countDocuments({
        plan: planKey,
        status: 'active',
      });

      if (activeSubscriptions > 0) {
        return next(
          new ErrorHandler(
            `Cannot delete plan with ${activeSubscriptions} active subscriptions. Please cancel all subscriptions first.`,
            400
          )
        );
      }

      await SubscriptionPlan.deleteOne({ planKey });

      res.status(200).json({
        success: true,
        message: 'Subscription plan deleted successfully',
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
