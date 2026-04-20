// Auth Guard Middleware for Protected Routes
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/utils/store';
import Loading from '@/components/Loading';

export function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loading.PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Loading.PageLoader />;
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
