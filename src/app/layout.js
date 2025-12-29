'use client';
import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/components/AuthModalContext';
import '@/styles/globals.css';

export default function RootLayout({ children }) {
  useEffect(() => {
    const AOS = require('aos');
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <html lang="en">
      <head>
        <title>PowerGrid Utilities - Reliable Energy Solutions</title>
        <meta name="description" content="Your trusted electric utility provider" />
      </head>
      <body>
        <AuthProvider>
          <AuthModalProvider>
            {children}      {/* Header/Navbar inside this can use useAuthModal */}
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
