'use client';
import React from 'react';

export default function StatsCard({ title, value }) {
  return (
    <div className="stats-card">
      <h5>{title}</h5>
      <p>{value}</p>
    </div>
  );
}
