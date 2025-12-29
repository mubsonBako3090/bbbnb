import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { requireAuth } from '@/middleware/auth';

export async function PATCH(req) {
  try {
    await connectDB();
    const admin = await requireAuth(req);

    if (admin.role !== 'superAdmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { customerId } = await req.json();
    const customer = await User.findById(customerId);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    customer.meterInstallationStatus = 'installed';
    customer.hasMeter = true;

    await customer.save();

    return NextResponse.json({ message: 'Meter approved' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
