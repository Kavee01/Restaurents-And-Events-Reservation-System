require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../daos/user');

// Connect to the database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pearl-reserve', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  createAdminUser();
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@pearlreserve.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists. No action needed.');
      process.exit(0);
    }
    
    // Generate salt and hash password
    const iterations = 10000;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('admin123', salt, iterations, 64, 'sha512').toString('hex');
    
    // Create admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@pearlreserve.com',
      password: hash,
      salt: salt,
      iterations: iterations,
      isOwner: true, // Admin can access owner features
      isAdmin: true
    });
    
    await adminUser.save();
    console.log('Admin user created successfully!');
    
    // Create a standard admin user with hardcoded credentials
    const standardAdmin = await User.findOne({ email: 'admin' });
    
    if (!standardAdmin) {
      const standardAdminUser = new User({
        name: 'System Admin',
        email: 'admin', // Using admin as email for simplicity
        password: hash,
        salt: salt,
        iterations: iterations,
        isOwner: true,
        isAdmin: true
      });
      
      await standardAdminUser.save();
      console.log('Standard admin user (admin/admin123) created successfully!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
} 