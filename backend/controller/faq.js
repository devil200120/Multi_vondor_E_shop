const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const FAQ = require("../model/faq");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();

// Get all published FAQs (public route)
router.get(
  "/get-faqs",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { category, search } = req.query;
      
      let query = {
        isActive: true,
        isPublished: true
      };

      if (category && category !== 'all') {
        query.category = category;
      }

      let faqs;
      if (search) {
        faqs = await FAQ.find({
          ...query,
          $or: [
            { question: { $regex: search, $options: 'i' } },
            { answer: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        }).sort({ order: 1, createdAt: -1 });
      } else {
        faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });
      }

      // Get user identifier for vote status
      const userIdentifier = req.user?.id || req.ip || req.connection.remoteAddress;

      // Add user vote status to each FAQ
      const faqsWithVoteStatus = faqs.map(faq => {
        const faqObj = faq.toObject();
        if (userIdentifier) {
          faqObj.userVote = faq.getUserVoteStatus(userIdentifier);
        } else {
          faqObj.userVote = null;
        }
        // Remove the votes array from the response for privacy
        delete faqObj.votes;
        return faqObj;
      });

      // Group FAQs by category for better organization
      const faqsByCategory = faqsWithVoteStatus.reduce((acc, faq) => {
        if (!acc[faq.category]) {
          acc[faq.category] = [];
        }
        acc[faq.category].push(faq);
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        faqs: faqsWithVoteStatus,
        faqsByCategory,
        totalFAQs: faqsWithVoteStatus.length
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get FAQ categories (public route)
router.get(
  "/get-categories",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const categories = await FAQ.distinct('category', {
        isActive: true,
        isPublished: true
      });

      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const count = await FAQ.countDocuments({
            category,
            isActive: true,
            isPublished: true
          });
          return { name: category, count };
        })
      );

      res.status(200).json({
        success: true,
        categories: categoriesWithCount
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Increment FAQ view count (public route)
router.post(
  "/increment-view/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const faq = await FAQ.findById(req.params.id);
      
      if (!faq) {
        return next(new ErrorHandler("FAQ not found", 404));
      }

      await faq.incrementViews();

      res.status(200).json({
        success: true,
        message: "View count updated"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Mark FAQ as helpful (public route)
router.post(
  "/mark-helpful/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const faq = await FAQ.findById(req.params.id);
      
      if (!faq) {
        return next(new ErrorHandler("FAQ not found", 404));
      }

      // Get user identifier (IP address or user ID if logged in)
      const userIdentifier = req.user?.id || req.ip || req.connection.remoteAddress;
      
      if (!userIdentifier) {
        return next(new ErrorHandler("Unable to identify user", 400));
      }

      await faq.markHelpful(userIdentifier);

      res.status(200).json({
        success: true,
        message: "Marked as helpful",
        helpfulCount: faq.helpful,
        notHelpfulCount: faq.notHelpful,
        userVote: 'helpful'
      });
    } catch (error) {
      if (error.message.includes('already marked')) {
        return next(new ErrorHandler(error.message, 400));
      }
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Mark FAQ as not helpful (public route)
router.post(
  "/mark-not-helpful/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const faq = await FAQ.findById(req.params.id);
      
      if (!faq) {
        return next(new ErrorHandler("FAQ not found", 404));
      }

      // Get user identifier (IP address or user ID if logged in)
      const userIdentifier = req.user?.id || req.ip || req.connection.remoteAddress;
      
      if (!userIdentifier) {
        return next(new ErrorHandler("Unable to identify user", 400));
      }

      await faq.markNotHelpful(userIdentifier);

      res.status(200).json({
        success: true,
        message: "Marked as not helpful",
        helpfulCount: faq.helpful,
        notHelpfulCount: faq.notHelpful,
        userVote: 'notHelpful'
      });
    } catch (error) {
      if (error.message.includes('already marked')) {
        return next(new ErrorHandler(error.message, 400));
      }
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get user's vote status for an FAQ (public route)
router.get(
  "/vote-status/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const faq = await FAQ.findById(req.params.id);
      
      if (!faq) {
        return next(new ErrorHandler("FAQ not found", 404));
      }

      // Get user identifier (IP address or user ID if logged in)
      const userIdentifier = req.user?.id || req.ip || req.connection.remoteAddress;
      
      const userVoteStatus = userIdentifier ? faq.getUserVoteStatus(userIdentifier) : null;

      res.status(200).json({
        success: true,
        userVote: userVoteStatus,
        helpfulCount: faq.helpful,
        notHelpfulCount: faq.notHelpful
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Get all FAQs with full details
router.get(
  "/admin/get-all-faqs",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { page = 1, limit = 10, category, search, status } = req.query;
      const skip = (page - 1) * limit;

      let query = {};

      if (category && category !== 'all') {
        query.category = category;
      }

      if (status && status !== 'all') {
        if (status === 'active') {
          query.isActive = true;
        } else if (status === 'inactive') {
          query.isActive = false;
        } else if (status === 'published') {
          query.isPublished = true;
        } else if (status === 'draft') {
          query.isPublished = false;
        }
      }

      if (search) {
        query.$or = [
          { question: { $regex: search, $options: 'i' } },
          { answer: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const faqs = await FAQ.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalFAQs = await FAQ.countDocuments(query);
      const totalPages = Math.ceil(totalFAQs / limit);

      // Get statistics
      const stats = await FAQ.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            published: { $sum: { $cond: ['$isPublished', 1, 0] } },
            totalViews: { $sum: '$views' },
            totalHelpful: { $sum: '$helpful' },
            totalNotHelpful: { $sum: '$notHelpful' }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        faqs,
        totalFAQs,
        totalPages,
        currentPage: parseInt(page),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        stats: stats[0] || {
          total: 0,
          active: 0,
          published: 0,
          totalViews: 0,
          totalHelpful: 0,
          totalNotHelpful: 0
        }
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Create new FAQ
router.post(
  "/admin/create-faq",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        question,
        answer,
        category,
        order,
        isActive,
        isPublished,
        tags
      } = req.body;

      const faq = new FAQ({
        question,
        answer,
        category,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        isPublished: isPublished !== undefined ? isPublished : true,
        tags: tags || [],
        createdBy: req.user._id
      });

      await faq.save();
      await faq.populate('createdBy', 'name email');

      res.status(201).json({
        success: true,
        message: "FAQ created successfully",
        faq
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Update FAQ
router.put(
  "/admin/update-faq/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const faq = await FAQ.findById(req.params.id);

      if (!faq) {
        return next(new ErrorHandler("FAQ not found", 404));
      }

      const {
        question,
        answer,
        category,
        order,
        isActive,
        isPublished,
        tags
      } = req.body;

      faq.question = question || faq.question;
      faq.answer = answer || faq.answer;
      faq.category = category || faq.category;
      faq.order = order !== undefined ? order : faq.order;
      faq.isActive = isActive !== undefined ? isActive : faq.isActive;
      faq.isPublished = isPublished !== undefined ? isPublished : faq.isPublished;
      faq.tags = tags !== undefined ? tags : faq.tags;
      faq.updatedBy = req.user._id;

      await faq.save();
      await faq.populate([
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]);

      res.status(200).json({
        success: true,
        message: "FAQ updated successfully",
        faq
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Delete FAQ
router.delete(
  "/admin/delete-faq/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const faq = await FAQ.findById(req.params.id);

      if (!faq) {
        return next(new ErrorHandler("FAQ not found", 404));
      }

      await FAQ.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "FAQ deleted successfully"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Bulk delete FAQs
router.delete(
  "/admin/bulk-delete-faqs",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { faqIds } = req.body;

      if (!faqIds || !Array.isArray(faqIds) || faqIds.length === 0) {
        return next(new ErrorHandler("No FAQ IDs provided", 400));
      }

      const result = await FAQ.deleteMany({
        _id: { $in: faqIds }
      });

      res.status(200).json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} FAQs`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Update FAQ order
router.put(
  "/admin/update-faq-order",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { faqOrders } = req.body; // Array of { id, order }

      if (!faqOrders || !Array.isArray(faqOrders)) {
        return next(new ErrorHandler("Invalid FAQ order data", 400));
      }

      const updatePromises = faqOrders.map(({ id, order }) =>
        FAQ.findByIdAndUpdate(id, { order, updatedBy: req.user._id })
      );

      await Promise.all(updatePromises);

      res.status(200).json({
        success: true,
        message: "FAQ order updated successfully"
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;