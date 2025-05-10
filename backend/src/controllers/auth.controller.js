const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateVerificationCode } = require('../utils/jwt.utils');
const { SendVerificationEmail } = require('../utils/email.utils');
const bcrypt = require('bcrypt');

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
        const accessToken = generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);
        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
};

const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const decoded = await verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        const accessToken = generateAccessToken(decoded.id);
        res.json({ accessToken });
    } catch (error) {
        console.error('Error during token refresh:', error);
        res.status(500).json({ message: 'An error occurred during token refresh' });
    }
};

const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        await redisClient.del(`refresh:${userId}`);
        res.json({ message: 'Logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'An error occurred during logout' });
    }
};

const register = async (req, res) => {
    try {
        const { FrisName, LastName, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const user = new User({
            name: `${FrisName} ${LastName}`,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: role || 'client',
        });
        await user.save();
        await SendVerificationEmail(email, verificationCode);
        res.status(201).json({ message: 'User registered successfully. Please check your email for verification.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'An error occurred during registration' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        user.isVerified = true;
        user.verificationCode = null;
        await user.save();
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).json({ message: 'An error occurred during email verification' });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }
        const verificationCode = generateVerificationCode();
        user.verificationCode = verificationCode;
        await user.save();
        await SendVerificationEmail(email, verificationCode);
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

module.exports = {
    login,
    refresh,
    logout,
    register,
    verifyEmail,
    resendVerificationEmail,
    verifyPasswordResetToken,
    resetPassword,
    sendPasswordResetEmail
};