import { useEffect } from 'react';
import styles from '@/styles/Lightbox.module.css';

export default function Lightbox({ image, onClose }) {
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape') onClose();
		};
    
		document.addEventListener('keydown', handleEscape);
		document.body.style.overflow = 'hidden';
    
		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [onClose]);

	return (
		<div className={styles.lightboxOverlay} onClick={onClose}>
			<div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
				<button className={styles.closeButton} onClick={onClose}>
					<i className="bi bi-x-lg"></i>
				</button>
				<img src={image} alt="Lightbox" className={styles.lightboxImage} />
			</div>
		</div>
	);
}
