// Admin middleware - Enhanced with better error handling and logging
const User = require('../models/User');

const logWithTimestamp = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Admin middleware that checks if the user has admin privileges
const admin = async (req, res, next) => {
  try {
    if (!req.user) {
      logWithTimestamp('Admin check failed: No user in request');
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated',
        timestamp: new Date().toISOString()
      });
    }

    // Log the user ID being checked
    logWithTimestamp(`Checking admin status for user ID: ${req.user.id}`);
    
    // Fetch fresh user data from database to ensure we have current privileges
    const user = await User.findById(req.user.id);
    
    if (!user) {
      logWithTimestamp(`Admin check failed: User ID ${req.user.id} not found in database`);
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString() 
      });
    }
    
    // Check if the user is an admin
    if (!user.isAdmin) {
      logWithTimestamp(`Admin access denied: User ${user.name} (${user.id}) is not an admin`);
      return res.status(403).json({ 
        success: false,
        message: 'Access denied: Admin privileges required',
        timestamp: new Date().toISOString()
      });
    }
    
    logWithTimestamp(`Admin access granted for user ${user.name} (${user.id})`);
    next();
  } catch (err) {
    logWithTimestamp(`Admin middleware error: ${err.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Server error during admin check',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = admin;