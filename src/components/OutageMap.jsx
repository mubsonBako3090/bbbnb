"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '@/styles/OutageMap.module.css';
import Header from '@/components/ui/Header';
import Link from 'next/link';
export default function OutageMapPage() {
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOutages([
        { id: 1, area: 'Downtown District', customers: 1500000, status: 'In Progress', estimatedRestoration: '2:00 PM' },
        { id: 2, area: 'North Suburbs', customers: 800000, status: 'Investigating', estimatedRestoration: '4:30 PM' },
        { id: 3, area: 'West Industrial Zone', customers: 2000, status: 'Restored', estimatedRestoration: 'Completed' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  

  return (
    <>
      <Head>
        <title>Outage Map - PowerGrid Utilities</title>
      </Head>

      <Header />

      {/* Hero Section */}
      <section className={styles.outageHero}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 data-aos="fade-up">Outage Map & Information</h1>
              <p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="200">
                Real-time updates on power outages in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.quickActions}>
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3" data-aos="fade-up">
              <div className={styles.actionCard}>
                <i className="bi bi-telephone-fill"></i>
                <h4>Report Outage</h4>
                <p>Call 24/7 Emergency Line</p>
                <a href="tel:+2349164675884-POWER-ON" className="btn btn-primary">1-800-POWER-ON</a>
              </div>
            </div>
            <div className="col-md-4 mb-3" data-aos="fade-up" data-aos-delay="100">
              <div className={styles.actionCard}>
                <i className="bi bi-phone"></i>
                <h4>Text Updates</h4>
                <p>Get outage alerts via SMS</p>
                <Link href="/LoginForm">  
                <button className="btn btn-outline-primary">Sign Up</button>
                </Link> 
              </div>
            </div>
            <div className="col-md-4 mb-3" data-aos="fade-up" data-aos-delay="200">
              <div className={styles.actionCard}>
                <i className="bi bi-lightning-charge"></i>
                <h4>Online Report</h4>
                <p>Report outage through our portal</p>
                <button className="btn btn-primary">Report Online</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-8" data-aos="fade-right">
              <div className={styles.mapContainer}>
                <div className={styles.mapPlaceholder}>
                  <i className="bi bi-map"></i>
                  <p>Interactive Outage Map</p>
                  <small>Real-time outage locations and status</small>
                </div>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-left">
              <div className={styles.outageList}>
                <h3>Current Outages</h3>
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  outages.map(outage => (
                    <div key={outage.id} className={styles.outageItem}>
                      <div className={styles.outageHeader}>
                        <h5>{outage.area}</h5>
                        <span className={`badge ${styles[outage.status.replace(' ', '')]}`}>
                          {outage.status}
                        </span>
                      </div>
                      <p>Affected Customers: {outage.customers.toLocaleString()}</p>
                      <small>Est. Restoration: {outage.estimatedRestoration}</small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className={`section-padding bg-light ${styles.safetyTips}`}>
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="section-title">Outage Safety Tips</h2>
          </div>
          <div className="row">
            <div className="col-md-6" data-aos="fade-up">
              <div className={styles.tipCard}>
                <i className="bi bi-flash"></i>
                <h5>Power Line Safety</h5>
                <p>Stay away from downed power lines and report them immediately</p>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className={styles.tipCard}>
                <i className="bi bi-refrigerator"></i>
                <h5>Food Safety</h5>
                <p>Keep refrigerator and freezer doors closed to maintain temperature</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
