import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { requireAuth } from '@/middleware/auth';

export async function POST(request) {
  try {
    await connectDB();

    const user = await requireAuth(request);

    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can generate a meter' },
        { status: 403 }
      );
    }

    // 🔥 Read data from frontend
    const body = await request.json();
    const {
      meterType,
      preferredInstallationDate,
      specialInstructions,
      propertyAccess,
      meterLocation
    } = body;

    // Prevent duplicate requests
    if (user.meterInstallationStatus === 'pending') {
      return NextResponse.json(
        { error: 'Meter request already pending' },
        { status: 400 }
      );
    }

    // Generate meter number if not present
    if (!user.meterNumber) {
      user.meterNumber =
        'MTR' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    // Save meter info
    user.meterType = meterType || 'smart';
    user.meterInstallationStatus = 'pending';
    user.meterRequestDate = new Date();
    user.preferredInstallationDate = preferredInstallationDate;
    user.specialInstructions = specialInstructions;
    user.propertyAccess = propertyAccess;
    user.meterLocation = meterLocation;

    // Auto next reading date (after installation)
    user.nextMeterReadingDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    await user.save();

    return NextResponse.json({
      message: 'Meter request submitted successfully',
      meterNumber: user.meterNumber,
      meterType: user.meterType,
      installationStatus: user.meterInstallationStatus,
      requestDate: user.meterRequestDate,
      preferredInstallationDate: user.preferredInstallationDate
    });
  } catch (err) {
    console.error('Meter generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: err.status || 500 }
    );
  }
}
