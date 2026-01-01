import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Bill from '@/models/Bill';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid bill ID' }, { status: 400 });
    }

    const bill = await Bill.findById(params.id)
      .populate('user', 'firstName lastName email accountNumber');

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 });
  }
}
