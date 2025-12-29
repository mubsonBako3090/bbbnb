'use client';
import React from 'react';

export default function BillDetail({ bill }) {
  return (
    <div className="bill-detail">
      <h4>{bill?.title}</h4>
      <p>Amount: {bill?.amount}</p>
    </div>
  );
}
