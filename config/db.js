const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Log connection attempt (without sensitive info)
    const uriParts = process.env.MONGO_URI.split('@');
    const sanitizedUri = uriParts.length > 1 
      ? `mongodb+srv://****:****@${uriParts[1]}`
      : 'mongodb://****';
    console.log('Connecting to MongoDB at:', sanitizedUri);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Add connection options for better reliability
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('Full error:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

module.exports = connectDB;
