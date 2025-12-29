'use client';
import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/contact.module.css';

export default function Contact() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: ''
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle form submission
		console.log('Form submitted:', formData);
		alert('Thank you for your message! We will get back to you soon.');
		setFormData({
			name: '',
			email: '',
			phone: '',
			subject: '',
			message: ''
		});
	};

	return (
		<>
			<Head>
				<title>Contact Us - PowerGrid Utilities</title>
			</Head>

    
<Header />

			{/* Hero Section */}
			<section className={styles.contactHero}>
				<div className="container">
					<div className="row">
						<div className="col-12 my-4 text-center">
							<h1 data-aos="fade-up">Contact Us</h1>
							<p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="200">
								Get in touch with our team for any questions or concerns
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Information */}
			<section className="section-padding">
				<div className="container">
					<div className="row">
						<div className="col-lg-4 my-4" data-aos="fade-up">
							<div className={styles.infoCard}>
								<div className={styles.infoIcon}>
									<i className="bi bi-telephone-fill"></i>
								</div>
								<h4>Phone</h4>
								<p>24/7 Customer Service</p>
								<a href="tel:+2349164675884-POWER" className={styles.infoLink}>1-800-555-POWER</a>
								<br />
								<a href="tel:1-800-555-OUTAGE" className={styles.infoLink}>1-800-555-OUTAGE (Emergency)</a>
							</div>
						</div>
						<div className="col-lg-4 my-4" data-aos="fade-up" data-aos-delay="100">
							<div className={styles.infoCard}>
								<div className={styles.infoIcon}>
									<i className="bi bi-envelope-fill"></i>
								</div>
								<h4>Email</h4>
								<p>Send us a message</p>
								<a href="mailto:adammubarakbako@gmail.com" className={styles.infoLink}>info@powergrid.com</a>
								<br />
								<a href="mailto:mubarakadambako@gmail.com" className={styles.infoLink}>support@powergrid.com</a>
							</div>
						</div>
						<div className="col-lg-4 my-4" data-aos="fade-up" data-aos-delay="200">
							<div className={styles.infoCard}>
								<div className={styles.infoIcon}>
									<i className="bi bi-geo-alt-fill"></i>
								</div>
								<h4>Office</h4>
								<p>Visit our headquarters</p>
								<address className={styles.address}>
									000 Energy Plaza<br />
									Suite 500<br />
									Power City, kaduna
								</address>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Form */}
			<section className={`section-padding bg-light ${styles.contactFormSection}`}>
				<div className="container">
					<div className="row">
						<div className="col-lg-8 mx-auto">
							<div className={styles.formContainer} data-aos="fade-up">
								<h2 className="text-center mb-4">Send us a Message</h2>
								<form onSubmit={handleSubmit}>
									<div className="row">
										<div className="col-md-6 mb-3">
											<label htmlFor="name" className="form-label">Full Name</label>
											<input
												type="text"
												className="form-control"
												id="name"
												name="name"
												value={formData.name}
												onChange={handleChange}
												required
											/>
										</div>
										<div className="col-md-6 mb-3">
											<label htmlFor="email" className="form-label">Email Address</label>
											<input
												type="email"
												className="form-control"
												id="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												required
											/>
										</div>
									</div>
									<div className="row">
										<div className="col-md-6 mb-3">
											<label htmlFor="phone" className="form-label">Phone Number</label>
											<input
												type="tel"
												className="form-control"
												id="phone"
												name="phone"
												value={formData.phone}
												onChange={handleChange}
											/>
										</div>
										<div className="col-md-6 mb-3">
											<label htmlFor="subject" className="form-label">Subject</label>
											<select
												className="form-select"
												id="subject"
												name="subject"
												value={formData.subject}
												onChange={handleChange}
												required
											>
												<option value="">Select a subject</option>
												<option value="billing">Billing Inquiry</option>
												<option value="service">Service Request</option>
												<option value="outage">Power Outage</option>
												<option value="safety">Safety Concern</option>
												<option value="other">Other</option>
											</select>
										</div>
									</div>
									<div className="mb-3">
										<label htmlFor="message" className="form-label">Message</label>
										<textarea
											className="form-control"
											id="message"
											name="message"
											rows="5"
											value={formData.message}
											onChange={handleChange}
											required
										></textarea>
									</div>
									<div className="text-center">
										<button type="submit" className="btn btn-primary btn-lg">
											Send Message
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Office Hours */}
			<section className="section-padding">
				<div className="container">
					<div className="row">
						<div className="col-lg-6 mx-auto">
							<div className={styles.hoursCard} data-aos="fade-up">
								<h3 className="text-center mb-4">Office Hours</h3>
								<div className={styles.hoursList}>
									<div className={styles.hourItem}>
										<span>Monday - Friday</span>
										<span>8:00 AM - 6:00 PM</span>
									</div>
									<div className={styles.hourItem}>
										<span>Saturday</span>
										<span>9:00 AM - 2:00 PM</span>
									</div>
									<div className={styles.hourItem}>
										<span>Sunday</span>
										<span>Closed</span>
									</div>
									<div className={styles.emergencyNote}>
										<i className="bi bi-exclamation-triangle-fill me-2"></i>
										<strong>Emergency services available 24/7</strong>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
      
		
    
		</>
	);
}
