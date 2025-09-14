const Notification = require('../model/notification');

const seedNotifications = async () => {
  try {
    // Sample notifications for testing
    const sampleNotifications = [
      {
        title: 'New Order Received',
        message: 'Order #12345678 for 3 items worth ₹2,500 has been placed',
        type: 'new_order',
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        title: 'Low Stock Alert',
        message: 'Product "Red Bricks" is running low on stock (8 remaining)',
        type: 'low_stock',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        title: 'New User Registered',
        message: 'New user John Doe (john@example.com) has registered and activated their account',
        type: 'new_registration',
        priority: 'low',
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        title: 'Order Status Updated',
        message: 'Order #87654321 status changed to Delivered',
        type: 'order_status',
        priority: 'medium',
        isRead: true,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        title: 'Payment Received',
        message: 'Payment of ₹3,200 received for Order #56789012',
        type: 'payment_received',
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        title: 'New Seller Registered',
        message: 'New seller "Building Materials Co." has registered and activated their shop',
        type: 'new_seller_registration',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        title: 'Product Added',
        message: 'Product "Cement Bags" added by Building Supplies Store',
        type: 'new_product',
        priority: 'low',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        title: 'Refund Request',
        message: 'Refund requested for Order #34567890',
        type: 'refund_request',
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      }
    ];

    // Clear existing notifications
    await Notification.deleteMany({});
    
    // Insert sample notifications
    await Notification.insertMany(sampleNotifications);
    
    console.log('✅ Sample notifications seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    return false;
  }
};

module.exports = seedNotifications;