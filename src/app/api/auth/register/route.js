import { NextResponse } from 'next/server';
import { withDatabase } from '@/lib/database';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import { handleError, successResponse } from '@/lib/utils';

export const POST = withDatabase(async (request) => {
  try {
    const body = await request.json();

    const { 
      firstName,
      lastName,
      email,
      password,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
      customerType,
      role // role from frontend
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !streetAddress || !city || !state || !zipCode) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Super admin restriction
    if (role === 'superAdmin') {
      const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
      if (existingSuperAdmin) {
        return NextResponse.json(
          { success: false, error: 'A Super Admin already exists' },
          { status: 403 }
        );
      }
    }

    // Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      address: {
        street: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: 'NG'
      },
      // If role is superAdmin, customerType is null
      customerType: role === 'superAdmin' ? null : (customerType || 'residential'),
      role: role || 'customer' // default to customer if not provided
    });

    const token = generateToken(user._id);

    await user.updateLastLogin();

    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      accountNumber: user.accountNumber,
      meterNumber: user.meterNumber,
      customerType: user.customerType,
      role: user.role,
      address: user.address,
      preferences: user.preferences,
      lastLogin: user.lastLogin
    };

    const response = NextResponse.json(
      successResponse({ user: userResponse }, 'Registration successful')
    );

    setTokenCookie(response, token);

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    const errorData = handleError(error);
    return NextResponse.json(
      { success: false, error: errorData.error, details: errorData.details },
      { status: 400 }
    );
  }
});
