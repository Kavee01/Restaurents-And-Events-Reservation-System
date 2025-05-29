const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const createUploadDirectories = () => {
  const dirs = [
    'public',
    'public/uploads',
    'public/uploads/restaurants'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });
};

module.exports = {
  createUploadDirectories
}; 