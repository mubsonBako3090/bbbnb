// app/api/superadmin/audit-logs/route.js
import { NextResponse } from 'next/server';
import { authenticateSuperAdmin } from '@/middleware/auth';
import connectDB from '@/lib/database';
import AuditLog from '@/models/AuditLog';

export async function GET(request) {
  try {
    await connectDB();

    const user = await authenticateSuperAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Number(searchParams.get('limit')) || 50;
    const page = Number(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    const query = {};

    if (category) query.category = category;
    if (userId) query.userId = userId;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log._id,
        action: log.action,
        category: log.category,
        user: log.userId
          ? {
              name: log.userId.name,
              email: log.userId.email,
              role: log.userId.role
            }
          : {
              email: log.userEmail,
              role: log.userRole
            },
        targetId: log.targetId,
        targetType: log.targetType,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        details: log.details,
        severity: log.severity,
        timestamp: log.timestamp
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('GET audit logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
      }
