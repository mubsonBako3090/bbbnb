'use client';
import React from 'react';

export default function Invoice({ invoice }) {
  return (
    <div className="invoice">
      <h4>Invoice #{invoice?.id}</h4>
      <div>Total: {invoice?.total}</div>
    </div>
  );
}
