
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
    currentBill: { amountDue: 0, dueDate: null },
    usageData: [],
    programs: [],
    outages: [],
  });
  const [meterStatus, setMeterStatus] = useState(null);
  const [showMeterGenerator, setShowMeterGenerator] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  const [currentBill, setCurrentBill] = useState({ amountDue: 0, period: 'N/A', dueDate: null });
  const [payments, setPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [meterReadings, setMeterReadings] = useState([]);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [newReading, setNewReading] = useState('');

  // --- Navigation handlers ---
  const handleNavigateToBills = () => {
<<<<<<< HEAD
    const billSection = document.getElementById('bills-section');
    if (billSection) {
      billSection.scrollIntoView({ behavior: 'smooth' });
      billSection.focus(); // Add focus for screen readers
    }
=======
    // You can either scroll to the bill section or navigate to a bills page
    // Option 1: Scroll to bill section (if it's on the same page)
    const billSection = document.getElementById('bills-section');
    if (billSection) {
      billSection.scrollIntoView({ behavior: 'smooth' });
    }
    // Option 2: Navigate to a separate bills page
    // router.push('/bills');
>>>>>>> 2b269fb6f87ddd0caa42910a40ff255bdc2c630e
  };

  const handleNavigateToUsage = () => {
    const usageSection = document.getElementById('usage-section');
    if (usageSection) {
      usageSection.scrollIntoView({ behavior: 'smooth' });
<<<<<<< HEAD
      usageSection.focus();
    }
  };

  const handleNavigateToPrograms = () => {
    router.push('/programs');
  };

  const handleNavigateToOutages = () => {
    router.push('/outages');
=======
    }
    // Or navigate to usage page: router.push('/usage');
  };

  const handleNavigateToPrograms = () => {
    // Navigate to programs page or open programs modal
    router.push('/programs');
    // Or scroll if programs section exists on page
  };

  const handleNavigateToOutages = () => {
    // Navigate to outages page
    router.push('/outages');
    // Or scroll if outages section exists on page
>>>>>>> 2b269fb6f87ddd0caa42910a40ff255bdc2c630e
  };

  // --- Fetch dashboard & meter status ---
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isAuthenticated) {
      fetchDashboardData();
      fetchMeterStatus();
    }
  }, [user, loading, isAuthenticated]);

  // --- Fetch dashboard data ---
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardData({
          currentBill: data.currentBill || { amountDue: 0, dueDate: null },
          usageData: data.usageData || [],
          programs: data.programs || [],
          outages: data.outages || []
        });

        // Meter readings
        if (data.meterReadings?.length) {
          setMeterReadings(data.meterReadings);
          setCurrentUsage(data.meterReadings.at(-1).usage);
          const latestBillAmount = calculateBill(data.meterReadings);

          setCurrentBill({
            id: data.currentBill?._id || null,
            amountDue: latestBillAmount,
            period: `${new Date(data.meterReadings.at(-2)?.date || Date.now()).toLocaleDateString()} - ${new Date(data.meterReadings.at(-1).date).toLocaleDateString()}`,
            dueDate: new Date(new Date(data.meterReadings.at(-1).date).setDate(new Date(data.meterReadings.at(-1).date).getDate() + 15))
          });
        }

        setPayments(data.bills || []);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsDashboardLoading(false);
    }
  }

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

  // --- Payment Form ---
  const openPaymentForm = () => {
    if (currentBill) setShowPaymentForm(true);
    else alert("No bill available.");
  };
  const closePaymentForm = () => setShowPaymentForm(false);
  const handlePay = (payment) => {
    setPayments(prev => [...prev, payment]);
    setShowPaymentForm(false);
  };

  // --- Submit Meter Reading ---
  const handleSubmitReadingClick = () => {
    const readingValue = parseFloat(newReading);
    if (isNaN(readingValue) || readingValue < 0) {
      alert('Please enter a valid reading');
      return;
    }

    const readingEntry = {
      date: new Date().toISOString(),
      usage: readingValue,
    };

    handleSubmitReading(readingEntry);
    setNewReading('');
  };

  const handleSubmitReading = (newReadingEntry) => {
    const updatedReadings = [...meterReadings, newReadingEntry];
    setMeterReadings(updatedReadings);
    setCurrentUsage(newReadingEntry.usage);

    if (updatedReadings.length >= 2) {
      const billAmount = calculateBill(updatedReadings);
      setCurrentBill({
        amountDue: billAmount,
        period: `${new Date(updatedReadings.at(-2).date).toLocaleDateString()} - ${new Date(newReadingEntry.date).toLocaleDateString()}`,
        dueDate: new Date(new Date(newReadingEntry.date).setDate(new Date(newReadingEntry.date).getDate() + 15))
      });
    }
  };

  const calculateBill = (readings, rate = 50) => {
    if (!readings || readings.length < 2) return 0;
    const last = readings.at(-1).usage;
    const prev = readings.at(-2).usage;
    const usage = last - prev;
    return usage > 0 ? usage * rate : 0;
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
                  className="btn btn-danger mt-3" 
                  onClick={handleLogout}
                  aria-label="Logout from your account"
                >
                  <i className="bi bi-box-arrow-right me-2" aria-hidden="true"></i> Logout
                </button>
                <button
<<<<<<< HEAD
                  className="btn btn-secondary mt-3 ms-2"
                  onClick={() => router.push('/profile')}
                  aria-label="Go to your profile page"
                >
                  <i className="bi bi-person-circle me-2" aria-hidden="true"></i>
=======
                  className="btn btn-secondary mt-3"
                  onClick={() => router.push('/profile')}
                >
                  <i className="bi bi-person-circle me-2"></i>
>>>>>>> 2b269fb6f87ddd0caa42910a40ff255bdc2c630e
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
                    Your {meterStatus.meterType} meter ({user.meterNumber}) is active and recording usage
                  </p>
                  <small>
                    Next reading: {user.nextMeterReadingDate ? new Date(user.nextMeterReadingDate).toLocaleDateString() : 'Not scheduled'}
                  </small>
                </div>
                <button 
                  className={styles.statusButton}
                  aria-label="View meter readings history"
                >
                  View Readings
                </button>
              </div>
            ) : null}
          </div>
        )}

