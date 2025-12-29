// components/PermissionGuard.js
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function PermissionGuard({ 
  children, 
  permission, 
  fallback = null 
}) {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return fallback;
  }
  
  return <>{children}</>;
}