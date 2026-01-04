import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAdmin } from '@/middleware/auth';
import { generateMonthlyBills } from '@/lib/billing/generateBills';
import { successResponse, errorResponse } from '@/lib/utils';

// POST /api/admin/bills/generate - Generate bills (admin)
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAdmin(request);
    
    const data = await request.json();
    const { 
      month, 
      year, 
      customerIds = [], 
      mode = 'manual',
      generateFor = 'all' // 'all', 'selected', 'new'
    } = data;
    
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
      successResponse(result, 'Bills generation completed')
    );
    
  } catch (error) {
    console.error('POST /api/admin/bills/generate error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 500 }
    );
  }
}

// GET /api/admin/bills/generate/preview - Preview bill generation
export async function GET(request) {
  try {
    await connectDB();
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    // Calculate period
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth(); // 0-indexed
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
    
    // Get customers who would receive bills
    const customers = await User.find({ 
      role: 'customer', 
      accountStatus: 'active',
      isActive: true,
    }).countDocuments();
    
    // Get customers who already have bills for this period
    const billedCustomers = await Bill.countDocuments({
      'billingPeriod.start': startDate,
      'billingPeriod.end': endDate,
    });
    
    return NextResponse.json(
      successResponse({
        period: {
          start: startDate,
          end: endDate,
          month: targetMonth,
          year: targetYear,
        },
        stats: {
          totalCustomers: customers,
          alreadyBilled: billedCustomers,
          toBeBilled: customers - billedCustomers,
        },
        estimatedRevenue: (customers - billedCustomers) * 5000, // Rough estimate
      })
    );
    
  } catch (error) {
    console.error('GET /api/admin/bills/generate/preview error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 500 }
    );
  }
}