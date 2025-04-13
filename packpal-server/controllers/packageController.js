const Package = require('../models/Package');
const User = require('../models/User');

// @desc    Get all packages for a user
// @route   GET /api/packages
// @access  Private
const getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ user: req.user.id });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single package
// @route   GET /api/packages/:id
// @access  Private
const getPackageById = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Check if the package belongs to the user or if user is admin
    if (package.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(package);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new package
// @route   POST /api/packages
// @access  Private
const createPackage = async (req, res) => {
  try {
    const { packageType, customer, shippingDate } = req.body;
    
    // Generate random values for waste and cost savings based on package type
    const wasteReduced = Math.floor(Math.random() * 500) + 100;
    const costSaved = Math.floor(Math.random() * 20) + 5;
    
    const package = await Package.create({
      user: req.user.id,
      packageType,
      customer,
      shippingDate,
      wasteReduced,
      costSaved,
      status: 'pending'
    });
    
    // Increment the user's package count
    await User.findByIdAndUpdate(req.user.id, { $inc: { packageCount: 1 } });
    
    res.status(201).json(package);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a package
// @route   PUT /api/packages/:id
// @access  Private
const updatePackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Check if the package belongs to the user or if user is admin
    if (package.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a package
// @route   DELETE /api/packages/:id
// @access  Private
const deletePackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    // Check if the package belongs to the user or if user is admin
    if (package.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Package.deleteOne({ _id: req.params.id });
    
    // Decrement the user's package count
    await User.findByIdAndUpdate(req.user.id, { $inc: { packageCount: -1 } });
    
    res.json({ message: 'Package removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
};
