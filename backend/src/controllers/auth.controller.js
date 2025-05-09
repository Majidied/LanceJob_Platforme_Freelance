import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateVerificationCode } from '../utils/jwt.utils';
import { SendVerificationEmail } from '../utils/email.utils';

export const login = async (req, res) => {
    try {
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

export const refresh = async (req, res) => {
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

export const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        await redisClient.del(`refresh:${userId}`);
        res.json({ message: 'Logged out' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'An error occurred during logout' });
    }
};

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const user = new User({ email, password: hashedPassword, verificationCode });
        await user.save();
        await SendVerificationEmail(email, verificationCode);
        res.status(201).json({ message: 'User registered successfully. Please check your email for verification.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'An error occurred during registration' });
    }
};
