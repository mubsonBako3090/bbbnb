// app/bills/page.jsx - SIMPLE CLIENT-SIDE FIX
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import BillsClient from './BillsClient';

export default function BillsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Header />
      <BillsClient user={user} />
      <Footer />
    </>
  );
}