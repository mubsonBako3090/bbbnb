import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';

export async function POST() {
  try {
    await connectDB();

    const email = 'superadmin@powergrid.com';

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ message: 'Super Admin already exists' });
    }

    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      password: 'superadmin123',
      role: 'superAdmin',
      isStaff: true,
      isVerified: true,
    });

    return NextResponse.json({
      message: 'Super Admin created successfully',
      email,
      password: 'superadmin123',
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
