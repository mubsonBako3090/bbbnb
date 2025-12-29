// app/api/admin/customers/route.js
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const ALLOWED_ROLES = ['superAdmin', 'admin', 'billingManager', 'supportAgent', 'fieldAgent'];

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Role-based data filtering
  let customers = await getCustomersFromDB();
  
  // Field agents only see customers in their zone
  if (session.user.role === 'fieldAgent' && session.user.zone) {
    customers = customers.filter(c => c.zone === session.user.zone);
  }
  
  // Support agents see limited info
  if (session.user.role === 'supportAgent') {
    customers = customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      meterStatus: c.meterStatus,
      // Hide sensitive info
    }));
  }

  return NextResponse.json(customers);
}