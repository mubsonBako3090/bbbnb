'use client';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/LegalPages.module.css';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main className={`container ${styles.legalContainer}`}>
        <h1>Privacy Policy</h1>
        <p>
          Your privacy is important to us. This page explains what personal information we collect,
          how we use it, and how we protect it.
        </p>
        <h2>Information We Collect</h2>
        <ul>
          <li>Personal details such as name, email, and account information</li>
          <li>Usage data and interactions on our website</li>
          <li>Billing and payment information</li>
        </ul>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain our services</li>
          <li>To improve our website and customer experience</li>
          <li>For communication and billing purposes</li>
        </ul>
        <h2>Contact Us</h2>
        <p>If you have any questions about this privacy policy, please contact us at <a href="mailto:support@powergrid.com">support@powergrid.com</a>.</p>
      </main>
      <Footer />
    </>
  );
}
