const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Enhanced debugging - Directory and file checks
console.log('============= DEBUGGING INFO =============');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Load environment variables
dotenv.config({ path: './.env' });

// Centralized logger with timestamps
const logWithTimestamp = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  logWithTimestamp('Critical Error: JWT_SECRET is not defined in the environment variables.');
  process.exit(1);
}

// System user for logs
const SYSTEM_USER = process.env.SYSTEM_USER || 'unknown-user';

// Initialize Express
const app = express();

// Connect to database
connectDB()
  .then(() => logWithTimestamp('Database connected successfully'))
  .catch((err) => {
    logWithTimestamp(`Database connection failed: ${err.message}`);
    process.exit(1); // Exit the process if the database connection fails
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log all requests dynamically
app.use((req, res, next) => {
  logWithTimestamp(`Request: ${req.method} ${req.originalUrl}`);
  next();
});

// IMPORTANT - Add a test route to confirm Express is handling routes
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test route works!',
    timestamp: new Date().toISOString()
  });
});

// Basic status route for health checks
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    currentUser: SYSTEM_USER,
    message: 'Packpal API is running'
  });
});

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    if (
      req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      const token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id
      const User = mongoose.model('User');
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        logWithTimestamp('Auth failed: User not found');
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      next();
    } else {
      logWithTimestamp('Auth failed: No token provided');
      res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    logWithTimestamp(`Auth error: ${error.message}`);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Define Models
try {
  // Check if the models directory exists
  const modelsDir = path.join(__dirname, 'models');
  if (!fs.existsSync(modelsDir)) {
    logWithTimestamp(`Models directory not found: ${modelsDir}`);
    logWithTimestamp('Creating models directory...');
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  // Define User model if not already defined
  try {
    mongoose.model('User');
    logWithTimestamp('User model already defined');
  } catch (error) {
    logWithTimestamp('Defining User model');
    
    const UserSchema = new mongoose.Schema({
      name: {
        type: String,
        required: [true, 'Please add a name'],
      },
      email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
      },
      password: {
        type: String,
        required: [true, 'Please add a password'],
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
      role: {
        type: String,
        enum: ['Owner', 'Admin', 'Member', 'Viewer'],
        default: 'Member',
      },
      username: {
        type: String,
        unique: true,
        sparse: true
      },
      position: {
        type: String
      },
      company: {
        type: String
      },
      phone: {
        type: String
      },
      registrationDate: {
        type: Date,
        default: Date.now,
      },
      lastLogin: {
        type: Date,
      },
      settings: {
        notifications: {
          emailNotifications: { type: Boolean, default: true },
          packageUpdates: { type: Boolean, default: true },
          teamChanges: { type: Boolean, default: true },
          announcementAlerts: { type: Boolean, default: true },
          dailyDigest: { type: Boolean, default: false },
          desktopNotifications: { type: Boolean, default: true }
        },
        display: {
          theme: { type: String, default: 'light' },
          dashboardLayout: { type: String, default: 'default' },
          dateFormat: { type: String, default: 'MM/DD/YYYY' },
          timeFormat: { type: String, default: '12h' }
        },
        privacy: {
          showProfileInfo: { type: Boolean, default: true },
          sharePackageStats: { type: Boolean, default: true },
          twoFactorAuth: { type: Boolean, default: false },
          autoLogout: { type: String, default: '30min' }
        },
        packaging: {
          defaultPackageType: { type: String, default: 'Standard' },
          prioritizeSustainability: { type: Boolean, default: true },
          optimizeCost: { type: Boolean, default: true },
          sendShippingUpdates: { type: Boolean, default: true },
          defaultShippingMethod: { type: String, default: 'Standard' }
        },
        integrations: {
          allowExcelExport: { type: Boolean, default: true },
          connectToShipping: { type: Boolean, default: false },
          apiAccessEnabled: { type: Boolean, default: false }
        },
        accessibility: {
          fontSize: { type: String, default: 'medium' },
          highContrast: { type: Boolean, default: false },
          reducedMotion: { type: Boolean, default: false },
          screenReaderOptimized: { type: Boolean, default: false }
        }
      }
    });
    
    mongoose.model('User', UserSchema);
    logWithTimestamp('User model defined');
  }

  // Define Package model if not already defined
  try {
    mongoose.model('Package');
    logWithTimestamp('Package model already defined');
  } catch (error) {
    logWithTimestamp('Defining Package model');
    
    const packageSchema = mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
      packageId: {
        type: String,
        unique: true
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
    
    // Generate package ID before saving
    packageSchema.pre('save', async function(next) {
      if (!this.packageId) {
        // Generate a unique package ID
        const baseId = Math.floor(1000 + Math.random() * 9000).toString();
        const Package = mongoose.model('Package');
        
        // Check if ID already exists and generate a new one if needed
        let isUnique = false;
        let packageId = baseId;
        let counter = 0;
        
        while (!isUnique) {
          const existingPackage = await Package.findOne({ packageId });
          if (!existingPackage) {
            isUnique = true;
          } else {
            counter++;
            packageId = `${baseId}-${counter}`;
          }
        }
        
        this.packageId = packageId;
      }
      next();
    });
    
    mongoose.model('Package', packageSchema);
    logWithTimestamp('Package model defined');
  }

  // Define GlobalSettings model if not already defined
  try {
    mongoose.model('GlobalSettings');
    logWithTimestamp('GlobalSettings model already defined');
  } catch (error) {
    logWithTimestamp('Defining GlobalSettings model');
    
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
    
    mongoose.model('GlobalSettings', globalSettingsSchema);
    logWithTimestamp('GlobalSettings model defined');
  }

  // Define Announcement model if not already defined
  try {
    mongoose.model('Announcement');
    logWithTimestamp('Announcement model already defined');
  } catch (error) {
    logWithTimestamp('Defining Announcement model');
    
    const announcementSchema = mongoose.Schema({
      title: {
        type: String,
        required: [true, 'Please add a title']
      },
      message: {
        type: String,
        required: [true, 'Please add a message']
      },
      readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      reactions: {
        thumbsUp: {
          type: Number,
          default: 0
        },
        heart: {
          type: Number,
          default: 0
        },
        celebration: {
          type: Number,
          default: 0
        }
      },
      userReactions: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        reactionType: {
          type: String,
          enum: ['thumbsUp', 'heart', 'celebration']
        }
      }],
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }, {
      timestamps: true
    });
    
    mongoose.model('Announcement', announcementSchema);
    logWithTimestamp('Announcement model defined');
  }

  // Define Checklist model if not already defined
  try {
    mongoose.model('Checklist');
    logWithTimestamp('Checklist model already defined');
  } catch (error) {
    logWithTimestamp('Defining Checklist model');
    
    const checklistItemSchema = new mongoose.Schema({
      text: {
        type: String,
        required: true
      },
      category: {
        type: String,
        default: 'General'
      },
      status: {
        type: String,
        enum: ['To Pack', 'Packed', 'Delivered'],
        default: 'To Pack'
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    });
    
    const checklistSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true
      },
      items: [checklistItemSchema],
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }, {
      timestamps: true
    });
    
    mongoose.model('Checklist', checklistSchema);
    logWithTimestamp('Checklist model defined');
  }
} catch (error) {
  logWithTimestamp(`Error defining models: ${error.message}`);
}

