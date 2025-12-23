const crypto = require('crypto');
const axios = require('axios');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

// PhonePe Configuration - Updated for proper test environment
const PHONEPE_CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID || 'TEST-M23GY3YS22NV2_25110', // Your test merchant ID
  saltKey: process.env.PHONEPE_SALT_KEY || 'ODUzMDhjYTEtMmRmZS00ZmRlLTlhOGEtMThhY2IzMTdlY2Ix', // Your test salt key
  saltIndex: process.env.PHONEPE_SALT_INDEX || '1', // Default salt index for test
  env: process.env.NODE_ENV === 'production' ? 'PROD' : 'UAT', // Environment switching
  // Updated API endpoint for test environment
  apiEndpoint: process.env.NODE_ENV === 'production' 
    ? 'https://api.phonepe.com/apis/hermes'           // Production endpoint
    : 'https://api-preprod.phonepe.com/apis/hermes'   // Test endpoint (current)
};

// Generate PhonePe payment request
const initiatePhonePePayment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { amount, orderId, userId, userPhone, userName, userEmail } = req.body;

    // Validate required fields
    if (!amount || !userId) {
      return next(new ErrorHandler("Amount and User ID are required", 400));
    }

    // Check if using test credentials that are not configured
    if (PHONEPE_CONFIG.merchantId.startsWith('TEST-') && PHONEPE_CONFIG.merchantId === 'TEST-M23GY3YS22NV2_25110') {
      // Create a simulated transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Return a simulated PhonePe response for testing
      res.status(200).json({
        success: true,
        paymentUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/phonepe/test-payment?transactionId=${transactionId}&amount=${amount}`,
        transactionId: transactionId,
        message: 'Test payment simulation - Replace with real PhonePe credentials for production',
        isTestMode: true,
        note: 'Current test credentials are not configured on PhonePe servers'
      });
      
      return;
    }

    // Create unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare payload for PhonePe
    const payload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: Math.round(amount * 100), // Amount in paise (₹1 = 100 paise)
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/phonepe/callback/${transactionId}`,
      redirectMode: 'GET',
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v2/payment/phonepe/callback`,
      mobileNumber: userPhone || "9999999999",
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Encode payload to base64
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    
    // Generate checksum: base64_payload + endpoint + salt_key
    const checksumString = base64Payload + '/pg/v1/pay' + PHONEPE_CONFIG.saltKey;
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex') + '###' + PHONEPE_CONFIG.saltIndex;

    // Make request to PhonePe API
    const response = await axios.post(
      `${PHONEPE_CONFIG.apiEndpoint}/pg/v1/pay`,
      {
        request: base64Payload
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        }
      }
    );

    if (response.data.success) {
      res.status(200).json({
        success: true,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        transactionId: transactionId,
        message: 'Payment URL generated successfully'
      });
    } else {
      console.error('PhonePe payment initiation failed:', response.data);
      return next(new ErrorHandler('Payment initiation failed: ' + (response.data.message || 'Unknown error'), 400));
    }

  } catch (error) {
    console.error('PhonePe payment error:', error.response?.data || error.message);
    return next(new ErrorHandler(`PhonePe payment failed: ${error.response?.data?.message || error.message}`, 500));
  }
});

// Handle PhonePe callback and verify payment status
const handlePhonePeCallback = catchAsyncErrors(async (req, res, next) => {
  try {
    const { transactionId } = req.body || req.query;
    
    if (!transactionId) {
      return next(new ErrorHandler("Transaction ID is required", 400));
    }
    
    // Generate checksum for status check
    const checksumString = `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${transactionId}` + PHONEPE_CONFIG.saltKey;
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex') + '###' + PHONEPE_CONFIG.saltIndex;

    // Check payment status with PhonePe
    const response = await axios.get(
      `${PHONEPE_CONFIG.apiEndpoint}/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId
        }
      }
    );

    if (response.data.success && response.data.data.state === 'COMPLETED') {
      // Payment successful
      res.status(200).json({
        success: true,
        paymentStatus: 'SUCCESS',
        transactionId: transactionId,
        amount: response.data.data.amount / 100, // Convert back to rupees
        paymentData: response.data.data,
        message: 'Payment verified successfully'
      });
    } else {
      // Payment failed or pending
      const state = response.data.data?.state || 'FAILED';
      res.status(400).json({
        success: false,
        paymentStatus: state,
        transactionId: transactionId,
        message: `Payment ${state.toLowerCase()}: ${response.data.data?.responseCodeDescription || 'Unknown error'}`
      });
    }

  } catch (error) {
    console.error('PhonePe callback error:', error.response?.data || error.message);
    return next(new ErrorHandler(`Payment verification failed: ${error.response?.data?.message || error.message}`, 500));
  }
});

// Frontend callback handler (for redirect after payment)
const handlePhonePeRedirect = catchAsyncErrors(async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment?error=missing_transaction_id`);
    }

    // Check payment status
    const checksumString = `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${transactionId}` + PHONEPE_CONFIG.saltKey;
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex') + '###' + PHONEPE_CONFIG.saltIndex;

    const response = await axios.get(
      `${PHONEPE_CONFIG.apiEndpoint}/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId
        }
      }
    );

    const paymentSuccess = response.data.success && response.data.data.state === 'COMPLETED';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (paymentSuccess) {
      // Redirect to success page with transaction details
      res.redirect(`${frontendUrl}/payment/phonepe/success?transactionId=${transactionId}&amount=${response.data.data.amount / 100}`);
    } else {
      // Redirect to failure page
      res.redirect(`${frontendUrl}/payment/phonepe/failed?transactionId=${transactionId}&reason=${encodeURIComponent(response.data.data?.responseCodeDescription || 'Payment failed')}`);
    }

  } catch (error) {
    console.error('PhonePe redirect error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/payment/phonepe/failed?error=${encodeURIComponent(error.message)}`);
  }
});

