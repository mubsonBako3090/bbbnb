'use client';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/LegalPages.module.css';

export default function TermsOfService() {
  return (
    <>
      <Header />
      <main className={`container ${styles.legalContainer}`}>
        <h1>Terms of Service</h1>
        <p>
          By using PowerGrid Utilities' website and services, you agree to these Terms of Service. 
          Please read them carefully.
        </p>
        <h2>Use of Services</h2>
        <p>Our services are intended for residential and commercial customers. You may not misuse the services or attempt unauthorized access.</p>
        <h2>Account Responsibility</h2>
        <p>You are responsible for maintaining the confidentiality of your account and password, and for all activities that occur under your account.</p>
        <h2>Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of our services constitutes acceptance of any new terms.</p>
      </main>
      <Footer />
    </>
  );
}
