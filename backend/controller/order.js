const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");

// create new order
router.post(
  "/create-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      //   group cart items by shopId
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // create an order for each shop
      const orders = [];

      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update order status for seller    ---------------(product)
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      
      if (req.body.status === "Transferred to delivery partner") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      // Add status to history
      order.statusHistory.push({
        status: req.body.status,
        timestamp: new Date(),
        note: req.body.note || getStatusNote(req.body.status)
      });

      order.status = req.body.status;

      // Set tracking info if provided
      if (req.body.trackingNumber) {
        order.trackingNumber = req.body.trackingNumber;
      }
      if (req.body.courierPartner) {
        order.courierPartner = req.body.courierPartner;
      }
      if (req.body.estimatedDelivery) {
        order.estimatedDelivery = new Date(req.body.estimatedDelivery);
      }

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharge = order.totalPrice * 0.1;
        await updateSellerInfo(order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });

      function getStatusNote(status) {
        const notes = {
          "Processing": "Your order is being prepared",
          "Transferred to delivery partner": "Order picked up by delivery partner",
          "Shipping": "Order is in transit",
          "Received": "Order reached destination city",
          "On the way": "Delivery executive is on the way",
          "Delivered": "Order delivered successfully"
        };
        return notes[status] || "Status updated";
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock -= qty;
        product.sold_out += qty;

        await product.save({ validateBeforeSave: false });
      }

      async function updateSellerInfo(amount) {
        const seller = await Shop.findById(req.seller.id);

        seller.availableBalance = amount;

        await seller.save();
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order Refund successfull!",
      });

      if (req.body.status === "Refund Success") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock += qty;
        product.sold_out -= qty;

        await product.save({ validateBeforeSave: false });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// check coordinates status --- for debugging
router.get(
  "/check-coordinates-status",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalOrders = await Order.countDocuments();
      const ordersWithCoords = await Order.countDocuments({
        'shippingAddress.latitude': { $exists: true, $ne: null },
        'shippingAddress.longitude': { $exists: true, $ne: null }
      });
      const ordersWithoutCoords = totalOrders - ordersWithCoords;

      // Get a sample order with coordinates
      const sampleOrderWithCoords = await Order.findOne({
        'shippingAddress.latitude': { $exists: true, $ne: null },
        'shippingAddress.longitude': { $exists: true, $ne: null }
      }).select('shippingAddress').limit(1);

      // Get a sample order without coordinates
      const sampleOrderWithoutCoords = await Order.findOne({
        $or: [
          { 'shippingAddress.latitude': { $exists: false } },
          { 'shippingAddress.longitude': { $exists: false } },
          { 'shippingAddress.latitude': null },
          { 'shippingAddress.longitude': null }
        ]
      }).select('shippingAddress').limit(1);

      res.status(200).json({
        success: true,
        stats: {
          totalOrders,
          ordersWithCoords,
          ordersWithoutCoords,
          percentage: totalOrders > 0 ? ((ordersWithCoords / totalOrders) * 100).toFixed(2) : 0
        },
        samples: {
          withCoordinates: sampleOrderWithCoords?.shippingAddress || null,
          withoutCoordinates: sampleOrderWithoutCoords?.shippingAddress || null
        }
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