// ==================== PHONEPE PAYOUT SYSTEM ====================

// Initiate PhonePe Payout for Seller Withdrawals
const initiatePhonePePayout = catchAsyncErrors(async (req, res, next) => {
  try {
    const { withdrawalId, sellerId, amount, bankDetails } = req.body;

    // Validate required fields
    if (!withdrawalId || !sellerId || !amount || !bankDetails) {
      return next(new ErrorHandler("All payout details are required", 400));
    }

    // Validate bank details
    if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.holderName) {
      return next(new ErrorHandler("Complete bank details are required for payout", 400));
    }

    // Create unique payout transaction ID
    const payoutTransactionId = `PAYOUT_${withdrawalId}_${Date.now()}`;
    
    // Prepare payout payload
    const payoutPayload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: payoutTransactionId,
      merchantUserId: sellerId,
      amount: Math.round(amount * 100), // Convert to paise (₹1 = 100 paise)
      instrumentType: "BANK_ACCOUNT",
      targetAccount: {
        accountType: "BANK_ACCOUNT",
        bankAccount: {
          accountNumber: bankDetails.accountNumber,
          ifsc: bankDetails.ifscCode,
          name: bankDetails.holderName
        }
      },
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v2/payment/phonepe/payout/callback`,
      remarks: `Seller withdrawal payout - ID: ${withdrawalId}`
    };

    // Encode payload to base64
    const base64Payload = Buffer.from(JSON.stringify(payoutPayload)).toString('base64');
    
    // Generate checksum for payout: base64_payload + endpoint + salt_key
    const checksumString = base64Payload + '/pg/v1/payout' + PHONEPE_CONFIG.saltKey;
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex') + '###' + PHONEPE_CONFIG.saltIndex;

    // Make payout request to PhonePe API
    const response = await axios.post(
      `${PHONEPE_CONFIG.apiEndpoint}/pg/v1/payout`,
      {
        request: base64Payload
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId
        }
      }
    );

    if (response.data.success) {
      // Payout initiated successfully
      res.status(200).json({
        success: true,
        payoutTransactionId: payoutTransactionId,
        status: response.data.data.state || 'PENDING',
        message: 'Payout initiated successfully',
        data: response.data
      });
    } else {
      console.error('PhonePe payout initiation failed:', response.data);
      return next(new ErrorHandler('Payout initiation failed: ' + (response.data.message || 'Unknown error'), 400));
    }

  } catch (error) {
    console.error('PhonePe payout error:', error.response?.data || error.message);
    return next(new ErrorHandler(`PhonePe payout failed: ${error.response?.data?.message || error.message}`, 500));
  }
});

// Check PhonePe Payout Status
const checkPhonePePayoutStatus = catchAsyncErrors(async (req, res, next) => {
  try {
    const { payoutTransactionId } = req.params;
    
    if (!payoutTransactionId) {
      return next(new ErrorHandler("Payout Transaction ID is required", 400));
    }

    // Generate checksum for payout status check
    const checksumString = `/pg/v1/payout/status/${PHONEPE_CONFIG.merchantId}/${payoutTransactionId}` + PHONEPE_CONFIG.saltKey;
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex') + '###' + PHONEPE_CONFIG.saltIndex;

    // Make status check request
    const response = await axios.get(
      `${PHONEPE_CONFIG.apiEndpoint}/pg/v1/payout/status/${PHONEPE_CONFIG.merchantId}/${payoutTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': PHONEPE_CONFIG.merchantId
        }
      }
    );

    if (response.data.success) {
      const payoutData = response.data.data;
      
      res.status(200).json({
        success: true,
        transactionId: payoutTransactionId,
        status: payoutData.state,
        amount: payoutData.amount / 100, // Convert back to rupees
        responseCode: payoutData.responseCode,
        message: payoutData.responseCodeDescription || 'Payout status retrieved',
        data: payoutData
      });
    } else {
      return next(new ErrorHandler('Failed to get payout status: ' + (response.data.message || 'Unknown error'), 400));
    }

  } catch (error) {
    console.error('PhonePe payout status error:', error.response?.data || error.message);
    return next(new ErrorHandler(`Failed to check payout status: ${error.response?.data?.message || error.message}`, 500));
  }
});

// Handle PhonePe Payout Callback (Webhook)
const handlePhonePePayoutCallback = catchAsyncErrors(async (req, res, next) => {
  try {
    const { response } = req.body;
    
    if (!response) {
      return next(new ErrorHandler("Invalid payout callback data", 400));
    }

    // Decode the response
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());

    // Extract transaction details
    const { merchantTransactionId, state, responseCode, amount } = decodedResponse;

    // Update withdrawal status based on payout result
    if (state === 'COMPLETED') {
      // Here you would update the withdrawal status in database
      // await updateWithdrawalPayoutStatus(merchantTransactionId, 'SUCCESS', responseCode);
    } else if (state === 'FAILED') {
      // await updateWithdrawalPayoutStatus(merchantTransactionId, 'FAILED', responseCode);
    }

    res.status(200).json({
      success: true,
      message: 'Payout callback processed successfully'
    });

  } catch (error) {
    console.error('PhonePe payout callback error:', error);
    return next(new ErrorHandler('Payout callback processing failed', 500));
  }
});

module.exports = {
  initiatePhonePePayment,
  handlePhonePeCallback,
  handlePhonePeRedirect,
  initiatePhonePePayout,
  checkPhonePePayoutStatus,
  handlePhonePePayoutCallback
};