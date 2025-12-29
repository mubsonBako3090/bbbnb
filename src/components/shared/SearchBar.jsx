'use client';
import React from 'react';

export default function SearchBar({ onSearch }) {
  return (
    <input type="search" placeholder="Search" onChange={e => onSearch?.(e.target.value)} />
  );
}
