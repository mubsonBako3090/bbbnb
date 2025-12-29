'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/components/Header.module.css';

// Correct hook import
import useAuthModal from "@/hooks/useAuthModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Auth modal hook
  const { openLogin, openRegister, AuthModalComponent } = useAuthModal();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    openLogin();
    setIsMenuOpen(false);
  };

  const handleRegister = () => {
    openRegister();
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg navbar-light fixed-top ${styles.navbar} ${
          scrolled ? styles.scrolled : ''
        }`}
      >
        <div className="container">
          {/* Brand */}
          <Link href="/" className={`navbar-brand ${styles.brand}`}>
            <i className="bi bi-lightning-charge-fill me-2"></i> PowerGrid Utilities
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className={`navbar-toggler ${styles.navbarToggler}`}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link
                  href="/"
                  className={`nav-link ${styles.navLink}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  href="/about"
                  className={`nav-link ${styles.navLink}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  href="/services"
                  className={`nav-link ${styles.navLink}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  href="/outagemap"
                  className={`nav-link ${styles.navLink}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Outage Map
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  href="/programs"
                  className={`nav-link ${styles.navLink}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Programs & Rebates
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  href="/contact"
                  className={`nav-link ${styles.navLink}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>

              {/* Auth Section */}
              {isClient &&
                (isAuthenticated ? (
                  <li className="nav-item dropdown d-flex align-items-center">
                    <Link
                      href="/dashboard"
                      className={`nav-link ${styles.navLink} ${styles.userDropdown}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="bi bi-person-circle me-1"></i> {user?.firstName}
                    </Link>
                    <a
                      className={`nav-link dropdown-toggle ${styles.navLink}`}
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    ></a>
                    <ul className={`dropdown-menu ${styles.dropdownMenu}`}>
                      <li>
                        <Link
                          href="/dashboard"
                          className="dropdown-item"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="bi bi-speedometer2 me-2"></i> Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/profile"
                          className="dropdown-item"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="bi bi-person me-2"></i> My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/bills"
                          className="dropdown-item"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="bi bi-receipt me-2"></i> My Bills
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/secure-messages"
                          className="dropdown-item"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="bi bi-chat-left-text me-2"></i> Messages
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={handleLogout}
                        >
                          <i className="bi bi-box-arrow-right me-2"></i> Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <li className="nav-item">
                    <div className={styles.authButtons}>
                      <button
                        className={`btn btn-outline-primary me-2 ${styles.authBtn}`}
                        onClick={handleLogin}
                      >
                        <i className="bi bi-person-circle me-2"></i> Login
                      </button>
                      <button
                        className={`btn btn-primary ${styles.authBtn}`}
                        onClick={handleRegister}
                      >
                        <i className="bi bi-person-plus me-2"></i> Register
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* FIXED: Must be rendered as JSX */}
      <AuthModalComponent />
    </>
  );
}
