import { NextResponse } from 'next/server';
import { withDatabase } from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import User from '@/models/User';
import { successResponse, handleError } from '@/lib/utils';

export const GET = withDatabase(async (request) => {
  try {
    const user = await requireAuth(request);
    
    const userResponse = {
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
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json(
      successResponse({ user: userResponse }, 'Profile fetched successfully')
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication required' },
      { status: 401 }
    );
  }
});

export const PUT = withDatabase(async (request) => {
  try {
    const user = await requireAuth(request);
    const updateData = await request.json();

    // Remove restricted fields
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'preferences'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    const userResponse = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      accountNumber: updatedUser.accountNumber,
      meterNumber: updatedUser.meterNumber,
      customerType: updatedUser.customerType,
      address: updatedUser.address,
      preferences: updatedUser.preferences,
      lastLogin: updatedUser.lastLogin
    };

    return NextResponse.json(
      successResponse({ user: userResponse }, 'Profile updated successfully')
    );

  } catch (error) {
    console.error('Profile update error:', error);
    
    const errorData = handleError(error);
    return NextResponse.json(
      { success: false, error: errorData.error, details: errorData.details },
      { status: 400 }
    );
  }
});