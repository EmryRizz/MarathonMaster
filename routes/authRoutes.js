// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Show login form (GET)
router.get('/login', authController.showLoginForm);

// Process login (POST)
router.post('/login', authController.processLogin);

// Show register form (GET)
router.get('/register', authController.showRegisterForm); 

module.exports = router;
