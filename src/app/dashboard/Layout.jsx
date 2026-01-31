import Sidebar from '@/components/admin/Sidebar';
import styles from '@/styles/AdminLayout.module.css';

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.adminLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
