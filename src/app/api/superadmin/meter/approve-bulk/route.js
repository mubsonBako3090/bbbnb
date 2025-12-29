// app/api/superadmin/meter/approve-bulk/route.js
import { NextResponse } from 'next/server';
import { authenticateSuperAdmin, createAuditLog } from '@/middleware/auth';
import connectDB from '@/lib/database';
import Customer from '@/models/Customer';

export async function PATCH(request) {
  try {
    await connectDB();

    const user = await authenticateSuperAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerIds } = await request.json();

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'No customer IDs provided' },
        { status: 400 }
      );
    }

    const customers = await Customer.find({ _id: { $in: customerIds } });

    if (customers.length !== customerIds.length) {
      return NextResponse.json(
        { error: 'Some customers not found' },
        { status: 404 }
      );
    }

    const updates = customers.map(customer => ({
      updateOne: {
        filter: { _id: customer._id },
        update: {
          $set: {
            meterNumber: `MTR-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 10)
              .toUpperCase()}`,
            meterInstallationStatus: 'approved',
            accountStatus: 'active',
            updatedAt: new Date()
          }
        }
      }
    }));

    const result = await Customer.bulkWrite(updates);

    await createAuditLog(user._id, 'BULK_APPROVE_METERS', 'meter_management', {
      targetType: 'Customer',
      details: {
        count: customerIds.length,
        customerIds,
        approvedBy: user.email
      }
    });

    return NextResponse.json({
      message: `Successfully approved ${result.modifiedCount} meter installations`,
      approvedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk approve meters error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
         }
