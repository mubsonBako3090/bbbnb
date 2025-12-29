// app/admin/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PermissionGuard from '@/components/PermissionGuard';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/AdminDashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, hasPermission, PERMISSIONS } = useAuth();
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingInstallations: 0,
    unpaidBills: 0,
    revenueToday: 0
  });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (user && user.role === 'superAdmin') {
      router.replace('/super-admin');
      return;
    }
    fetchDashboardData();
  }, [loading, user]);

  const fetchDashboardData = async () => {
    setFetching(true);
    try {
      await Promise.all([
        fetchCustomers(),
        fetchStats()
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const approveMeter = async (customerId) => {
    if (!confirm('Approve meter installation?')) return;
    
    try {
      const res = await fetch('/api/admin/meter/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      if (!res.ok) throw new Error('Failed to approve meter');
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading || fetching) return <div className={styles.loading}>Loading...</div>;

  return (
    <>
      <Header />
      <main className={styles.container}>
        <h1 className={styles.pageTitle}>
          {user?.role === 'admin' ? 'Administrator Dashboard' : 
           user?.role === 'billingManager' ? 'Billing Dashboard' :
           user?.role === 'supportAgent' ? 'Support Dashboard' : 'Dashboard'}
        </h1>
        
        {/* Stats Overview */}
        <PermissionGuard permission={PERMISSIONS.VIEW_DASHBOARD}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Customers</h3>
              <p className={styles.statNumber}>{stats.totalCustomers}</p>
            </div>
            
            <PermissionGuard permission={PERMISSIONS.APPROVE_METERS}>
              <div className={styles.statCard}>
                <h3>Pending Installations</h3>
                <p className={styles.statNumber}>{stats.pendingInstallations}</p>
              </div>
            </PermissionGuard>
            
            <PermissionGuard permission={PERMISSIONS.VIEW_BILLING}>
              <div className={styles.statCard}>
                <h3>Unpaid Bills</h3>
                <p className={styles.statNumber}>{stats.unpaidBills}</p>
              </div>
            </PermissionGuard>
            
            <PermissionGuard permission={PERMISSIONS.MANAGE_BILLING}>
              <div className={styles.statCard}>
                <h3>Revenue Today</h3>
                <p className={styles.statNumber}>${stats.revenueToday.toLocaleString()}</p>
              </div>
            </PermissionGuard>
          </div>
        </PermissionGuard>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <PermissionGuard permission={PERMISSIONS.VIEW_CUSTOMERS}>
            <button 
              className={`${styles.tab} ${activeTab === 'customers' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              Customers
            </button>
          </PermissionGuard>
          
          <PermissionGuard permission={PERMISSIONS.VIEW_BILLING}>
            <button 
              className={`${styles.tab} ${activeTab === 'billing' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              Billing
            </button>
          </PermissionGuard>
          
          <PermissionGuard permission={PERMISSIONS.GENERATE_REPORTS}>
            <button 
              className={`${styles.tab} ${activeTab === 'reports' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
          </PermissionGuard>
          
          <PermissionGuard permission={PERMISSIONS.VIEW_USERS}>
            <button 
              className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Team
            </button>
          </PermissionGuard>
        </div>

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <PermissionGuard permission={PERMISSIONS.VIEW_CUSTOMERS}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Customer Management</h2>
                <PermissionGuard permission={PERMISSIONS.MANAGE_CUSTOMERS}>
                  <button 
                    className={styles.btnPrimary}
                    onClick={() => router.push('/admin/customers/new')}
                  >
                    + Add Customer
                  </button>
                </PermissionGuard>
              </div>
              
              {customers.length === 0 ? (
                <p className={styles.emptyState}>No customers found.</p>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Meter</th>
                        <th>Status</th>
                        <PermissionGuard permission={PERMISSIONS.APPROVE_METERS}>
                          <th>Action</th>
                        </PermissionGuard>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c._id}>
                          <td>{c.firstName} {c.lastName}</td>
                          <td>{c.email}</td>
                          <td>{c.meterNumber || 'Pending'}</td>
                          <td>
                            <span className={c.meterInstallationStatus === 'pending' ? styles.pending : styles.installed}>
                              {c.meterInstallationStatus}
                            </span>
                          </td>
                          <PermissionGuard permission={PERMISSIONS.APPROVE_METERS}>
                            <td>
                              {c.meterInstallationStatus === 'pending' && (
                                <button
                                  className={styles.btnSuccess}
                                  onClick={() => approveMeter(c._id)}
                                >
                                  Approve
                                </button>
                              )}
                            </td>
                          </PermissionGuard>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </PermissionGuard>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <PermissionGuard permission={PERMISSIONS.VIEW_BILLING}>
            <div className={styles.section}>
              <h2>Billing Management</h2>
              <div className={styles.billingActions}>
                <PermissionGuard permission={PERMISSIONS.MANAGE_BILLING}>
                  <button className={styles.btnPrimary}>
                    Generate Monthly Bills
                  </button>
                </PermissionGuard>
                <PermissionGuard permission={PERMISSIONS.PROCESS_PAYMENTS}>
                  <button className={styles.btnSecondary}>
                    Process Payments
                  </button>
                </PermissionGuard>
                <PermissionGuard permission={PERMISSIONS.GENERATE_REPORTS}>
                  <button className={styles.btnInfo}>
                    Export Billing Data
                  </button>
                </PermissionGuard>
              </div>
              {/* Add billing table here */}
            </div>
          </PermissionGuard>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <PermissionGuard permission={PERMISSIONS.GENERATE_REPORTS}>
            <div className={styles.section}>
              <h2>Reports & Analytics</h2>
              <div className={styles.reportsGrid}>
                <div className={styles.reportCard}>
                  <h3>Customer Growth</h3>
                  <p>Monthly customer acquisition report</p>
                  <button className={styles.btnSecondary}>View</button>
                </div>
                <div className={styles.reportCard}>
                  <h3>Revenue Analysis</h3>
                  <p>Monthly revenue and collections</p>
                  <button className={styles.btnSecondary}>View</button>
                </div>
                <div className={styles.reportCard}>
                  <h3>Meter Installations</h3>
                  <p>Installation progress and backlog</p>
                  <button className={styles.btnSecondary}>View</button>
                </div>
              </div>
            </div>
          </PermissionGuard>
        )}

        {/* Users/Team Tab */}
        {activeTab === 'users' && (
          <PermissionGuard permission={PERMISSIONS.VIEW_USERS}>
            <div className={styles.section}>
              <h2>Team Members</h2>
              <p className={styles.infoText}>
                Contact Super Admin for user management requests.
              </p>
              {/* Note: Regular admins cannot manage users, only view */}
            </div>
          </PermissionGuard>
        )}
      </main>
      <Footer />
    </>
  );
}