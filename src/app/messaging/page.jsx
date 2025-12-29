'use client';
import { useState } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';

export default function MessagingPage() {
  return (
    <>
      <Header />
      <div className="container py-5">
        <h1>Secure Messaging</h1>
        <p>Send and receive messages securely with customer support.</p>
      </div>
      <Footer />
    </>
  );
}
