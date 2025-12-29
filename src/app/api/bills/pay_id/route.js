import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import Bill from '@/models/Bills';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = params;
    const { paymentMethod, paymentAmount, transactionId } = await request.json();

    if (!paymentMethod || !paymentAmount) {
      return NextResponse.json(
        errorResponse('Payment method and amount are required'),
        { status: 400 }
      );
    }

    const bill = await Bill.findById(id);
    
    if (!bill) {
      return NextResponse.json(
        errorResponse('Bill not found'),
        { status: 404 }
      );
    }

    // Users can only pay their own bills
    if (user.role !== 'admin' && bill.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        errorResponse('Access denied'),
        { status: 403 }
      );
    }

    // Validate payment amount
    if (paymentAmount < bill.amountDue) {
      return NextResponse.json(
        errorResponse('Payment amount must be equal to or greater than the amount due'),
        { status: 400 }
      );
    }

    // Process payment (in a real app, integrate with payment gateway)
    const paymentResult = {
      success: true,
      transactionId: transactionId || 'txn_' + Date.now(),
      paymentDate: new Date(),
      amount: paymentAmount
    };

    if (!paymentResult.success) {
      return NextResponse.json(
        errorResponse('Payment processing failed'),
        { status: 402 }
      );
    }

    // Update bill status
    bill.status = 'paid';
    bill.paidAt = new Date();
    bill.paymentMethod = paymentMethod;
    bill.payments = paymentAmount;
    bill.amountDue = 0;

    await bill.save();

    const updatedBill = await Bill.findById(bill._id)
      .populate('user', 'firstName lastName email accountNumber');

    return NextResponse.json(
      successResponse(
        { 
          bill: updatedBill,
          payment: paymentResult
        },
        'Payment processed successfully'
      )
    );

  } catch (error) {
    console.error('Bill payment error:', error);
    return NextResponse.json(
      errorResponse('Payment processing failed'),
      { status: 500 }
    );
  }
}