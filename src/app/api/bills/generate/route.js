import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import { generateMonthlyBills } from '@/lib/billing/generateBills';
import { successResponse, errorResponse } from '@/lib/utils';

// POST /api/bills/generate - Generate bills for a period
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    
    // Only admins can generate bills
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 403 }
      );
    }
    
    const { month, year, customerIds, mode = 'manual' } = await request.json();
    
    // Set billing date
    let billingDate = new Date();
    if (year && month) {
      billingDate = new Date(year, month - 1, 1);
    } else {
      // Default to previous month
      billingDate.setMonth(billingDate.getMonth() - 1);
    }
    
    // Generate bills
    const result = await generateMonthlyBills({
      billingDate,
      mode,
      generatedBy: user._id,
    });
    
    return NextResponse.json(
      successResponse(result, 'Bills generated successfully')
    );
    
  } catch (error) {
    console.error('POST /api/bills/generate error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 500 }
    );
  }
}

// GET /api/bills/generate/status - Get bill generation status
export async function GET(request) {
  try {
    await connectDB();
    await requireAuth(request);
    
    // In a real app, you might have a job queue system
    // For now, return mock status
    return NextResponse.json(
      successResponse({
        lastRun: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        nextRun: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days from now
        status: 'idle',
        stats: {
          totalGenerated: 1500,
          lastMonth: 1450,
          thisMonth: 0,
        },
      })
    );
    
  } catch (error) {
    return NextResponse.json(
      errorResponse(error.message),
      { status: 500 }
    );
  }
}