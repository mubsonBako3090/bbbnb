'use client';
import Link from 'next/link';
import styles from '@/styles/Footer.module.css';

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className="container">
				<div className="row">
					<div className="col-lg-4 mb-4">
						<div className={styles.brandSection}>
							<h4 className={styles.brand}>
								<i className="bi bi-lightning-charge-fill me-2"></i>
								PowerGrid Utilities
							</h4>
							<p className={styles.brandDescription}>
								Providing reliable and sustainable energy solutions to communities 
								for over 50 years. Your trusted partner in power.
							</p>
							<div className={styles.socialLinks}>
								<a href="#" className={styles.socialLink}>
									<i className="bi bi-facebook"></i>
								</a>
								<a href="/" className={styles.socialLink}>
									<i className="bi bi-twitter"></i>
								</a>
								<a href="https://ng.linkedin.com/in/mubarak-adam-bako-a86583311" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                   <i className="bi bi-linkedin"></i>
                                </a>

								<a href="#" className={styles.socialLink}>
									<i className="bi bi-instagram"></i>
								</a>
								<a href="mailto:mubarakadambako@gmail.com" className={styles.socialLink}>
                                <i className="bi bi-envelope"></i> 
                              </a>

							</div>
						</div>
					</div>
          
					<div className="col-lg-2 col-md-3 mb-4">
						<h5 className={styles.footerTitle}>Quick Links</h5>
						<ul className={styles.footerLinks}>
							<li><Link href="/">Home</Link></li>
							<li><Link href="/about">About</Link></li>
							<li><Link href="/services">Services</Link></li>
							<li><Link href="/outagemap">Outage Map</Link></li>
							<li><Link href="/contact">Contact</Link></li>
						</ul>
					</div>
          
					<div className="col-lg-3 col-md-3 mb-4">
						<h5 className={styles.footerTitle}>Services</h5>
						<ul className={styles.footerLinks}>
							<li><a href="/services/residential">Residential Services</a></li>
							<li><a href="/services/commercial">Commercial Services</a></li>
							<li><a href="/services/emergency">Emergency Response</a></li>
							<li><a href="/services/energy">Energy Efficiency</a></li>
							<li><a href="/services/solar">Solar Integration</a></li>
						</ul>
					</div>
          
					<div className="col-lg-3 col-md-3 mb-4">
						<h5 className={styles.footerTitle}>Contact Info</h5>
						<div className={styles.contactInfo}>
							<p>
								<i className="bi bi-geo-alt me-2"></i>
								000 Energy Plaza, kaduna city
							</p>
							<p>
								<i className="bi bi-telephone me-2"></i>
								+2349164675884-POWER
							</p>
							<p>
								<i className="bi bi-envelope me-2"></i>
								mubarakadambako@gmail.com
							</p>
							<p>
								<i className="bi bi-clock me-2"></i>
								24/7 Emergency Service
							</p>
						</div>
					</div>
				</div>
        
				<div className={styles.footerBottom}>
					<div className="row align-items-center">
						<div className="col-md-6">
							<p className={styles.copyright}>
								&copy; 2025 PowerGrid Utilities. All rights reserved.
							</p>
						</div>
						<div className="col-md-6">
							<div className={styles.legalLinks}>
                             <Link href="/privacy-policy">Privacy Policy</Link>
                             <Link href="/terms-of-service">Terms of Service</Link>
                            <Link href="/accessibility">Accessibility</Link>
                          </div>

						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
