import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import Bill from '@/models/Bill';
import Payment from '@/models/Payment';
import { processPayment, verifyPayment } from '@/lib/payment/processors';
import { successResponse, errorResponse } from '@/lib/utils';

// POST /api/bills/[id]/pay - Make a payment for a bill
export async function POST(request, { params }) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    
    const { id } = params;
    const paymentData = await request.json();
    
    // Validate required fields
    if (!paymentData.amount || paymentData.amount <= 0) {
      return NextResponse.json(
        errorResponse('Invalid payment amount'),
        { status: 400 }
      );
    }
    
    if (!paymentData.method) {
      return NextResponse.json(
        errorResponse('Payment method is required'),
        { status: 400 }
      );
    }
    
    // Get the bill
    const bill = await Bill.findById(id);
    
    if (!bill) {
      return NextResponse.json(
        errorResponse('Bill not found'),
        { status: 404 }
      );
    }
    
    // Check authorization
    if (user.role !== 'admin' && bill.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        errorResponse('Unauthorized to pay this bill'),
        { status: 403 }
      );
    }
    
    // Validate payment amount
    if (paymentData.amount > bill.amountDue) {
      return NextResponse.json(
        errorResponse(`Payment amount cannot exceed amount due (₦${bill.amountDue})`),
        { status: 400 }
      );
    }
    
    // Create payment record
    const payment = new Payment({
      userId: user._id,
      billId: bill._id,
      amount: paymentData.amount,
      method: paymentData.method,
      methodDetails: paymentData.methodDetails || {},
      status: 'pending',
      initiatedAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });
    
    await payment.save();
    
    try {
      // Process payment through gateway
      const paymentResult = await processPayment(paymentData.method, {
        amount: paymentData.amount,
        ...paymentData.details,
        customerEmail: user.email,
        customerName: user.name,
        billNumber: bill.billNumber,
      });
      
      // Update payment with gateway response
      payment.gateway = {
        name: paymentData.gateway || 'mock',
        transactionId: paymentResult.transactionId,
        reference: paymentResult.reference,
        responseCode: '00',
        responseMessage: paymentResult.message,
      };
      
      payment.status = paymentResult.success ? 'processing' : 'failed';
      
      if (paymentResult.success) {
        // If payment is immediately successful (like mock), mark as completed
        if (paymentData.method === 'cash' || paymentData.mock === true) {
          payment.status = 'completed';
          payment.completedAt = new Date();
          payment.verified = true;
          
          // Update bill
          bill.paymentsReceived.push({
            date: new Date(),
            amount: paymentData.amount,
            method: paymentData.method,
            reference: paymentResult.reference,
            status: 'completed',
          });
          
          bill.totalPaid = (bill.totalPaid || 0) + paymentData.amount;
          bill.amountDue = bill.totalAmount - bill.totalPaid;
          
          if (bill.amountDue <= 0) {
            bill.status = 'paid';
            bill.paidAt = new Date();
          } else if (bill.totalPaid > 0) {
            bill.status = 'partially_paid';
          }
          
          await bill.save();
        }
      }
      
      await payment.save();
      
      return NextResponse.json(
        successResponse({
          payment,
          bill,
          nextSteps: paymentResult.instructions || 'Payment processed',
        }, paymentResult.message)
      );
      
    } catch (paymentError) {
      // Payment processing failed
      payment.status = 'failed';
      payment.gateway.responseMessage = paymentError.message;
      await payment.save();
      
      return NextResponse.json(
        errorResponse(`Payment failed: ${paymentError.message}`),
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('POST /api/bills/[id]/pay error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 500 }
    );
  }
}

// GET /api/bills/[id]/pay/status - Check payment status
export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    
    if (!paymentId) {
      return NextResponse.json(
        errorResponse('Payment ID is required'),
        { status: 400 }
      );
    }
    
    // Get payment
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return NextResponse.json(
        errorResponse('Payment not found'),
        { status: 404 }
      );
    }
    
    // Check authorization
    if (user.role !== 'admin' && payment.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 403 }
      );
    }
    
    // Verify payment with gateway
    const verification = await verifyPayment(
      payment.gateway?.reference,
      payment.gateway?.name
    );
    
    // Update payment status if changed
    if (verification.status !== payment.status) {
      payment.status = verification.status;
      payment.verified = verification.verified;
      
      if (verification.status === 'completed') {
        payment.completedAt = new Date();
        
        // Update bill
        const bill = await Bill.findById(payment.billId);
        if (bill) {
          bill.paymentsReceived.push({
            date: new Date(),
            amount: payment.amount,
            method: payment.method,
            reference: payment.gateway?.reference,
            status: 'completed',
          });
          
          bill.totalPaid = (bill.totalPaid || 0) + payment.amount;
          bill.amountDue = bill.totalAmount - bill.totalPaid;
          
          if (bill.amountDue <= 0) {
            bill.status = 'paid';
            bill.paidAt = new Date();
          } else if (bill.totalPaid > 0) {
            bill.status = 'partially_paid';
          }
          
          await bill.save();
        }
      }
      
      await payment.save();
    }
    
    return NextResponse.json(
      successResponse({
        payment,
        verification,
      })
    );
    
  } catch (error) {
    console.error('GET /api/bills/[id]/pay/status error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 500 }
    );
  }
}