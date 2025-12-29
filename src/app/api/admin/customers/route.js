// app/api/admin/customers/route.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ALLOWED_ROLES = [
  'superAdmin',
  'admin',
  'billingManager',
  'supportAgent',
  'fieldAgent',
];

export async function GET(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || !ALLOWED_ROLES.includes(token.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch customers
  let customers = await getCustomersFromDB();

  // Field agents only see customers in their zone
  if (token.role === 'fieldAgent' && token.zone) {
    customers = customers.filter(c => c.zone === token.zone);
  }

  // Support agents see limited info
  if (token.role === 'supportAgent') {
    customers = customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      meterStatus: c.meterStatus,
      // sensitive fields intentionally excluded
    }));
  }

  return NextResponse.json(customers);
}
