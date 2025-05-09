const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});
const missionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  tags: [{
    type: String
  }],
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'assigned', 'completed', 'cancelled'],
    default: 'draft'
  },
  type: {
    type: String,
    enum: ['fixe', 'Taux horaire', 'long terme'],
    required: true
  },
  experience: {
    type: String,
    enum: ['debutant', 'intermediaire', 'expert'],
    required: true
  },
  attachments: [attachmentSchema]
}, { timestamps: true });

module.exports  = mongoose.model('Mission', missionSchema);
