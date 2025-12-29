'use client';

import { useEffect, useState } from 'react';
import RoleBasedRoute from '@/components/RoleBasedRoute';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';

import SupportStats from '@/components/SupportStats';
import TicketFilters from '@/components/TicketFilters';
import TicketTable from '@/components/TicketTable';
import RecentActivity from '@/components/RecentActivity';

import styles from '@/styles/SupportDashboard.module.css';

export default function SupportDashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [activity, setActivity] = useState([]);
  const [filters, setFilters] = useState({
    status: 'open',
    priority: 'all',
  });

  useEffect(() => {
    // 🔌 Replace later with real API
    setTickets([
      {
        id: 'TKT-001',
        subject: 'Login issue',
        customer: 'John Doe',
        status: 'open',
        priority: 'high',
        createdAt: '2024-01-15'
      },
      {
        id: 'TKT-002',
        subject: 'Payment failed',
        customer: 'Jane Smith',
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-14'
      }
    ]);

    setActivity([
      { id: 1, text: 'New ticket created (#TKT-003)', time: '5 mins ago' },
      { id: 2, text: 'Ticket #TKT-001 replied', time: '30 mins ago' }
    ]);
  }, []);

  return (
    <RoleBasedRoute allowedRoles={['supportAgent', 'admin', 'superAdmin']}>
      <Header />

      <main className={styles.dashboardContainer}>
        <h1 className={styles.pageTitle}>Support Dashboard</h1>

        {/* STATS */}
        <SupportStats />

        {/* MAIN CONTENT */}
        <div className={styles.mainLayout}>
          <div className={styles.left}>
            <TicketFilters filters={filters} setFilters={setFilters} />
            <TicketTable tickets={tickets} filters={filters} />
          </div>

          <div className={styles.right}>
            <RecentActivity activity={activity} />
          </div>
        </div>
      </main>

      <Footer />
    </RoleBasedRoute>
  );
    }
