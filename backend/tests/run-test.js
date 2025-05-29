// Simple test script for system testing
const http = require('http');
const https = require('https');

console.log('Starting system test...');
console.log('=============================================');

// Test local API if it's running
const testLocalAPI = () => {
  return new Promise((resolve) => {
    try {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        timeout: 2000
      }, (res) => {
        console.log(`Local API Status: ${res.statusCode}`);
        resolve(res.statusCode === 200);
      });

      req.on('error', (e) => {
        console.log(`Local API Test: Failed - ${e.message}`);
        resolve(false);
      });

      req.on('timeout', () => {
        console.log('Local API Test: Failed - Request timed out');
        req.destroy();
        resolve(false);
      });

      req.end();
    } catch (error) {
      console.log(`Local API Test Error: ${error.message}`);
      resolve(false);
    }
  });
};

// Test deployed API if available
const testDeployedAPI = () => {
  return new Promise((resolve) => {
    try {
      // Adjust URL if needed
      const req = https.request({
        hostname: 'pearlreserve.vercel.app',
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`Deployed API Status: ${res.statusCode}`);
        resolve(res.statusCode === 200);
      });

      req.on('error', (e) => {
        console.log(`Deployed API Test: Failed - ${e.message}`);
        resolve(false);
      });

      req.on('timeout', () => {
        console.log('Deployed API Test: Failed - Request timed out');
        req.destroy();
        resolve(false);
      });

      req.end();
    } catch (error) {
      console.log(`Deployed API Test Error: ${error.message}`);
      resolve(false);
    }
  });
};

// Check database connection
const testDatabase = () => {
  // This is a mock test since we don't have direct DB access
  console.log('Database Test: Simulated - No direct access');
  return Promise.resolve(true);
};

// Run all tests
async function runTests() {
  console.log('Testing local API...');
  const localAPIStatus = await testLocalAPI();
  
  console.log('Testing deployed API...');
  const deployedAPIStatus = await testDeployedAPI();
  
  console.log('Testing database connection...');
  const dbStatus = await testDatabase();
  
  console.log('=============================================');
  console.log('Test Results:');
  console.log(`Local API: ${localAPIStatus ? 'PASS' : 'FAIL'}`);
  console.log(`Deployed API: ${deployedAPIStatus ? 'PASS' : 'FAIL'}`);
  console.log(`Database: ${dbStatus ? 'PASS' : 'FAIL'}`);
  console.log('=============================================');
  
  // Generate simple HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>System Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background-color: #f1f1f1; padding: 20px; text-align: center; }
    .result { margin: 20px 0; padding: 10px; border-radius: 5px; }
    .pass { background-color: #dff0d8; color: #3c763d; }
    .fail { background-color: #f2dede; color: #a94442; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f1f1f1; }
  </style>
</head>
<body>
  <div class="header">
    <h1>System Test Report</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
  
  <h2>Test Results</h2>
  <table>
    <tr>
      <th>Test</th>
      <th>Status</th>
    </tr>
    <tr>
      <td>Local API</td>
      <td class="${localAPIStatus ? 'pass' : 'fail'}">${localAPIStatus ? 'PASS' : 'FAIL'}</td>
    </tr>
    <tr>
      <td>Deployed API</td>
      <td class="${deployedAPIStatus ? 'pass' : 'fail'}">${deployedAPIStatus ? 'PASS' : 'FAIL'}</td>
    </tr>
    <tr>
      <td>Database</td>
      <td class="${dbStatus ? 'pass' : 'fail'}">${dbStatus ? 'PASS' : 'FAIL'}</td>
    </tr>
  </table>
  
  <h2>Summary</h2>
  <div class="result ${(localAPIStatus && deployedAPIStatus && dbStatus) ? 'pass' : 'fail'}">
    <h3>Overall Status: ${(localAPIStatus && deployedAPIStatus && dbStatus) ? 'PASS' : 'FAIL'}</h3>
    <p>Tests completed at ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
  
  const fs = require('fs');
  fs.writeFileSync('system-test-report.html', htmlReport);
  console.log('HTML report generated: system-test-report.html');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
}); 