<<<<<<< HEAD
       {/* --- Quick Stats --- */}
<section
  className="section-padding"
  aria-label="Quick statistics overview"
  role="region"
>
  <div className="container">
    <h2 className="visually-hidden">Quick Statistics</h2>

    <div className="row">
      {/* Bill Card */}
      <div className="col-md-3 col-6 mb-4">
        <Link
          href="/bills"
          className={`${styles.statCard} ${styles.clickableStatCard}`}
          aria-label={`View bill details. Amount: ₦${currentBill.amountDue}, Period: ${currentBill.period}`}
        >
          <div className={styles.statIcon} aria-hidden="true">
            <i className="bi bi-receipt"></i>
=======
        {/* --- Quick Stats --- */}
        <section className="section-padding">
          <div className="container">
            <div className="row">
              {/* Bill Card */}
              <div className="col-md-3 mb-4">
                <div 
                  className={`${styles.statCard} ${styles.clickableStatCard}`}
                  onClick={handleNavigateToBills}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavigateToBills()}
                >
                  <div className={styles.statIcon}><i className="bi bi-receipt"></i></div>
                  <div className={styles.statContent}>
                    <h3>₦{currentBill.amountDue}</h3>
                    <p>Current Bill</p>
                    <small>Period: {currentBill.period}</small>
                    <small>Due: {currentBill.dueDate?.toLocaleDateString() || 'N/A'}</small>
                  </div>
                  <div className={styles.statArrow}>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>
              
              {/* Usage Card */}
              <div className="col-md-3 mb-4">
                <div 
                  className={`${styles.statCard} ${styles.clickableStatCard}`}
                  onClick={handleNavigateToUsage}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavigateToUsage()}
                >
                  <div className={styles.statIcon}><i className="bi bi-lightning"></i></div>
                  <div className={styles.statContent}>
                    <h3>{currentUsage} kWh</h3>
                    <p>Usage</p>
                    <small>Last reading</small>
                  </div>
                  <div className={styles.statArrow}>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>
              
              {/* Programs Card */}
              <div className="col-md-3 mb-4">
                <div 
                  className={`${styles.statCard} ${styles.clickableStatCard}`}
                  onClick={handleNavigateToPrograms}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavigateToPrograms()}
                >
                  <div className={styles.statIcon}><i className="bi bi-gift"></i></div>
                  <div className={styles.statContent}>
                    <h3>{dashboardData.programs.length}</h3>
                    <p>Programs</p>
                    <small>Available</small>
                  </div>
                  <div className={styles.statArrow}>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>
              
              {/* Outages Card */}
              <div className="col-md-3 mb-4">
                <div 
                  className={`${styles.statCard} ${styles.clickableStatCard}`}
                  onClick={handleNavigateToOutages}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleNavigateToOutages()}
                >
                  <div className={styles.statIcon}><i className="bi bi-geo-alt-fill"></i></div>
                  <div className={styles.statContent}>
                    <h3>{dashboardData.outages.length}</h3>
                    <p>Outages</p>
                    <small>Current</small>
                  </div>
                  <div className={styles.statArrow}>
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>
            </div>
