import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import { successResponse } from '@/lib/utils';
import { sendEmail } from '@/lib/email'; // ✅ import sendEmail

// Wrapper to ensure DB connection
async function withDatabase(handler) {
  await connectDB();
  return handler();
}

export const POST = async (request) => {
  return withDatabase(async () => {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user || !(await user.correctPassword(password))) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, error: 'Account is deactivated. Please contact support.' },
          { status: 401 }
        );
      }

      const token = generateToken(user._id);
      await user.updateLastLogin();

      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountNumber: user.accountNumber,
        meterNumber: user.meterNumber,
        customerType: user.customerType,
        address: user.address,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
      };

      // --- SEND LOGIN EMAIL ---
      try {
        await sendEmail({
          to: user.email,
          subject: 'Login Notification',
          text: `Hello ${user.firstName},\n\nYou have successfully logged in to your account at ${new Date().toLocaleString()}.`,
          html: `<p>Hello <strong>${user.firstName}</strong>,</p>
                 <p>You have successfully logged in to your account at <strong>${new Date().toLocaleString()}</strong>.</p>`,
        });
      } catch (emailError) {
        console.error('Failed to send login email:', emailError);
        // Not critical, so we don't block login
      }

      const response = NextResponse.json(
        successResponse({ user: userResponse }, 'Login successful')
      );

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
