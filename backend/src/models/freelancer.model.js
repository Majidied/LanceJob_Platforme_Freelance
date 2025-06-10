const mongoose = require('mongoose');
const User = require('./user.model');

const freelancerSchema = new mongoose.Schema({
  phone: {
    type: String
  },
  rating: {
    type: Number,
    default: 0
  },
  bio: {
    type: String
  },
  skills: [{
    type: String
  }],
  title: {
    type: String
  },
  earned: {
    type: Number,
    default: 0
  },
  success: {
    type: Number,
    default: 0
  },
  address: {
    type: String
  },
  history: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }],
  appliedMissions: [{
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission'
    },
    applicationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    proposal: {
      type: String
    }
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  }],
  // ✅ NOUVEAU: Section pour les offres/invitations reçues
  offers: [{
    mission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission',
      required: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Client qui invite
      required: true
    },
    invitationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    type: {
      type: String,
      enum: ['application', 'invitation'], // application = candidature normale, invitation = invitation directe
      default: 'invitation'
    },
    message: {
      type: String,
      required: true
    },
    proposedPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'MAD'
    },
    deadline: {
      type: Date
    },
    requirements: {
      type: String
    },
    // Champs spécifiques aux invitations
    invitationDetails: {
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      },
      estimatedDuration: {
        type: String // ex: "2 semaines", "1 mois"
      },
      startDate: {
        type: Date
      }
    }
  }]
}, { timestamps: true });

module.exports = User.discriminator('freelancer', freelancerSchema);