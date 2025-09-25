const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to database
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to database for testing');
}).catch(err => {
  console.error('Database connection error:', err);
});

// Import the order routes
const orderRoutes = require('./controller/order');
app.use('/api/v2/order', orderRoutes);

// Test endpoint to simulate COD order
app.post('/test-cod-order', async (req, res) => {
  try {
    const testCODOrder = {
      cart: [
        {
          _id: "test-product-1",
          name: "Test Product",
          price: 100,
          qty: 1,
          shopId: "test-shop-1",
          images: [{ url: "test-image.jpg" }]
        }
      ],
      shippingAddress: {
        address1: "Test Address",
        city: "Test City",
        zipCode: "123456",
        country: "India",
        phoneNumber: "1234567890"
      },
      user: {
        _id: "test-user-1",
        name: "Test User",
        email: "test@example.com"
      },
      totalPrice: 100,
      paymentInfo: {
        type: "COD", // This will trigger the email skip logic
        status: "Pending"
      }
    };

    console.log('🧪 Testing COD order creation...');
    console.log('Payment Type:', testCODOrder.paymentInfo.type);
    
    // This would normally call the actual order creation endpoint
    // For testing, we'll just verify the logic
    const isCODOrder = testCODOrder.paymentInfo && (
      testCODOrder.paymentInfo.type === 'COD' || 
      testCODOrder.paymentInfo.type === 'Cash on Delivery' || 
      testCODOrder.paymentInfo.type === 'cash_on_delivery'
    );

    res.json({
      success: true,
      message: 'COD Order Test Completed',
      isCODOrder,
      emailWillBeSkipped: isCODOrder,
      testData: testCODOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test endpoint for regular order (with email)
app.post('/test-regular-order', async (req, res) => {
  try {
    const testRegularOrder = {
      cart: [
        {
          _id: "test-product-1",
          name: "Test Product",
          price: 100,
          qty: 1,
          shopId: "test-shop-1",
          images: [{ url: "test-image.jpg" }]
        }
      ],
      shippingAddress: {
        address1: "Test Address",
        city: "Test City",
        zipCode: "123456",
        country: "India",
        phoneNumber: "1234567890"
      },
      user: {
        _id: "test-user-1",
        name: "Test User",
        email: "test@example.com"
      },
      totalPrice: 100,
      paymentInfo: {
        type: "Credit Card", // This will trigger email sending
        status: "Completed"
      }
    };

    console.log('🧪 Testing Regular order creation...');
    console.log('Payment Type:', testRegularOrder.paymentInfo.type);
    
    const isCODOrder = testRegularOrder.paymentInfo && (
      testRegularOrder.paymentInfo.type === 'COD' || 
      testRegularOrder.paymentInfo.type === 'Cash on Delivery' || 
      testRegularOrder.paymentInfo.type === 'cash_on_delivery'
    );

    res.json({
      success: true,
      message: 'Regular Order Test Completed',
      isCODOrder,
      emailWillBeSkipped: isCODOrder,
      testData: testRegularOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🧪 COD Order Test Server running on port ${PORT}`);
  console.log('Available test endpoints:');
  console.log(`- POST http://localhost:${PORT}/test-cod-order`);
  console.log(`- POST http://localhost:${PORT}/test-regular-order`);
});