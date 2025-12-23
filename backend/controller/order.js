const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");
const NotificationService = require("../utils/NotificationService");
const sendMail = require("../utils/sendMail");
const { generateOrderConfirmationEmail, generateOrderCancellationEmail, generateRefundSuccessEmail, generateRefundRequestEmail } = require("../utils/emailTemplates");
const { generateInvoicePDF } = require("../utils/pdfGenerator");
const archiver = require('archiver');

// Helper function to get order number for display
const getOrderNumber = (order) => {
  // Use new orderNumber if available, otherwise fall back to old format
  return order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`;
};

// create new order
router.post(
  "/create-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo, subTotalPrice, shippingPrice, discountPrice, tax } = req.body;

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

      // Determine payment type early for processing logic
      const isCODOrder = paymentInfo && (
        paymentInfo.type === 'COD' || 
        paymentInfo.type === 'Cash on Delivery' || 
        paymentInfo.type === 'cash_on_delivery' ||
        paymentInfo.type === 'cod' ||
        paymentInfo.type?.toLowerCase().includes('cash') ||
        paymentInfo.type?.toLowerCase().includes('cod')
      );

      for (const [shopId, items] of shopItemsMap) {
        // Get shop information - handle admin products specially
        let shop = null;
        let shopName = 'Unknown Shop';
        
        if (shopId === 'admin') {
          // For admin-created products, use a default shop info
          shopName = 'Admin Store';
        } else {
          // For regular shop products, fetch shop info
          try {
            shop = await Shop.findById(shopId);
            shopName = shop?.name || 'Unknown Shop';
          } catch (error) {
            console.log(`Error fetching shop ${shopId}:`, error.message);
            shopName = 'Unknown Shop';
          }
        }
        
        // Calculate per-shop subtotal and proportional charges
        // Use finalPrice if available (attribute-based pricing), otherwise use discountPrice
        const shopSubTotal = items.reduce((total, item) => {
          const itemPrice = item.finalPrice || item.discountPrice;
          return total + (itemPrice * item.qty);
        }, 0);
        
        const totalCartValue = cart.reduce((total, item) => {
          const itemPrice = item.finalPrice || item.discountPrice;
          return total + (itemPrice * item.qty);
        }, 0);
        const proportionalShipping = totalCartValue > 0 ? (shopSubTotal / totalCartValue) * (shippingPrice || 0) : 0;
        const proportionalDiscount = totalCartValue > 0 ? (shopSubTotal / totalCartValue) * (discountPrice || 0) : 0;
        const proportionalTax = totalCartValue > 0 ? (shopSubTotal / totalCartValue) * (tax || 0) : 0;
        const shopTotalPrice = shopSubTotal + proportionalShipping + proportionalTax - proportionalDiscount;

        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice: shopTotalPrice,
          subTotalPrice: shopSubTotal,
          shippingPrice: proportionalShipping,
          discountPrice: proportionalDiscount,
          tax: proportionalTax,
          paymentInfo,
          shopId: shopId,
          shopName: shopName
        });
        orders.push(order);

        // Process payment to supplier wallet for online payments (PhonePe, Stripe, PayPal, etc.)
        // For COD, payment will be processed when order is delivered
        const isOnlinePayment = paymentInfo && paymentInfo.type && !isCODOrder;
        
        if (isOnlinePayment && shopId !== 'admin') {
          try {
            // Calculate seller earnings (minus platform service charge)
            const serviceCharge = shopTotalPrice * 0.1; // 10% platform fee
            const sellerEarnings = shopTotalPrice - serviceCharge;
            
            // Add money to seller's wallet immediately for online payments
            const shop = await Shop.findById(shopId);
            if (shop) {
              shop.availableBalance = (shop.availableBalance || 0) + sellerEarnings;
              await shop.save();
              
              console.log(`✅ Online payment processed: ₹${sellerEarnings} added to seller ${shopId} wallet (Order: ${getOrderNumber(order)})`);
            }
          } catch (sellerPaymentError) {
            console.error('Failed to process seller payment for online order:', sellerPaymentError);
            // Don't fail the order creation, just log the error
          }
        }

        // Create notification for new order
        if (shopId !== 'admin') {
          // Only create notifications for regular shops, not admin products
          await NotificationService.createOrderNotification(
            'New Order Received',
            `Order ${getOrderNumber(order)} for ${order.cart.length} items worth ₹${order.totalPrice}`,
            'new_order',
            order._id,
            null,
            [shopId]
          );
        }
      }

      // Send comprehensive order confirmation email to the user
      let emailSent = false;
      try {
        // Use the first order for email (they all have the same user and basic info)
        const firstOrder = orders[0];
        
        // Create a combined order object for email template if multiple orders
        const emailOrder = {
          ...firstOrder.toObject(),
          cart: cart, // Use the full cart from all shops
          totalPrice: totalPrice // Use the total price across all orders
        };

        const emailHTML = generateOrderConfirmationEmail(emailOrder, user);
        
        // Prepare email subject and message based on payment type
        const paymentMethod = isCODOrder ? 'Cash on Delivery (COD)' : (paymentInfo?.type || 'Online Payment');
        const emailSubject = `Order Confirmation - ${getOrderNumber(firstOrder)} (${paymentMethod})`;
        const emailMessage = `Dear ${user.name},\n\nYour order has been successfully placed!\n\nOrder Details:\n- Order Number: ${getOrderNumber(firstOrder)}\n- Total Amount: ₹${totalPrice}\n- Payment Method: ${paymentMethod}\n- Items: ${cart.length} products${isCODOrder ? '\n- Please keep the exact amount ready for delivery' : ''}\n\nYou can track your order at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/user/track-order/${firstOrder._id}\n\nThank you for shopping with us!\n\nBest regards,\nYour Store Team`;
        
        await sendMail({
          email: user.email,
          subject: emailSubject,
          message: emailMessage,
          html: emailHTML
        });

        emailSent = true;
        console.log(`Order confirmation email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError.message);
        // Don't throw error here as the order was created successfully
        // Just log the email error and continue
      }

      res.status(201).json({
        success: true,
        orders,
        message: emailSent ? 
          `Order placed successfully (${isCODOrder ? 'COD' : 'Online'} - Email confirmation sent)` : 
          `Order placed successfully (${isCODOrder ? 'COD' : 'Online'} - Email sending failed, but order is confirmed)`,
        emailSent: emailSent,
        paymentMethod: isCODOrder ? 'COD' : (paymentInfo?.type || 'Online')
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

// get single order by ID (admin only)
router.get(
  "/admin-get-order/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      res.status(200).json({
        success: true,
        order,
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
        
        // Only process payment to seller wallet for COD orders
        // Online payments are already processed during order creation
        const isCODOrder = order.paymentInfo && (
          order.paymentInfo.type === 'COD' || 
          order.paymentInfo.type === 'Cash on Delivery' || 
          order.paymentInfo.type === 'cash_on_delivery' ||
          order.paymentInfo.type === 'cod' ||
          order.paymentInfo.type?.toLowerCase().includes('cash') ||
          order.paymentInfo.type?.toLowerCase().includes('cod')
        );
        
        if (isCODOrder) {
          const serviceCharge = order.totalPrice * 0.1;
          await updateSellerInfo(order.shopId, order.totalPrice - serviceCharge);
          console.log(`✅ COD payment processed: ₹${order.totalPrice - serviceCharge} added to seller wallet (Order: ${getOrderNumber(order)})`);
        }
      }

      await order.save({ validateBeforeSave: false });

      // Create notification for order status update
      await NotificationService.createOrderStatusNotification(
        `Order Status Updated`,
        `Order ${getOrderNumber(order)} status changed to ${req.body.status}`,
        'order_status',
        order._id,
        order.user._id
      );

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

      async function updateSellerInfo(shopId, amount) {
        const seller = await Shop.findById(shopId);

        if (seller) {
          seller.availableBalance = (seller.availableBalance || 0) + amount;
          await seller.save();
        }
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

      // Send refund request email notification
      try {
        const emailHtml = generateRefundRequestEmail(order, order.user);
        await sendMail({
          email: process.env.SMPT_MAIL, // Send to admin/seller
          subject: `Refund Request - ${getOrderNumber(order)}`,
          html: emailHtml,
        });
        console.log('Refund request email sent successfully to admin:', process.env.SMPT_MAIL);
      } catch (emailError) {
        console.error('Failed to send refund request email:', emailError);
        // Continue even if email fails
      }

      // Create notification for refund request
      await NotificationService.createOrderStatusNotification(
        'Refund Request',
        `Refund requested for Order ${getOrderNumber(order)}`,
        'refund_request',
        order._id,
        order.user._id
      );

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

      // Send refund success email if status is "Refund Success"
      if (req.body.status === "Refund Success") {
        try {
          console.log('Attempting to send refund success email to:', order.user.email);
          const emailHtml = generateRefundSuccessEmail(order, order.user);
          await sendMail({
            email: order.user.email,
            subject: `Refund Processed - ${getOrderNumber(order)}`,
            html: emailHtml,
          });
          console.log('✅ Refund success email sent successfully to:', order.user.email);
        } catch (emailError) {
          console.error('❌ Failed to send refund success email:', emailError);
          console.error('Email config check:', {
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            user: process.env.SMPT_MAIL,
            hasPassword: !!process.env.SMPT_PASSWORD
          });
          // Don't fail the refund if email fails
        }

        // Restore product stock
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      res.status(200).json({
        success: true,
        message: "Order Refund successfull!",
      });

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

// Download invoice PDF (User for their own orders)
router.get(
  "/user-invoice-pdf/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }

      // Check if this order belongs to the authenticated user
      const userId = req.user.id || req.user._id;
      if (order.user._id.toString() !== userId.toString()) {
        return next(new ErrorHandler("You can only download invoices for your own orders", 403));
      }

      // Populate cart items with current product GST configuration
      const Product = require("../model/product");
      if (order.cart && order.cart.length > 0) {
        for (let i = 0; i < order.cart.length; i++) {
          const cartItem = order.cart[i];
          if (cartItem._id) {
            try {
              const product = await Product.findById(cartItem._id).select('gstConfiguration');
              if (product && product.gstConfiguration) {
                order.cart[i].gstConfiguration = product.gstConfiguration;
              }
            } catch (productError) {
              console.log(`Could not fetch GST config for product ${cartItem._id}:`, productError.message);
              // Continue without GST config for this item
            }
          }
        }
      }

      // Get shop information if available
      let shop = null;
      if (order.cart && order.cart.length > 0 && order.cart[0].shopId) {
        const shopId = order.cart[0].shopId;
        
        // Check if shopId is a valid ObjectId (not "admin" or other string)
        if (shopId !== "admin" && mongoose.Types.ObjectId.isValid(shopId)) {
          shop = await Shop.findById(shopId).select('name email phoneNumber address');
        } else {
          // Handle admin products or invalid shopId
          shop = {
            name: "Platform Store",
            email: "support@platform.com",
            phoneNumber: "Customer Service",
            address: "Online Platform"
          };
        }
      }

      // Generate PDF
      const pdfData = await generateInvoicePDF(order, shop);
      
      // Convert to Buffer if it's a Uint8Array (from Puppeteer)
      const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
      
      // Set response headers
      const orderNumber = getOrderNumber(order);
      const filename = `Invoice_${orderNumber.replace('#', '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF buffer
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('User PDF generation error:', error);
      return next(new ErrorHandler(`Failed to generate PDF: ${error.message}`, 500));
    }
  })
);

// Download invoice PDF (Admin only)
router.get(
  "/admin-invoice-pdf/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }

      // Populate cart items with current product GST configuration
      const Product = require("../model/product");
      if (order.cart && order.cart.length > 0) {
        for (let i = 0; i < order.cart.length; i++) {
          const cartItem = order.cart[i];
          if (cartItem._id) {
            try {
              const product = await Product.findById(cartItem._id).select('gstConfiguration');
              if (product && product.gstConfiguration) {
                order.cart[i].gstConfiguration = product.gstConfiguration;
              }
            } catch (productError) {
              console.log(`Could not fetch GST config for product ${cartItem._id}:`, productError.message);
              // Continue without GST config for this item
            }
          }
        }
      }

      // Get shop information if available
      let shop = null;
      if (order.cart && order.cart.length > 0 && order.cart[0].shopId) {
        const shopId = order.cart[0].shopId;
        
        // Check if shopId is a valid ObjectId (not "admin" or other string)
        if (shopId !== "admin" && mongoose.Types.ObjectId.isValid(shopId)) {
          shop = await Shop.findById(shopId).select('name email phoneNumber address');
        } else {
          // Handle admin products or invalid shopId
          shop = {
            name: "Admin Tagged",
            email: "admin@platform.com",
            phoneNumber: "N/A",
            address: "Platform Headquarters"
          };
        }
      }

      // Generate PDF
      const pdfData = await generateInvoicePDF(order, shop);
      
      // Convert to Buffer if it's a Uint8Array (from Puppeteer)
      const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
      
      // Set response headers
      const orderNumber = getOrderNumber(order);
      const filename = `Invoice_${orderNumber.replace('#', '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF buffer
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      return next(new ErrorHandler(`Failed to generate PDF: ${error.message}`, 500));
    }
  })
);

// Download invoice PDF (Seller only)
router.get(
  "/seller-invoice-pdf/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }

      // Check if this order belongs to the seller's shop
      const sellerId = req.seller.id || req.seller._id;
      const orderBelongsToSeller = order.cart && order.cart.some(item => 
        item.shopId && item.shopId.toString() === sellerId.toString()
      );

      if (!orderBelongsToSeller) {
        return next(new ErrorHandler("You can only download invoices for your own orders", 403));
      }

      // Populate cart items with current product GST configuration
      const Product = require("../model/product");
      if (order.cart && order.cart.length > 0) {
        for (let i = 0; i < order.cart.length; i++) {
          const cartItem = order.cart[i];
          if (cartItem._id) {
            try {
              const product = await Product.findById(cartItem._id).select('gstConfiguration');
              if (product && product.gstConfiguration) {
                order.cart[i].gstConfiguration = product.gstConfiguration;
              }
            } catch (productError) {
              console.log(`Could not fetch GST config for product ${cartItem._id}:`, productError.message);
              // Continue without GST config for this item
            }
          }
        }
      }

      // Get seller's shop information
      const shop = await Shop.findById(sellerId).select('name email phoneNumber address');
      
      if (!shop) {
        return next(new ErrorHandler("Shop not found", 404));
      }

      // Generate order number for filename
      const orderNumber = order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`;

      // Generate PDF
      const pdfData = await generateInvoicePDF(order, shop);

      // Convert to buffer if needed
      const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);

      // Set response headers for PDF download
      const filename = `Invoice_${orderNumber.replace('#', '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF buffer
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('Seller PDF generation error:', error);
      return next(new ErrorHandler(`Failed to generate PDF: ${error.message}`, 500));
    }
  })
);

// Preview invoice HTML (Admin only) - for debugging
router.get(
  "/admin-invoice-preview/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return next(new ErrorHandler("Order not found", 404));
      }

      // Get shop information if available
      let shop = null;
      if (order.cart && order.cart.length > 0 && order.cart[0].shopId) {
        const shopId = order.cart[0].shopId;
        
        // Check if shopId is a valid ObjectId (not "admin" or other string)
        if (shopId !== "admin" && mongoose.Types.ObjectId.isValid(shopId)) {
          shop = await Shop.findById(shopId).select('name email phoneNumber address');
        } else {
          // Handle admin products or invalid shopId
          shop = {
            name: "Admin Tagged",
            email: "admin@platform.com",
            phoneNumber: "N/A",
            address: "Platform Headquarters"
          };
        }
      }

      // Import the HTML generator
      const { generateInvoiceHTML } = require("../utils/pdfGenerator");
      
      // Generate and return HTML
      const htmlContent = generateInvoiceHTML(order, shop);
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
      
    } catch (error) {
      console.error('HTML generation error:', error);
      return next(new ErrorHandler(`Failed to generate preview: ${error.message}`, 500));
    }
  })
);