>>>>>>> 2b269fb6f87ddd0caa42910a40ff255bdc2c630e
          </div>

          <div className={styles.statContent}>
            <span className="visually-hidden">Current Bill Amount</span>
            <h3 aria-hidden="true">₦{currentBill.amountDue}</h3>
            <p>Current Bill</p>
            <small>Period: {currentBill.period}</small>
            <small>Due: {currentBill.dueDate?.toLocaleDateString() || "N/A"}</small>
          </div>

          <div className={styles.statArrow} aria-hidden="true">
            <i className="bi bi-chevron-right"></i>
          </div>
        </Link>
      </div>

      {/* Usage Card */}
      <div className="col-md-3 col-6 mb-4">
        <Link
          href="/usage"
          className={`${styles.statCard} ${styles.clickableStatCard}`}
          aria-label={`View usage details. Current usage: ${currentUsage} kilowatt hours`}
        >
          <div className={styles.statIcon} aria-hidden="true">
            <i className="bi bi-lightning"></i>
          </div>

          <div className={styles.statContent}>
            <span className="visually-hidden">Current Usage</span>
            <h3 aria-hidden="true">{currentUsage} kWh</h3>
            <p>Usage</p>
            <small>Last reading</small>
          </div>

          <div className={styles.statArrow} aria-hidden="true">
            <i className="bi bi-chevron-right"></i>
          </div>
        </Link>
      </div>

      {/* Programs Card */}
      <div className="col-md-3 col-6 mb-4">
        <Link
          href="/programs"
          className={`${styles.statCard} ${styles.clickableStatCard}`}
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
        </Link>
      </div>

      {/* Outages Card */}
      <div className="col-md-3 col-6 mb-4">
        <Link
          href="/outages"
          className={`${styles.statCard} ${styles.clickableStatCard}`}
          aria-label={`View outage information. ${dashboardData.outages.length} current outages`}
        >
          <div className={styles.statIcon} aria-hidden="true">
            <i className="bi bi-geo-alt-fill"></i>
          </div>

          <div className={styles.statContent}>
            <span className="visually-hidden">Current Outages</span>
            <h3 aria-hidden="true">{dashboardData.outages.length}</h3>
            <p>Outages</p>
            <small>Current</small>
          </div>

          <div className={styles.statArrow} aria-hidden="true">
            <i className="bi bi-chevron-right"></i>
          </div>
        </Link>
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
                <label htmlFor="meter-reading-input" className="visually-hidden">
                  Enter current meter reading in kilowatt hours
                </label>
                <input
                  id="meter-reading-input"
                  type="number"
                  min={0}
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
                >
                  Submit Reading
                </button>
              </div>
            </div>
          </section>
        )}

        {/* --- Usage Chart --- */}
        {meterReadings.length > 0 && (
<<<<<<< HEAD
          <section 
            className={styles.sectionPadding} 
            id="usage-section"
            aria-labelledby="usage-chart-heading"
            role="region"
            tabIndex={-1}
          >
=======
          <section className={styles.sectionPadding} id="usage-section">
>>>>>>> 2b269fb6f87ddd0caa42910a40ff255bdc2c630e
            <div className="container">
              <h3 id="usage-chart-heading">Energy Usage</h3>
              <UsageChart readings={meterReadings} />
            </div>
          </section>
        )}

        {/* --- Payment Section --- */}
<<<<<<< HEAD
        <section 
          className="section-padding" 
          id="bills-section"
          aria-labelledby="payment-heading"
          role="region"
          tabIndex={-1}
        >
=======
        <section className="section-padding" id="bills-section">
>>>>>>> 2b269fb6f87ddd0caa42910a40ff255bdc2c630e
          <div className="container">
            <h2 id="payment-heading" className="section-title mb-4">Make a Payment</h2>
            <button 
              className="btn btn-primary mb-3" 
              onClick={openPaymentForm}
              aria-label="Open payment form to pay your current bill"
            >
              <i className="bi bi-credit-card me-2" aria-hidden="true"></i> Pay Now
            </button>
            {showPaymentForm && (
              <div 
                role="dialog"
                aria-labelledby="payment-form-title"
                aria-modal="true"
              >
                <PaymentForm 
                  bill={currentBill} 
                  onClose={closePaymentForm} 
                  onSubmit={handlePay} 
                />
              </div>
            )}
            <div aria-live="polite" aria-atomic="true">
              <BillList bills={payments} />
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
            // Ensure it's visible when focused
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