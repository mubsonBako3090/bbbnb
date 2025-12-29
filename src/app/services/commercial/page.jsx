'use client';

import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import styles from '@/styles/Services.module.css'

export default function commercialService() {
  return (
    <>
      <Header />
      <div className="container py-5">
        <h1>commertial Services</h1>
        <p>
          We provide reliable electricity to homes, 24/7 support, smart energy
          solutions, and more. Enjoy uninterrupted power supply with our
          residential services.
        </p>

        {/* Back Button */}
        <Link href="/services">
          <button className="btn btn-outline-primary mt-4">
            ← Back to Services
          </button>
        </Link>
      </div>
      <Footer />
    </>
  );
}
