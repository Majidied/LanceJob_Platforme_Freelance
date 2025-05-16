import api from "./api";

/**
 * Authenticates a user and stores tokens in localStorage
 */
export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data) {
            localStorage.setItem('user_tokens', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

/**
 * Registers a new user
 */
export const register = async (email, password) => {
    try {
        const response = await api.post('/auth/register', { email, password });
        return response.data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

/**
 * Logs out the current user
 */
export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('user_tokens'); // Fixed: was removing 'user' instead
        return response.data;
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};

/**
 * Gets the current user data from localStorage
 */
export const getUser = async () => {
    try {
        const userTokens = await api.get('/users/me');

        return userTokens;
    } catch (error) {
        console.error("Get user error:", error);
        throw error;
    }
};

/**
 * Checks if user is authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('user_tokens');
};

// Remaining functions with added JSDoc comments and consistent error handling

/**
 * Verifies a user's email with verification code
 */
export const verifyEmail = async (email, verificationCode) => {
    try {
        const response = await api.post('/auth/verify-email', { email, verificationCode });
        return response.data;
    } catch (error) {
        console.error("Email verification error:", error);
        throw error;
    }
};

/**
 * Resends verification email
 */
export const resendVerificationEmail = async (email) => {
    try {
        const response = await api.post('/auth/resend-verification', { email });
        return response.data;
    } catch (error) {
        console.error("Resend verification email error:", error);
        throw error;
    }
};

/**
 * Sends password reset email
 */
export const sendPasswordResetEmail = async (email) => {
    try {
        const response = await api.post('/auth/send-password-reset-email', { email });
        return response.data;
    } catch (error) {
        console.error("Send password reset email error:", error);
        throw error;
    }
};

/**
 * Verifies password reset token
 */
export const verifyPasswordResetToken = async (email, resetToken) => {
    try {
        const response = await api.post('/auth/verify-password-reset', { email, resetToken });
        return response.data;
    } catch (error) {
        console.error("Verify password reset token error:", error);
        throw error;
    }
};

/**
 * Resets user password
 */
export const resetPassword = async (email, resetToken, newPassword) => {
    try {
        const response = await api.post('/auth/reset-password', { email, resetToken, newPassword });
        return response.data;
    } catch (error) {
        console.error("Reset password error:", error);
        throw error;
    }
};