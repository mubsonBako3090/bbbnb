import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const currentUser = await requireAuth(request);
    const { id } = params;

    // Users can only access their own data unless they're admin
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      return NextResponse.json(
        errorResponse('Access denied'),
        { status: 403 }
      );
    }

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse({ user }));

  } catch (error) {
    console.error('Get user by ID error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 401 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const currentUser = await requireAuth(request);
    const { id } = params;
    const updateData = await request.json();

    // Users can only update their own data unless they're admin
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      return NextResponse.json(
        errorResponse('Access denied'),
        { status: 403 }
      );
    }

    // Define allowed updates based on role
    let allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'preferences'];
    if (currentUser.role === 'admin') {
      allowedUpdates = [...allowedUpdates, 'role', 'isActive', 'customerType'];
    }

    const updates = {};
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json(
      successResponse({ user: updatedUser }, 'User updated successfully')
    );

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      errorResponse('Failed to update user'),
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'User deactivated successfully')
    );

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 401 }
    );
  }
}