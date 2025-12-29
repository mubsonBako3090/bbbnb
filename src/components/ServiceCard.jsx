import styles from '@/styles/ServiceCard.module.css';

export default function ServiceCard({ icon, title, description }) {
	return (
		<div className={styles.serviceCard}>
			<div className={styles.serviceIcon}>
				<i className={icon}></i>
			</div>
			<h4 className={styles.serviceTitle}>{title}</h4>
			<p className={styles.serviceDescription}>{description}</p>
			<div className={styles.serviceHover}></div>
		</div>
	);
}
