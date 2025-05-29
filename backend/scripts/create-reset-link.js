/**
 * Create Reset Link Script
 * 
 * This script creates a reset link that can be used for testing
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../daos/user');
const userModel = require('../models/user');

// Load environment variables
dotenv.config();

// Main function
const main = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.error('DATABASE_URL environment variable is not set');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Generate reset token
    const email = 'nisayurusandaneth@gmail.com';
    const result = await userModel.generateResetToken(email);
    
    if (!result.success) {
      console.error('Failed to generate token:', result.error);
      process.exit(1);
    }
    
    const token = result.data.resetToken;
    
    // Create reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password/${token}`;
    
    console.log('\n=== RESET PASSWORD LINK ===');
    console.log(resetLink);
    console.log('\nToken:', token);
    console.log('Token length:', token.length);
    console.log('\nCopy and paste this link into your browser to test the reset password functionality.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
};

// Run the script
main(); 