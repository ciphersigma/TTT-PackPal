const mongoose = require('mongoose');

const globalSettingsSchema = mongoose.Schema({
  wasteReduction: {
    type: Number,
    default: 0
  },
  costSavings: {
    type: Number,
    default: 0
  },
  optimizedPackages: {
    type: Number,
    default: 0
  },
  recyclablePercentage: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const GlobalSettings = mongoose.model('GlobalSettings', globalSettingsSchema);

module.exports = GlobalSettings;
