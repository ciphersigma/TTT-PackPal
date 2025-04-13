const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    
    // Try to add deprecated options only if they're supported by this MongoDB version
    if (mongoose.version < '6.0.0') {
      options.useCreateIndex = true;
      options.useFindAndModify = false;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/packpal', options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // We'll let the caller handle the error
    throw error;
  }
};

module.exports = connectDB;