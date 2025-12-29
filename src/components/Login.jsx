'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Login.module.css';

export default function Login({ onSwitchToRegister, onClose }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);

    if (user.role === 'superAdmin') {
  router.replace('/superadmin/dashboard');
} else {
  router.replace('/dashboard');
}

  };

  return (
    <div className={styles.authModal}>
      <div className={styles.authContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>

        <div className={styles.authHeader}>
          <i className="bi bi-person-circle"></i>
          <h2>Customer Login</h2>
          <p>Access your account to manage services and bills</p>
        </div>

        {error && (
          <div className={`alert alert-danger ${styles.alert}`}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className={styles.inputGroup}>
              <i className="bi bi-envelope"></i>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <div className={styles.inputGroup}>
              <i className="bi bi-lock"></i>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className={styles.authOptions}>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <a href="#" className={styles.forgotLink}>Forgot password?</a>
          </div>

          <button type="submit" className={`btn btn-primary w-100 ${styles.authButton}`} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Don't have an account?{' '}
            <button className={styles.switchLink} onClick={onSwitchToRegister}>
              Create one here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
