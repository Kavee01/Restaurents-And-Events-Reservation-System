// Authentication testing script for the project root
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Authentication Tests...');
console.log('=============================================');

// Run the backend auth tests
try {
  console.log('Running authentication tests...');
  execSync('cd backend && npm run auth-test', { stdio: 'inherit' });
  console.log('Authentication tests completed. See auth-test-report.html for results.');
} catch (error) {
  console.error('Error running authentication tests:', error.message);
}

console.log('=============================================');
console.log('Test workflow completed.');
console.log('Reports available:');
console.log('- system-test-report.html: General system test report');
console.log('- auth-test-report.html: Authentication test report');
console.log('============================================='); 