import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Bill from '@/models/Bill'; // ✅ FIX
import { requireAuth } from '@/middleware/auth';

export async function GET(request) {
  try {
    await connectDB();

    // Ensure user is authenticated
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = {
      user: user._id,
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { bills },
    });
  } catch (error) {
    console.error('Bills fetch error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}
