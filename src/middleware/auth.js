// Updated middleware auth
import connectDB from '@/lib/database';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Ensure the incoming request is authenticated
 */
export async function requireAuth(request) {
  await connectDB();
  const userId = await getUserIdFromRequest(request);
  if (!userId) throw new Error('Unauthorized');

  const user = await User.findById(userId);
  if (!user) throw new Error('Unauthorized');

  return user;
}

/**
 * Ensure requester is an admin
 */
export async function requireAdmin(request) {
  const user = await requireAuth(request);
  if (user.role !== 'admin') throw new Error('Admin access required');
  return user;
}

/**
 * Ensure requester is a Super Admin
 */
export function requireSuperAdmin(user) {
  if (user.role !== 'superAdmin') {
    const err = new Error('Super admin access required');
    err.status = 403;
    throw err;
  }
}

/**
 * ✅ NEW — Super Admin request helper
 * Use this for /api/superadmin/* routes
 */
export async function authenticateSuperAdminRequest(request) {
  const user = await requireAuth(request);
  requireSuperAdmin(user);
  return user;
    }
