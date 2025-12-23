const Notification = require("../model/notification");
const User = require("../model/user");

// Notification helper functions
class NotificationService {
  // Create notification for new order
  static async createOrderNotification(order, shop) {
    try {
      // Get all admin users
      const adminUsers = await User.find({ role: "Admin" });
      
      // Create notification for each admin
      const adminNotifications = adminUsers.map(admin => ({
        recipient: admin._id,
        recipientType: "admin",
        type: "info",
        title: "New Order Received",
        message: `Order #${order._id.toString().slice(-8)} has been placed by ${order.user.name}`,
        data: {
          orderId: order._id,
          shopId: shop._id,
          totalPrice: order.totalPrice,
        },
        actionUrl: `/admin/order/${order._id}`,
      }));

      await Notification.insertMany(adminNotifications);

      // Create notification for shop owner
      if (shop.owner) {
        await Notification.create({
          recipient: shop.owner,
          recipientType: "seller",
          type: "success",
          title: "New Order Received",
          message: `You received a new order #${order._id.toString().slice(-8)} worth $${order.totalPrice}`,
          data: {
            orderId: order._id,
            totalPrice: order.totalPrice,
          },
          actionUrl: `/order/${order._id}`,
        });
      }
    } catch (error) {
      console.error("Error creating order notification:", error);
    }
  }

  // Create notification for low stock
  static async createLowStockNotification(product, shop) {
    try {
      // Get all admin users
      const adminUsers = await User.find({ role: "Admin" });
      
      const notifications = adminUsers.map(admin => ({
        recipient: admin._id,
        recipientType: "admin",
        type: "warning",
        title: "Low Stock Alert",
        message: `Product "${product.name}" is running low on stock (only ${product.stock} left)`,
        data: {
          productId: product._id,
          shopId: shop._id,
          currentStock: product.stock,
        },
        actionUrl: `/admin-products`,
      }));

      await Notification.insertMany(notifications);

      // Notify shop owner
      if (shop.owner) {
        await Notification.create({
          recipient: shop.owner,
          recipientType: "seller",
          type: "warning",
          title: "Low Stock Alert",
          message: `Your product "${product.name}" is running low on stock (${product.stock} remaining)`,
          data: {
            productId: product._id,
            currentStock: product.stock,
          },
          actionUrl: `/dashboard-products`,
        });
      }
    } catch (error) {
      console.error("Error creating low stock notification:", error);
    }
  }

