import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import Bill from '@/models/Bills';
import User from '@/models/User';
import { successResponse, errorResponse, handleError, generateBillNumber } from '@/lib/utils';

export async function GET(request) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');

    let query = {};
    
    // Non-admin users can only see their own bills
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
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      successResponse({
        bills,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      })
    );

  } catch (error) {
    console.error('Get bills error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 401 }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin(request);
    
    const billData = await request.json();

    // Validate required fields
    const requiredFields = ['user', 'billingPeriod', 'energyUsage', 'rate'];
    for (const field of requiredFields) {
      if (!billData[field]) {
        return NextResponse.json(
          errorResponse(`${field} is required`),
          { status: 400 }
        );
      }
    }

    // Verify user exists
    const user = await User.findById(billData.user);
    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    // Generate bill number
    const billNumber = generateBillNumber();

    // Create bill
    const bill = await Bill.create({
      ...billData,
      billNumber,
      accountNumber: user.accountNumber
    });

    const populatedBill = await Bill.findById(bill._id)
      .populate('user', 'firstName lastName email accountNumber');

    return NextResponse.json(
      successResponse({ bill: populatedBill }, 'Bill created successfully'),
      { status: 201 }
    );

  } catch (error) {
    console.error('Create bill error:', error);
    const errorData = handleError(error);
    return NextResponse.json(
      errorResponse(errorData.error, errorData.details),
      { status: 400 }
    );
  }
}