'use client';

import React from 'react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function BillList({ bills }) {
  return (
    <div>
      <h3>Payments</h3>

      {/* Show message if no bills */}
      {bills.length === 0 && <p>No payments yet.</p>}

      <ul>
        {bills.map((bill) => (
          <li key={bill.id} style={{ marginBottom: '10px' }}>
            {/* Amount in USD */}
            <strong>{formatCurrency(bill.amount)}</strong> — {bill.description || 'No description'}
            <br />
            {/* Formatted date and time */}
            <small>{formatDateTime(bill.date)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
