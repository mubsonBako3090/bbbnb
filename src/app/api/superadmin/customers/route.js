import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { requireAuth } from '@/middleware/auth';

export async function GET(req) {
  try {
    await connectDB();
    const user = await requireAuth(req);

    if (user.role !== 'superAdmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customers = await User.find({ role: 'customer' }).select(
      'firstName lastName email meterNumber meterInstallationStatus'
    );

    return NextResponse.json(customers);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
