import nodemailer from 'nodemailer';
import config from '../config';

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
        user: config.email,
        pass: config.emailPassword,
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

module.exports = {
    sendVerificationEmail,
};