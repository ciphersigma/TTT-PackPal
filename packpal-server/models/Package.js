const mongoose = require('mongoose');

const packageSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  packageType: {
    type: String,
    required: [true, 'Please add a package type'],
    enum: ['Standard', 'Eco-friendly', 'Compact', 'Bulk', 'Custom']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  customer: {
    type: String,
    required: [true, 'Please add a customer name']
  },
  shippingDate: {
    type: Date
  },
  wasteReduced: {
    type: Number,
    default: 0
  },
  costSaved: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
