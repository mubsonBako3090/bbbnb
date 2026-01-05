'use client';

import { useState } from 'react';

export default function MeterReadingForm({ onSuccess }) {
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitReading = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reading }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      onSuccess?.(result.data.usage);
      setReading('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitReading} className="mb-4">
      <h4>Submit Meter Reading</h4>

      {error && <p className="text-danger">{error}</p>}

      <input
        type="number"
        className="form-control mb-2"
        placeholder="Enter current meter reading"
        value={reading}
        onChange={(e) => setReading(e.target.value)}
        required
      />

      <button className="btn btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Reading'}
      </button>
    </form>
  );
}
