// app/api/superadmin/users/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authenticateSuperAdmin, createAuditLog } from '@/middleware/auth';
import connectDB from '@/lib/database';
import User from '@/models/User';

// Define role permissions mapping
const ROLE_PERMISSIONS = {
  superAdmin: ['all_permissions'],
  admin: [
    'view_dashboard',
    'view_customers',
    'manage_customers',
    'approve_meters',
    'bulk_operations',
    'view_billing',
    'manage_billing',
    'process_payments',
    'generate_reports',
    'view_users',
    'send_notifications'
  ],
  billingManager: [
    'view_dashboard',
    'view_customers',
    'view_billing',
    'manage_billing',
    'process_payments',
    'generate_reports'
  ],
  supportAgent: [
    'view_dashboard',
    'view_customers',
    'view_billing'
  ],
  fieldAgent: [
    'view_dashboard',
    'view_customers',
    'approve_meters'
  ]
};

// GET all users
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit')) || 100;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (role) query.role = role;
    if (active !== null) query.isActive = active === 'true';

    // Get users (excluding passwords)
    const users = await User.find(query)
      .select('-password -loginSessions')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Create audit log
    await createAuditLog(user._id, 'GET_USERS', 'user_management', {
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user
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

    const data = await request.json();

    // Validate required fields
    if (!data.email || !data.name || !data.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate random password if not provided
    const password = data.password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set permissions based on role
    const permissions = ROLE_PERMISSIONS[data.role] || [];

    // Create new user
    const newUser = new User({
      email: data.email.toLowerCase(),
      name: data.name,
      password: hashedPassword,
      role: data.role,
      permissions: [...permissions, ...(data.permissions || [])],
      zone: data.zone,
      isActive: true
    });

    await newUser.save();

    // Create audit log
    await createAuditLog(user._id, 'CREATE_USER', 'user_management', {
      targetId: newUser._id,
      targetType: 'User',
      details: {
        email: newUser.email,
        role: newUser.role,
        createdBy: user.email
      }
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.loginSessions;

    return NextResponse.json({
      message: 'User created successfully',
      user: userResponse,
      temporaryPassword: !data.password ? password : undefined
    }, { status: 201 });

  } catch (error) {
    console.error('POST user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(request) {
  try {
    await connectDB();
    const user = await authenticateSuperAdmin(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    if (!data.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userToUpdate = await User.findById(data.userId);
    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (userToUpdate.role === 'superAdmin' && user._id.toString() !== userToUpdate._id.toString()) {
      if (data.role && data.role !== 'superAdmin') {
        return NextResponse.json(
          { error: 'Cannot change super admin role' },
          { status: 403 }
        );
      }
      if (data.isActive === false) {
        return NextResponse.json(
          { error: 'Cannot deactivate super admin' },
          { status: 403 }
        );
      }
    }

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.role) {
      updateData.role = data.role;
      updateData.permissions = ROLE_PERMISSIONS[data.role] || [];
    }
    if (data.permissions) {
      const rolePermissions = ROLE_PERMISSIONS[userToUpdate.role] || [];
      updateData.permissions = [...new Set([...rolePermissions, ...data.permissions])];
    }
    if (data.zone !== undefined) updateData.zone = data.zone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      data.userId,
      { $set: updateData },
      { new: true }
    ).select('-password -loginSessions');

    await createAuditLog(user._id, 'UPDATE_USER', 'user_management', {
      targetId: updatedUser._id,
      targetType: 'User',
      details: {
        updatedFields: Object.keys(updateData),
        updatedBy: user.email
      }
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('PATCH user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
                                     }
