const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const Withdraw = require("../model/withdraw");
const sendMail = require("../utils/sendMail");
const router = express.Router();

// create withdraw request --- only for seller
router.post(
  "/create-withdraw-request",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount } = req.body;

      const data = {
        seller: req.seller,
        amount,
      };

      try {
        await sendMail({
          email: req.seller.email,
          subject: "Withdraw Request",
          message: `Hello ${req.seller.name}, Your withdraw request of ${amount}$ is processing. It will take 3days to 7days to processing! `,
        });
        res.status(201).json({
          success: true,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }

      const withdraw = await Withdraw.create(data);

      const shop = await Shop.findById(req.seller._id);

      shop.availableBalance = shop.availableBalance - amount;

      await shop.save();

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all withdraws --- admnin

router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      console.log("Admin requesting all withdrawal requests");
      
      const withdraws = await Withdraw.find().sort({ createdAt: -1 });
      
      console.log(`Found ${withdraws.length} withdrawal requests`);
      
      // Log first item for debugging
      if (withdraws.length > 0) {
        console.log("Sample withdrawal data:", {
          id: withdraws[0]._id,
          seller: withdraws[0].seller,
          amount: withdraws[0].amount,
          status: withdraws[0].status
        });
      }

      res.status(200).json({
        success: true,
        withdraws,
        count: withdraws.length
      });
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update withdraw request ---- admin
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sellerId } = req.body;

      const withdraw = await Withdraw.findByIdAndUpdate(
        req.params.id,
        {
          status: "succeed",
          updatedAt: Date.now(),
        },
        { new: true }
      );

      const seller = await Shop.findById(sellerId);

      const transection = {
        _id: withdraw._id,
        amount: withdraw.amount,
        updatedAt: withdraw.updatedAt,
        status: withdraw.status,
      };

      seller.transections = [...seller.transections, transection];

      await seller.save();

      try {
        await sendMail({
          email: seller.email,
          subject: "Payment confirmation",
          message: `Hello ${seller.name}, Your withdraw request of ${withdraw.amount}$ is on the way. Delivery time depends on your bank's rules it usually takes 3days to 7days.`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ==================== PHONEPE PAYOUT INTEGRATION ====================

// Enhanced withdrawal approval with PhonePe payout
router.put(
  "/approve-withdrawal-with-phonepe-payout/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sellerId, payoutMethod } = req.body; // payoutMethod: 'bank' or 'upi'
      const withdrawalId = req.params.id;

      // Get withdrawal request
      const withdraw = await Withdraw.findById(withdrawalId);
      if (!withdraw) {
        return next(new ErrorHandler("Withdrawal request not found", 404));
      }

      // Get seller details
      const seller = await Shop.findById(sellerId);
      if (!seller) {
        return next(new ErrorHandler("Seller not found", 404));
      }

      // Validate seller has withdrawal method setup
      if (!seller.withdrawMethod) {
        return next(new ErrorHandler("Seller has not set up withdrawal method", 400));
      }

      // Prepare bank details for PhonePe payout
      const bankDetails = {
        accountNumber: seller.withdrawMethod.bankAccountNumber,
        ifscCode: seller.withdrawMethod.ifscCode || seller.withdrawMethod.bankSwiftCode,
        holderName: seller.withdrawMethod.bankHolderName,
        upiId: seller.withdrawMethod.upiId
      };

      // Validate required details based on payout method
      if (payoutMethod === 'upi' && !bankDetails.upiId) {
        return next(new ErrorHandler("UPI ID is required for UPI payout", 400));
      }

      if (payoutMethod === 'bank' && (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.holderName)) {
        return next(new ErrorHandler("Complete bank details are required for bank payout", 400));
      }

      console.log(`🏦 Processing PhonePe ${payoutMethod} payout for seller: ${seller.name}, amount: ₹${withdraw.amount}`);

      // Import PhonePe payout function
      const { initiatePhonePePayout } = require('./phonePePayment');
      
      // Prepare payout request
      const payoutRequest = {
        body: {
          withdrawalId: withdrawalId,
          sellerId: sellerId,
          amount: withdraw.amount,
          bankDetails: bankDetails,
          payoutMethod: payoutMethod
        }
      };

      // Create a mock response object for the payout function
      let payoutResult = null;
      let payoutError = null;

      const mockRes = {
        status: (code) => ({
          json: (data) => {
            payoutResult = { statusCode: code, data };
          }
        })
      };

      const mockNext = (error) => {
        payoutError = error;
      };

      // Call PhonePe payout function
      try {
        await initiatePhonePePayout(payoutRequest, mockRes, mockNext);
      } catch (error) {
        console.error('PhonePe payout initiation failed:', error);
        payoutError = error;
      }

      if (payoutError) {
        // If PhonePe payout fails, update status to failed and notify
        await Withdraw.findByIdAndUpdate(withdrawalId, {
          status: "failed",
          payoutTransactionId: null,
          payoutError: payoutError.message,
          updatedAt: Date.now(),
        });

        try {
          await sendMail({
            email: seller.email,
            subject: "Withdrawal Payout Failed",
            message: `Hello ${seller.name}, Unfortunately, your withdrawal request of ₹${withdraw.amount} could not be processed automatically. Our team will process it manually. Reason: ${payoutError.message}`,
          });
        } catch (emailError) {
          console.error('Failed to send payout failure email:', emailError);
        }

        return next(new ErrorHandler(`Payout failed: ${payoutError.message}`, 500));
      }

      if (payoutResult && payoutResult.statusCode === 200) {
        // PhonePe payout initiated successfully
        const payoutTransactionId = payoutResult.data.payoutTransactionId;

        // Update withdrawal with payout details
        const updatedWithdraw = await Withdraw.findByIdAndUpdate(
          withdrawalId,
          {
            status: "payout_initiated",
            payoutTransactionId: payoutTransactionId,
            payoutMethod: payoutMethod,
            updatedAt: Date.now(),
          },
          { new: true }
        );

        // Add transaction to seller's history
        const transaction = {
          _id: updatedWithdraw._id,
          amount: updatedWithdraw.amount,
          updatedAt: updatedWithdraw.updatedAt,
          status: updatedWithdraw.status,
          payoutTransactionId: payoutTransactionId,
          payoutMethod: payoutMethod
        };

        seller.transections = [...seller.transections, transaction];
        await seller.save();

        // Send confirmation email
        try {
          await sendMail({
            email: seller.email,
            subject: "Withdrawal Payout Initiated",
            message: `Hello ${seller.name}, Your withdrawal request of ₹${withdraw.amount} has been processed via PhonePe ${payoutMethod} payout. Transaction ID: ${payoutTransactionId}. The money should reach your account within a few minutes to 24 hours depending on your bank.`,
          });
        } catch (emailError) {
          console.error('Failed to send payout success email:', emailError);
        }

        res.status(200).json({
          success: true,
          message: "PhonePe payout initiated successfully",
          withdraw: updatedWithdraw,
          payoutTransactionId: payoutTransactionId
        });

      } else {
        return next(new ErrorHandler("PhonePe payout initiation failed", 500));
      }

    } catch (error) {
      console.error('Withdrawal payout processing error:', error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
