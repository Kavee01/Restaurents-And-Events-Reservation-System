const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} = require('../controllers/adminController');

// All routes require admin authentication
router.use(verifyToken, isAdmin);

// User management routes
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', updateUserStatus);

module.exports = router; 