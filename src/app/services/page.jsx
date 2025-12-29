"use client";
import Head from 'next/head';
import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';
import styles from '@/styles/Services.module.css';
import Header from '@/components/ui/Header';

export default function Services() {
  const allServices = [
    {
      icon: 'bi-house-check',
      title: 'New Service Connection',
      description: 'Get electricity connected to your new home or business'
    },
    {
      icon: 'bi-tools',
      title: 'Maintenance & Repair',
      description: 'Professional maintenance and repair services'
    },
    {
      icon: 'bi-graph-up',
      title: 'Energy Efficiency',
      description: 'Consultations and solutions to reduce energy consumption'
    },
    {
      icon: 'bi-sun',
      title: 'Solar Integration',
      description: 'Connect solar panels to the grid and manage energy production'
    },
    {
      icon: 'bi-shield-check',
      title: 'Safety Inspections',
      description: 'Comprehensive electrical safety inspections'
    },
    {
      icon: 'bi-phone',
      title: '24/7 Emergency',
      description: 'Round-the-clock emergency response teams'
    }
  ];

  return (
    <>
      <Head>
        <title>Our Services - PowerGrid Utilities</title>
      </Head>

      <Header />

      {/* Hero Section */}
      <section className={styles.servicesHero}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 data-aos="fade-up">Our Services</h1>
              <p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="200">
                Comprehensive energy solutions for residential and commercial needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* All Services */}
      <section className="section-padding">
        <div className="container">
          <div className="row">
            {allServices.map((service, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4" data-aos="fade-up" data-aos-delay={index * 100}>
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={`section-padding bg-light ${styles.processSection}`}>
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Simple steps to get the power you need</p>
          </div>
          <div className="row">
            <div className="col-md-4 text-center" data-aos="fade-up">
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>1</div>
                <h4>Contact Us</h4>
                <p>Reach out through our website, phone, or in-person</p>
              </div>
            </div>
            <div className="col-md-4 text-center" data-aos="fade-up" data-aos-delay="100">
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>2</div>
                <h4>Assessment</h4>
                <p>We assess your needs and provide a customized solution</p>
              </div>
            </div>
            <div className="col-md-4 text-center" data-aos="fade-up" data-aos-delay="200">
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>3</div>
                <h4>Implementation</h4>
                <p>Professional installation and connection to the grid</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
