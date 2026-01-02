import { Suspense } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import BillsClient from './BillsClient';
import BillsSkeleton from './BillsSkeleton';

export const dynamic = 'force-dynamic'; // auth-based

export default async function BillsPage() {
  return (
    <>
      <Header />

      <Suspense fallback={<BillsSkeleton />}>
        <BillsClient />
      </Suspense>

      <Footer />
    </>
  );
}
