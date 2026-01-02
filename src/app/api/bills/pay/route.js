import { NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';
import { verifyCSRFToken } from '@/lib/csrf';
import { rateLimit } from '@/lib/rateLimit';
import connectDB from '@/lib/database';
import Bill from '@/models/Bill';

export async function POST(request) {
  try {
    // 🔐 Rate limit
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!rateLimit(ip, 5)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // 🔐 CSRF validation
    verifyCSRFToken(request);

    // 🔐 Auth
    const user = await requireAuth(request);

    // 📦 Body
    const { billId } = await request.json();
    if (!billId) {
      return NextResponse.json(
        { error: 'Bill ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const bill = await Bill.findOne({
      _id: billId,
      userId: user._id,
    });

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    if (bill.status === 'paid') {
      return NextResponse.json(
        { message: 'Bill already paid' },
        { status: 200 }
      );
    }

    // 💳 Simulate payment success
    bill.status = 'paid';
    bill.paidAt = new Date();
    await bill.save();

    return NextResponse.json({
      success: true,
      data: bill,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: err.message || 'Payment failed' },
      { status: err.status || 500 }
    );
  }
}
