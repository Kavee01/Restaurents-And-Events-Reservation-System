#!/usr/bin/env node

/**
 * Script to set up the admin user for PearlReserve
 * Run this script with: node setup-admin.js
 */

const http = require('http');

// Make a request to the check-admin API endpoint
console.log('Checking if admin user exists...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/user/check-admin',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.exists) {
        console.log('✅ Admin user already exists');
      } else {
        console.log('✅ Admin user created successfully');
        console.log('Admin Credentials:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
      }
      console.log('\nYou can now log in at http://localhost:5173/signin');
    } catch (e) {
      console.error('Error parsing response:', e);
      console.error('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('⚠️ Error checking admin user:', error.message);
  console.log('Make sure your backend server is running on port 3000');
});

req.end(); 