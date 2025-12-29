'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';

export default function UsagePage() {
  return (
    <>
      <Header />
      <div className="container py-5">
        <h1>Usage History</h1>
        <p>Your electricity usage trends will appear here.</p>
      </div>
      <Footer />
    </>
  );
}
