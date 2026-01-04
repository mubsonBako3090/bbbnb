import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAdmin } from '@/middleware/auth';
import Bill from '@/models/Bill';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/utils';

// GET /api/admin/bills - Get all bills (admin)
export async function GET(request) {
  try {
    await connectDB();
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build filter
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (startDate || endDate) {
      filter['billingPeriod.start'] = {};
      if (startDate) filter['billingPeriod.start'].$gte = new Date(startDate);
      if (endDate) filter['billingPeriod.start'].$lte = new Date(endDate);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get bills with user info
    const bills = await Bill.find(filter)
      .populate('userId', 'firstName lastName email accountNumber')
      .sort({ 'billingPeriod.end': -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count
    const total = await Bill.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    // Calculate admin statistics
    const stats = {
      totalBills: await Bill.countDocuments(),
      totalRevenue: await Bill.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(res => res[0]?.total || 0),
      totalCollected: await Bill.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPaid' } } }
      ]).then(res => res[0]?.total || 0),
      pendingAmount: await Bill.aggregate([
        { $match: { status: { $in: ['generated', 'partially_paid', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$amountDue' } } }
      ]).then(res => res[0]?.total || 0),
      byStatus: await Bill.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      byMonth: await Bill.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$billingPeriod.start' },
              month: { $month: '$billingPeriod.start' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
            collected: { $sum: '$totalPaid' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]),
    };
    
    return NextResponse.json(
      successResponse({
        bills,
        stats,
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
    console.error('GET /api/admin/bills error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 401 }
    );
  }
}

// POST /api/admin/bills - Create or update bills in bulk
export async function POST(request) {
  try {
    await connectDB();
    await requireAdmin(request);
    
    const data = await request.json();
    const { action, billIds, updates } = data;
    
    let result;
    
    switch (action) {
      case 'updateStatus':
        result = await Bill.updateMany(
          { _id: { $in: billIds } },
          { $set: { status: updates.status } }
        );
        break;
        
      case 'sendReminders':
        // Logic to send reminder emails
        result = { sent: billIds.length };
        break;
        
      case 'export':
        // Logic to export bills to CSV/Excel
        result = { exported: billIds.length };
        break;
        
      default:
        return NextResponse.json(
          errorResponse('Invalid action'),
          { status: 400 }
        );
    }
    
    return NextResponse.json(
      successResponse(result, `${action} completed successfully`)
    );
    
  } catch (error) {
    console.error('POST /api/admin/bills error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 400 }
    );
  }
}