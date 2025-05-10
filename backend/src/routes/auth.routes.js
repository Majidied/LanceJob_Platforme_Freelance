const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticateJWT = require('../middleware/auth.middleware');

const router = express.Router();

// User registration
router.post('/register', authController.register);
// User login
router.post('/login', authController.login);
// Token refresh
router.post('/refresh', authController.refresh);
// User logout
router.post('/logout', authController.logout);
// Verify email
router.post('/verify-email', authenticateJWT, authController.verifyEmail);
// Resend verification email
router.post('/resend-verification', authenticateJWT, authController.resendVerificationEmail);
// Verify password reset token
router.post('/verify-password-reset', authController.verifyPasswordResetToken);
// Reset password
router.post('/reset-password', authController.resetPassword);
// Send password reset email
router.post('/send-password-reset-email', authController.sendPasswordResetEmail);

module.exports = router;