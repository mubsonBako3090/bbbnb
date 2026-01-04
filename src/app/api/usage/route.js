import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import Usage from '@/models/Usage';
import { successResponse, errorResponse } from '@/lib/utils';

// GET /api/usage - Get user's usage data
export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'desc'; // 'asc' or 'desc'
    
    const usage = await Usage.find({ userId: user._id })
      .sort({ readingDate: sort === 'asc' ? 1 : -1 })
      .limit(limit)
      .lean();
    
    // Calculate total consumption
    const totalConsumption = usage.reduce((sum, reading) => sum + (reading.consumption || 0), 0);
    
    return NextResponse.json(
      successResponse({ 
        usage,
        summary: {
          totalReadings: usage.length,
          totalConsumption,
          averageConsumption: usage.length > 0 ? totalConsumption / usage.length : 0,
          latestReading: usage.length > 0 ? usage[0] : null
        }
      })
    );
    
  } catch (error) {
    console.error('GET /api/usage error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 401 }
    );
  }
}

// POST /api/usage - Submit meter reading
export async function POST(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    
    const data = await request.json();
    const { reading, meterNumber, readingDate } = data;
    
    // Validate input
    if (!reading || isNaN(parseFloat(reading)) || parseFloat(reading) < 0) {
      return NextResponse.json(
        errorResponse('Invalid reading value'),
        { status: 400 }
      );
    }
    
    // Get previous reading
    const previousReading = await Usage.findOne({ 
      userId: user._id 
    }).sort({ readingDate: -1 });
    
    const currentReading = parseFloat(reading);
    const previousReadingValue = previousReading?.currentReading || 0;
    
    // Validate that current reading is not less than previous reading
    if (currentReading < previousReadingValue) {
      return NextResponse.json(
        errorResponse('Current reading cannot be less than previous reading'),
        { status: 400 }
      );
    }
    
    const consumption = currentReading - previousReadingValue;
    
    const usage = new Usage({
      userId: user._id,
      meterNumber: meterNumber || user.meterNumber,
      readingDate: readingDate ? new Date(readingDate) : new Date(),
      readingType: 'manual',
      currentReading,
      previousReading: previousReadingValue,
      consumption,
      ratePlan: user.ratePlan || 'residential',
      rateApplied: user.ratePlan === 'commercial' ? 30 : 15, // Default rates
      submittedBy: user._id,
      verified: true,
    });
    
    await usage.save();
    
    return NextResponse.json(
      successResponse({ 
        usage,
        message: 'Meter reading submitted successfully'
      })
    );
    
  } catch (error) {
    console.error('POST /api/usage error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 400 }
    );
  }
}