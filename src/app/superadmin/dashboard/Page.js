‎'use client';
‎import { useEffect, useState, useRef } from 'react';
‎import { useAuth } from '@/contexts/AuthContext';
‎import { useRouter } from 'next/navigation';
‎import Header from '@/components/ui/Header';
‎import Footer from '@/components/Footer';
‎import PaymentForm from '@/components/PaymentForm';
‎import BillList from '@/components/BillList';
‎import MeterGenerator from '@/components/dashboard/MeterGenerator';
‎import UsageChart from '@/components/dashboard/UsageChart';
‎import styles from '@/styles/Dashboard.module.css';
‎
‎export default function Dashboard() {
‎  const router = useRouter();
‎  const { user, isAuthenticated, loading, logout } = useAuth();
‎
‎  // Refs for scroll positioning
‎  const meterReadingRef = useRef(null);
‎  const dashboardTopRef = useRef(null);
‎
‎  // --- Consolidated States ---
‎  const [dashboardData, setDashboardData] = useState({
‎    programs: [],
‎    outages: [],
‎    usageData: [],
‎    
‎  });
‎  
‎  const [meterStatus, setMeterStatus] = useState({
‎    hasMeter: false,
‎    currentRequest: null,
‎    meterType: null,
‎    meterNumber: null
‎  });
‎  
‎  const [showMeterGenerator, setShowMeterGenerator] = useState(false);
‎  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
‎  const [showPaymentForm, setShowPaymentForm] = useState(false);
‎  const [newReading, setNewReading] = useState('');
‎  const [isSubmittingReading, setIsSubmittingReading] = useState(false);
‎
‎  // Bill states
‎  const [currentBill, setCurrentBill] = useState({
‎    id: null,
‎    amountDue: 0,
‎    totalAmount: 0,
‎    period: 'N/A',
‎    dueDate: null,
‎    billNumber: null,
‎    status: null,
‎    billingPeriod: { start: null, end: null }
‎  });
‎  
‎  const [bills, setBills] = useState([]);
‎  const [payments, setPayments] = useState([]); // ADDED BACK - Payments state
‎  const [meterReadings, setMeterReadings] = useState([]);
‎  const [currentUsage, setCurrentUsage] = useState(0);
‎
‎  // --- Effect Hooks ---
‎  useEffect(() => {
‎    if (!loading && !isAuthenticated) {
‎      router.push('/');
‎      return;
‎    }
‎    if (isAuthenticated && user) {
‎      fetchDashboardData();
‎      fetchMeterStatus();
‎    }
‎  }, [user, loading, isAuthenticated, router]);
‎
‎  // Scroll to top to avoid navbar overlap
‎  useEffect(() => {
‎    if (!isDashboardLoading && dashboardTopRef.current) {
‎      // Add padding to account for fixed navbar
‎      document.body.style.paddingTop = '76px'; // Height of your navbar
‎      
‎      // Scroll to top with offset for navbar
‎      window.scrollTo({
‎        top: 0,
‎        behavior: 'smooth'
‎      });
‎    }
‎    
‎    return () => {
‎      document.body.style.paddingTop = '0';
‎    };
‎  }, [isDashboardLoading]);
‎
‎  // --- API Functions ---
‎  const fetchDashboardData = async () => {
‎    try {
‎      setIsDashboardLoading(true);
‎      const token = localStorage.getItem('token');
‎      
‎      // Fetch multiple data sources in parallel
‎      const [billsResponse, usageResponse, programsResponse, outagesResponse] = await Promise.all([
‎        fetch('/api/bills', {
‎          headers: { 'Authorization': `Bearer ${token}` }
‎        }),
‎        fetch('/api/usage', {
‎          headers: { 'Authorization': `Bearer ${token}` }
‎        }),
‎        fetch('/api/programs', {
‎          headers: { 'Authorization': `Bearer ${token}` }
‎        }),
‎        fetch('/api/outages/current', {
‎          headers: { 'Authorization': `Bearer ${token}` }
‎        })
‎      ]);
‎
‎      // Process bills data
‎      if (billsResponse.ok) {
‎        const billsData = await billsResponse.json();
‎        const allBills = billsData.data?.bills || [];
‎        const currentBillData = billsData.data?.currentBill || null;
‎        
‎        setBills(allBills);
‎        
‎        if (currentBillData) {
‎          setCurrentBill({
‎            id: currentBillData._id,
‎            amountDue: currentBillData.amountDue || 0,
‎            totalAmount: currentBillData.totalAmount || 0,
‎            period: currentBillData.period || 
‎              `${new Date(currentBillData.billingPeriod?.start).toLocaleDateString()} - ${new Date(currentBillData.billingPeriod?.end).toLocaleDateString()}`,
‎            dueDate: currentBillData.dueDate ? new Date(currentBillData.dueDate) : null,
‎            billNumber: currentBillData.billNumber,
‎            status: currentBillData.status || 'generated',
‎            billingPeriod: currentBillData.billingPeriod || { start: null, end: null }
‎          });
‎        }
‎      }
‎
‎      // Process usage data
‎      if (usageResponse.ok) {
‎        const usageData = await usageResponse.json();
‎        const readings = usageData.data?.usage || usageData.data?.readings || [];
‎        setMeterReadings(readings);
‎        
‎        if (readings.length > 0) {
‎          const sortedReadings = [...readings].sort((a, b) => 
‎            new Date(b.date || b.readingDate) - new Date(a.date || a.readingDate)
‎          );
‎          const latestReading = sortedReadings[0];
‎          setCurrentUsage(latestReading.consumption || latestReading.usage || 0);
‎        }
‎      }
‎
‎      // Process programs and outages
‎      const programs = programsResponse.ok ? await programsResponse.json() : {};
‎      const outages = outagesResponse.ok ? await outagesResponse.json() : {};
‎
‎      setDashboardData({
‎        programs: programs.data?.programs || programs.programs || [],
‎        outages: outages.data?.outages || outages.outages || [],
‎        usageData: readings
‎      });
‎
‎    } catch (error) {
‎      console.error('Error fetching dashboard data:', error);
‎    } finally {
‎      setIsDashboardLoading(false);
‎    }
‎  };
‎
‎  const fetchMeterStatus = async () => {
‎    try {
‎      const token = localStorage.getItem('token');
‎      const response = await fetch('/api/customer/meter/status', {
‎        headers: { 'Authorization': `Bearer ${token}` }
‎      });
‎
‎      if (response.ok) {
‎        const data = await response.json();
‎        setMeterStatus({
‎          hasMeter: data.hasMeter || user?.meterNumber !== null,
‎          currentRequest: data.currentRequest || null,
‎          meterType: data.meterType || null,
‎          meterNumber: data.meterNumber || user?.meterNumber
‎        });
‎        
‎        // Show meter generator for new users without meters
‎        if (!data.hasMeter && !data.currentRequest && !user?.meterNumber) {
‎          setShowMeterGenerator(true);
‎        }
‎      }
‎    } catch (error) {
‎      console.error('Error fetching meter status:', error);
‎      // Fallback to user data
‎      setMeterStatus({
‎        hasMeter: user?.meterNumber !== null,
‎        currentRequest: null,
‎        meterType: null,
‎        meterNumber: user?.meterNumber
‎      });
‎    }
‎  };
‎
‎  // --- Meter Reading Submission ---
‎  const handleSubmitReading = async () => {
‎    const readingValue = parseFloat(newReading);
‎    
‎    if (isNaN(readingValue) || readingValue < 0) {
‎      alert('Please enter a valid reading');
‎      return;
‎    }
‎
‎    // Check if reading is realistic (not lower than previous readings)
‎    if (meterReadings.length > 0) {
‎      const latestReading = meterReadings[0];
‎      const previousValue = latestReading.consumption || latestReading.usage;
‎      if (readingValue < previousValue) {
‎        if (!confirm(`Your reading (${readingValue} kWh) is lower than your last reading (${previousValue} kWh). Is this correct?`)) {
‎          return;
‎        }
‎      }
‎    }
‎
‎    setIsSubmittingReading(true);
‎
‎    try {
‎      const token = localStorage.getItem('token');
‎      const response = await fetch('/api/usage/submit', {
‎        method: 'POST',
‎        headers: {
‎          'Authorization': `Bearer ${token}`,
‎          'Content-Type': 'application/json'
‎        },
‎        body: JSON.stringify({
‎          reading: readingValue,
‎          meterNumber: meterStatus.meterNumber || user?.meterNumber,
‎          readingDate: new Date().toISOString(),
‎          notes: 'Customer submitted reading'
‎        })
‎      });
‎
‎      if (response.ok) {
‎        const data = await response.json();
‎        setNewReading('');
‎        
‎        // Add new reading to local state
‎        const newReadingEntry = {
‎          date: new Date().toISOString(),
‎          usage: readingValue,
‎          consumption: readingValue,
‎          readingId: data.data?.readingId || Date.now()
‎        };
‎        
‎        const updatedReadings = [newReadingEntry, ...meterReadings];
‎        setMeterReadings(updatedReadings);
‎        setCurrentUsage(readingValue);
‎        
‎        // Update dashboard data
‎        setDashboardData(prev => ({
‎          ...prev,
‎          usageData: updatedReadings
‎        }));
‎        
‎        alert('Reading submitted successfully!');
‎        
‎        // Refresh usage data from server
‎        await fetchDashboardData();
‎        
‎        // Scroll to meter reading section to show updated list
‎        if (meterReadingRef.current) {
‎          meterReadingRef.current.scrollIntoView({ 
‎            behavior: 'smooth',
‎            block: 'center'
‎          });
‎        }
‎      } else {
‎        const errorData = await response.json();
‎        alert(errorData.message || 'Failed to submit reading');
‎      }
‎    } catch (error) {
‎      console.error('Error submitting reading:', error);
‎      alert('Error submitting reading. Please try again.');
‎    } finally {
‎      setIsSubmittingReading(false);
‎    }
‎  };
‎
‎  // --- Event Handlers ---
‎  const handleMeterGenerated = () => {
‎    setShowMeterGenerator(false);
‎    fetchMeterStatus();
‎    fetchDashboardData();
‎  };
‎
‎  const handleLogout = async () => {
‎    await logout();
‎    router.replace("/");
‎  };
‎
‎  // --- PAYMENT CODE (RESTORED FROM YOUR ORIGINAL) ---
‎  const openPaymentForm = () => {
‎    setShowPaymentForm(true);
‎  };
‎
‎  const closePaymentForm = () => setShowPaymentForm(false);
‎  
‎  const handlePay = async (paymentData) => {
‎    try {
‎      const token = localStorage.getItem('token');
‎      
‎      // If there is a bill with amount due → pay bill
‎      if (currentBill?.id && currentBill.amountDue > 0) {
‎        const response = await fetch(`/api/bills/${currentBill.id}/pay`, {
‎          method: 'POST',
‎          headers: {
‎            'Authorization': `Bearer ${token}`,
‎            'Content-Type': 'application/json',
‎          },
‎          body: JSON.stringify({
‎            amount: paymentData.amount,
‎            reference: paymentData.reference || `PAY-${Date.now()}`,
‎            method: paymentData.method || 'card'
‎          }),
‎        });
‎        
‎        if (!response.ok) {
‎          throw new Error('Failed to process bill payment');
‎        }
‎      } 
‎      // No bill → fund wallet
‎      else {
‎        const response = await fetch('/api/wallet/fund', {
‎          method: 'POST',
‎          headers: {
‎            'Authorization': `Bearer ${token}`,
‎            'Content-Type': 'application/json',
‎          },
‎          body: JSON.stringify({
‎            amount: paymentData.amount,
‎            reference: paymentData.reference || `FUND-${Date.now()}`,
‎            method: paymentData.method || 'card'
‎          }),
‎        });
‎        
‎        if (!response.ok) {
‎          throw new Error('Failed to fund wallet');
‎        }
‎      }
‎      
‎      // Update local payments state
‎      const newPayment = {
‎        id: Date.now(),
‎        amount: paymentData.amount,
‎        date: new Date().toISOString(),
‎        reference: paymentData.reference || `PAY-${Date.now()}`,
‎        status: 'completed',
‎        type: currentBill?.id ? 'bill_payment' : 'wallet_topup'
‎      };
‎      
‎      setPayments(prev => [...prev, newPayment]);
‎      setShowPaymentForm(false);
‎      
‎      // Refresh dashboard data
‎      await fetchDashboardData();
‎      
‎      alert('Payment successful!');
‎    } catch (error) {
‎      console.error('Payment error:', error);
‎      alert('Payment completed but failed to update records.');
‎    }
‎  };
‎
‎  // --- Navigation Handlers ---
‎  const handleNavigateToBills = () => router.push('/bills');
‎  const handleNavigateToUsage = () => router.push('/usage');
‎  const handleNavigateToPrograms = () => router.push('/programs');
‎  const handleNavigateToOutages = () => router.push('/outages');
‎  const handleNavigateToProfile = () => router.push('/profile');
‎  const handleNavigateToMeterReadings = () => {
‎    if (meterReadingRef.current) {
‎      meterReadingRef.current.scrollIntoView({ 
‎        behavior: 'smooth',
‎        block: 'start'
‎      });
‎    }
‎  };
‎
‎  // --- Loading State ---
‎  if (loading || isDashboardLoading) {
‎    return (
‎      <>
‎        <Header />
‎        <div className={styles.loadingContainer} style={{ paddingTop: '76px' }}>
‎          <div className="spinner-border text-primary" role="status">
‎            <span className="visually-hidden">Loading...</span>
‎          </div>
‎          <p className="mt-3">Loading your dashboard...</p>
‎        </div>
‎        <Footer />
‎      </>
‎    );
‎  }
‎
‎  return (
‎    <>
‎      <Header />
‎      
‎      {/* Skip Navigation for Accessibility */}
‎      <a href="#main-content" className="skip-to-main">
‎        Skip to main content
‎      </a>
‎
‎      <main id="main-content" className={styles.dashboard} ref={dashboardTopRef}>
‎        {/* Meter Generator Section - Fixed to handle navbar */}
‎        <section className={styles.meterGeneratorSection} style={{ marginTop: '1rem' }}>
‎          <div className="container">
‎            <div className="d-flex justify-content-between align-items-center">
‎              <div>
‎                <h2 className={styles.sectionTitle}>Meter Management</h2>
‎                <p className="text-muted mb-0">Manage your electricity meter and readings</p>
‎              </div>
‎              <button 
‎                className={`btn ${showMeterGenerator ? 'btn-secondary' : 'btn-primary'}`}
‎                onClick={() => setShowMeterGenerator(!showMeterGenerator)}
‎                aria-expanded={showMeterGenerator}
‎              >
‎                <i className={`bi ${showMeterGenerator ? 'bi-x-lg' : 'bi-plus-lg'}`} />
‎                {meterStatus.hasMeter ? "Generate New Meter" : "Get Started with a Meter"}
‎              </button>
‎            </div>
‎            
‎            {showMeterGenerator && (
‎              <div className={styles.meterGeneratorContainer} style={{ marginTop: '1.5rem' }}>
‎                <MeterGenerator 
‎                  onComplete={handleMeterGenerated} 
‎                  hasMeter={meterStatus.hasMeter}
‎                  currentRequest={meterStatus.currentRequest}
‎                />
‎              </div>
‎            )}
‎          </div>
‎        </section>
‎
‎        {/* Welcome Section */}
‎        <section className={styles.welcomeSection} style={{ marginTop: '2rem' }}>
‎          <div className="container">
‎            <div className="row align-items-center">
‎              <div className="col-lg-8 col-md-6 mb-3 mb-md-0">
‎                <h1 className={styles.welcomeTitle}>
‎                  Welcome back, <span className="text-primary">{user?.firstName}!</span>
‎                </h1>
‎                <div className={styles.welcomeDetails}>
‎                  <span className={styles.detailItem}>
‎                    <i className="bi bi-person-badge"></i>
‎                    Account: <strong>{user?.accountNumber}</strong>
‎                  </span>
‎                  <span className={styles.detailItem}>
‎                    <i className="bi bi-lightning-charge"></i>
‎                    {user?.customerType?.charAt(0).toUpperCase() + user?.customerType?.slice(1)} Customer
‎                  </span>
‎                  {meterStatus.meterNumber && (
‎                    <span className={styles.detailItem}>
‎                      <i className="bi bi-speedometer2"></i>
‎                      Meter: <strong>{meterStatus.meterNumber}</strong>
‎                    </span>
‎                  )}
‎                </div>
‎              </div>
‎              
‎              <div className="col-lg-4 col-md-6 text-md-end">
‎                <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
‎                  <span className={styles.statusBadge}>
‎                    <i className="bi bi-check-circle-fill"></i>
‎                    Account Active
‎                  </span>
‎                  <button 
‎                    className="btn btn-outline-primary"
‎                    onClick={handleNavigateToProfile}
‎                  >
‎                    <i className="bi bi-person-circle"></i>
‎                    Profile
‎                  </button>
‎                  <button 
‎                    className="btn btn-danger"
‎                    onClick={handleLogout}
‎                  >
‎                    <i className="bi bi-box-arrow-right"></i>
‎                    Logout
‎                  </button>
‎                </div>
‎              </div>
‎            </div>
‎          </div>
‎        </section>
‎
‎        {/* Meter Status Banner */}
‎        {meterStatus.currentRequest && (
‎          <section className={styles.meterStatusBanner}>
‎            <div className="container">
‎              <div className={`alert alert-warning ${styles.statusAlert}`}>
‎                <div className="d-flex align-items-center">
‎                  <i className="bi bi-clock-history fs-4 me-3"></i>
‎                  <div className="flex-grow-1">
‎                    <h6 className="mb-1">Meter Installation Scheduled</h6>
‎                    <p className="mb-0">
‎                      Your {meterStatus.meterType} meter installation is scheduled for{' '}
‎                      {new Date(meterStatus.currentRequest.estimatedInstallationDate).toLocaleDateString()}
‎                    </p>
‎                    <small className="text-muted">Request ID: {meterStatus.currentRequest.requestId}</small>
‎                  </div>
‎                  <button className="btn btn-sm btn-outline-warning">
‎                    View Details
‎                  </button>
‎                </div>
‎              </div>
‎            </div>
‎          </section>
‎        )}
‎
‎        {/* Quick Stats Grid - Responsive */}
‎        <section className={styles.statsSection}>
‎          <div className="container">
‎            <h2 className={styles.sectionTitle}>Quick Overview</h2>
‎            
‎            <div className="row g-3">
‎              {/* Current Bill */}
‎              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
‎                <div 
‎                  className={`${styles.statCard} ${styles.clickableCard}`}
‎                  onClick={handleNavigateToBills}
‎                  role="button"
‎                  tabIndex={0}
‎                >
‎                  <div className={styles.statIconContainer}>
‎                    <i className="bi bi-receipt"></i>
‎                  </div>
‎                  <div className={styles.statContent}>
‎                    <h3>₦{currentBill.amountDue.toLocaleString()}</h3>
‎                    <p>Current Bill</p>
‎                    <small>
‎                      {currentBill.dueDate ? 
‎                        `Due: ${currentBill.dueDate.toLocaleDateString()}` : 
‎                        'No bill due'
‎                      }
‎                    </small>
‎                    {currentBill.billNumber && (
‎                      <small className="d-block">#{currentBill.billNumber}</small>
‎                    )}
‎                  </div>
                  <div className={styles.statArrow}>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>

              {/* Current Usage */}
              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                <div 
                  className={`${styles.statCard} ${styles.clickableCard}`}
                  onClick={handleNavigateToUsage}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.statIconContainer}>
                    <i className="bi bi-lightning-charge"></i>
                  </div>
                  <div className={styles.statContent}>
                    <h3>{currentUsage.toLocaleString()} kWh</h3>
                    <p>Current Usage</p>
                    <small>Latest reading</small>
                  </div>
                  <div className={styles.statArrow}>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>

              {/* Bill Status */}
              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                <div 
                  className={`${styles.statCard} ${styles.clickableCard}`}
                  onClick={handleNavigateToBills}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.statIconContainer}>
                    <i className={`bi ${
                      currentBill.status === 'paid' ? 'bi-check-circle text-success' :
                      currentBill.status === 'overdue' ? 'bi-exclamation-circle text-danger' :
                      currentBill.status === 'partially_paid' ? 'bi-currency-exchange text-warning' :
                      currentBill.status ? 'bi-clock text-info' : 'bi-file-x text-secondary'
                    }`}></i>
                  </div>
                  <div className={styles.statContent}>
                    <h3>
                      {currentBill.status ? 
                        currentBill.status.charAt(0).toUpperCase() + 
                        currentBill.status.slice(1).replace('_', ' ') : 
                        'No Bill'
                      }
                    </h3>
                    <p>Bill Status</p>
                    <small>Current bill status</small>
                  </div>
                  <div className={styles.statArrow}>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>

              {/* Available Programs */}
              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                <div 
                  className={`${styles.statCard} ${styles.clickableCard}`}
                  onClick={handleNavigateToPrograms}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.statIconContainer}>
                    <i className="bi bi-gift"></i>
                  </div>
                  <div className={styles.statContent}>
                    <h3>{dashboardData.programs.length}</h3>
                    <p>Available Programs</p>
                    <small>Energy programs</small>
                  </div>
                  <div className={styles.statArrow}>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid - Responsive */}
        <div className="container-fluid">
          <div className="row g-4">
            {/* Left Column - Meter Reading & Usage Chart */}
            <div className="col-lg-8">
              {/* Meter Reading Form */}
              {meterStatus.hasMeter && meterStatus.meterNumber && (
                <section className={styles.meterReadingSection} ref={meterReadingRef}>
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title d-flex align-items-center">
                        <i className="bi bi-pencil-square me-2"></i>
                        Submit Meter Reading
                      </h5>
                      
                      <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                          <label htmlFor="meterReading" className="form-label">
                            Current Reading (kWh)
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              id="meterReading"
                              className="form-control"
                              placeholder="Enter current meter reading"
                              value={newReading}
                              onChange={(e) => setNewReading(e.target.value)}
                              min="0"
                              step="0.01"
                              disabled={isSubmittingReading}
                            />
                            <span className="input-group-text">kWh</span>
                          </div>
                          <div className="form-text">
                            Enter the exact number from your meter display
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="d-grid gap-2">
                            <button
                              className="btn btn-success"
                              onClick={handleSubmitReading}
                              disabled={!newReading || parseFloat(newReading) <= 0 || isSubmittingReading}
                            >
                              {isSubmittingReading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check-circle me-2"></i>
                                  Submit Reading
                                </>
                              )}
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                // Pre-fill with last reading + estimated usage
                                if (meterReadings.length > 0) {
                                  const latest = meterReadings[0];
                                  const lastReading = latest.consumption || latest.usage;
                                  const estimatedUsage = 50; // Default estimate
                                  setNewReading((lastReading + estimatedUsage).toString());
                                }
                              }}
                              disabled={meterReadings.length === 0 || isSubmittingReading}
                            >
                              <i className="bi bi-calculator me-2"></i>
                              Estimate Next Reading
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {meterReadings.length > 0 && (
                        <div className="mt-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6>Latest Readings</h6>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => {
                                  const lastReading = meterReadings[0];
                                  setNewReading((lastReading.consumption || lastReading.usage).toString());
                                }}
                              >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Use Last Reading
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={handleNavigateToUsage}
                              >
                                View All
                              </button>
                            </div>
                          </div>
                          <div className="list-group list-group-flush">
                            {meterReadings.slice(0, 5).map((reading, index) => (
                              <div key={reading.readingId || index} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <span className="fw-medium">
                                      {new Date(reading.date || reading.readingDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                    <small className="text-muted ms-2">
                                      {new Date(reading.date || reading.readingDate).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </small>
                                  </div>
                                  <div>
                                    <span className="fw-bold fs-6">
                                      {reading.usage || reading.consumption} kWh
                                    </span>
                                    {index > 0 && meterReadings[index - 1] && (
                                      <small className={`ms-2 ${(reading.consumption || reading.usage) > (meterReadings[index - 1].consumption || meterReadings[index - 1].usage) ? 'text-success' : 'text-danger'}`}>
                                        <i className={`bi ${(reading.consumption || reading.usage) > (meterReadings[index - 1].consumption || meterReadings[index - 1].usage) ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                                        {Math.abs((reading.consumption || reading.usage) - (meterReadings[index - 1].consumption || meterReadings[index - 1].usage))} kWh
                                      </small>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Quick Tips */}
                      <div className="alert alert-info mt-3">
                        <h6 className="alert-heading mb-2">
                          <i className="bi bi-lightbulb me-2"></i>
                          Reading Tips
                        </h6>
                        <ul className="mb-0 ps-3">
                          <li>Read the numbers from left to right on your meter display</li>
                          <li>Ignore any red numbers or numbers after a decimal point</li>
                          <li>Submit your reading on the same day each month for consistency</li>
                          <li>If your meter has multiple displays, use the one labeled "kWh"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Usage Chart */}
              {meterReadings.length > 1 && (
                <section className={styles.usageChartSection}>
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title m-0">Energy Usage Trend</h5>
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            Last 30 days
                          </button>
                          <ul className="dropdown-menu">
                            <li><button className="dropdown-item">Last 7 days</button></li>
                            <li><button className="dropdown-item">Last 30 days</button></li>
                            <li><button className="dropdown-item">Last 90 days</button></li>
                            <li><button className="dropdown-item">Last 12 months</button></li>
                          </ul>
                        </div>
                      </div>
                      <UsageChart readings={meterReadings} />
                      <div className="mt-3 text-center">
                        <button 
                          className="btn btn-outline-primary me-2"
                          onClick={handleNavigateToUsage}
                        >
                          <i className="bi bi-graph-up me-2"></i>
                          View Detailed Usage Analysis
                        </button>
                        <button 
                          className="btn btn-outline-success"
                          onClick={handleNavigateToMeterReadings}
                        >
                          <i className="bi bi-pencil-square me-2"></i>
                          Submit New Reading
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Payment & Quick Actions */}
            <div className="col-lg-4">
              {/* Payment Section */}
              <section className={styles.paymentSection}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center">
                      <i className="bi bi-credit-card me-2"></i>
                      Quick Payment
                    </h5>
                    
                    {currentBill.id ? (
                      <>
                        <div className={styles.billSummary}>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Amount Due:</span>
                            <span className="fw-bold fs-5 text-primary">
                              ₦{currentBill.amountDue.toLocaleString()}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Due Date:</span>
                            <span className={currentBill.dueDate && currentBill.dueDate < new Date() ? 'text-danger fw-bold' : ''}>
                              {currentBill.dueDate ? currentBill.dueDate.toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-3">
                            <span>Status:</span>
                            <span className={`badge ${
                              currentBill.status === 'paid' ? 'bg-success' :
                              currentBill.status === 'overdue' ? 'bg-danger' :
                              currentBill.status === 'partially_paid' ? 'bg-warning' :
                              'bg-info'
                            }`}>
                              {currentBill.status?.replace('_', ' ') || 'Pending'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-primary btn-lg"
                            onClick={openPaymentForm}
                          >
                            <i className="bi bi-lightning-charge me-2"></i>
                            Pay Now
                          </button>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={handleNavigateToBills}
                          >
                            View All Bills
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <i className="bi bi-receipt display-4 text-muted mb-3"></i>
                        <p className="text-muted">No bills at the moment</p>
                        <button 
                          className="btn btn-outline-primary"
                          onClick={openPaymentForm}
                        >
                          <i className="bi bi-wallet2 me-2"></i>
                          Fund Wallet
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section className={styles.quickActionsSection}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Quick Actions</h5>
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                        onClick={handleNavigateToBills}
                      >
                        <span>View Bills & History</span>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                      <button 
                        className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                        onClick={handleNavigateToUsage}
                      >
                        <span>Usage Details</span>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                      {meterStatus.hasMeter && (
                        <button 
                          className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                          onClick={handleNavigateToMeterReadings}
                        >
                          <span>Submit Meter Reading</span>
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                        onClick={handleNavigateToPrograms}
                      >
                        <span>Energy Programs</span>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                      <button 
                        className="btn btn-outline-primary d-flex align-items-center justify-content-between"
                        onClick={handleNavigateToOutages}
                      >
                        <span>Outage Reports</span>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* PAYMENT SECTION (YOUR ORIGINAL CODE RESTORED) */}
        <section className="section-padding">
          <div className="container">
            <h2 className="section-title mb-4">Make a Payment</h2>
            <button className="btn btn-primary mb-3" onClick={openPaymentForm}>
              <i className="bi bi-credit-card me-2"></i> Pay Now
            </button>
            {showPaymentForm && (
              <PaymentForm 
                bill={currentBill} 
                onClose={closePaymentForm} 
                onSubmit={handlePay}
              />
            )}
            <BillList bills={bills} />
          </div>
        </section>

        {/* Recent Bills Section */}
        <section className={styles.recentBillsSection}>
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className={styles.sectionTitle}>Recent Bills</h2>
              <button 
                className="btn btn-link text-decoration-none"
                onClick={handleNavigateToBills}
              >
                View All <i className="bi bi-arrow-right"></i>
              </button>
            </div>
            
            {bills.length > 0 ? (
              <div className="row g-3">
                {bills.slice(0, 4).map((bill) => (
                  <div key={bill._id} className="col-lg-3 col-md-6">
                    <div 
                      className={`card ${styles.billCard} ${styles.clickableCard}`}
                      onClick={() => router.push(`/bills/${bill._id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="card-subtitle text-muted">Bill #{bill.billNumber}</h6>
                            <small className="text-muted">
                              {new Date(bill.billingPeriod?.start).toLocaleDateString()} -{' '}
                              {new Date(bill.billingPeriod?.end).toLocaleDateString()}
                            </small>
                          </div>
                          <span className={`badge ${
                            bill.status === 'paid' ? 'bg-success' : 
                            bill.status === 'overdue' ? 'bg-danger' : 
                            'bg-warning'
                          }`}>
                            {bill.status}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Total Amount:</span>
                            <span className="fw-bold">₦{bill.totalAmount?.toLocaleString()}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Amount Due:</span>
                            <span className={`${bill.amountDue > 0 ? 'text-danger fw-bold' : 'text-success'}`}>
                              ₦{bill.amountDue?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <small className="text-muted">
                            Due: {new Date(bill.dueDate).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-receipt display-4 text-muted mb-3"></i>
                <p className="text-muted">No bills found</p>
              </div>
            )}
          </div>
        </section>

        {/* Outages & Programs Summary */}
        {(dashboardData.outages.length > 0 || dashboardData.programs.length > 0) && (
          <section className={styles.summarySection}>
            <div className="container">
              <div className="row g-4">
                {dashboardData.outages.length > 0 && (
                  <div className="col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title d-flex align-items-center">
                          <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                          Current Outages
                        </h5>
                        <div className="list-group list-group-flush">
                          {dashboardData.outages.slice(0, 3).map((outage, index) => (
                            <div key={index} className="list-group-item">
                              <div className="d-flex justify-content-between">
                                <span>{outage.area}</span>
                                <span className="badge bg-warning">
                                  {outage.status}
                                </span>
                              </div>
                              <small className="text-muted">
                                Reported: {new Date(outage.reportedAt).toLocaleDateString()}
                              </small>
                            </div>
                          ))}
                        </div>
                        {dashboardData.outages.length > 3 && (
                          <button 
                            className="btn btn-link mt-3 p-0"
                            onClick={handleNavigateToOutages}
                          >
                            View all {dashboardData.outages.length} outages
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {dashboardData.programs.length > 0 && (
                  <div className="col-lg-6">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title d-flex align-items-center">
                          <i className="bi bi-gift text-success me-2"></i>
                          Available Programs
                        </h5>
                        <div className="list-group list-group-flush">
                          {dashboardData.programs.slice(0, 3).map((program, index) => (
                            <div key={index} className="list-group-item">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">{program.name}</h6>
                                  <small className="text-muted">{program.type}</small>
                                </div>
                                <span className="badge bg-success">Available</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {dashboardData.programs.length > 3 && (
                          <button 
                            className="btn btn-link mt-3 p-0"
                            onClick={handleNavigateToPrograms}
                          >
                            View all {dashboardData.programs.length} programs
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentBill.id ? `Pay Bill #${currentBill.billNumber}` : 'Fund Your Wallet'}
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
                  bill={currentBill.id ? currentBill : null}
                  onClose={closePaymentForm}
                  onSubmit={handlePay}
                  isWalletTopUp={!currentBill.id}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx global>{`
        /* Fix for navbar overlap */
        body {
          padding-top: 76px !important; /* Height of your navbar */
        }
        
        .skip-to-main {
          position: absolute;
          top: -40px;
          left: 10px;
          background: #0d6efd;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          z-index: 1000;
          transition: top 0.3s;
        }
        
        .skip-to-main:focus {
          top: 10px;
        }
        
        /* Ensure modal is above navbar */
        .modal {
          z-index: 1060;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          body {
            padding-top: 70px !important;
          }
          
          .modal-dialog {
            margin: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          body {
            padding-top: 65px !important;
          }
          
          .welcome-section h1 {
            font-size: 1.5rem;
          }
          
          .stat-card h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </>
  );
                            }
‎ 
