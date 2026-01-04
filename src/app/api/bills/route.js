import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import Bill from '@/models/Bill';
import { successResponse, errorResponse } from '@/lib/utils';

// GET /api/bills - Get user's bills
export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build filter
    const filter = { userId: user._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (year) {
      filter['billingPeriod.start'] = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`)
      };
    }
    
    if (month && year) {
      const startDate = new Date(`${year}-${month.padStart(2, '0')}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      filter['billingPeriod.start'] = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get bills
    const bills = await Bill.find(filter)
      .sort({ 'billingPeriod.end': -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Bill.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    // Calculate summary
    const summary = {
      totalBills: total,
      totalAmount: bills.reduce((sum, bill) => sum + bill.totalAmount, 0),
      totalDue: bills.reduce((sum, bill) => sum + bill.amountDue, 0),
      paidBills: bills.filter(bill => bill.status === 'paid').length,
      pendingBills: bills.filter(bill => bill.status === 'generated').length,
      overdueBills: bills.filter(bill => bill.status === 'overdue').length,
    };
    
    // Get current bill (most recent unpaid)
    const currentBill = await Bill.findOne({
      userId: user._id,
      status: { $in: ['generated', 'partially_paid', 'overdue'] }
    }).sort({ 'billingPeriod.end': -1 });
    
    return NextResponse.json(
      successResponse({
        bills,
        currentBill,
        summary,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      })
    );
    
  } catch (error) {
    console.error('GET /api/bills error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 401 }
    );
  }
}

// POST /api/bills - Create a new bill (admin only)
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    
    // Only admins can create bills
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['userId', 'billingPeriod', 'meterReading', 'charges'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          errorResponse(`Missing required field: ${field}`),
          { status: 400 }
        );
      }
    }
    
    // Create bill
    const bill = new Bill({
      ...data,
      generatedBy: user._id,
      status: 'generated',
    });
    
    await bill.save();
    
    return NextResponse.json(
      successResponse({ bill }, 'Bill created successfully'),
      { status: 201 }
    );
    
  } catch (error) {
    console.error('POST /api/bills error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 400 }
    );
  }
}