const mongoose = require('mongoose');

const paymentAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  transactions: [{
    amount: Number,
    type: String,
    date: {
      type: Date,
      default: Date.now
    },
    description: String
  }]
}, { timestamps: true });

module.exports  = mongoose.model('PaymentAccount', paymentAccountSchema);
