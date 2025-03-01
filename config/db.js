// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI is not defined in environment variables. Please check your .env file.');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error Details:');
    console.error(`Error Message: ${error.message}`);
    if (error.code) console.error(`Error Code: ${error.code}`);
    if (error.name) console.error(`Error Name: ${error.name}`);
    
    // Log the connection string (remove sensitive info)
    const sanitizedUri = process.env.MONGO_URI ? 
      process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 
      'Not defined';
    console.error(`Connection String (sanitized): ${sanitizedUri}`);
    
    process.exit(1);
  }
};

module.exports = connectDB;
