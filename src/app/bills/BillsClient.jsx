'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BillList from '@/components/bills/BillList';
import PaymentForm from '@/components/bills/PaymentForm';
import InvoiceGenerator from '@/components/bills/InvoiceGenerator';
import styles from '@/styles/pages/Bills.module.css';

export default function BillsClient({ user }) {
  /* =========================
     AUTH
  ========================== */
  const { isAuthenticated, loading } = useAuth();

  /* =========================
     STATE
  ========================== */
  const [bills, setBills] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [summary, setSummary] = useState({});
  const [currentUser] = useState(user || {});

  const [filter, setFilter] = useState('all');
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('bills');

  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

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
  const fetchBills = async (page = 1, status = filter) => {
    try {
      setFetching(true);

      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
      });

      if (status !== 'all') params.append('status', status);

      const res = await fetch(`/api/bills?${params}`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch bills');

      const data = await res.json();

      setBills(data.data?.bills || []);
      setCurrentBill(data.data?.currentBill || null);
      setSummary(data.data?.summary || {});
      setPagination(data.data?.pagination || pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  /* =========================
     EFFECTS
  ========================== */
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'bills') {
      fetchBills(1, filter);
    }
  }, [isAuthenticated, filter, activeTab]);

  /* =========================
     PAGINATION
  ========================== */
  const handleNextPage = () => {
    if (pagination.hasNext) {
      fetchBills(pagination.page + 1, filter);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      fetchBills(pagination.page - 1, filter);
    }
  };

  /* =========================
     PAYMENT
  ========================== */
  const handlePayment = bill => {
    setSelectedBill(bill);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async paymentData => {
    try {
      const res = await fetch(`/api/bills/${selectedBill._id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'x-csrf-token': getCSRFToken(),
        },
        body: JSON.stringify(paymentData),
      });

      if (!res.ok) throw new Error('Payment failed');

      fetchBills(pagination.page, filter);
      setShowPaymentForm(false);
      setSelectedBill(null);
      alert('Payment successful');
    } catch (err) {
      alert(err.message);
    }
  };

  /* =========================
     INVOICE
  ========================== */
  const handleGenerateInvoice = bill => {
    setSelectedBill(bill);
    setShowInvoiceGenerator(true);
  };

  const handleDownloadInvoice = async billId => {
    try {
      const res = await fetch(`/api/bills/${billId}/invoice`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to download invoice');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${billId}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

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
    <div className="container py-5">
      <h2 className="mb-4">
        Bills for <strong>{currentUser?.accountNumber || '—'}</strong>
      </h2>

      <BillList
        bills={bills}
        onPayment={handlePayment}
        onInvoice={handleGenerateInvoice}
        onDownload={handleDownloadInvoice}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
              <button className="page-link" onClick={handlePrevPage}>
                Previous
              </button>
            </li>
            <li className="page-item active">
              <span className="page-link">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            </li>
            <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
              <button className="page-link" onClick={handleNextPage}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Payment Modal */}
      {showPaymentForm && selectedBill && (
        <PaymentForm
          bill={selectedBill}
          onClose={() => setShowPaymentForm(false)}
          onSubmit={handlePaymentSubmit}
        />
      )}

      {/* Invoice Modal */}
      {showInvoiceGenerator && selectedBill && (
        <InvoiceGenerator
          bill={selectedBill}
          onClose={() => setShowInvoiceGenerator(false)}
          onDownload={handleDownloadInvoice}
        />
      )}
    </div>
  );
}
