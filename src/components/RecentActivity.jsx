import styles from '@/styles/SupportDashboard.module.css';

export default function RecentActivity({ activity }) {
  return (
    <div className={styles.activityBox}>
      <h3>Recent Activity</h3>
      <ul>
        {activity.map(item => (
          <li key={item.id}>
            <p>{item.text}</p>
            <span>{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