// --------------------
// INTEGRATED API ROUTES
// --------------------

// User routes

// Get current user
app.get('/api/users/me', authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    logWithTimestamp(`Error fetching current user: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all users (admin only)
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }

    const User = mongoose.model('User');
    const users = await User.find({}).select('-password');
    logWithTimestamp(`Retrieved ${users.length} users from database`);
    res.json(users);
  } catch (err) {
    logWithTimestamp(`Error fetching users: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login route with MongoDB integration
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    logWithTimestamp(`Login attempt for email: ${email}`);
    
    // First try to find user in MongoDB
    const User = mongoose.model('User');
    const user = await User.findOne({ email });
    
    if (user) {
      // For now, just compare passwords directly
      // In production, use bcrypt.compare
      if (password === user.password) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '30d'
        });
        
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          role: user.role,
          username: user.username || user.name.toLowerCase().replace(/\s/g, ''),
          registrationDate: user.registrationDate,
          lastLogin: user.lastLogin,
          token
        });
        
        logWithTimestamp(`User ${user.name} logged in successfully`);
        return;
      }
    }
    
    // Fallback to hardcoded users if MongoDB user not found
    if (email === 'admin@packpal.com' && password === 'admin123') {
      logWithTimestamp('Using hardcoded admin account');
      res.json({
        _id: 'admin_123',
        name: 'Admin User',
        email: 'admin@packpal.com',
        isAdmin: true,
        role: 'Admin',
        username: 'adminuser',
        registrationDate: new Date('2025-04-01').toISOString(),
        lastLogin: new Date().toISOString(),
        token: jwt.sign({ id: 'admin_123' }, process.env.JWT_SECRET, { expiresIn: '30d' })
      });
    } else if (email === 'user@packpal.com' && password === 'user123') {
      logWithTimestamp('Using hardcoded regular user account');
      res.json({
        _id: 'user_456',
        name: 'Regular User',
        email: 'user@packpal.com',
        isAdmin: false,
        role: 'Member',
        username: 'regularuser',
        registrationDate: new Date('2025-04-02').toISOString(),
        lastLogin: new Date().toISOString(),
        token: jwt.sign({ id: 'user_456' }, process.env.JWT_SECRET, { expiresIn: '30d' })
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    logWithTimestamp(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register route with MongoDB integration
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    logWithTimestamp(`Registration attempt for email: ${email}`);
    
    const User = mongoose.model('User');
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generate username from name
    const username = name.toLowerCase().replace(/\s/g, '');
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password, // In production, this will be hashed by the pre-save hook
      isAdmin: email.includes('admin') ? true : false, // Simple admin detection
      role: email.includes('admin') ? 'Admin' : 'Member',
      username,
      registrationDate: new Date()
    });
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      username: user.username,
      registrationDate: user.registrationDate,
      token
    });
    
    logWithTimestamp(`New user registered: ${user.name}`);
  } catch (error) {
    logWithTimestamp(`Registration error: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
app.put('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, position, company, phone } = req.body;
    
    const user = await mongoose.model('User').findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (position !== undefined) user.position = position;
    if (company !== undefined) user.company = company;
    if (phone !== undefined) user.phone = phone;
    
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      position: user.position,
      company: user.company,
      phone: user.phone,
      isAdmin: user.isAdmin,
      role: user.role,
      username: user.username,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin
    });
  } catch (err) {
    logWithTimestamp(`Error updating user profile: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user password
app.put('/api/users/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await mongoose.model('User').findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current password is correct
    if (currentPassword !== user.password) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    logWithTimestamp(`Error updating password: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user settings (notifications, display, etc.)
const updateUserSettings = (settingType) => {
  return async (req, res) => {
    try {
      const user = await mongoose.model('User').findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Initialize settings object if it doesn't exist
      if (!user.settings) {
        user.settings = {};
      }
      
      // Create or update the specific settings section
      user.settings[settingType] = req.body;
      
      await user.save();
      
      res.json(user.settings[settingType]);
    } catch (err) {
      logWithTimestamp(`Error updating ${settingType} settings: ${err.message}`);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
};

// Settings routes
app.put('/api/users/settings/notifications', authMiddleware, updateUserSettings('notifications'));
app.put('/api/users/settings/display', authMiddleware, updateUserSettings('display'));
app.put('/api/users/settings/privacy', authMiddleware, updateUserSettings('privacy'));
app.put('/api/users/settings/packaging', authMiddleware, updateUserSettings('packaging'));
app.put('/api/users/settings/integrations', authMiddleware, updateUserSettings('integrations'));
app.put('/api/users/settings/accessibility', authMiddleware, updateUserSettings('accessibility'));

// Update user role
app.put('/api/users/:id/role', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }

    const { role } = req.body;
    const userId = req.params.id;
    
    logWithTimestamp(`Updating user ${userId} role to ${role}`);
    
    if (!['Owner', 'Admin', 'Member', 'Viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const User = mongoose.model('User');
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    logWithTimestamp(`User ${updatedUser.name} role updated to ${role}`);
    res.json(updatedUser);
  } catch (err) {
    logWithTimestamp(`Error updating user role: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Package routes

// Get all packages (admin only)
app.get('/api/packages', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }

    const Package = mongoose.model('Package');
    
    // Find all packages and populate the user field
    const packages = await Package.find({}).populate('user', 'name');
    
    // Transform data to match frontend expectations
    const transformedPackages = packages.map(pkg => ({
      _id: pkg._id,
      packageId: pkg.packageId || pkg._id.toString().substring(0, 8),
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
    
    logWithTimestamp(`Retrieved ${packages.length} packages from database`);
    res.json(transformedPackages);
  } catch (err) {
    logWithTimestamp(`Error fetching packages: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's packages
app.get('/api/packages/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify user is requesting their own packages or is an admin
    if (userId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to view these packages' });
    }
    
    const Package = mongoose.model('Package');
    const packages = await Package.find({ user: userId }).sort({ createdAt: -1 });
    
    res.json(packages);
  } catch (err) {
    logWithTimestamp(`Error fetching user packages: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get packages for current user
app.get('/api/packages/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const Package = mongoose.model('Package');
    const packages = await Package.find({ user: userId }).sort({ createdAt: -1 });
    
    res.json(packages);
  } catch (err) {
    logWithTimestamp(`Error fetching user packages: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a new package
app.post('/api/packages', authMiddleware, async (req, res) => {
  try {
    const { packageType, customer, shippingDate, status } = req.body;
    
    const Package = mongoose.model('Package');
    
    const newPackage = new Package({
      user: req.user._id,
      packageType,
      customer,
      shippingDate: shippingDate ? new Date(shippingDate) : null,
      status: status || 'pending',
      wasteReduced: Math.floor(Math.random() * 500) + 100, // Sample value
      costSaved: Math.floor(Math.random() * 20) + 5 // Sample value
    });
    
    await newPackage.save();
    
    // Update global optimized packages count
    const GlobalSettings = mongoose.model('GlobalSettings');
    const settings = await GlobalSettings.findOne({});
    
    if (settings) {
      settings.optimizedPackages += 1;
      await settings.save();
    }
    
    res.status(201).json(newPackage);
  } catch (err) {
    logWithTimestamp(`Error creating package: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Global settings routes
app.get('/api/settings', async (req, res) => {
  try {
    const GlobalSettings = mongoose.model('GlobalSettings');
    
    // Find settings or create default if none exist
    let settings = await GlobalSettings.findOne({});
    
    if (!settings) {
      logWithTimestamp('No settings found, creating default settings');
      settings = await GlobalSettings.create({
        wasteReduction: 42,
        costSavings: 12450,
        optimizedPackages: 8672,
        recyclablePercentage: 78
      });
    }
    
    logWithTimestamp('Settings retrieved successfully');
    res.json(settings);
  } catch (err) {
    logWithTimestamp(`Error fetching settings: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.put('/api/settings', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }
    
    const {
      wasteReduction,
      costSavings,
      optimizedPackages,
      recyclablePercentage
    } = req.body;
    
    logWithTimestamp(`Updating settings: ${JSON.stringify(req.body)}`);
    
    const GlobalSettings = mongoose.model('GlobalSettings');
    
    // Find and update settings
    let settings = await GlobalSettings.findOne({});
    
    if (!settings) {
      // Create settings if they don't exist
      settings = new GlobalSettings({
        wasteReduction,
        costSavings,
        optimizedPackages,
        recyclablePercentage,
        updatedBy: req.user._id
      });
    } else {
      // Update existing settings
      settings.wasteReduction = wasteReduction;
      settings.costSavings = costSavings;
      settings.optimizedPackages = optimizedPackages;
      settings.recyclablePercentage = recyclablePercentage;
      settings.lastUpdated = Date.now();
      settings.updatedBy = req.user._id;
    }
    
    await settings.save();
    logWithTimestamp('Settings updated successfully');
    res.json(settings);
  } catch (err) {
    logWithTimestamp(`Error updating settings: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Announcement routes
app.get('/api/announcements', async (req, res) => {
  try {
    const Announcement = mongoose.model('Announcement');
    
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    
    logWithTimestamp(`Retrieved ${announcements.length} announcements from database`);
    res.json(announcements);
  } catch (err) {
    logWithTimestamp(`Error fetching announcements: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/announcements', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }
    
    const { title, message } = req.body;
    
    logWithTimestamp(`Creating announcement: ${title}`);
    
    const Announcement = mongoose.model('Announcement');
    
    // Create new announcement
    const announcement = new Announcement({
      title,
      message,
      createdBy: req.user._id
    });
    
    await announcement.save();
    
    // Return the saved announcement
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name');
    
    logWithTimestamp('Announcement created successfully');
    res.status(201).json(populatedAnnouncement);
  } catch (err) {
    logWithTimestamp(`Error creating announcement: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/api/announcements/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }
    
    const announcementId = req.params.id;
    logWithTimestamp(`Deleting announcement: ${announcementId}`);
    
    const Announcement = mongoose.model('Announcement');
    const announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    await announcement.remove();
    
    logWithTimestamp('Announcement deleted successfully');
    res.json({ message: 'Announcement removed', id: announcementId });
  } catch (err) {
    logWithTimestamp(`Error deleting announcement: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark announcement as read
app.post('/api/announcements/:id/read', authMiddleware, async (req, res) => {
  try {
    const announcementId = req.params.id;
    const userId = req.user._id;
    
    const Announcement = mongoose.model('Announcement');
    const announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Check if user has already read the announcement
    if (!announcement.readBy.includes(userId)) {
      announcement.readBy.push(userId);
      await announcement.save();
    }
    
    res.json({ message: 'Announcement marked as read' });
  } catch (err) {
    logWithTimestamp(`Error marking announcement as read: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get read announcements for a user
app.get('/api/users/:userId/announcements/read', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify user is requesting their own data or is an admin
    if (userId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to view this data' });
    }
    
    const Announcement = mongoose.model('Announcement');
    const announcements = await Announcement.find({ readBy: userId });
    
    const readAnnouncements = announcements.map(announcement => ({
      announcementId: announcement._id,
      title: announcement.title
    }));
    
    res.json(readAnnouncements);
  } catch (err) {
    logWithTimestamp(`Error fetching read announcements: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add reaction to announcement
app.post('/api/announcements/:id/react', authMiddleware, async (req, res) => {
  try {
    const announcementId = req.params.id;
    const { reactionType } = req.body;
    const userId = req.user._id;
    
    // Validate reaction type
    if (!['thumbsUp', 'heart', 'celebration'].includes(reactionType)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }
    
    const Announcement = mongoose.model('Announcement');
    const announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Check if user has already reacted with this type
    const existingReaction = announcement.userReactions.find(
      reaction => reaction.user.toString() === userId.toString() && reaction.reactionType === reactionType
    );
    
    if (!existingReaction) {
      // Increment the reaction count
      announcement.reactions[reactionType] += 1;
      
      // Add to user reactions
      announcement.userReactions.push({
        user: userId,
        reactionType
      });
      
      await announcement.save();
    }
    
    res.json(announcement.reactions);
  } catch (err) {
    logWithTimestamp(`Error adding reaction to announcement: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Checklist routes

// Get all checklists for the current user
app.get('/api/checklists', authMiddleware, async (req, res) => {
  try {
    const Checklist = mongoose.model('Checklist');
    
    // Find checklists where user is creator or team member
    const checklists = await Checklist.find({
      $or: [
        { createdBy: req.user._id },
        { team: req.user._id }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(checklists);
  } catch (err) {
    logWithTimestamp(`Error fetching checklists: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a new checklist
app.post('/api/checklists', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    const Checklist = mongoose.model('Checklist');
    
    const checklist = new Checklist({
      name,
      createdBy: req.user._id,
      items: []
    });
    
    await checklist.save();
    
    res.status(201).json(checklist);
  } catch (err) {
    logWithTimestamp(`Error creating checklist: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add item to checklist
app.post('/api/checklists/:id/items', authMiddleware, async (req, res) => {
  try {
    const checklistId = req.params.id;
    const { text, category, status } = req.body;
    
    const Checklist = mongoose.model('Checklist');
    const checklist = await Checklist.findById(checklistId);
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    // Create new item
    const newItem = {
      text,
      category: category || 'General',
      status: status || 'To Pack',
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to checklist
    checklist.items.push(newItem);
    await checklist.save();
    
    // Return the newly created item
    res.status(201).json(checklist.items[checklist.items.length - 1]);
  } catch (err) {
    logWithTimestamp(`Error adding item to checklist: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update item status
app.put('/api/checklists/:checklistId/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const { checklistId, itemId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['To Pack', 'Packed', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const Checklist = mongoose.model('Checklist');
    const checklist = await Checklist.findById(checklistId);
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    // Find and update item
    const item = checklist.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    item.status = status;
    item.updatedAt = new Date();
    
    await checklist.save();
    
    res.json(item);
  } catch (err) {
    logWithTimestamp(`Error updating item status: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete item from checklist
app.delete('/api/checklists/:checklistId/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const { checklistId, itemId } = req.params;
    
    const Checklist = mongoose.model('Checklist');
    const checklist = await Checklist.findById(checklistId);
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    // Remove item
    checklist.items.id(itemId).remove();
    await checklist.save();
    
    res.json({ message: 'Item removed', id: itemId });
  } catch (err) {
    logWithTimestamp(`Error deleting item: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a checklist
app.delete('/api/checklists/:id', authMiddleware, async (req, res) => {
  try {
    const checklistId = req.params.id;
    
    const Checklist = mongoose.model('Checklist');
    const checklist = await Checklist.findById(checklistId);
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    // Verify user is the creator or has delete permissions
    if (checklist.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this checklist' });
    }
    
    await checklist.remove();
    
    res.json({ message: 'Checklist removed', id: checklistId });
  } catch (err) {
    logWithTimestamp(`Error deleting checklist: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --------------------
// END INTEGRATED API ROUTES
// --------------------

// Try to import and use the router if available
logWithTimestamp('Attempting to load external routes...');
try {
  // Check if routes directory exists
  const routesDir = path.join(__dirname, 'routes');
  if (!fs.existsSync(routesDir)) {
    logWithTimestamp(`Routes directory not found: ${routesDir}`);
    
    // Try to find routes directory in parent or sibling directories
    const possibleRoutesDirectories = [
      path.join(__dirname, '..', 'routes'),
      path.join(__dirname, '..', 'packpal-server', 'routes'), 
      path.join(process.cwd(), 'routes'),
      path.join(process.cwd(), 'packpal-server', 'routes')
    ];
    
    let routesDirFound = false;
    let foundRoutesDir = '';
    
    for (const dir of possibleRoutesDirectories) {
      if (fs.existsSync(dir)) {
        logWithTimestamp(`Found alternative routes directory: ${dir}`);
        routesDirFound = true;
        foundRoutesDir = dir;
        break;
      }
    }
    
    if (routesDirFound) {
      logWithTimestamp(`Using alternative routes directory: ${foundRoutesDir}`);
      const files = fs.readdirSync(foundRoutesDir);
      logWithTimestamp(`Files in alternative routes directory: ${files.join(', ')}`);
      
      // Try to load user routes from the found directory
      if (files.includes('userRoutes.js')) {
        try {
          const userRoutesPath = path.join(foundRoutesDir, 'userRoutes.js');
          logWithTimestamp(`Loading user routes from: ${userRoutesPath}`);
          
          const userRoutes = require(userRoutesPath);
          app.use('/api/users', userRoutes);
          logWithTimestamp('User routes loaded from alternative directory');
        } catch (error) {
          logWithTimestamp(`Failed to load user routes: ${error.message}`);
          logWithTimestamp('Using integrated user routes instead');
        }
      }
      
      // Try to load other routes
      if (files.includes('announcementRoutes.js')) {
        try {
          const announcementRoutesPath = path.join(foundRoutesDir, 'announcementRoutes.js');
          logWithTimestamp(`Loading announcement routes from: ${announcementRoutesPath}`);
          
          const announcementRoutes = require(announcementRoutesPath);
          app.use('/api/announcements', announcementRoutes);
          logWithTimestamp('Announcement routes loaded successfully from alternative directory');
        } catch (error) {
          logWithTimestamp(`Failed to load announcement routes: ${error.message}`);
          logWithTimestamp('Using integrated announcement routes instead');
        }
      }
    }
  } else {
    // Routes directory exists, try to load routes
    const files = fs.readdirSync(routesDir);
    logWithTimestamp(`Files in routes directory: ${files.join(', ')}`);
    
    if (files.includes('userRoutes.js')) {
      try {
        const userRoutesPath = path.join(routesDir, 'userRoutes.js');
        logWithTimestamp(`Loading user routes from: ${userRoutesPath}`);
        
        const userRoutes = require(userRoutesPath);
        app.use('/api/users', userRoutes);
        logWithTimestamp('User routes loaded successfully');
      } catch (error) {
        logWithTimestamp(`Failed to load user routes: ${error.message}`);
        logWithTimestamp('Using integrated user routes instead');
      }
    } else {
      logWithTimestamp('userRoutes.js not found in routes directory');
    }
    
    // Load announcement routes if they exist
    if (files.includes('announcementRoutes.js')) {
      try {
        const announcementRoutesPath = path.join(routesDir, 'announcementRoutes.js');
        logWithTimestamp(`Loading announcement routes from: ${announcementRoutesPath}`);
        
        const announcementRoutes = require(announcementRoutesPath);
        app.use('/api/announcements', announcementRoutes);
        logWithTimestamp('Announcement routes loaded successfully');
      } catch (error) {
        logWithTimestamp(`Failed to load announcement routes: ${error.message}`);
        logWithTimestamp('Using integrated announcement routes instead');
      }
    } else {
      logWithTimestamp('announcementRoutes.js not found in routes directory');
    }
    
    // Load package routes if they exist
    if (files.includes('packageRoutes.js')) {
      try {
        const packageRoutesPath = path.join(routesDir, 'packageRoutes.js');
        logWithTimestamp(`Loading package routes from: ${packageRoutesPath}`);
        
        const packageRoutes = require(packageRoutesPath);
        app.use('/api/packages', packageRoutes);
        logWithTimestamp('Package routes loaded successfully');
      } catch (error) {
        logWithTimestamp(`Failed to load package routes: ${error.message}`);
        logWithTimestamp('Using integrated package routes instead');
      }
    }
    
    // Load settings routes if they exist
    if (files.includes('settingsRoutes.js')) {
      try {
        const settingsRoutesPath = path.join(routesDir, 'settingsRoutes.js');
        logWithTimestamp(`Loading settings routes from: ${settingsRoutesPath}`);
        
        const settingsRoutes = require(settingsRoutesPath);
        app.use('/api/settings', settingsRoutes);
        logWithTimestamp('Settings routes loaded successfully');
      } catch (error) {
        logWithTimestamp(`Failed to load settings routes: ${error.message}`);
        logWithTimestamp('Using integrated settings routes instead');
      }
    }
  }
} catch (err) {
  logWithTimestamp(`Error during routes setup: ${err.message}`);
  logWithTimestamp(`Error stack: ${err.stack}`);
}

// Catch-all route for API 404s - This must come AFTER all API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
    timestamp: new Date().toISOString()
  });
});

// Serve static assets in production
const serveStaticFiles = () => {
  const staticPath = path.join(__dirname, '../client/build');
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(staticPath, 'index.html'));
    });
    logWithTimestamp('Static files served from client/build');
  } else {
    logWithTimestamp(`Static directory not found: ${staticPath}`);
    app.use('*', (req, res) => {
      res.status(404).send('Static files not found. Please ensure the build directory exists.');
    });
  }
};

if (process.env.NODE_ENV === 'production') {
  serveStaticFiles();
} else {
  // Development welcome route
  app.get('/', (req, res) => {
    res.send(`Packpal API Server is running in development mode. Current time: ${new Date().toISOString()}`);
  });
}

// Error handler (must be the last middleware)
app.use((err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  logWithTimestamp(`Error: ${err.stack}`);
  res.status(500).json({
    success: false,
    error: isProduction ? 'Internal Server Error' : err.message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
const handleShutdown = (signal) => {
  logWithTimestamp(`${signal} received: Closing server...`);
  if (server) {
    server.close(() => {
      logWithTimestamp('Server closed gracefully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', handleShutdown); // For Ctrl+C
process.on('SIGTERM', handleShutdown); // For termination signals
process.on('unhandledRejection', (err) => {
  logWithTimestamp(`Unhandled Rejection: ${err.message}`);
  handleShutdown('Unhandled Rejection');
});

const PORT = process.env.PORT || 5000;

let server;
try {
  // Use 0.0.0.0 instead of 127.0.0.1 to allow connections from other machines
  server = app.listen(PORT, '0.0.0.0', () => {
    logWithTimestamp(`Server running on port ${PORT}`);
    logWithTimestamp(`Current system user: ${SYSTEM_USER}`);
    
    // After server starts, print a message showing how to test the routes
    console.log('\n============= HOW TO TEST =============');
    console.log(`1. Test basic server: http://localhost:${PORT}/test`);
    console.log(`2. Test API status: http://localhost:${PORT}/api/status`);
    console.log(`3. Test user login (POST): http://localhost:${PORT}/api/users/login`);
    console.log(`   With body: {"email":"admin@packpal.com","password":"admin123"}`);
    console.log(`4. Test user registration (POST): http://localhost:${PORT}/api/users/register`);
    console.log(`   With body: {"name":"Test User","email":"test@example.com","password":"password123"}`);
    console.log(`5. Test announcements: http://localhost:${PORT}/api/announcements`);
    console.log(`6. Test settings: http://localhost:${PORT}/api/settings`);
    console.log('======================================\n');
  });
} catch (err) {
  logWithTimestamp(`Failed to start server: ${err.message}`);
  process.exit(1);
}

module.exports = server; // Export for testing