import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } from '@/config/email';

// Create reusable transporter
export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,          // e.g., smtp.gmail.com
  port: EMAIL_PORT,          // e.g., 465 for SSL, 587 for TLS
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,        // your email
    pass: EMAIL_PASS,        // your email password or app password
  },
});

// Function to send email
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Electric Utility" <${EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || '',
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
};
