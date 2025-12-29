'use client';
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
