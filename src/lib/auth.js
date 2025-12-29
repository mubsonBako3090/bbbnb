// src/lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'electric-utility-super-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Generate JWT token for a user
 * @param {string} userId - MongoDB user _id
 * @returns {string} JWT token
 */
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token
 * @param {string} token 
 * @returns {object} decoded payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Set JWT token as HTTP-only cookie
 * @param {NextResponse} res 
 * @param {string} token 
 */
export function setTokenCookie(res, token) {
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  });
}

/**
 * Clear token cookie
 * @param {NextResponse} res 
 */
export function clearTokenCookie(res) {
  res.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
}

/**
 * Extract user ID from request cookies
 * @param {Request} req 
 * @returns {string|null} userId
 */
export async function getUserIdFromRequest(req) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
