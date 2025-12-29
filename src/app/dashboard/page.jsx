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
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <div className={styles.dashboard}>

        {/* --- Always-available Meter Generator --- */}
        <section className="section-padding">
          <div className="container mb-4">
            <button 
              className="btn btn-primary"
              onClick={() => setShowMeterGenerator(!showMeterGenerator)}
            >
              {meterStatus?.hasMeter ? "Generate New Meter" : "Generate Meter"}
            </button>
          </div>
          {showMeterGenerator && (
            <div className="container">
              <MeterGenerator 
                onComplete={handleMeterGenerated} 
                hasMeter={meterStatus?.hasMeter} 
              />
            </div>
          )}
        </section>

        {/* --- Welcome Section --- */}
        <section className={styles.welcomeSection}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1>Welcome back, {user?.firstName}!</h1>
                <p className={styles.welcomeSubtitle}>
                  Account: {user?.accountNumber} • {user?.customerType?.charAt(0).toUpperCase() + user?.customerType?.slice(1)} Customer
                  {user?.meterNumber && ` • Meter: ${user.meterNumber}`}
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <span className={styles.statusBadge}><i className="bi bi-check-circle-fill me-1"></i> Active</span>
                <button className="btn btn-danger mt-3" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i> Logout</button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Meter Status Banner --- */}
        {meterStatus && (
          <div className={styles.meterStatusBanner}>
            {meterStatus.currentRequest ? (
              <div className={`${styles.statusAlert} ${styles.statusPending}`}>
                <i className="bi bi-clock-history"></i>
                <div className={styles.statusContent}>
                  <strong>Meter Installation Scheduled</strong>
                  <p>
                    Your {meterStatus.meterType} meter is scheduled for installation on{' '}
                    {new Date(meterStatus.currentRequest.estimatedInstallationDate).toLocaleDateString()}
                  </p>
                  <small>Request ID: {meterStatus.currentRequest.requestId}</small>
                </div>
                <button className={styles.statusButton}>View Details</button>
              </div>
            ) : meterStatus.hasMeter ? (
              <div className={`${styles.statusAlert} ${styles.statusActive}`}>
                <i className="bi bi-check-circle"></i>
                <div className={styles.statusContent}>
                  <strong>Meter Active</strong>
                  <p>
                    Your {meterStatus.meterType} meter ({user.meterNumber}) is active and recording usage
                  </p>
                  <small>Next reading: {user.nextMeterReadingDate ? new Date(user.nextMeterReadingDate).toLocaleDateString() : 'Not scheduled'}</small>
                </div>
                <button className={styles.statusButton}>View Readings</button>
              </div>
            ) : null}
          </div>
        )}

        {/* --- Quick Stats --- */}
        <section className="section-padding">
          <div className="container">
            <div className="row">
              <div className="col-md-3 mb-4">
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><i className="bi bi-receipt"></i></div>
                  <div className={styles.statContent}>
                    <h3>₦{currentBill.amountDue}</h3>
                    <p>Current Bill</p>
                    <small>Period: {currentBill.period}</small>
                    <small>Due: {currentBill.dueDate?.toLocaleDateString() || 'N/A'}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-4">
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><i className="bi bi-lightning"></i></div>
                  <div className={styles.statContent}>
                    <h3>{currentUsage} kWh</h3>
                    <p>Usage</p>
                    <small>Last reading</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-4">
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><i className="bi bi-gift"></i></div>
                  <div className={styles.statContent}>
                    <h3>{dashboardData.programs.length}</h3>
                    <p>Programs</p>
                    <small>Available</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-4">
                <div className={styles.statCard}>
                  <div className={styles.statIcon}><i className="bi bi-geo-alt-fill"></i></div>
                  <div className={styles.statContent}>
                    <h3>{dashboardData.outages.length}</h3>
                    <p>Outages</p>
                    <small>Current</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Meter Reading Section --- */}
        {user?.meterNumber && (
          <section className={styles.meterReadingsSection}>
            <div className="container">
              <h3>Submit Meter Reading</h3>
              <div className={styles.readingForm}>
                <input
                  type="number"
                  min={0}
                  placeholder="Enter current reading (kWh)"
                  value={newReading}
                  onChange={(e) => setNewReading(e.target.value)}
                  className="form-control mb-2"
                />
                <button
                  className="btn btn-success"
                  onClick={handleSubmitReadingClick}
                >
                  Submit Reading
                </button>
              </div>
            </div>
          </section>
        )}

        {/* --- Usage Chart --- */}
        {meterReadings.length > 0 && (
          <section className={styles.sectionPadding}>
            <div className="container">
              <h3>Energy Usage</h3>
              <UsageChart readings={meterReadings} />
            </div>
          </section>
        )}

        {/* --- Payment Section --- */}
        <section className="section-padding">
          <div className="container">
            <h2 className="section-title mb-4">Make a Payment</h2>
            <button className="btn btn-primary mb-3" onClick={openPaymentForm}>
              <i className="bi bi-credit-card me-2"></i> Pay Now
            </button>
            {showPaymentForm && <PaymentForm bill={currentBill} onClose={closePaymentForm} onSubmit={handlePay} />}
            <BillList bills={payments} />
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
