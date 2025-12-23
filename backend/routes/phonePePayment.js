const express = require('express');
const { 
  initiatePhonePePayment, 
  handlePhonePeCallback, 
  handlePhonePeRedirect,
  initiatePhonePePayout,
  checkPhonePePayoutStatus,
  handlePhonePePayoutCallback
} = require('../controller/phonePePayment');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();

// ==================== PAYMENT ROUTES ====================
// Initiate PhonePe payment (protected route)
router.post('/initiate', isAuthenticated, initiatePhonePePayment);

// Handle PhonePe webhook callback (no auth needed for webhook)
router.post('/callback', handlePhonePeCallback);

// Handle PhonePe redirect after payment (no auth needed for redirect)
router.get('/redirect/:transactionId', handlePhonePeRedirect);

// Manual status check (protected route)
router.get('/status/:transactionId', isAuthenticated, handlePhonePeCallback);

// ==================== PAYOUT ROUTES ====================
// Initiate PhonePe payout for seller withdrawal (admin only)
router.post('/payout/initiate', isAuthenticated, isAdmin('Admin'), initiatePhonePePayout);

// Check PhonePe payout status (admin only)
router.get('/payout/status/:payoutTransactionId', isAuthenticated, isAdmin('Admin'), checkPhonePePayoutStatus);

// Handle PhonePe payout webhook callback (no auth needed for webhook)
router.post('/payout/callback', handlePhonePePayoutCallback);

module.exports = router;