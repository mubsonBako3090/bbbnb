'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/pages/Profile.module.css';

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      paperlessBilling: false
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        preferences: user.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          paperlessBilling: false
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('preferences.')) {
      const preferenceField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [preferenceField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile updated:', formData);
      setIsEditing(false);
      // In real app, update user context here
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const states = [
    'Abia', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'Kaduna', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className={styles.unauthorized}>
          <div className="container text-center">
            <i className="bi bi-shield-exclamation"></i>
            <h2>Access Denied</h2>
            <p>Please log in to access your profile.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className={styles.profile}>
        {/* Header Section */}
        <section className={styles.profileHeader}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1>My Profile</h1>
                <p className={styles.profileSubtitle}>
                  Manage your account information and preferences
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <div className={styles.accountInfo}>
                  <p><strong>Account Number:</strong> {user?.accountNumber}</p>
                  <p><strong>Meter Number:</strong> {user?.meterNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Form */}
        <section className="section-padding">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className={styles.profileCard}>
                  <div className={styles.cardHeader}>
                    <h3>Personal Information</h3>
                    <button
                      className={`btn ${isEditing ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                      onClick={() => setIsEditing(!isEditing)}
                      type="button"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">Address Information</h5>
                      <div className="row">
                        <div className="col-12 mb-3">
                          <label htmlFor="street" className="form-label">Street Address</label>
                          <input
                            type="text"
                            className="form-control"
                            id="street"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="city" className="form-label">City</label>
                          <input
                            type="text"
                            className="form-control"
                            id="city"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="state" className="form-label">State</label>
                          <select
                            className="form-select"
                            id="state"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                          >
                            <option value="">Select State</option>
                            {states.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                          <input
                            type="text"
                            className="form-control"
                            id="zipCode"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">Communication Preferences</h5>
                      <div className="row">
                        <div className="col-12">
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="emailNotifications"
                              name="preferences.emailNotifications"
                              checked={formData.preferences.emailNotifications}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                            <label className="form-check-label" htmlFor="emailNotifications">
                              Email Notifications
                            </label>
                            <small className="form-text text-muted d-block">
                              Receive important updates and billing notifications via email
                            </small>
                          </div>
                          
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="smsNotifications"
                              name="preferences.smsNotifications"
                              checked={formData.preferences.smsNotifications}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                            <label className="form-check-label" htmlFor="smsNotifications">
                              SMS Notifications
                            </label>
                            <small className="form-text text-muted d-block">
                              Receive outage alerts and important updates via text message
                            </small>
                          </div>
                          
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="paperlessBilling"
                              name="preferences.paperlessBilling"
                              checked={formData.preferences.paperlessBilling}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                            <label className="form-check-label" htmlFor="paperlessBilling">
                              Paperless Billing
                            </label>
                            <small className="form-text text-muted d-block">
                              Go green and receive your bills electronically
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="text-end">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saveLoading}
                        >
                          {saveLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}