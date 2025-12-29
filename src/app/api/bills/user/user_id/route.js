import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import Bill from '@/models/Bills';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    await connectDB();

    // Prevent static-generation calls from failing
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        errorResponse("Authentication required"),
        { status: 401 }
      );
    }

    const currentUser = await requireAuth(request);
    const { userId } = params;

    // Users can only access their own bills
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== userId) {
      return NextResponse.json(
        errorResponse('Access denied'),
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 12;

    let query = { user: userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const bills = await Bill.find(query)
      .sort({ dueDate: -1 })
      .limit(limit);

    // Summary statistics
    const totalBills = await Bill.countDocuments({ user: userId });
    const pendingBills = await Bill.countDocuments({
      user: userId,
      status: 'pending'
    });

    const totalAmountDue = await Bill.aggregate([
      { $match: { user: userId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amountDue' } } }
    ]);

    const summary = {
      totalBills,
      pendingBills,
      totalAmountDue: totalAmountDue[0]?.total || 0
    };

    return NextResponse.json(
      successResponse({
        bills,
        summary
      })
    );

  } catch (error) {
    console.error('Get user bills error:', error);
    return NextResponse.json(
      errorResponse(error.message || "Server error"),
      { status: 401 }
    );
  }
}
