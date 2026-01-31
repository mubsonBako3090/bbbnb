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
‎                  <div className={styles.statArrow}>
‎                    <i className="bi bi-chevron-right"></i>
‎                  </div>
‎                </div>
‎              </div>
‎
‎              {/* Current Usage */}
‎              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
‎                <div 
‎ 
