'use client';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/LegalPages.module.css';

export default function Accessibility() {
  return (
    <>
      <Header />
      <main className={`container ${styles.legalContainer}`}>
        <h1>Accessibility Statement</h1>
        <p>
          PowerGrid Utilities is committed to ensuring digital accessibility for people with disabilities.
          We are continually improving the user experience for everyone and applying the relevant accessibility standards.
        </p>
        <h2>Accessibility Features</h2>
        <ul>
          <li>Keyboard navigable menus and forms</li>
          <li>Screen reader-friendly structure</li>
          <li>Contrast and font-size options for readability</li>
        </ul>
        <h2>Feedback</h2>
        <p>If you encounter accessibility barriers, please contact us at <a href="mailto:accessibility@powergrid.com">accessibility@powergrid.com</a>. We will respond promptly.</p>
      </main>
      <Footer />
    </>
  );
}
