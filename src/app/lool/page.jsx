'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/SuperAdminDashboard.module.css';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Redirect non-superAdmin users
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'superAdmin') {
        router.replace('/');
        return;
      }
      fetchCustomers();
    }
  }, [loading, user]);

  // Fetch customers
  const fetchCustomers = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/superadmin/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  // Approve meter installation
  const approveMeter = async (customerId) => {
    if (!confirm('Approve meter installation for this customer?')) return;

    try {
      const res = await fetch('/api/superadmin/meter/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      if (!res.ok) throw new Error('Failed to approve meter');
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || fetching) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      <Header />
      <main className={styles.container}>
        <h1 className={styles.pageTitle}>Super Admin Dashboard</h1>

        {customers.length === 0 ? (
          <p className={styles.loading}>No customers found.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Meter</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td>{c.firstName} {c.lastName}</td>
                    <td>{c.email}</td>
                    <td>{c.meterNumber || 'Not generated'}</td>
                    <td>
                      <span className={c.meterInstallationStatus === 'pending' ? styles.pending : styles.installed}>
                        {c.meterInstallationStatus}
                      </span>
                    </td>
                    <td>
                      {c.meterInstallationStatus === 'pending' && (
                        <button
                          className={styles['btn-success']}
                          onClick={() => approveMeter(c._id)}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
