'use client';
import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`card ${className}`} style={{padding:'1rem',borderRadius:6}}>
      {children}
    </div>
  );
}
