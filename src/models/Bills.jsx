'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import BillList from '@/components/bills/BillList';
import PaymentForm from '@/components/bills/PaymentForm';
import styles from '@/styles/pages/Bills.module.css';
import Header from '@/components/ui/Header';
import Link from "next/link";

export default function Bills() {
  const { user, isAuthenticated, loading } = useAuth();
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchBills();
    }
  }, [isAuthenticated]);

  const fetchBills = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        const mockBills = [
          {
            id: 1,
            billNumber: 'BL202401001',
            billingPeriod: {
              start: '2023-12-01',
              end: '2023-12-31'
            },
            dueDate: '2024-01-15',
            energyUsage: 450,
            rate: 0.15,
            energyCharge: 67.50,
            serviceFee: 15.00,
            taxes: 8.25,
            totalAmount: 125.75,
            amountDue: 125.75,
            status: 'pending',
            paidAt: null
          },
          {
            id: 2,
            billNumber: 'BL202312001',
            billingPeriod: {
              start: '2023-11-01',
              end: '2023-11-30'
            },
            dueDate: '2023-12-15',
            energyUsage: 420,
            rate: 0.15,
            energyCharge: 63.00,
            serviceFee: 15.00,
            taxes: 7.80,
            totalAmount: 120.80,
            amountDue: 0,
            status: 'paid',
            paidAt: '2023-12-10'
          },
          {
            id: 3,
            billNumber: 'BL202311001',
            billingPeriod: {
              start: '2023-10-01',
              end: '2023-10-31'
            },
            dueDate: '2023-11-15',
            energyUsage: 480,
            rate: 0.15,
            energyCharge: 72.00,
            serviceFee: 15.00,
            taxes: 8.70,
            totalAmount: 130.70,
            amountDue: 0,
            status: 'paid',
            paidAt: '2023-11-12'
          }
        ];
        setBills(mockBills);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    }
  };

  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    console.log('Processing payment:', paymentData);
    // capture id before clearing selectedBill
    const paidId = selectedBill?.id;
    // API call would go here
    setShowPaymentForm(false);
    setSelectedBill(null);
    
    // Update bill status locally
    if (paidId != null) {
      setBills(prevBills =>
        prevBills.map(bill =>
          bill.id === paidId
            ? { ...bill, status: 'paid', amountDue: 0, paidAt: new Date().toISOString() }
            : bill
        )
      );
    }
    
    alert('Payment processed successfully!');
  };

  const filteredBills = bills.filter(bill => {
    if (filter === 'all') return true;
    if (filter === 'pending') return bill.status === 'pending';
    if (filter === 'paid') return bill.status === 'paid';
    if (filter === 'overdue') return bill.status === 'pending' && new Date(bill.dueDate) < new Date();
    return true;
  });

  const totalPending = bills.filter(bill => bill.status === 'pending').reduce((sum, bill) => sum + bill.amountDue, 0);
  const totalPaid = bills.filter(bill => bill.status === 'paid').reduce((sum, bill) => sum + bill.totalAmount, 0);

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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

  return (
    <>
      <header />

      <div className={styles.bills}>
        {/* Header Section */}
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
                  <p><strong>Total Pending:</strong> ${totalPending.toFixed(2)}</p>
                  <p><strong>Total Paid This Year:</strong> ${totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className={styles.quickStats}>
          <div className="container">
            <div className="row">
              <div className="col-md-3 mb-3">
                <div className={styles.statCard}>
                  <i className="bi bi-receipt"></i>
                  <div>
                    <h3>${totalPending.toFixed(2)}</h3>
                    <p>Amount Due</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className={styles.statCard}>
                  <i className="bi bi-credit-card"></i>
                  <div>
                    <h3>{bills.filter(b => b.status === 'pending').length}</h3>
                    <p>Pending Bills</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className={styles.statCard}>
                  <i className="bi bi-check-circle"></i>
                  <div>
                    <h3>{bills.filter(b => b.status === 'paid').length}</h3>
                    <p>Paid Bills</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className={styles.statCard}>
                  <i className="bi bi-graph-up"></i>
                  <div>
                    <h3>${totalPaid.toFixed(2)}</h3>
                    <p>Total Paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bills Content */}
        <section className="section-padding">
          <div className="container">
            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h3>Billing History</h3>
                </div>
                <div className="col-md-6">
                  <div className={styles.filterButtons}>
                    <button
                      className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('all')}
                    >
                      All Bills
                    </button>
                    <button
                      className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('pending')}
                    >
                      Pending
                    </button>
                    <button
                      className={`btn ${filter === 'paid' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('paid')}
                    >
                      Paid
                    </button>
                    <button
                      className={`btn ${filter === 'overdue' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('overdue')}
                    >
                      Overdue
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bills List */}
            <BillList
              bills={filteredBills}
              onPayment={handlePayment}
              loading={loading}
            />

            {/* Empty State */}
            {filteredBills.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <i className="bi bi-receipt"></i>
                <h4>No bills found</h4>
                <p>There are no bills matching your current filter.</p>
              </div>
            )}
          </div>
        </section>

        {/* Payment Methods */}
        <section className={`section-padding bg-light ${styles.paymentMethods}`}>
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="section-title">Payment Methods</h2>
            </div>
            <div className="row">
              <div className="col-md-4 text-center mb-4">
                <div className={styles.paymentMethod}>
                  <i className="bi bi-credit-card"></i>
                  <h5>Credit/Debit Card</h5>
                  <p>Secure online payments with instant confirmation</p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className={styles.paymentMethod}>
                  <i className="bi bi-bank"></i>
                  <h5>Bank Transfer</h5>
                  <p>Direct transfer from your bank account</p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className={styles.paymentMethod}>
                  <i className="bi bi-wallet2"></i>
                  <h5>Auto-Pay</h5>
                  <p>Set up automatic payments for worry-free billing</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
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
