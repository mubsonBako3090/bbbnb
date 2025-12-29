import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import User from '@/models/User';
import { successResponse, errorResponse, handleError } from '@/lib/utils';

export async function GET(request) {
  try {
    const user = await requireAuth(request);
    
    // If user is admin, return all users, otherwise return only their own data
    if (user.role === 'admin') {
      const users = await User.find({}).select('-password');
      return NextResponse.json(successResponse({ users }));
    } else {
      return NextResponse.json(successResponse({ user }));
    }

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 401 }
    );
  }
}

export async function PUT(request) {
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

    return NextResponse.json(
      successResponse({ user: updatedUser }, 'Profile updated successfully')
    );

  } catch (error) {
    console.error('Update user error:', error);
    const errorData = handleError(error);
    return NextResponse.json(
      errorResponse(errorData.error, errorData.details),
      { status: 400 }
    );
  }
}