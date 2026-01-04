// lib/auth/server-auth.js - DEBUG VERSION
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function requireAuth() {
  try {
    console.log('🔐 requireAuth called');
    
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    console.log('📦 Token exists:', !!token);
    console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'None');
    
    if (!token) {
      console.log('❌ No token found in cookies');
      return null;
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
    return decoded;
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return null;
  }
}