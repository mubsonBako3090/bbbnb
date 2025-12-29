'use client';
import { useState } from 'react';
import styles from '@/styles/Dashboard.module.css';
import { FaBolt, FaPlug, FaCheckCircle } from 'react-icons/fa';

export default function MeterGenerator() {
  const [step, setStep] = useState(1);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    preferredInstallationDate: '',
    specialInstructions: '',
    propertyAccess: 'yes',
    meterLocation: 'front',
  });

  const meterOptions = [
    {
      id: 'smart',
      icon: <FaBolt />,
      title: 'Smart Meter',
      description: 'Automatically reports usage data and alerts.',
      features: ['Remote reading', 'High accuracy', 'Alerts'],
      price: '$120',
    },
    {
      id: 'digital',
      icon: <FaPlug />,
      title: 'Digital Meter',
      description: 'Manual reading but digital display.',
      features: ['Manual reading', 'Digital display'],
      price: '$80',
    },
    {
      id: 'analog',
      icon: <FaCheckCircle />,
      title: 'Analog Meter',
      description: 'Traditional analog meter.',
      features: ['Manual reading', 'Low cost'],
      price: '$50',
    },
  ];

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/customer/meter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meterType: selectedMeter,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit meter request');
      }

      // Reset after success
      setStep(1);
      setSelectedMeter(null);
      setFormData({
        preferredInstallationDate: '',
        specialInstructions: '',
        propertyAccess: 'yes',
        meterLocation: 'front',
      });

      alert('Meter request submitted successfully!');
      window.location.reload(); // refresh dashboard data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.meterGenerator}>
      <h2>Meter Generation</h2>

      {error && <p className={styles.errorText}>{error}</p>}

      {/* Step 1 */}
      {step === 1 && (
        <div className={styles.meterGeneratorContainer}>
          <div className={styles.meterOptions}>
            {meterOptions.map((meter) => (
              <div
                key={meter.id}
                className={`${styles.meterOption} ${
                  selectedMeter === meter.id ? styles.selected : ''
                }`}
                onClick={() => setSelectedMeter(meter.id)}
              >
                <div className={styles.meterIcon}>{meter.icon}</div>
                <div className={styles.meterInfo}>
                  <h4>{meter.title}</h4>
                  <p>{meter.description}</p>
                  <div className={styles.features}>
                    {meter.features.map((f, idx) => (
                      <span key={idx}>{f}</span>
                    ))}
                  </div>
                  <div className={styles.priceTag}>
                    <span className={styles.price}>{meter.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.stepActions}>
            <button
              className={styles.nextButton}
              onClick={handleNext}
              disabled={!selectedMeter}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className={styles.meterGeneratorContainer}>
          <form className={styles.form}>
            <label>Preferred Installation Date</label>
            <input
              type="date"
              name="preferredInstallationDate"
              value={formData.preferredInstallationDate}
              onChange={handleChange}
              required
            />

            <label>Special Instructions</label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
            />

            <label>Property Access</label>
            <select
              name="propertyAccess"
              value={formData.propertyAccess}
              onChange={handleChange}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>

            <label>Meter Location</label>
            <select
              name="meterLocation"
              value={formData.meterLocation}
              onChange={handleChange}
            >
              <option value="front">Front</option>
              <option value="back">Back</option>
            </select>
          </form>

          <div className={styles.stepActions}>
            <button className={styles.backButton} onClick={handleBack}>
              Back
            </button>
            <button
              className={styles.nextButton}
              onClick={handleNext}
              disabled={!formData.preferredInstallationDate}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className={styles.meterGeneratorContainer}>
          <div className={styles.confirmationCard}>
            <h4>Confirm Your Meter Selection</h4>
            <p><strong>Meter Type:</strong> {selectedMeter}</p>
            <p><strong>Installation Date:</strong> {formData.preferredInstallationDate}</p>
            <p><strong>Special Instructions:</strong> {formData.specialInstructions || 'None'}</p>
            <p><strong>Property Access:</strong> {formData.propertyAccess}</p>
            <p><strong>Meter Location:</strong> {formData.meterLocation}</p>
          </div>

          <div className={styles.stepActions}>
            <button className={styles.backButton} onClick={handleBack}>
              Back
            </button>
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
