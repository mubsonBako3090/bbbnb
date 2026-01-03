'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.css';
import UsageChart from '@/components/dashboard/UsageChart';
import MeterGenerator from '@/components/dashboard/MeterGenerator';

export default function DashboardClient({
  user,
  stats,
  meterStatus,
  usageReadings,
}) {
  const router = useRouter();

  return (
    <div className={styles.dashboard}>
      {/* Welcome */}
      <section className={styles.welcomeSection}>
        <h1>
          Welcome back, <span className="text-primary">{user.firstName}</span>
        </h1>
        <p>
          Account: <strong>{user.accountNumber}</strong>
        </p>
      </section>

      {/* Quick Stats */}
      <section className="section-padding">
        <div className="row">
          <StatCard
            href="/bills"
            icon="bi-receipt"
            title="Bills"
            value={`₦${stats.totalAmountDue}`}
            badge={stats.overdueBills > 0 ? `${stats.overdueBills} overdue` : null}
          />

          <StatCard
            href="/usage"
            icon="bi-lightning"
            title="Usage"
            value={`${stats.totalUsage} kWh`}
          />

          <StatCard
            href="/programs"
            icon="bi-gift"
            title="Programs"
            value={stats.programCount}
          />

          <StatCard
            href="/outages"
            icon="bi-geo-alt-fill"
            title="Outages"
            value={stats.outageCount}
          />
        </div>
      </section>

      {/* Usage Chart */}
      {usageReadings.length > 0 && (
        <section className="section-padding">
          <UsageChart readings={usageReadings} />
        </section>
      )}

      {/* Meter */}
      <MeterGenerator hasMeter={meterStatus.hasMeter} />
    </div>
  );
}

function StatCard({ href, icon, title, value, badge }) {
  return (
    <div className="col-md-3 col-6 mb-4">
      <Link href={href} className={styles.statCard}>
        <i className={`bi ${icon}`} />
        <h3>{value}</h3>
        <p>{title}</p>
        {badge && <span className="badge bg-danger">{badge}</span>}
      </Link>
    </div>
  );
}
