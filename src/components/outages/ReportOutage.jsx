'use client';
import React from 'react';

export default function ReportOutage({ onReport }) {
  return (
    <form onSubmit={onReport} className="report-outage-form">
      <textarea name="description" placeholder="Describe the outage" />
      <button className="btn btn-primary">Report</button>
    </form>
  );
}
