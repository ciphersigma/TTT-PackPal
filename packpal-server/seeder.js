const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Package = require('./models/Package');
const Announcement = require('./models/Announcement');
const GlobalSettings = require('./models/GlobalSettings');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Package.deleteMany();
    await Announcement.deleteMany();
    await GlobalSettings.deleteMany();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@packpal.com',
      password: adminPassword,
      isAdmin: true,
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    // Create regular user
    const regularPassword = await bcrypt.hash('user123', 10);
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@packpal.com',
      password: regularPassword,
      isAdmin: false,
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    // Create packages for regular user
    const packages = [
      {
        user: regularUser._id,
        packageType: 'Eco-friendly',
        status: 'pending',
        customer: 'GreenShip Inc.',
        shippingDate: new Date().toISOString(),
        wasteReduced: 320,
        costSaved: 18
      },
      {
        user: regularUser._id,
        packageType: 'Compact',
        status: 'shipped',
        customer: 'OrganicGoods Ltd.',
        shippingDate: new Date().toISOString(),
        wasteReduced: 450,
        costSaved: 22
      }
    ];

    await Package.insertMany(packages);

    // Create announcements
    const announcements = [
      {
        title: 'Welcome to PackPal!',
        message: 'Thank you for joining our sustainable packaging platform. Together we can make a difference in reducing packaging waste.',
        createdBy: admin._id,
        readBy: [],
        reactions: { thumbsUp: 5, heart: 3, celebration: 2 }
      },
      {
        title: 'New Feature: Package Optimization',
        message: 'We have just launched our new package optimization feature that can suggest the most eco-friendly packaging for your products.',
        createdBy: admin._id,
        readBy: [regularUser._id],
        reactions: { thumbsUp: 10, heart: 7, celebration: 4 }
      }
    ];

    await Announcement.insertMany(announcements);

    // Create global settings
    await GlobalSettings.create({
      wasteReduction: 42,
      costSavings: 12450,
      optimizedPackages: 8672,
      recyclablePercentage: 78,
      lastUpdated: new Date().toISOString(),
      updatedBy: admin._id
    });

    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Package.deleteMany();
    await Announcement.deleteMany();
    await GlobalSettings.deleteMany();

    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
