'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import MeterReadingForm from '@/components/MeterReadingForm';

export default function UsagePage() {
  const [usage, setUsage] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/usage', {
          credentials: 'include',
        });

        const result = await res.json();

        if (result.success) {
          setUsage(result.data.usage);
          setSummary(result.data.summary);
        }
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
     

    };

    fetchUsage();
  }, []);

  return (
    <>
      <Header />

      <div className="container py-5">
        <h1>Usage History</h1>

        {loading && <p>Loading usage data...</p>}

        {!loading && usage.length === 0 && (
          <p>No meter readings submitted yet.</p>
        )}

        {!loading && usage.length > 0 && (
          <>
            {/* SUMMARY */}
            <div className="mb-4">
              <p><strong>Total Consumption:</strong> {summary.totalConsumption} kWh</p>
              <p><strong>Average Consumption:</strong> {summary.averageConsumption.toFixed(2)} kWh</p>
            </div>

            {/* TABLE */}
            <MeterReadingForm onSuccess={() => window.location.reload()} />

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Previous Reading</th>
                  <th>Current Reading</th>
                  <th>Units Used (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((u) => (
                  <tr key={u._id}>
                    <td>{new Date(u.readingDate).toLocaleDateString()}</td>
                    <td>{u.previousReading}</td>
                    <td>{u.currentReading}</td>
                    <td>{u.consumption}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
