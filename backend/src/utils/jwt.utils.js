import jwt from 'jsonwebtoken';
import redisClient from '../config/redisClient';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generates a token for the given user ID.
 *
 * @param id - The user ID.
 * @returns The generated token.
 */
const generateToken = (id, type) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    const DaysForExpiration = 30;

    redisClient.setEx(
        token.toString(),
        DaysForExpiration * 24 * 60 * 60,
        JSON.stringify({ id, type }),
    );

    return token;
};

/**
 * Removes a token from the Redis cache and executes a callback function.
 *
 * @param {string} token - The token to be removed from the Redis cache.
 * @param {Function} func - The callback function to be executed after removing the token.
 * @returns {void}
 */
const removeToken = (token, func) => {
    redisClient.del(token);
    func();
};

/**
 * Retrieves the user ID associated with a given token.
 *
 * @param {string} token - The token to retrieve the user ID from.
 * @returns {Promise<string|null>} - A promise that resolves to the user ID if the token is valid, or null if the token is not found.
 */
const getUserIdByToken = async (token) => {
    const cachedToken = await redisClient.get(token);
    if (cachedToken) {
        try {
            const parsedToken = JSON.parse(cachedToken);
            if (parsedToken && parsedToken.id) {
                return parsedToken.id;
            }
        } catch (error) {
            return cachedToken;
        }
    }
    return null;
};

/**
 * Removes all tokens associated with a specific user and type from the Redis cache.
 * 
 * @param userId - The ID of the user.
 * @param type - The type of the token.
 * @returns A Promise that resolves to void.
 * @throws If there is an error removing the tokens.
 */
const removeAllTokens = async (userId, type) => {
    try {
        const keys = await redisClient.keys('*');

        for (const key of keys) {
            const keyType = await redisClient.type(key);
            if (keyType !== 'string') {
                console.warn(`Skipping non-string key ${key} of type ${keyType}`);
                await redisClient.del(key);
                continue;
            }
            const cachedToken = await redisClient.get(key);

            if (cachedToken) {
                let shouldDelete = false;
                try {
                    const { id, type: tokenType } = JSON.parse(cachedToken);

                    if (id === userId && type === tokenType) {
                        shouldDelete = true;
                    }
                } catch (parseError) {
                    console.warn(`Skipping non-JSON value for key ${key}:`, cachedToken);
                    shouldDelete = true;
                }

                if (shouldDelete) {
                    const result = await redisClient.del(key);
                    if (result === 1) {
                        console.log(`Successfully deleted key: ${key}`);
                    } else {
                        console.warn(`Failed to delete key: ${key}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error removing tokens:', error);
    }
};


/**
 * Generates a verification token for a given user ID.
 *
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the generated verification token.
 */
const generateVerificationToken = async (userId) => {
    // Generate a 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the code in Redis with a 1-hour expiration time
    await redisClient.setEx(`verify:${userId}`, 3600, code);

    return code;
};

/**
 * Creates a transporter for sending emails.
 * 
 * @remarks
 * This function creates a nodemailer transporter using the provided configuration.
 * The transporter can be used to send emails using the Gmail service.
 * 
 * @returns The created transporter.
 */
const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services or SMTP config
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a verification email to the specified email address.
 * 
 * @param email - The email address to send the verification email to.
 * @param verificationUrl - The URL to include in the verification email.
 * @returns A promise that resolves when the email is sent successfully.
 */
const sendVerificationEmail = async (
    email,
    code
) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Email Verification Code',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 40px 0;">
                <table align="center" width="100%" style="max-width: 480px; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden;">
                    <tr>
                        <td style="background: #2563eb; padding: 24px 0; text-align: center;">
                            <h1 style="color: #fff; margin: 0; font-size: 28px; letter-spacing: 1px;">LanceJob</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 32px 24px 32px;">
                            <h2 style="color: #222; margin: 0 0 12px 0; font-size: 22px;">Verify Your Email Address</h2>
                            <p style="color: #555; font-size: 16px; margin: 0 0 24px 0;">
                                Please use the following code to verify your email address:
                            </p>
                            <div style="text-align: center; margin: 32px 0;">
                                <span style="display: inline-block; background: #2563eb; color: #fff; padding: 16px 32px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 4px;">
                                    ${code}
                                </span>
                            </div>
                            <p style="color: #888; font-size: 13px; text-align: center; margin: 0;">
                                If you did not request this code, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f1f5f9; color: #888; font-size: 12px; text-align: center; padding: 18px;">
                            &copy; ${new Date().getFullYear()} LanceJob. All rights reserved.
                        </td>
                    </tr>
                </table>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

/**
 * Verifies the validity of a token.
 * 
 * @param token - The token to be verified.
 * @returns A promise that resolves to the decoded token if it is valid, otherwise null.
 */
const verifyToken = async (token) => {
    const tokenCache = await redisClient.get(token);

    if (!tokenCache) {
        return null;
    }
    
    const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });

    if (decoded) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
    return null;
};

export {
    generateToken,
    removeToken,
    removeAllTokens,
    getUserIdByToken,
    generateVerificationToken,
    sendVerificationEmail,
    verifyToken,
};
