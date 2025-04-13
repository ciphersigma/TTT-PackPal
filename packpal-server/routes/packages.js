const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Package = require('../models/Package');
const User = require('../models/User');

// @route   GET /api/packages
// @desc    Get all packages
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }

    // Find all packages and populate the user field
    const packages = await Package.find({}).populate('user', 'name');
    
    // Transform data to match frontend expectations
    const transformedPackages = packages.map(pkg => ({
      _id: pkg._id,
      id: pkg._id.toString(), // Add id field that frontend expects
      packageType: pkg.packageType,
      status: pkg.status,
      customer: pkg.customer,
      shippingDate: pkg.shippingDate ? 
        new Date(pkg.shippingDate).toISOString().replace('T', ' ').substring(0, 19) : 
        null,
      userName: pkg.user ? pkg.user.name : 'Unknown',
      user: pkg.user,
      wasteReduced: pkg.wasteReduced,
      costSaved: pkg.costSaved,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt
    }));
    
    res.json(transformedPackages);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

