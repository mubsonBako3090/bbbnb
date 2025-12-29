'use client';
import React from 'react';

export default function Sidebar({ children }) {
  return (
    <aside style={{padding: '1rem', borderRight: '1px solid #eee'}}>
      {/* Minimal placeholder sidebar — replace with app-specific UI */}
      {children}
    </aside>
  );
}
