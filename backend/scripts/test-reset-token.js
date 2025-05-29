/**
 * Reset Token Test Script
 * 
 * This script tests the password reset token generation and validation process
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../daos/user');
const userModel = require('../models/user');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Set up MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.error('DATABASE_URL environment variable is not set');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`Connected to MongoDB at ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Test reset token generation
const testGenerateToken = async (email) => {
  try {
    console.log(`Testing generateResetToken for email: ${email}`);
    
    const result = await userModel.generateResetToken(email);
    console.log('Generate token result:', result);
    
    if (result.success) {
      return result.data.resetToken;
    } else {
      console.error('Failed to generate token:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error generating token:', error);
    return null;
  }
};

// Test reset token validation
const testValidateToken = async (token) => {
  try {
    console.log(`Testing validateResetToken with token: ${token}`);
    
    const result = await userModel.validateResetToken(token);
    console.log('Validate token result:', result);
    
    return result;
  } catch (error) {
    console.error('Error validating token:', error);
    return { success: false, error: error.message };
  }
};

// Test generating and validating a fresh token
const runFullTest = async (email) => {
  // Generate a token
  const token = await testGenerateToken(email);
  
  if (!token) {
    console.error('Failed to generate token, cannot continue with test');
    return;
  }
  
  console.log('Token generated successfully:', token);
  console.log('Token length:', token.length);
  
  // Validate the token (should succeed)
  const validationResult = await testValidateToken(token);
  
  if (validationResult.success) {
    console.log('Token validation successful!');
  } else {
    console.error('Token validation failed:', validationResult.error);
  }
  
  // Direct DB check - see what's actually in the database
  const user = await User.findOne({ email });
  console.log('User from database:', {
    id: user._id,
    email: user.email,
    resetToken: user.resetToken,
    resetTokenExpiry: user.resetTokenExpiry,
  });
};

// Main function
const main = async () => {
  try {
    await connectDB();
    
    // Replace with a valid email from your database
    const testEmail = 'nisayurusandaneth@gmail.com'; 
    
    await runFullTest(testEmail);
    
    console.log('\nTest completed');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
};

// Run the main function
main(); 