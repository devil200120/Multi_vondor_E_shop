const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isAuthenticated, isAdmin, isSeller } = require("../middleware/auth");

// Get all reviews with pagination and filtering
router.get(
  "/get-all-reviews",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const sortBy = req.query.sortBy || 'newest'; // newest, oldest, highest, lowest
      const rating = req.query.rating ? parseInt(req.query.rating) : null;
      const skip = (page - 1) * limit;

      // Get all products that have reviews
      const products = await Product.find(
        { "reviews.0": { $exists: true } },
        {
          _id: 1,
          name: 1,
          images: 1,
          reviews: 1,
          shop: 1,
          category: 1,
          discountPrice: 1,
          originalPrice: 1
        }
      ).populate('category', 'name');

      // Extract all reviews with product information
      let allReviews = [];
      products.forEach(product => {
        if (product.reviews && product.reviews.length > 0) {
          product.reviews.forEach(review => {
            allReviews.push({
              _id: review._id,
              user: review.user,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt,
              productId: review.productId || product._id,
              product: {
                _id: product._id,
                name: product.name,
                image: product.images && product.images.length > 0 ? product.images[0].url : null,
                category: product.category?.name || 'Unknown',
                price: product.discountPrice,
                originalPrice: product.originalPrice,
                shop: product.shop
              }
            });
          });
        }
      });

      // Filter by rating if specified
      if (rating) {
        allReviews = allReviews.filter(review => review.rating === rating);
      }

      // Sort reviews
      switch (sortBy) {
        case 'oldest':
          allReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'highest':
          allReviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'lowest':
          allReviews.sort((a, b) => a.rating - b.rating);
          break;
        case 'newest':
        default:
          allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }

      // Calculate total and apply pagination
      const totalReviews = allReviews.length;
      const paginatedReviews = allReviews.slice(skip, skip + limit);
      const totalPages = Math.ceil(totalReviews / limit);

      // Calculate rating distribution
      const ratingDistribution = {
        5: allReviews.filter(r => r.rating === 5).length,
        4: allReviews.filter(r => r.rating === 4).length,
        3: allReviews.filter(r => r.rating === 3).length,
        2: allReviews.filter(r => r.rating === 2).length,
        1: allReviews.filter(r => r.rating === 1).length,
      };

      // Calculate average rating
      const averageRating = totalReviews > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      res.status(200).json({
        success: true,
        reviews: paginatedReviews,
        totalReviews,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        reviewsPerRating: {
          5: ratingDistribution[5],
          4: ratingDistribution[4],
          3: ratingDistribution[3],
          2: ratingDistribution[2],
          1: ratingDistribution[1]
        }
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get reviews for a specific product
router.get(
  "/get-product-reviews/:productId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const product = await Product.findById(productId, {
        reviews: 1,
        name: 1,
        images: 1,
        shop: 1
      });

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      const reviews = product.reviews || [];
      const totalReviews = reviews.length;
      const paginatedReviews = reviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + limit);

      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      res.status(200).json({
        success: true,
        reviews: paginatedReviews,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
        currentPage: page,
        averageRating: Math.round(averageRating * 10) / 10,
        product: {
          _id: product._id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0].url : null,
          shop: product.shop
        }
      });
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get review statistics
router.get(
  "/get-review-stats",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Get all products with reviews
      const products = await Product.find(
        { "reviews.0": { $exists: true } },
        { reviews: 1 }
      );

      let totalReviews = 0;
      let totalRating = 0;
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      products.forEach(product => {
        if (product.reviews && product.reviews.length > 0) {
          product.reviews.forEach(review => {
            totalReviews++;
            totalRating += review.rating;
            ratingCounts[review.rating]++;
          });
        }
      });

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      res.status(200).json({
        success: true,
        stats: {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution: ratingCounts,
          reviewedProducts: products.length
        }
      });
    } catch (error) {
      console.error("Error fetching review stats:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Seller: Get all reviews for seller's products
router.get(
  "/seller-reviews",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellerId = req.seller._id;
      const status = req.query.status; // all, approved, pending
      const rating = req.query.rating ? parseInt(req.query.rating) : null;

      // Get all products belonging to this seller
      const products = await Product.find(
        { shopId: sellerId },
        { _id: 1, name: 1, images: 1, reviews: 1, category: 1 }
      ).populate('category', 'name');

      // Extract all reviews with product information
      let allReviews = [];
      products.forEach(product => {
        if (product.reviews && product.reviews.length > 0) {
          product.reviews.forEach(review => {
            allReviews.push({
              _id: review._id,
              user: review.user,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt,
              isVerifiedPurchase: review.isVerifiedPurchase || false,
              isApprovedByAdmin: review.isApprovedByAdmin !== false, // Default to true for old reviews
              vendorReply: review.vendorReply,
              product: {
                _id: product._id,
                name: product.name,
                images: product.images,
                category: product.category?.name || 'Unknown'
              }
            });
          });
        }
      });

      // Filter by status
      if (status === 'approved') {
        allReviews = allReviews.filter(review => review.isApprovedByAdmin);
      } else if (status === 'pending') {
        allReviews = allReviews.filter(review => !review.isApprovedByAdmin);
      }

      // Filter by rating if specified
      if (rating) {
        allReviews = allReviews.filter(review => review.rating === rating);
      }

      // Sort by newest first
      allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.status(200).json({
        success: true,
        reviews: allReviews
      });
    } catch (error) {
      console.error("Error fetching seller reviews:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Seller: Get review statistics for seller's products
router.get(
  "/seller-review-stats",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellerId = req.seller._id;

      // Get all products belonging to this seller
      const products = await Product.find(
        { shopId: sellerId },
        { reviews: 1 }
      );

      let totalReviews = 0;
      let totalRating = 0;
      let pendingReviews = 0;
      let approvedReviews = 0;
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      products.forEach(product => {
        if (product.reviews && product.reviews.length > 0) {
          product.reviews.forEach(review => {
            totalReviews++;
            totalRating += review.rating;
            ratingCounts[review.rating]++;

            // Count approved vs pending
            if (review.isApprovedByAdmin !== false) {
              approvedReviews++;
            } else {
              pendingReviews++;
            }
          });
        }
      });

      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      res.status(200).json({
        success: true,
        stats: {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          pendingReviews,
          approvedReviews,
          ratingDistribution: ratingCounts
        }
      });
    } catch (error) {
      console.error("Error fetching seller review stats:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Seller: Reply to a review
router.post(
  "/reply/:reviewId",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { replyText } = req.body;
      const sellerId = req.seller._id;

      if (!replyText || replyText.trim().length === 0) {
        return next(new ErrorHandler("Reply text is required", 400));
      }

      // Find the product containing this review
      const product = await Product.findOne({
        shopId: sellerId,
        "reviews._id": reviewId
      });

      if (!product) {
        return next(new ErrorHandler("Review not found or unauthorized", 404));
      }

      // Find the review and add vendor reply
      const review = product.reviews.id(reviewId);
      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }

      review.vendorReply = {
        text: replyText,
        createdAt: new Date()
      };

      await product.save();

      res.status(200).json({
        success: true,
        message: "Reply posted successfully",
        review: {
          _id: review._id,
          vendorReply: review.vendorReply
        }
      });
    } catch (error) {
      console.error("Error posting reply:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Delete a specific review from a product
router.delete(
  "/admin/delete-review/:productId/:reviewId",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId, reviewId } = req.params;

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      const reviewIndex = product.reviews.findIndex(
        review => review._id.toString() === reviewId
      );

      if (reviewIndex === -1) {
        return next(new ErrorHandler("Review not found", 404));
      }

      // Remove the review from the array
      const deletedReview = product.reviews[reviewIndex];
      product.reviews.splice(reviewIndex, 1);

      // Recalculate ratings after review deletion
      if (product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        product.ratings = totalRating / product.reviews.length;
      } else {
        product.ratings = 0;
      }

      await product.save();

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
        deletedReview: {
          _id: deletedReview._id,
          user: deletedReview.user,
          rating: deletedReview.rating,
          comment: deletedReview.comment,
          createdAt: deletedReview.createdAt
        }
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Admin: Delete multiple reviews by IDs
router.delete(
  "/admin/delete-reviews",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { reviewsToDelete } = req.body; // Array of { productId, reviewId }

      if (!reviewsToDelete || !Array.isArray(reviewsToDelete) || reviewsToDelete.length === 0) {
        return next(new ErrorHandler("No reviews specified for deletion", 400));
      }

      const deletionResults = [];
      const errors = [];

      for (const { productId, reviewId } of reviewsToDelete) {
        try {
          const product = await Product.findById(productId);
          if (!product) {
            errors.push({ productId, reviewId, error: "Product not found" });
            continue;
          }

          const reviewIndex = product.reviews.findIndex(
            review => review._id.toString() === reviewId
          );

          if (reviewIndex === -1) {
            errors.push({ productId, reviewId, error: "Review not found" });
            continue;
          }

          // Remove the review from the array
          const deletedReview = product.reviews[reviewIndex];
          product.reviews.splice(reviewIndex, 1);

          // Recalculate ratings after review deletion
          if (product.reviews.length > 0) {
            const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
            product.ratings = totalRating / product.reviews.length;
          } else {
            product.ratings = 0;
          }

          await product.save();

          deletionResults.push({
            productId,
            reviewId,
            success: true,
            deletedReview: {
              _id: deletedReview._id,
              user: deletedReview.user,
              rating: deletedReview.rating,
              comment: deletedReview.comment,
              createdAt: deletedReview.createdAt
            }
          });
        } catch (error) {
          errors.push({ productId, reviewId, error: error.message });
        }
      }

      res.status(200).json({
        success: true,
        message: `Processed ${reviewsToDelete.length} review deletion requests`,
        deletedCount: deletionResults.length,
        errorCount: errors.length,
        results: deletionResults,
        errors: errors
      });
    } catch (error) {
      console.error("Error in bulk review deletion:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;