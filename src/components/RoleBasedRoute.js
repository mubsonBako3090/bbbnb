// components/RoleBasedRoute.js
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleBasedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/' 
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push(redirectTo);
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}