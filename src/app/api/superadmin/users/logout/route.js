// app/api/superadmin/users/logout/route.js
import { NextResponse } from 'next/server';
import { authenticateSuperAdmin, createAuditLog } from '@/middleware/auth';
import connectDB from '@/lib/database';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const user = await authenticateSuperAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userToLogout = await User.findById(userId);

    if (!userToLogout) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user._id.toString() === userId && user.role !== 'superAdmin') {
      return NextResponse.json(
        { error: 'Cannot force logout yourself' },
        { status: 403 }
      );
    }

    const result = await User.updateOne(
      { _id: userId },
      {
        $set: {
          'loginSessions.$[].isActive': false,
          lastActivity: new Date()
        }
      }
    );

    await createAuditLog(user._id, 'FORCE_LOGOUT', 'security', {
      targetId: userId,
      targetType: 'User',
      details: {
        targetEmail: userToLogout.email,
        targetRole: userToLogout.role,
        performedBy: user.email
      },
      severity: 'warning'
    });

    return NextResponse.json({
      message: `Successfully logged out user ${userToLogout.email}`,
      sessionsCleared: result.modifiedCount
    });

  } catch (error) {
    console.error('Force logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
      }
