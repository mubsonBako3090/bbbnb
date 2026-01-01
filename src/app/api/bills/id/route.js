import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import Bill from '@/models/Bill';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const bill = await Bill.findById(params.id)
      .populate('user', 'firstName lastName email accountNumber');

    if (!bill) {
      return NextResponse.json(errorResponse('Bill not found'), { status: 404 });
    }

    if (user.role !== 'admin' && bill.user._id.toString() !== user._id.toString()) {
      return NextResponse.json(errorResponse('Access denied'), { status: 403 });
    }

    return NextResponse.json(successResponse({ bill }));
  } catch (error) {
    return NextResponse.json(errorResponse(error.message), { status: 401 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    await requireAdmin(request);

    const updates = await request.json();
    delete updates.user;
    delete updates.billNumber;
    delete updates.accountNumber;

    const bill = await Bill.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    );

    return NextResponse.json(successResponse({ bill }, 'Bill updated'));
  } catch (error) {
    return NextResponse.json(errorResponse('Update failed'), { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    await requireAdmin(request);

    await Bill.findByIdAndDelete(params.id);
    return NextResponse.json(successResponse(null, 'Bill deleted'));
  } catch (error) {
    return NextResponse.json(errorResponse('Delete failed'), { status: 400 });
  }
}
