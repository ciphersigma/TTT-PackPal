// createAdmin.js - Run with node createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path if needed
const connectDB = require('./config/db'); // Adjust path if needed

const createAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Database connected');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@packpal.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      
      // Ensure the user has admin privileges
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('Updated existing user to admin');
      }
    } else {
      // Create new admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@packpal.com',
        password: 'admin123', // will be hashed by the User model
        isAdmin: true,
        registrationDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    }
    
    // List all users with admin status
    const users = await User.find().select('name email isAdmin');
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Admin: ${user.isAdmin ? 'Yes' : 'No'}`);
    });

    // Disconnect from database
    await mongoose.connection.close();
    console.log('Database disconnected');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();