'use client';
import Head from 'next/head';
import Header from '@/components/ui/Header';
import styles from '@/styles/about.module.css';
import Footer from './Footer';

export default function About() {
	const stats = [
		{ number: '2M+', label: 'Customers Served' },
		{ number: '50+', label: 'Years Experience' },
		{ number: '99.9%', label: 'Reliability Rate' },
		{ number: '24/7', label: 'Support Available' }
	];

	return (
		<>
			<Head>
				<title>About Us - PowerGrid Utilities</title>
			</Head>

			<Header />

			{/* Hero Section */}
			<section className={styles.aboutHero}>
				<div className="container">
					<div className="row">
						<div className="col-12 text-center">
							<h1 data-aos="fade-up">About PowerGrid Utilities</h1>
							<p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="200">
								Powering communities with reliable energy since 1970
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className={styles.statsSection}>
				<div className="container">
					<div className="row">
						{stats.map((stat, index) => (
							<div key={index} className="col-md-3 col-6 text-center" data-aos="fade-up" data-aos-delay={index * 100}>
								<div className={styles.statItem}>
									<h3 className={styles.statNumber}>{stat.number}</h3>
									<p className={styles.statLabel}>{stat.label}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="section-padding">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-lg-6" data-aos="fade-right">
							<img 
								src="/kol.jpeg" 
								alt="Our Mission" 
								height={400}
								width={400}
								className={`img-fluid ${styles.aboutImage}`}
							/>
						</div>
						<div className="col-lg-6" data-aos="fade-left">
							<h2 className="section-title ">Our Mission</h2>
							<p className={styles.missionText}>
								At PowerGrid Utilities, we are committed to providing safe, reliable, 
								and affordable electricity to our customers. Our mission is to power 
								communities while embracing innovation and sustainability.
							</p>
							<ul className={styles.missionList}>
								<li><i className="bi bi-check-circle-fill text-success me-2"></i>Reliable Power Delivery</li>
								<li><i className="bi bi-check-circle-fill text-success me-2"></i>Customer-Centric Approach</li>
								<li><i className="bi bi-check-circle-fill text-success me-2"></i>Sustainable Energy Solutions</li>
								<li><i className="bi bi-check-circle-fill text-success me-2"></i>Community Investment</li>
							</ul>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		

		</>
	);
}
