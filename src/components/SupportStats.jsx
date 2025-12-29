import styles from '@/styles/SupportDashboard.module.css';

export default function SupportStats() {
  return (
    <div className={styles.statsContainer}>
      <div className={styles.statCard}>
        <span>Open</span>
        <h2>24</h2>
      </div>
      <div className={styles.statCard}>
        <span>Pending</span>
        <h2>12</h2>
      </div>
      <div className={styles.statCard}>
        <span>Resolved</span>
        <h2>156</h2>
      </div>
      <div className={styles.statCard}>
        <span>Closed</span>
        <h2>89</h2>
      </div>
    </div>
  );
      }
