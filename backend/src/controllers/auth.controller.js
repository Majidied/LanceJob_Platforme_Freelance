const Freelancer = require('../models/freelancer.model');
const Client = require('../models/client.model');
const User = require('../models/user.model');
const { generateToken, generateVerificationCode, verifyVerificationCode, getUserIdByToken } = require('../utils/jwt.utils');
const { sendVerificationEmail } = require('../utils/email.utils');
const bcrypt = require('bcrypt');
const redisClient = require('../config/redis');

const login = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: 'Request body is missing' });
        }
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = await generateToken(user.id);
        if (!token) {
            return res.status(500).json({ message: 'Failed to generate token' });
        }
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
};


const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Authorization header:', authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('Missing or malformed Authorization header');
            return res.status(400).json({ message: 'Authorization header missing or malformed' });
        }
        const token = authHeader.split(' ')[1];
        console.log('Extracted token:', token);
        const userId = await getUserIdByToken(token);
        console.log('User ID from token:', userId);
        if (!userId) {
            console.error('Invalid token or user not found');
            return res.status(400).json({ message: 'Invalid token or user not found' });
        }
        // Use correct redis client instance
        if (redisClient.del) {
            await redisClient.del(userId.toString());
            console.log(`Deleted session for user ID: ${userId}`);
        } else if (redisClient.redisClient && redisClient.redisClient.del) {
            await redisClient.redisClient.del(userId.toString());
            console.log(`Deleted session for user ID: ${userId} using redisClient.redisClient`);
        } else {
            console.error('Redis client is not properly configured');
            return res.status(500).json({ message: 'Redis client is not properly configured' });
        }
        res.json({ message: 'Logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'An error occurred during logout' });
    }
};

const register = async (req, res) => {
    let user = null;
    try {
        const { FrisName, LastName, email, password, role } = req.body;
        const userRole = role === 'freelancer' ? 'freelancer' : 'client';
        const Model = userRole === 'freelancer' ? Freelancer : Client;
        const existingUser = await Model.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new Model({
            name: `${FrisName} ${LastName}`,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: userRole,
        });
        await user.save();
        try {
            const verificationCode = generateVerificationCode(user.id);
            await sendVerificationEmail(email, verificationCode);
            const token = generateToken(user.id);
            res.status(201).json({ message: 'User registered successfully. Please check your email for verification.', token });
        } catch (innerError) {
            // If sending email or generating code fails, remove the user
            await Model.deleteOne({ _id: user._id });
            console.error('Error after saving user, rolling back:', innerError);
            res.status(500).json({ message: 'An error occurred during registration. Please try again.' });
        }
    } catch (error) {
        // If user was created but something failed, try to remove
        if (user && user._id) {
            try {
                await user.constructor.deleteOne({ _id: user._id });
            } catch (cleanupError) {
                console.error('Error during cleanup after registration failure:', cleanupError);
            }
        }
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'An error occurred during registration' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ message: 'Authorization header missing or malformed' });
        }
        const token = authHeader.split(' ')[1];
        const userId = await getUserIdByToken(token);
        if (!userId) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const { verificationCode } = req.body;
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!verifyVerificationCode(user.id, verificationCode)) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        user.status = "ACTIVE";
        await user.save();
        await redisClient.redisClient.del(userId.toString());
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).json({ message: 'An error occurred during email verification' });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ message: 'Authorization header missing or malformed' });
        }
        const token = authHeader.split(' ')[1];
        const userId = await getUserIdByToken(token);
        if (!userId) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.status === 'ACTIVE') {
            return res.status(400).json({ message: 'Email is already verified' });
        }
        const verificationCode = generateVerificationCode(user.id);
        await user.save();
        await sendVerificationEmail(user.email, verificationCode);
        res.json({ message: 'Verification email resent successfully' });
    } catch (error) {
        console.error('Error during resending verification email:', error);
        res.status(500).json({ message: 'An error occurred during resending verification email' });
    }
};

const verifyPasswordResetToken = async (req, res) => {
    try {
        const { email, resetToken } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isValidToken = await bcrypt.compare(resetToken, user.resetTokenHash);
        if (!isValidToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        res.json({ message: 'Password reset token is valid' });
    } catch (error) {
        console.error('Error during password reset token verification:', error);
        res.status(500).json({ message: 'An error occurred during password reset token verification' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.find({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetTokenHash = null;
        await user.save();
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'An error occurred during password reset' });
    }
}

const sendPasswordResetEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.find({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const resetCode = generateVerificationCode();
        await user.save();
        await SendVerificationEmail(email, resetCode);
        res.json({ message: 'Password reset email sent successfully' });
    }
    catch (error) {
        console.error('Error during sending password reset email:', error);
        res.status(500).json({ message: 'An error occurred during sending password reset email' });
    }
}

const isVerified = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ message: 'Authorization header missing or malformed' });
        }
        const token = authHeader.split(' ')[1];
        const userId = await getUserIdByToken(token);
        if (!userId) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ isVerified: !!user.status && user.status === 'ACTIVE' });
    } catch (error) {
        console.error('Error checking verification status:', error);
        res.status(500).json({ message: 'An error occurred while checking verification status' });
    }
};

module.exports = {
    login,
    logout,
    register,
    verifyEmail,
    resendVerificationEmail,
    verifyPasswordResetToken,
    resetPassword,
    sendPasswordResetEmail,
    isVerified
};