import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import Bill from '@/models/Bill';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/utils';
import { sendEmail } from '@/lib/email'; // <-- import Nodemailer helper

export async function POST(request, { params }) {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const { amount, method } = await request.json();
    const bill = await Bill.findById(params.id).populate('user'); // populate user for email

    if (!bill) {
      return NextResponse.json(errorResponse('Bill not found'), { status: 404 });
    }

    if (user.role !== 'admin' && bill.user._id.toString() !== user._id.toString()) {
      return NextResponse.json(errorResponse('Access denied'), { status: 403 });
    }

    if (amount <= 0 || amount > bill.amountDue) {
      return NextResponse.json(errorResponse('Invalid payment amount'), { status: 400 });
    }

    // Update bill
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

    // --- Send payment confirmation email ---
    try {
      await sendEmail({
        to: bill.user.email,
        subject: 'Payment Confirmation',
        html: `
          <p>Hi ${bill.user.name},</p>
          <p>Your payment of <strong>$${amount}</strong> for bill <strong>#${bill._id}</strong> was successful.</p>
          <p>Remaining balance: <strong>$${bill.amountDue}</strong></p>
          <p>Status: <strong>${bill.status}</strong></p>
          <p>Thank you for using our services!</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue without breaking the payment flow
    }

    return NextResponse.json(
      successResponse({ bill }, 'Payment successful')
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(errorResponse('Payment failed'), { status: 500 });
  }
}
