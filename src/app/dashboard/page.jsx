'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import PaymentForm from '@/components/PaymentForm';
import BillList from '@/components/BillList';
import MeterGenerator from '@/components/dashboard/MeterGenerator';
import UsageChart from '@/components/dashboard/UsageChart';
import styles from '@/styles/Dashboard.module.css';
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

  // --- States ---
  const [dashboardData, setDashboardData] = useState({
    programs: [],
    outages: [],
  });
  const [meterStatus, setMeterStatus] = useState(null);
  const [showMeterGenerator, setShowMeterGenerator] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  // Updated bill states
  const [currentBill, setCurrentBill] = useState({
    id: null,
    amountDue: 0,
    totalAmount: 0,
    period: 'N/A',
    dueDate: null,
    billNumber: null,
    status: null,
    billingPeriod: { start: null, end: null }
  });
  
  const [bills, setBills] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [meterReadings, setMeterReadings] = useState([]);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [newReading, setNewReading] = useState('');

  // --- Fetch dashboard & meter status ---
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isAuthenticated && user) {
      fetchDashboardData();
      fetchMeterStatus();
    }
  }, [user, loading, isAuthenticated, router]);

  // --- Fetch dashboard data (UPDATED) ---
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch bills from new API
      const billsResponse = await fetch('/api/bills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (billsResponse.ok) {
        const billsData = await billsResponse.json();
        
        // New API structure: data.data.bills, data.data.currentBill
        const allBills = billsData.data?.bills || [];
        const currentBillData = billsData.data?.currentBill || null;
        const summary = billsData.data?.summary || {};
        
        setBills(allBills);
        
        // Set current bill
        if (currentBillData) {
          setCurrentBill({
            id: currentBillData._id,
            amountDue: currentBillData.amountDue || 0,
            totalAmount: currentBillData.totalAmount || 0,
            period: currentBillData.period || 
              `${new Date(currentBillData.billingPeriod?.start).toLocaleDateString()} - ${new Date(currentBillData.billingPeriod?.end).toLocaleDateString()}`,
            dueDate: currentBillData.dueDate ? new Date(currentBillData.dueDate) : null,
            billNumber: currentBillData.billNumber,
            status: currentBillData.status || 'generated',
            billingPeriod: currentBillData.billingPeriod || { start: null, end: null }
          });
        } else {
          // No current bill
          setCurrentBill({
            id: null,
            amountDue: 0,
            totalAmount: 0,
            period: 'N/A',
            dueDate: null,
            billNumber: null,
            status: null,
            billingPeriod: { start: null, end: null }
          });
        }

        // Set dashboard data (programs, outages)
        setDashboardData({
          programs: billsData.programs || [],
          outages: billsData.outages || []
        });
      }

      // Fetch usage data separately
      await fetchUsageData(token);
      
      // Fetch additional dashboard data if needed
      await fetchAdditionalDashboardData(token);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  // New function to fetch usage data
  const fetchUsageData = async (token) => {
    try {
      const response = await fetch('/api/usage', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const usageData = data.data?.usage || [];
        setMeterReadings(usageData);
        
        if (usageData.length > 0) {
          // Get latest consumption
          const latestReading = usageData[0]; // Sorted by most recent
          setCurrentUsage(latestReading.consumption || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  // New function for additional dashboard data
  const fetchAdditionalDashboardData = async (token) => {
    try {
      // You can add other dashboard endpoints here
      const [programsRes, outagesRes] = await Promise.all([
        fetch('/api/programs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/outages/current', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (programsRes.ok) {
        const programsData = await programsRes.json();
        setDashboardData(prev => ({
          ...prev,
          programs: programsData.data?.programs || []
        }));
      }
      
      if (outagesRes.ok) {
        const outagesData = await outagesRes.json();
        setDashboardData(prev => ({
          ...prev,
          outages: outagesData.data?.outages || []
        }));
      }
    } catch (error) {
      console.error('Error fetching additional data:', error);
    }
  };

  // --- Fetch meter status ---
  const fetchMeterStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customer/meter/generate', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMeterStatus(data);
        setShowMeterGenerator(true);
      }
    } catch (error) {
      console.error('Error fetching meter status:', error);
    }
  };

  // --- Handle meter generation completion ---
  const handleMeterGenerated = () => {
    setShowMeterGenerator(false);
    fetchMeterStatus();
    fetchDashboardData();
  };

  // --- Logout ---
  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  // --- Payment Form Handlers (UPDATED) ---
  const openPaymentForm = () => {
    if (currentBill && currentBill.id && currentBill.amountDue > 0) {
      setShowPaymentForm(true);
    } else {
      alert(currentBill?.status === 'paid' ? "Bill already paid." : "No bill available for payment.");
    }
  };
  
  const closePaymentForm = () => setShowPaymentForm(false);
  
  const handlePaymentSuccess = (paymentData) => {
    // Refresh data after successful payment
    fetchDashboardData();
    alert('Payment processed successfully!');
  };

  // --- Submit Meter Reading (UPDATED) ---
  const handleSubmitReadingClick = async () => {
    const readingValue = parseFloat(newReading);
    if (isNaN(readingValue) || readingValue < 0) {
      alert('Please enter a valid reading');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reading: readingValue,
          meterNumber: user?.meterNumber || 'N/A',
          readingDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNewReading('');
        // Refresh usage data
        await fetchUsageData(token);
        alert('Reading submitted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit reading');
      }
    } catch (error) {
      console.error('Error submitting reading:', error);
      alert('Error submitting reading');
    }
  };

  // --- Navigation handlers ---
  const handleNavigateToBills = () => {
    router.push('/bills');
  };

  const handleNavigateToUsage = () => {
    const usageSection = document.getElementById('usage-section');
    if (usageSection) {
      usageSection.scrollIntoView({ behavior: 'smooth' });
      usageSection.focus();
    }
  };

  const handleNavigateToPrograms = () => {
    router.push('/programs');
  };

  const handleNavigateToOutages = () => {
    router.push('/outages');
  };

  // --- Loading ---
  if (loading || isDashboardLoading) return (
    <>
      <Header />
      <div 
        className={styles.loadingContainer}
        role="status"
        aria-label="Loading dashboard content"
      >
        <div 
          className="spinner-border text-primary" 
          role="status"
          aria-hidden="true"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="visually-hidden">Dashboard content is loading, please wait.</p>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <div className={styles.dashboard}>

        {/* --- Always-available Meter Generator --- */}
        <section className="section-padding" aria-labelledby="meter-generator-heading">
          <div className="container mb-4">
            <h2 id="meter-generator-heading" className="visually-hidden">Meter Generator</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowMeterGenerator(!showMeterGenerator)}
              aria-expanded={showMeterGenerator}
              aria-controls="meter-generator-section"
            >
              {meterStatus?.hasMeter ? "Generate New Meter" : "Generate Meter"}
              <span className="visually-hidden">
                {showMeterGenerator ? 'Hide meter generator form' : 'Show meter generator form'}
              </span>
            </button>
          </div>
          {showMeterGenerator && (
            <div 
              id="meter-generator-section"
              aria-live="polite"
              aria-relevant="additions"
            >
              <div className="container">
                <MeterGenerator 
                  onComplete={handleMeterGenerated} 
                  hasMeter={meterStatus?.hasMeter} 
                />
              </div>
            </div>
          )}
        </section>

        {/* --- Welcome Section --- */}
        <section className={styles.welcomeSection} aria-label="Welcome and account information">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1>
                  Welcome back, <span className="text-primary">{user?.firstName}</span>!
                </h1>
                <p className={styles.welcomeSubtitle}>
                  <span className="visually-hidden">Account details: </span>
                  Account: <strong>{user?.accountNumber}</strong> • 
                  {user?.customerType?.charAt(0).toUpperCase() + user?.customerType?.slice(1)} Customer
                  {user?.meterNumber && ` • Meter: ${user.meterNumber}`}
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <span 
                  className={styles.statusBadge}
                  role="status"
                  aria-label="Account status: Active"
                >
                  <i className="bi bi-check-circle-fill me-1" aria-hidden="true"></i> Active
                </span>
                
                <button 
                  className="btn btn-danger mt-3 me-2" 
                  onClick={handleLogout}
                  aria-label="Logout from your account"
                >
                  <i className="bi bi-box-arrow-right me-2" aria-hidden="true"></i> Logout
                </button>
                <button
                  className="btn btn-secondary mt-3"
                  onClick={() => router.push('/profile')}
                  aria-label="Go to your profile page"
                >
                  <i className="bi bi-person-circle me-2" aria-hidden="true"></i>
                  Profile
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Meter Status Banner --- */}
        {meterStatus && (
          <div 
            className={styles.meterStatusBanner}
            role="region"
            aria-label="Meter status information"
          >
            {meterStatus.currentRequest ? (
              <div 
                className={`${styles.statusAlert} ${styles.statusPending}`}
                role="alert"
                aria-live="polite"
              >
                <i className="bi bi-clock-history" aria-hidden="true"></i>
                <div className={styles.statusContent}>
                  <strong>Meter Installation Scheduled</strong>
                  <p>
                    Your {meterStatus.meterType} meter is scheduled for installation on{' '}
                    {new Date(meterStatus.currentRequest.estimatedInstallationDate).toLocaleDateString()}
                  </p>
                  <small>Request ID: {meterStatus.currentRequest.requestId}</small>
                </div>
                <button 
                  className={styles.statusButton}
                  aria-label="View details of scheduled meter installation"
                >
                  View Details
                </button>
              </div>
            ) : meterStatus.hasMeter ? (
              <div 
                className={`${styles.statusAlert} ${styles.statusActive}`}
                role="status"
                aria-live="polite"
              >
                <i className="bi bi-check-circle" aria-hidden="true"></i>
                <div className={styles.statusContent}>
                  <strong>Meter Active</strong>
                  <p>
                    Your {meterStatus.meterType} meter ({user?.meterNumber || 'N/A'}) is active and recording usage
                  </p>
                  <small>
                    Next reading: {user?.nextMeterReadingDate ? new Date(user.nextMeterReadingDate).toLocaleDateString() : 'Not scheduled'}
                  </small>
                </div>
                <button 
                  className={styles.statusButton}
                  onClick={() => router.push('/usage')}
                  aria-label="View meter readings history"
                >
                  View Readings
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* --- Quick Stats (UPDATED) --- */}
        <section
          className="section-padding"
          aria-label="Quick statistics overview"
          role="region"
        >
          <div className="container">
            <h2 className="visually-hidden">Quick Statistics</h2>

            <div className="row">
              {/* Bill Card - UPDATED */}
              <div className="col-md-3 col-6 mb-4">
                <div
                  className={`${styles.statCard} ${styles.clickableStatCard}`}
                  onClick={handleNavigateToBills}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleNavigateToBills()}
                  aria-label={`View bill details. Amount: ₦${currentBill.amountDue.toFixed(2)}, Period: ${currentBill.period}`}
                >
                  <div className={styles.statIcon} aria-hidden="true">
                    <i className="bi bi-receipt"></i>
                  </div>

                  <div className={styles.statContent}>
                    <span className="visually-hidden">Current Bill Amount</span>
                    <h3 aria-hidden="true">₦{currentBill.amountDue.toFixed(2)}</h3>
                    <p>Current Bill</p>
                    <small>Due: {currentBill.dueDate?.toLocaleDateString() || "N/A"}</small>
                    {currentBill.billNumber && (
                      <small className="d-block">#{currentBill.billNumber}</small>
                    )}
                  </div>

                  <div className={styles.statArrow} aria-hidden="true">
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>

              {/* Usage Card - UPDATED */}
              <div className="col-md-3 col-6 mb-4">
                <div
                  className={`${styles.statCard} ${styles.clickableStatCard}`}
                  onClick={handleNavigateToUsage}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleNavigateToUsage()}
                  aria-label={`View usage details. Current usage: ${currentUsage.toFixed(0)} kilowatt hours`}
                >
                  <div className={styles.statIcon} aria-hidden="true">
                    <i className="bi bi-lightning"></i>
                  </div>

                  <div className={styles.statContent}>
                    <span className="visually-hidden">Current Usage</span>
                    <h3 aria-hidden="true">{currentUsage.toFixed(0)} kWh</h3>
                    <p>Usage</p>
                    <small>Current Month</small>
                  </div>

                  <div className={styles.statArrow} aria-hidden="true">
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>

              {/* Bill Status Card - NEW */}
              <div className="col-md-3 col-6 mb-4">
                <div
                  className={`${styles.statCard} ${styles.clickableStatCard}`}
                  onClick={handleNavigateToBills}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleNavigateToBills()}
                  aria-label={`View bill status. Status: ${currentBill.status || 'No bill'}`}
                >
                  <div className={styles.statIcon} aria-hidden="true">
                    <i className={`bi ${
                      currentBill.status === 'paid' ? 'bi-check-circle text-success' :
                      currentBill.status === 'overdue' ? 'bi-exclamation-circle text-danger' :
                      currentBill.status === 'partially_paid' ? 'bi-currency-exchange text-warning' :
                      currentBill.status ? 'bi-clock text-info' : 'bi-file-x text-secondary'
                    }`}></i>
                  </div>

                  <div className={styles.statContent}>
                    <span className="visually-hidden">Bill Status</span>
                    <h3 aria-hidden="true">
                      {currentBill.status ? 
                        currentBill.status.charAt(0).toUpperCase() + currentBill.status.slice(1).replace('_', ' ') : 
                        'No Bill'
                      }
                    </h3>
                    <p>Status</p>
                    <small>Current Bill</small>
                  </div>

                  <div className={styles.statArrow} aria-hidden="true">
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>

              {/* Programs Card */}
              <div className="col-md-3 col-6 mb-4">
                <div
                  className={`${styles.statCard} ${styles.clickableStatCard}`}
                  onClick={handleNavigateToPrograms}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleNavigateToPrograms()}
                  aria-label={`View energy programs. ${dashboardData.programs.length} programs available`}
                >
                  <div className={styles.statIcon} aria-hidden="true">
                    <i className="bi bi-gift"></i>
                  </div>

                  <div className={styles.statContent}>
                    <span className="visually-hidden">Available Programs</span>
                    <h3 aria-hidden="true">{dashboardData.programs.length}</h3>
                    <p>Programs</p>
                    <small>Available</small>
                  </div>

                  <div className={styles.statArrow} aria-hidden="true">
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Meter Reading Section --- */}
        {user?.meterNumber && (
          <section 
            className={styles.meterReadingsSection}
            aria-labelledby="meter-reading-heading"
            role="region"
          >
            <div className="container">
              <h3 id="meter-reading-heading">Submit Meter Reading</h3>
              <div className={styles.readingForm}>
                <label htmlFor="meter-reading-input" className="form-label">
                  Enter current meter reading (kWh)
                </label>
                <input
                  id="meter-reading-input"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Enter current reading (kWh)"
                  value={newReading}
                  onChange={(e) => setNewReading(e.target.value)}
                  className="form-control mb-2"
                  aria-describedby="meter-reading-help"
                />
                <small id="meter-reading-help" className="form-text text-muted">
                  Enter the current reading from your meter in kilowatt hours
                </small>
                <button
                  className="btn btn-success mt-2"
                  onClick={handleSubmitReadingClick}
                  aria-label="Submit meter reading"
                  disabled={!newReading || parseFloat(newReading) <= 0}
                >
                  <i className="bi bi-check-circle me-2" aria-hidden="true"></i>
                  Submit Reading
                </button>
              </div>
            </div>
          </section>
        )}

        {/* --- Usage Chart --- */}
        {meterReadings.length > 0 && (
          <section 
            className={styles.sectionPadding} 
            id="usage-section"
            aria-labelledby="usage-chart-heading"
            role="region"
            tabIndex={-1}
          >
            <div className="container">
              <h3 id="usage-chart-heading">Energy Usage</h3>
              <UsageChart readings={meterReadings} />
              <button 
                className="btn btn-outline-primary mt-3"
                onClick={() => router.push('/usage')}
                aria-label="View detailed usage history"
              >
                <i className="bi bi-graph-up me-2" aria-hidden="true"></i>
                View Full Usage History
              </button>
            </div>
          </section>
        )}

        {/* --- Payment Section (UPDATED) --- */}
        <section 
          className="section-padding" 
          id="bills-section"
          aria-labelledby="payment-heading"
          role="region"
          tabIndex={-1}
        >
          <div className="container">
            <h2 id="payment-heading" className="section-title mb-4">
              {currentBill.billNumber ? `Bill #${currentBill.billNumber}` : 'Billing & Payments'}
            </h2>
            
            {currentBill.id ? (
              <>
                {/* Current Bill Card */}
                <div className="card mb-4 shadow-sm">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <h5 className="card-title">Current Bill Details</h5>
                        <div className="row">
                          <div className="col-6">
                            <p className="card-text mb-1">
                              <strong>Billing Period:</strong><br/>
                              {currentBill.period}
                            </p>
                            <p className="card-text mb-1">
                              <strong>Due Date:</strong><br/>
                              {currentBill.dueDate ? currentBill.dueDate.toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="col-6">
                            <p className="card-text mb-1">
                              <strong>Total Amount:</strong><br/>
                              ₦{currentBill.totalAmount.toFixed(2)}
                            </p>
                            <p className="card-text mb-1">
                              <strong>Status:</strong><br/>
                              <span className={`badge ${
                                currentBill.status === 'paid' ? 'bg-success' :
                                currentBill.status === 'overdue' ? 'bg-danger' :
                                currentBill.status === 'partially_paid' ? 'bg-warning' :
                                'bg-info'
                              }`}>
                                {currentBill.status ? 
                                  currentBill.status.charAt(0).toUpperCase() + currentBill.status.slice(1).replace('_', ' ') : 
                                  'Generated'
                                }
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 text-md-end">
                        <div className="mb-3">
                          <h3 className={`display-6 ${currentBill.amountDue > 0 ? 'text-danger' : 'text-success'}`}>
                            ₦{currentBill.amountDue.toFixed(2)}
                          </h3>
                          <p className="text-muted">Amount Due</p>
                        </div>
                        <button 
                          className="btn btn-primary btn-lg w-100"
                          onClick={openPaymentForm}
                          aria-label={`Pay bill ${currentBill.billNumber}`}
                          disabled={currentBill.amountDue <= 0}
                        >
                          <i className="bi bi-credit-card me-2" aria-hidden="true"></i> 
                          {currentBill.amountDue > 0 ? 'Pay Now' : 'Paid'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => router.push('/bills')}
                    aria-label="View all bills and payment history"
                  >
                    <i className="bi bi-list-ul me-2" aria-hidden="true"></i> View All Bills
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      // Generate PDF invoice
                      window.open(`/api/bills/${currentBill.id}/invoice`, '_blank');
                    }}
                    aria-label="Download invoice PDF"
                  >
                    <i className="bi bi-download me-2" aria-hidden="true"></i> Download Invoice
                  </button>
                  <button 
                    className="btn btn-outline-info"
                    onClick={() => {
                      // View payment history
                      router.push('/bills?tab=payments');
                    }}
                    aria-label="View payment history"
                  >
                    <i className="bi bi-clock-history me-2" aria-hidden="true"></i> Payment History
                  </button>
                </div>
                
                {/* Payment Form Modal */}
                {showPaymentForm && (
                  <div 
                    role="dialog"
                    aria-labelledby="payment-form-title"
                    aria-modal="true"
                    className="modal show d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                  >
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id="payment-form-title">
                            Pay Bill #{currentBill.billNumber}
                          </h5>
                          <button 
                            type="button" 
                            className="btn-close" 
                            onClick={closePaymentForm}
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="modal-body">
                          <PaymentForm 
                            bill={currentBill} 
                            onClose={closePaymentForm} 
                            onSubmit={handlePaymentSuccess} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* No Bill State */
              <div className="card border-info mb-4">
                <div className="card-body text-center">
                  <i className="bi bi-info-circle display-4 text-info mb-3" aria-hidden="true"></i>
                  <h5 className="card-title">No Current Bill</h5>
                  <p className="card-text">
                    You don't have any bills at the moment. Your next bill will be generated at the end of your billing cycle.
                  </p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => router.push('/bills')}
                    aria-label="View billing history"
                  >
                    <i className="bi bi-receipt me-2" aria-hidden="true"></i> View Billing History
                  </button>
                </div>
              </div>
            )}
            
            {/* Recent Bills */}
            <div aria-live="polite" aria-atomic="true">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Recent Bills</h4>
                <button 
                  className="btn btn-link"
                  onClick={() => router.push('/bills')}
                  aria-label="View all bills"
                >
                  View All <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </button>
              </div>
              
              {bills.length > 0 ? (
                <div className="list-group">
                  {bills.slice(0, 5).map((bill) => (
                    <div 
                      key={bill._id} 
                      className="list-group-item list-group-item-action"
                      onClick={() => router.push(`/bills/${bill._id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && router.push(`/bills/${bill._id}`)}
                      aria-label={`View bill ${bill.billNumber} details`}
                    >
                      <div className="d-flex w-100 justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">Bill #{bill.billNumber}</h6>
                          <small className="text-muted">
                            {new Date(bill.billingPeriod?.start).toLocaleDateString()} - {new Date(bill.billingPeriod?.end).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="text-end">
                          <h6 className="mb-1 text-primary">₦{bill.totalAmount?.toFixed(2)}</h6>
                          <small className={`badge ${
                            bill.status === 'paid' ? 'bg-success' : 
                            bill.status === 'overdue' ? 'bg-danger' : 
                            'bg-warning'
                          }`}>
                            {bill.status}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between mt-2">
                        <small>Due: {new Date(bill.dueDate).toLocaleDateString()}</small>
                        <small>Amount Due: ₦{bill.amountDue?.toFixed(2)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-light text-center" role="alert">
                  <i className="bi bi-receipt display-6 text-muted mb-3" aria-hidden="true"></i>
                  <p className="mb-0">No bills found.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Skip to main content link for keyboard users */}
        <a 
          href="#main-content" 
          className="visually-hidden-focusable"
          style={{
            position: 'absolute',
            top: '-40px',
            left: '10px',
            background: '#0d6efd',
            color: 'white',
            padding: '8px',
            zIndex: 1000,
            textDecoration: 'none'
          }}
          onFocus={() => {
            const element = document.querySelector('[style*="top: -40px"]');
            if (element) element.style.top = '10px';
          }}
          onBlur={() => {
            const element = document.querySelector('[style*="top: 10px"]');
            if (element) element.style.top = '-40px';
          }}
        >
          Skip to main content
        </a>

      </div>
      <Footer />
    </>
  );
}