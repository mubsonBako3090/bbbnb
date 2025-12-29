import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import { successResponse } from '@/lib/utils';

// Wrapper to ensure DB connection
async function withDatabase(handler) {
  await connectDB();
  return handler();
}

export const POST = async (request) => {
  return withDatabase(async () => {
    try {
      const { email, password } = await request.json();

      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Find user and include password
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      // Check if user exists and password is correct
      if (!user || !(await user.correctPassword(password))) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Check if account is active
      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: 'Account is deactivated. Please contact support.' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateToken(user._id);

      // Update last login
      await user.updateLastLogin();

      // Prepare user response (exclude password)
      const userResponse = {
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role, // ✅ ADD THIS
  accountNumber: user.accountNumber,
  meterNumber: user.meterNumber,
  customerType: user.customerType,
  address: user.address,
  preferences: user.preferences,
  lastLogin: user.lastLogin
};

      // Create response
      const response = NextResponse.json(
        successResponse({ user: userResponse }, 'Login successful')
      );

      // Set JWT cookie
      setTokenCookie(response, token);

      return response;

    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
};
