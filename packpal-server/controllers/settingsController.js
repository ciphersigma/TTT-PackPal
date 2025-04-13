const GlobalSettings = require('../models/GlobalSettings');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
const getGlobalSettings = async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne({}).populate('updatedBy', 'name');
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await GlobalSettings.create({
        wasteReduction: 42,
        costSavings: 12450,
        optimizedPackages: 8672,
        recyclablePercentage: 78
      });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateGlobalSettings = async (req, res) => {
  try {
    const { wasteReduction, costSavings, optimizedPackages, recyclablePercentage } = req.body;
    
    let settings = await GlobalSettings.findOne({});
    
    if (!settings) {
      // Create settings if they don't exist
      settings = new GlobalSettings({
        wasteReduction: wasteReduction || 42,
        costSavings: costSavings || 12450,
        optimizedPackages: optimizedPackages || 8672,
        recyclablePercentage: recyclablePercentage || 78,
        lastUpdated: new Date().toISOString(),
        updatedBy: req.user.id
      });
    } else {
      // Update existing settings
      settings.wasteReduction = wasteReduction || settings.wasteReduction;
      settings.costSavings = costSavings || settings.costSavings;
      settings.optimizedPackages = optimizedPackages || settings.optimizedPackages;
      settings.recyclablePercentage = recyclablePercentage || settings.recyclablePercentage;
      settings.lastUpdated = new Date().toISOString();
      settings.updatedBy = req.user.id;
    }
    
    const updatedSettings = await settings.save();
    
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGlobalSettings,
  updateGlobalSettings
};
