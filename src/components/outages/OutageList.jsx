'use client';
import React from 'react';

export default function OutageList({ outages = [] }) {
  return (
    <div className="outage-list">
      {outages.map(o => (
        <div key={o.id}>{o.title}</div>
      ))}
    </div>
  );
}
