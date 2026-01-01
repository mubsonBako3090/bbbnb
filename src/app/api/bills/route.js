import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import Bill from '@/models/Bill';
import User from '@/models/User';
import { successResponse, errorResponse, generateBillNumber } from '@/lib/utils';

export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    let query = {};

    if (user.role !== 'admin') {
      query.user = user._id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bills = await Bill.find(query)
      .populate('user', 'firstName lastName email accountNumber')
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bill.countDocuments(query);

    return NextResponse.json(
      successResponse({
        bills,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    );
  } catch (error) {
    return NextResponse.json(errorResponse(error.message), { status: 401 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    await requireAdmin(request);

    const data = await request.json();
    const user = await User.findById(data.user);

    if (!user) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    const bill = await Bill.create({
      ...data,
      billNumber: generateBillNumber(),
      user: user._id,
      accountNumber: user.accountNumber,
      amountDue: data.totalAmount
    });

    return NextResponse.json(
      successResponse({ bill }, 'Bill created successfully'),
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(errorResponse(error.message), { status: 400 });
  }
}
