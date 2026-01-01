import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import Bill from '@/models/Bill';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const { amount, method } = await request.json();
    const bill = await Bill.findById(params.id);

    if (!bill) {
      return NextResponse.json(errorResponse('Bill not found'), { status: 404 });
    }

    if (user.role !== 'admin' && bill.user.toString() !== user._id.toString()) {
      return NextResponse.json(errorResponse('Access denied'), { status: 403 });
    }

    if (amount <= 0 || amount > bill.amountDue) {
      return NextResponse.json(errorResponse('Invalid payment amount'), { status: 400 });
    }

    bill.amountDue -= amount;

    bill.payments.push({
      amount,
      method,
      paidAt: new Date()
    });

    if (bill.amountDue === 0) {
      bill.status = 'paid';
      bill.paidAt = new Date();
    } else {
      bill.status = 'partially_paid';
    }

    await bill.save();

    return NextResponse.json(
      successResponse({ bill }, 'Payment successful')
    );
  } catch (error) {
    return NextResponse.json(errorResponse('Payment failed'), { status: 500 });
  }
}
