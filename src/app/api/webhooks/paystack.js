import crypto from 'crypto';
import Bill from '@/models/Bill';

export async function POST(req) {
  const rawBody = await req.text();

  const signature = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  if (signature !== req.headers.get('x-paystack-signature')) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    const { billId } = event.data.metadata;
    const amountPaid = event.data.amount / 100;

    const bill = await Bill.findById(billId);
    if (!bill) return new Response('Bill not found', { status: 404 });

    bill.amountPaid += amountPaid;
    bill.amountDue = bill.totalAmount - bill.amountPaid;

    bill.status =
      bill.amountDue <= 0 ? 'paid' : 'partially_paid';

    await bill.save();
  }

  return Response.json({ received: true });
}
