'use client';
import React from 'react';

export default function Modal({ children, open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)'}}>
      <div className="modal-content" onClick={(e)=>e.stopPropagation()} style={{background:'#fff',padding:'1rem',margin:'4rem auto',maxWidth:600}}>
        {children}
      </div>
    </div>
  );
}
