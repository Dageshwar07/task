const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Register a new user
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', authMiddleware, authController.getCurrentUser);

// Update user (protected route)
router.put('/me', authMiddleware, authController.updateUser);

// Change password (protected route)
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;