  // Create notification for new user registration
  static async createUserRegistrationNotification(user) {
    try {
      const adminUsers = await User.find({ role: "Admin" });
      
      const notifications = adminUsers.map(admin => ({
        recipient: admin._id,
        recipientType: "admin",
        type: "info",
        title: "New User Registration",
        message: `New user "${user.name}" has registered on the platform`,
        data: {
          userId: user._id,
          userEmail: user.email,
        },
        actionUrl: `/admin-users`,
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Error creating user registration notification:", error);
    }
  }

  // Create notification for new shop registration
  static async createShopRegistrationNotification(shop) {
    try {
      const adminUsers = await User.find({ role: "Admin" });
      
      const notifications = adminUsers.map(admin => ({
        recipient: admin._id,
        recipientType: "admin",
        type: "info",
        title: "New Shop Registration",
        message: `New shop "${shop.name}" has been registered and requires verification`,
        data: {
          shopId: shop._id,
          shopEmail: shop.email,
        },
        actionUrl: `/admin-sellers`,
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Error creating shop registration notification:", error);
    }
  }

  // Create notification for payment received
  static async createPaymentNotification(order, payment) {
    try {
      const adminUsers = await User.find({ role: "Admin" });
      
      const notifications = adminUsers.map(admin => ({
        recipient: admin._id,
        recipientType: "admin",
        type: "success",
        title: "Payment Received",
        message: `Payment of $${payment.amount} received for order #${order._id.toString().slice(-8)}`,
        data: {
          orderId: order._id,
          paymentId: payment._id,
          amount: payment.amount,
        },
        actionUrl: `/admin/order/${order._id}`,
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Error creating payment notification:", error);
    }
  }

  // Create notification for seller verification
  static async createSellerVerificationNotification(shop, status) {
    try {
      const message = status === "approved" 
        ? `Shop "${shop.name}" has been approved and verified`
        : `Shop "${shop.name}" verification has been rejected`;

      const type = status === "approved" ? "success" : "error";

      if (shop.owner) {
        await Notification.create({
          recipient: shop.owner,
          recipientType: "seller",
          type: type,
          title: "Shop Verification Update",
          message: message,
          data: {
            shopId: shop._id,
            verificationStatus: status,
          },
          actionUrl: `/dashboard`,
        });
      }
    } catch (error) {
      console.error("Error creating seller verification notification:", error);
    }
  }

  // Create notification for shop approval/rejection
  static async createShopApprovalNotification(shop, status, adminUser, rejectionReason = null) {
    try {
      let message, type, title;
      
      if (status === "approved") {
        title = "Shop Approved";
        message = `Congratulations! Your shop "${shop.name}" has been approved by admin. You can now start selling.`;
        type = "success";
      } else if (status === "rejected") {
        title = "Shop Application Rejected";
        message = `Your shop "${shop.name}" application has been rejected. Reason: ${rejectionReason || 'No reason provided'}`;
        type = "error";
      } else {
        title = "New Shop Registration";
        message = `New shop "${shop.name}" is pending approval.`;
        type = "info";
      }

      if (status === "pending") {
        // Notify all admins about new shop registration
        const adminUsers = await User.find({ role: "Admin" });
        
        const notifications = adminUsers.map(admin => ({
          recipient: admin._id,
          recipientType: "admin",
          type: "info",
          title: "New Shop Registration - Approval Required",
          message: `Shop "${shop.name}" (${shop.email}) has registered and requires admin approval`,
          data: {
            shopId: shop._id,
            shopName: shop.name,
            shopEmail: shop.email,
            approvalStatus: status,
          },
          actionUrl: `/admin/pending-sellers`,
        }));

        await Notification.insertMany(notifications);
      } else {
        // Create notification that would be sent to shop owner (if they had a user account)
        // For now, we'll create a notification record that can be used for email purposes
        await Notification.create({
          recipient: null, // Shop doesn't have a user account yet
          recipientType: "seller",
          type: type,
          title: title,
          message: message,
          data: {
            shopId: shop._id,
            shopName: shop.name,
            shopEmail: shop.email,
            approvalStatus: status,
            adminId: adminUser ? adminUser._id : null,
            adminName: adminUser ? adminUser.name : null,
            rejectionReason: rejectionReason,
          },
          actionUrl: status === "approved" ? `/shop/dashboard` : null,
        });
      }
    } catch (error) {
      console.error("Error creating shop approval notification:", error);
    }
  }

  // Create notification for order status update
  static async createOrderStatusNotification(order, newStatus) {
    try {
      // Notify customer
      if (order.user) {
        await Notification.create({
          recipient: order.user._id,
          recipientType: "user",
          type: "info",
          title: "Order Status Updated",
          message: `Your order #${order._id.toString().slice(-8)} status has been updated to "${newStatus}"`,
          data: {
            orderId: order._id,
            newStatus: newStatus,
          },
          actionUrl: `/user/order/${order._id}`,
        });
      }

      // Notify admins for certain status changes
      if (["Cancelled", "Refund Success"].includes(newStatus)) {
        const adminUsers = await User.find({ role: "Admin" });
        
        const notifications = adminUsers.map(admin => ({
          recipient: admin._id,
          recipientType: "admin",
          type: "warning",
          title: "Order Status Alert",
          message: `Order #${order._id.toString().slice(-8)} has been ${newStatus.toLowerCase()}`,
          data: {
            orderId: order._id,
            newStatus: newStatus,
          },
          actionUrl: `/admin/order/${order._id}`,
        }));

        await Notification.insertMany(notifications);
      }
    } catch (error) {
      console.error("Error creating order status notification:", error);
    }
  }

  // Create notification for stock updates
  static async createStockNotification(title, message, type, productId, shopId, recipients) {
    try {
      const adminUsers = await User.find({ role: "Admin" });
      
      const notifications = adminUsers.map(admin => ({
        recipient: admin._id,
        recipientType: "admin",
        type: type === "stock_update" ? "info" : type === "low_stock" ? "warning" : "info",
        title: title,
        message: message,
        data: {
          productId: productId,
          shopId: shopId,
          actionType: type,
        },
        actionUrl: `/admin-products`,
      }));

      await Notification.insertMany(notifications);

      // If specific recipients are provided (like shop owners), notify them too
      if (recipients && recipients.length > 0) {
        const recipientNotifications = recipients.map(recipientId => ({
          recipient: recipientId,
          recipientType: "seller",
          type: type === "stock_update" ? "success" : type === "low_stock" ? "warning" : "info",
          title: title,
          message: message,
          data: {
            productId: productId,
            shopId: shopId,
            actionType: type,
          },
          actionUrl: `/dashboard-products`,
        }));

        await Notification.insertMany(recipientNotifications);
      }
    } catch (error) {
      console.error("Error creating stock notification:", error);
    }
  }

  // Create notification for product actions (create, update, delete)
  static async createProductNotification(title, message, type, productId, shopId, recipients) {
    try {
      const adminUsers = await User.find({ role: "Admin" });
      
      const notifications = adminUsers.map(admin => ({
        recipient: admin._id,
        recipientType: "admin",
        type: type === "new_product" ? "info" : type === "product_deleted" ? "warning" : "info",
        title: title,
        message: message,
        data: {
          productId: productId,
          shopId: shopId,
          actionType: type,
        },
        actionUrl: `/admin-products`,
      }));

      await Notification.insertMany(notifications);

      // If specific recipients are provided (like shop owners), notify them too
      if (recipients && recipients.length > 0) {
        const recipientNotifications = recipients.map(recipientId => ({
          recipient: recipientId,
          recipientType: "seller",
          type: type === "new_product" ? "success" : type === "product_deleted" ? "info" : "info",
          title: title,
          message: message,
          data: {
            productId: productId,
            shopId: shopId,
            actionType: type,
          },
          actionUrl: `/dashboard-products`,
        }));

        await Notification.insertMany(recipientNotifications);
      }
    } catch (error) {
      console.error("Error creating product notification:", error);
    }
  }
}

module.exports = NotificationService;