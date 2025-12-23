const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
    trim: true,
    maxLength: [500, "Question cannot exceed 500 characters"]
  },
  answer: {
    type: String,
    required: [true, "Answer is required"],
    trim: true,
    maxLength: [5000, "Answer cannot exceed 5000 characters"]
  },
  category: {
    type: String,
    required: true,
    enum: [
      "general",
      "ordering",
      "shipping", 
      "payment",
      "returns",
      "account",
      "technical",
      "products"
    ],
    default: "general"
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Track user votes to prevent multiple votes from same user
  votes: [{
    userIdentifier: {
      type: String, // IP address or user ID
      required: true
    },
    voteType: {
      type: String,
      enum: ['helpful', 'notHelpful'],
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Index for better performance
faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ isActive: 1, isPublished: 1 });
faqSchema.index({ question: "text", answer: "text" });

// Virtual for helpfulness score
faqSchema.virtual('helpfulnessScore').get(function() {
  const total = this.helpful + this.notHelpful;
  if (total === 0) return 0;
  return (this.helpful / total) * 100;
});

// Method to increment view count
faqSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to mark as helpful with user tracking
faqSchema.methods.markHelpful = function(userIdentifier) {
  // Check if user has already voted
  const existingVote = this.votes.find(vote => vote.userIdentifier === userIdentifier);
  
  if (existingVote) {
    if (existingVote.voteType === 'helpful') {
      // User already marked as helpful - don't allow duplicate
      throw new Error('You have already marked this FAQ as helpful');
    } else {
      // User previously marked as not helpful - switch vote
      existingVote.voteType = 'helpful';
      existingVote.votedAt = new Date();
      this.notHelpful = Math.max(0, this.notHelpful - 1);
      this.helpful += 1;
    }
  } else {
    // New vote
    this.votes.push({
      userIdentifier,
      voteType: 'helpful',
      votedAt: new Date()
    });
    this.helpful += 1;
  }
  
  return this.save();
};

// Method to mark as not helpful with user tracking
faqSchema.methods.markNotHelpful = function(userIdentifier) {
  // Check if user has already voted
  const existingVote = this.votes.find(vote => vote.userIdentifier === userIdentifier);
  
  if (existingVote) {
    if (existingVote.voteType === 'notHelpful') {
      // User already marked as not helpful - don't allow duplicate
      throw new Error('You have already marked this FAQ as not helpful');
    } else {
      // User previously marked as helpful - switch vote
      existingVote.voteType = 'notHelpful';
      existingVote.votedAt = new Date();
      this.helpful = Math.max(0, this.helpful - 1);
      this.notHelpful += 1;
    }
  } else {
    // New vote
    this.votes.push({
      userIdentifier,
      voteType: 'notHelpful',
      votedAt: new Date()
    });
    this.notHelpful += 1;
  }
  
  return this.save();
};

// Method to get user's vote status
faqSchema.methods.getUserVoteStatus = function(userIdentifier) {
  const vote = this.votes.find(vote => vote.userIdentifier === userIdentifier);
  return vote ? vote.voteType : null;
};

// Static method to get FAQs by category
faqSchema.statics.getByCategoryPublished = function(category) {
  return this.find({
    category,
    isActive: true,
    isPublished: true
  }).sort({ order: 1, createdAt: -1 });
};

// Static method to get all published FAQs
faqSchema.statics.getAllPublished = function() {
  return this.find({
    isActive: true,
    isPublished: true
  }).sort({ category: 1, order: 1, createdAt: -1 });
};

module.exports = mongoose.model("FAQ", faqSchema);