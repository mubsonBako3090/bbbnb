'use client';
import styles from '@/styles/AdminLayout.module.css';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>⚡ PowerGrid</h2>

      <nav className={styles.nav}>
        <button
          className={activeTab === 'overview' ? styles.active : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>

        <button
          className={activeTab === 'customers' ? styles.active : ''}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>

        <button
          className={activeTab === 'users' ? styles.active : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>

        <button
          className={activeTab === 'audit' ? styles.active : ''}
          onClick={() => setActiveTab('audit')}
        >
          Audit Logs
        </button>

        <button
          className={activeTab === 'system' ? styles.active : ''}
          onClick={() => setActiveTab('system')}
        >
          System Health
        </button>
      </nav>
    </aside>
  );
          }
