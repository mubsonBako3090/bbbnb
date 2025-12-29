// app/api/superadmin/system-health/route.js
import { NextResponse } from 'next/server';
import { authenticateSuperAdmin } from '@/middleware/auth';
import connectDB from '@/lib/database';
import mongoose from 'mongoose';
import os from 'os';

export async function GET(request) {
  try {
    await connectDB();
    const user = await authenticateSuperAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get system information
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)), // GB
      freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)), // GB
      loadAverage: os.loadavg(),
      uptime: os.uptime(), // seconds
      networkInterfaces: Object.keys(os.networkInterfaces()).length
    };

    const memoryUsage = ((systemInfo.totalMemory - systemInfo.freeMemory) / systemInfo.totalMemory) * 100;

    // Database health check
    let dbStatus = 'disconnected';
    let dbLatency = 0;

    try {
      const startTime = Date.now();
      await connectDB();
      const db = mongoose.connection;
      dbStatus = db.readyState === 1 ? 'connected' : 'disconnected';
      dbLatency = Date.now() - startTime;
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      dbStatus = 'error';
    }

    // API endpoint health checks
    const apiEndpoints = [
      '/api/auth/status',
      '/api/customers',
      '/api/billing'
    ];

    const apiStatuses = await Promise.all(
      apiEndpoints.map(async (endpoint) => {
        try {
          const startTime = Date.now();
          const res = await fetch(`http://localhost:3000${endpoint}`, {
            headers: { 'Authorization': `Bearer ${request.headers.get('authorization')}` }
          });
          const latency = Date.now() - startTime;
          return {
            endpoint,
            status: res.status,
            latency,
            healthy: res.status < 400
          };
        } catch (error) {
          return {
            endpoint,
            status: 0,
            latency: 0,
            healthy: false,
            error: error.message
          };
        }
      })
    );

    // Get active sessions count
    const User = (await import('@/models/User')).default;
    const activeSessions = await User.aggregate([
      { $unwind: '$loginSessions' },
      { $match: { 'loginSessions.isActive': true } },
      { $count: 'activeSessions' }
    ]);

    // Get recent errors from audit logs
    const AuditLog = (await import('@/models/AuditLog')).default;
    const recentErrors = await AuditLog.find({
      severity: { $in: ['error', 'critical'] },
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .limit(10)
    .sort({ timestamp: -1 });

    const overallStatus =
      dbStatus === 'connected' &&
      memoryUsage < 90 &&
      apiStatuses.every(s => s.healthy)
        ? 'healthy'
        : 'degraded';

    const response = {
      system: {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        ...systemInfo,
        memoryUsage: Math.round(memoryUsage)
      },
      database: {
        status: dbStatus,
        latency: dbLatency
      },
      api: {
        status: apiStatuses.every(s => s.healthy) ? 'up' : 'partial',
        endpoints: apiStatuses
      },
      sessions: {
        active: activeSessions[0]?.activeSessions || 0
      },
      recentErrors: recentErrors.map(error => ({
        action: error.action,
        category: error.category,
        timestamp: error.timestamp,
        details: error.details
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET system health error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        system: { status: 'unhealthy' },
        database: { status: 'error' },
        api: { status: 'down' }
      },
      { status: 500 }
    );
  }
                              }
