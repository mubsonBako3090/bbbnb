'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BillList from '@/components/bills/BillList';
import PaymentForm from '@/components/bills/PaymentForm';
import styles from '@/styles/pages/Bills.module.css';

export default function BillsClient() {
  /* =========================
     AUTH
  ========================== */
  const { isAuthenticated, loading } = useAuth();

  /* =========================
     STATE
  ========================== */
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState('all');
  const [fetching, setFetching] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  /* =========================
     HELPERS
  ========================== */
  const getCSRFToken = () =>
    document.cookie
      .split('; ')
      .find(row => row.startsWith('csrfToken='))
      ?.split('=')[1];

  /* =========================
     FETCH BILLS
  ========================== */
  async function fetchBills() {
    try {
      setFetching(true);

      const query =
        filter && filter !== 'all'
          ? `?status=${filter}`
          : '';

      const res = await fetch(`/api/bills${query}`, {
        credentials: 'include',
      });

      const data = await res.json();
      setBills(data.data?.bills || []);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setFetching(false);
    }
  }

  /* =========================
     INITIAL FETCH
  ========================== */
  useEffect(() => {
    if (isAuthenticated) {
      fetchBills();
    }
  }, [isAuthenticated, filter]);

  /* =========================
     PAYMENT HANDLERS
  ========================== */
  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      const csrfToken = getCSRFToken();

      await fetch('/api/bills/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ billId: selectedBill._id }),
      });

      // polling will handle refresh
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  /* =========================
     PAYMENT STATUS POLLING
  ========================== */
  useEffect(() => {
    if (!selectedBill) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bills/${selectedBill._id}`, {
          credentials: 'include',
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data.data?.status === 'paid') {
          clearInterval(interval);
          await fetchBills();
          setSelectedBill(null);
          setShowPaymentForm(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedBill]);

  /* =========================
     UI STATES
  ========================== */
  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div className={styles.unauthorized}>
        <h3>Access Denied</h3>
        <p>Please log in to view your bills.</p>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================== */
  return (
    <>
      <BillList
        bills={bills}
        loading={fetching}
        filter={filter}
        onFilterChange={setFilter}
        onPayment={handlePayment}
      />

      {showPaymentForm && selectedBill && (
        <PaymentForm
          bill={selectedBill}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedBill(null);
          }}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </>
  );
}
