import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/utils';

export async function PUT(request) {
  try {
    const user = await requireAuth(request);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        errorResponse('Current password and new password are required'),
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        errorResponse('New password must be at least 6 characters'),
        { status: 400 }
      );
    }

    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.correctPassword(
      currentPassword,
      userWithPassword.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        errorResponse('Current password is incorrect'),
        { status: 400 }
      );
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    return NextResponse.json(
      successResponse(null, 'Password updated successfully')
    );

  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      errorResponse('Failed to update password'),
      { status: 400 }
    );
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        errorResponse('Email is required'),
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal whether email exists or not
      return NextResponse.json(
        successResponse(null, 'If an account with that email exists, a password reset link has been sent.')
      );
    }

    // Generate reset token (in a real app, you'd send an email)
    const resetToken = 'temp-reset-token-' + Date.now();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real app, send email with reset link
  console.log(`Password reset token for ${email}: ${resetToken}`);

    return NextResponse.json(
      successResponse(null, 'If an account with that email exists, a password reset link has been sent.')
    );

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      errorResponse('Failed to process password reset request'),
      { status: 500 }
    );
  }
}