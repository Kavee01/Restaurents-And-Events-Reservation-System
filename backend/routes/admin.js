const express = require('express');
const adminController = require('../controllers/admin');
const securityMiddleware = require('../middlewares/security');
const router = express.Router();

// Make sure these routes are only accessible by admins
router.use(securityMiddleware.checkLogin, securityMiddleware.checkIfAdmin);

// Get dashboard statistics
router.get('/stats', adminController.getDashboardStats);

module.exports = router; 