/**
 * Interaction Model
 * 
 * MongoDB model for storing user interactions with missions.
 * Used by the recommendation system to track user behavior.
 */

const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  freelancer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Freelancer',
    required: true,
    index: true,
  },
  mission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true,
    index: true,
  },
  interaction_type: {
    type: String,
    enum: ['view', 'click', 'apply', 'save', 'share', 'contact'],
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String,
    sessionId: String,
    applicationData: mongoose.Schema.Types.Mixed,
    success: Boolean,
    statusCode: Number,
    bulkOperation: Boolean,
    // Additional metadata as needed
    custom: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'interactions',
});

// Compound indexes for efficient queries
interactionSchema.index({ freelancer_id: 1, timestamp: -1 });
interactionSchema.index({ mission_id: 1, timestamp: -1 });
interactionSchema.index({ freelancer_id: 1, interaction_type: 1, timestamp: -1 });
interactionSchema.index({ mission_id: 1, interaction_type: 1, timestamp: -1 });
interactionSchema.index({ interaction_type: 1, timestamp: -1 });

// TTL index to automatically delete old interactions after 2 years
interactionSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

// Instance methods
interactionSchema.methods.toRecommendationFormat = function() {
  return {
    freelancer_id: this.freelancer_id.toString(),
    mission_id: this.mission_id.toString(),
    interaction_type: this.interaction_type,
    timestamp: this.timestamp,
    metadata: this.metadata,
  };
};

// Static methods
interactionSchema.statics.getFreelancerInteractions = function(freelancerId, limit = 100) {
  return this.find({ freelancer_id: freelancerId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('mission_id', 'title budget deadline type status')
    .lean();
};

interactionSchema.statics.getMissionInteractions = function(missionId, limit = 100) {
  return this.find({ mission_id: missionId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('freelancer_id', 'title skills rating')
    .lean();
};

interactionSchema.statics.getInteractionStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = new Date(startDate);
    if (endDate) matchStage.timestamp.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$interaction_type',
        count: { $sum: 1 },
        uniqueFreelancers: { $addToSet: '$freelancer_id' },
        uniqueMissions: { $addToSet: '$mission_id' },
      }
    },
    {
      $project: {
        interaction_type: '$_id',
        count: 1,
        uniqueFreelancers: { $size: '$uniqueFreelancers' },
        uniqueMissions: { $size: '$uniqueMissions' },
        _id: 0,
      }
    },
    { $sort: { count: -1 } }
  ]);
};

interactionSchema.statics.getFreelancerInteractionMatrix = function(limit = 1000) {
  return this.aggregate([
    {
      $group: {
        _id: {
          freelancer_id: '$freelancer_id',
          mission_id: '$mission_id',
          interaction_type: '$interaction_type'
        },
        count: { $sum: 1 },
        latest_timestamp: { $max: '$timestamp' }
      }
    },
    {
      $project: {
        freelancer_id: '$_id.freelancer_id',
        mission_id: '$_id.mission_id',
        interaction_type: '$_id.interaction_type',
        count: 1,
        latest_timestamp: 1,
        _id: 0
      }
    },
    { $sort: { latest_timestamp: -1 } },
    { $limit: limit }
  ]);
};

// Pre-save middleware to ensure data consistency
interactionSchema.pre('save', function(next) {
  // Ensure timestamp is set
  if (!this.timestamp) {
    this.timestamp = new Date();
  }
  
  // Initialize metadata if not present
  if (!this.metadata) {
    this.metadata = {};
  }
  
  next();
});

// Post-save middleware for logging
interactionSchema.post('save', function(doc) {
  console.log(`Interaction saved: ${doc.interaction_type} by ${doc.freelancer_id} on ${doc.mission_id}`);
});

const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction;
