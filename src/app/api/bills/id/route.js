import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import Bill from '@/models/Bills';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = params;

    const bill = await Bill.findById(id).populate('user', 'firstName lastName email accountNumber');
    
    if (!bill) {
      return NextResponse.json(
        errorResponse('Bill not found'),
        { status: 404 }
      );
    }

    // Users can only access their own bills unless they're admin
    if (user.role !== 'admin' && bill.user._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        errorResponse('Access denied'),
        { status: 403 }
      );
    }

    return NextResponse.json(successResponse({ bill }));

  } catch (error) {
    console.error('Get bill error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 401 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = params;
    const updateData = await request.json();

    // Remove fields that shouldn't be updated directly
    const { user, billNumber, accountNumber, ...allowedUpdates } = updateData;

    const bill = await Bill.findByIdAndUpdate(
      id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email accountNumber');

    if (!bill) {
      return NextResponse.json(
        errorResponse('Bill not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse({ bill }, 'Bill updated successfully')
    );

  } catch (error) {
    console.error('Update bill error:', error);
    return NextResponse.json(
      errorResponse('Failed to update bill'),
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = params;

    const bill = await Bill.findByIdAndDelete(id);

    if (!bill) {
      return NextResponse.json(
        errorResponse('Bill not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Bill deleted successfully')
    );

  } catch (error) {
    console.error('Delete bill error:', error);
    return NextResponse.json(
      errorResponse('Failed to delete bill'),
      { status: 400 }
    );
  }
}