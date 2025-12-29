// app/api/superadmin/stats/route.js
import { NextResponse } from 'next/server';
import { authenticateSuperAdmin } from '@/middleware/auth';
import connectDB from '@/lib/database';

export async function GET(request) {
  try {
    await connectDB();

    const user = await authenticateSuperAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const Customer = (await import('@/models/Customer')).default;
    const User = (await import('@/models/User')).default;
    const AuditLog = (await import('@/models/AuditLog')).default;

    const [
      totalCustomers,
      pendingInstallations,
      activeUsers,
      revenueAgg,
      recentLogs,
      userDistribution
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ meterInstallationStatus: 'pending' }),
      User.countDocuments({ role: { $ne: 'customer' }, isActive: true }),
      Customer.aggregate([
        { $group: { _id: null, total: { $sum: '$billingInfo.outstandingBalance' } } }
      ]),
      AuditLog.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      totalCustomers,
      pendingInstallations,
      activeUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      recentActivity: recentLogs,
      userDistribution: userDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
        }
