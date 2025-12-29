import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { getUserIdFromRequest } from '@/lib/auth';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request) {
  try {
    await connectDB();

    const userId = await getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        errorResponse('Not authenticated'),
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        errorResponse('Account is deactivated'),
        { status: 401 }
      );
    }

    return NextResponse.json(
      successResponse({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          accountNumber: user.accountNumber,
          meterNumber: user.meterNumber,
          customerType: user.customerType,
          address: user.address,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          isVerified: user.isVerified
        }
      }, 'Token is valid')
    );

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      errorResponse('Token verification failed'),
      { status: 401 }
    );
  }
}