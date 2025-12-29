'use client';
import React from 'react';

export default function BillCard({ bill }) {
  return (
    <div className="bill-card">
      <h6>{bill?.title || 'Bill'}</h6>
      <p>{bill?.amount || '--'}</p>
    </div>
  );
}