// Download multiple invoices as ZIP (Admin only)
router.post(
  "/admin-batch-invoices-zip",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { orderIds } = req.body;
      
      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return next(new ErrorHandler("Order IDs array is required", 400));
      }
      
      if (orderIds.length > 50) {
        return next(new ErrorHandler("Maximum 50 invoices can be downloaded at once", 400));
      }

      // Fetch all orders
      const orders = await Order.find({ _id: { $in: orderIds } });
      
      if (orders.length === 0) {
        return next(new ErrorHandler("No valid orders found", 404));
      }

      console.log(`Generating ${orders.length} invoices for batch download...`);

      // Set response headers for ZIP file
      const zipFilename = `Invoices_Batch_${new Date().toISOString().split('T')[0]}_${Date.now()}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

      // Create ZIP archive
      const archive = archiver('zip', {
        zlib: { level: 9 } // Best compression
      });

      // Handle archive errors
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        return next(new ErrorHandler(`Failed to create ZIP file: ${err.message}`, 500));
      });

      // Pipe archive data to response
      archive.pipe(res);

      // Generate PDFs and add to archive
      for (const order of orders) {
        try {
          // Get shop information if available
          let shop = null;
          if (order.cart && order.cart.length > 0 && order.cart[0].shopId) {
            const shopId = order.cart[0].shopId;
            
            // Check if shopId is a valid ObjectId (not "admin" or other string)
            if (shopId !== "admin" && mongoose.Types.ObjectId.isValid(shopId)) {
              shop = await Shop.findById(shopId).select('name email phoneNumber address');
            } else {
              // Handle admin products or invalid shopId
              console.log(`Order ${order._id} has admin product or invalid shopId: ${shopId}`);
              shop = {
                name: "Admin Tagged",
                email: "admin@platform.com",
                phoneNumber: "N/A",
                address: "Platform Headquarters"
              };
            }
          }

          // Generate PDF
          console.log(`Generating PDF for order ${order._id}...`);
          const pdfData = await generateInvoicePDF(order, shop);
          
          // Convert to Buffer if it's a Uint8Array (from Puppeteer)
          const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
          
          // Validate PDF buffer
          if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error(`Invalid PDF buffer generated for order ${order._id}`);
          }
          
          console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);
          
          // Create filename
          const orderNumber = getOrderNumber(order);
          const filename = `Invoice_${orderNumber.replace('#', '')}_${order.createdAt.toISOString().split('T')[0]}.pdf`;
          
          // Add PDF to archive - ensure we're passing a valid buffer
          archive.append(pdfBuffer, { name: filename });
          
          console.log(`✓ Generated: ${filename} (${pdfBuffer.length} bytes)`);
          
        } catch (pdfError) {
          console.error(`Failed to generate PDF for order ${order._id}:`, pdfError);
          // Add error file to archive
          const errorContent = `Failed to generate invoice for Order ${getOrderNumber(order)}\nError: ${pdfError.message}\nGenerated on: ${new Date().toISOString()}`;
          const errorBuffer = Buffer.from(errorContent, 'utf8');
          archive.append(errorBuffer, { 
            name: `ERROR_Order_${getOrderNumber(order).replace('#', '')}.txt` 
          });
        }
      }

      // Add summary file
      const summary = {
        generated_on: new Date().toISOString(),
        total_orders: orders.length,
        successful_invoices: orders.length,
        orders: orders.map(order => ({
          order_id: order._id,
          order_number: getOrderNumber(order),
          customer_name: order.user.name,
          customer_email: order.user.email,
          total_amount: order.totalPrice,
          status: order.status,
          created_at: order.createdAt
        }))
      };
      
      // Add summary as buffer to ensure proper handling
      const summaryBuffer = Buffer.from(JSON.stringify(summary, null, 2), 'utf8');
      archive.append(summaryBuffer, { name: 'batch_summary.json' });

      // Finalize archive with promise handling
      console.log('Finalizing archive...');
      archive.finalize().then(() => {
        console.log(`Batch invoice ZIP generated successfully: ${zipFilename}`);
      }).catch((finalizeError) => {
        console.error('Archive finalization error:', finalizeError);
      });
      
    } catch (error) {
      console.error('Batch invoice generation error:', error);
      return next(new ErrorHandler(`Failed to generate batch invoices: ${error.message}`, 500));
    }
  })
);

// Get orders summary for admin dashboard with pagination and filters
router.get(
  "/admin-orders-summary",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        startDate,
        endDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      let query = {};
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }
      
      if (search) {
        query.$or = [
          { 'user.name': { $regex: search, $options: 'i' } },
          { 'user.email': { $regex: search, $options: 'i' } },
          { _id: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Get orders with pagination
      const orders = await Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('_id user totalPrice status createdAt paymentInfo cart');

      // Get total count
      const total = await Order.countDocuments(query);

      // Format orders for frontend
      const formattedOrders = orders.map(order => ({
        _id: order._id,
        orderNumber: getOrderNumber(order),
        customerName: order.user.name,
        customerEmail: order.user.email,
        totalAmount: order.totalPrice,
        status: order.status,
        paymentMethod: order.paymentInfo?.type || 'Unknown',
        paymentStatus: order.paymentInfo?.status || 'Pending',
        itemCount: order.cart.length,
        createdAt: order.createdAt,
        canDownloadInvoice: true
      }));

      res.status(200).json({
        success: true,
        orders: formattedOrders,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalOrders: total,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        },
        filters: {
          status,
          startDate,
          endDate,
          search,
          sortBy,
          sortOrder
        }
      });

    } catch (error) {
      console.error('Orders summary error:', error);
      return next(new ErrorHandler(`Failed to get orders summary: ${error.message}`, 500));
    }
  })
);

// Admin cancel order
router.put(
  "/admin-cancel-order/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { reason } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 404));
      }

      // Check if order can be cancelled
      if (order.status === "Cancelled") {
        return next(new ErrorHandler("Order is already cancelled", 400));
      }

      if (order.status === "Delivered") {
        return next(new ErrorHandler("Cannot cancel delivered order", 400));
      }

      // Update order status to cancelled
      order.status = "Cancelled";
      order.cancelledAt = new Date();
      order.cancellationReason = reason || "Cancelled by admin";

      // Add status to history
      order.statusHistory.push({
        status: "Cancelled",
        timestamp: new Date(),
        note: reason || "Order cancelled by admin"
      });

      // Restore stock for cancelled items
      for (const item of order.cart) {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: item.qty }
        });
      }

      await order.save({ validateBeforeSave: false });

      // Send cancellation email to customer
      try {
        const emailHtml = generateOrderCancellationEmail(order, order.user, reason);
        await sendMail({
          email: order.user.email,
          subject: `Order Cancelled - ${getOrderNumber(order)}`,
          html: emailHtml,
        });
        console.log('Cancellation email sent successfully to:', order.user.email);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
        // Don't fail the cancellation if email fails
      }

      // Create notification for order cancellation
      try {
        await NotificationService.createOrderStatusNotification(
          `Order Cancelled`,
          `Order ${getOrderNumber(order)} has been cancelled by admin. ${reason ? `Reason: ${reason}` : ''}`,
          order.user._id,
          order._id,
          'cancelled'
        );
      } catch (notificationError) {
        console.error('Failed to create cancellation notification:', notificationError);
      }

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully and customer has been notified",
        order: {
          _id: order._id,
          status: order.status,
          cancelledAt: order.cancelledAt,
          cancellationReason: order.cancellationReason
        }
      });
    } catch (error) {
      console.error('Order cancellation error:', error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
