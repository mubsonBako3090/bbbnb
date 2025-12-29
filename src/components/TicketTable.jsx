import styles from '@/styles/SupportDashboard.module.css';

export default function TicketTable({ tickets, filters }) {
  const filtered = tickets.filter(t =>
    (filters.status === 'all' || t.status === filters.status) &&
    (filters.priority === 'all' || t.priority === filters.priority)
  );

  return (
    <div className={styles.ticketList}>
      {filtered.map(ticket => (
        <div key={ticket.id} className={styles.ticketCard}>
          <div className={styles.ticketHeader}>
            <span>#{ticket.id}</span>
            <span className={styles[ticket.status]}>{ticket.status}</span>
            <span className={styles[ticket.priority]}>{ticket.priority}</span>
          </div>

          <h4>{ticket.subject}</h4>
          <p>Customer: {ticket.customer}</p>

          <div className={styles.ticketFooter}>
            <span>{ticket.createdAt}</span>
            <button className={styles.btnPrimary}>View</button>
          </div>
        </div>
      ))}
    </div>
  );
            }
