'use client';
import { createContext, useContext, useState } from 'react';
import Login from './Login';
import Register from './Register';
import styles from '@/styles/Login.module.css';

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('login');

  const openLogin = () => {
    setMode('login');
    setShowModal(true);
  };

  const openRegister = () => {
    setMode('register');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const AuthModalComponent = () => {
    if (!showModal) return null;
    return (
      <div className={styles.authModal}>
        <div className={styles.authContent}>
          <button className={styles.closeButton} onClick={closeModal}>
            <i className="bi bi-x-lg"></i>
          </button>
          {mode === 'login' ? (
            <Login onSwitchToRegister={() => setMode('register')} onClose={closeModal} />
          ) : (
            <Register onSwitchToLogin={() => setMode('login')} onClose={closeModal} />
          )}
        </div>
      </div>
    );
  };

  return (
    <AuthModalContext.Provider value={{ openLogin, openRegister, AuthModalComponent }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error('useAuthModal must be used within AuthModalProvider');
  return context;
};
