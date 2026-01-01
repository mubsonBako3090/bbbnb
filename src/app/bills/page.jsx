'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import BillList from '@/components/bills/BillList';
import PaymentForm from '@/components/bills/PaymentForm';
import styles from '@/styles/pages/Bills.module.css';
import Header from '@/components/ui/Header';
import DownloadBillButton from '@/components/DownloadBillButton';

export default function Bills() {
  const { user, isAuthenticated, loading } = useAuth();

  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [fetching, setFetching] = useState(false);

  /* =========================
     FETCH BILLS FROM API
  ========================== */
  useEffect(() => {
    if (isAuthenticated) {
      fetchBills();
    }
  }, [isAuthenticated, filter]);

  const fetchBills = async () => {
    try {
      setFetching(true);

      const query =
        filter && filter !== 'all'
          ? `?status=${filter}`
          : '';

      const res = await fetch(`/api/bills${query}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch bills');
      }

      const data = await res.json();

      // API response shape: successResponse({ bills, pagination })
      setBills(data.data.bills || []);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setFetching(false);
    }
  };

  /* =========================
     PAYMENT HANDLERS
  ========================== */
  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      // Example payment endpoint (adjust if different)
      await fetch('/api/bills/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId: selectedBill._id })
      });

      setShowPaymentForm(false);
      setSelectedBill(null);

      await fetchBills(); // 🔄 refresh bills

      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed');
    }
  };

  /* =========================
     DERIVED DATA
  ========================== */
  const totalPending = bills
    .filter(bill => bill.status === 'pending')
    .reduce((sum, bill) => sum + (bill.amountDue || 0), 0);

  const totalPaid = bills
    .filter(bill => bill.status === 'paid')
    .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

  /* =========================
     UI STATES
  ========================== */
  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className="spinner-border text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className={styles.unauthorized}>
          <div className="container text-center">
            <i className="bi bi-shield-exclamation"></i>
            <h2>Access Denied</h2>
            <p>Please log in to view your bills.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  /* =========================
     MAIN RENDER
  ========================== */
  return (
    <>
      <Header />

      <div className={styles.bills}>
        {/* Header */}
        <section className={styles.billsHeader}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1>My Bills</h1>
                <p className={styles.billsSubtitle}>
                  View and manage your electricity bills
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <div className={styles.billSummary}>
                  <p><strong>Total Pending:</strong> ₦{totalPending.toFixed(2)}</p>
                  <p><strong>Total Paid:</strong> ₦{totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="section-padding">
          <div className="container">
            <div className={styles.filterTabs}>
              {['all', 'pending', 'paid', 'overdue'].map(type => (
                <button
                  key={type}
                  className={`btn ${
                    filter === type
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  }`}
                  onClick={() => setFilter(type)}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Bills List */}
            <BillList
              bills={bills}
              onPayment={handlePayment}
              loading={fetching}
            />

            {/* Empty State */}
            {!fetching && bills.length === 0 && (
              <div className={styles.emptyState}>
                <i className="bi bi-receipt"></i>
                <h4>No bills found</h4>
                <p>No bills available for this filter.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Payment Modal */}
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

      <Footer />
    </>
  );
}
