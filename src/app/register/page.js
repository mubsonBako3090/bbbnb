// app/register/page.js - Updated
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/Register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    serviceType: 'residential', // residential, commercial, industrial
    meterType: 'smart', // smart, digital, analog
    emergencyContact: '',
    idType: 'national_id', // national_id, passport, driver_license
    idNumber: '',
    referralCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'customer' // Default role for public registration
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Store temporary registration data for meter setup
        localStorage.setItem('pendingRegistration', JSON.stringify({
          customerId: data.customerId,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`
        }));
        
        // Redirect based on registration method
        if (data.requiresAdminApproval) {
          router.push('/registration/pending');
        } else if (data.meterRequired) {
          router.push('/registration/meter-setup');
        } else {
          router.push('/registration/success');
        }
      } else {
        setErrors({ form: data.error || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>New Customer Registration</h1>
          <p className={styles.subtitle}>
            Register for electricity service. All fields are required unless marked optional.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.form && (
            <div className={styles.errorAlert}>
              <span className={styles.errorIcon}>⚠️</span>
              {errors.form}
            </div>
          )}

          {/* Personal Information Section */}
          <fieldset className={styles.fieldset}>
            <legend>Personal Information</legend>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? styles.inputError : ''}
                  placeholder="John"
                  required
                />
                {errors.firstName && (
                  <span className={styles.errorText}>{errors.firstName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? styles.inputError : ''}
                  placeholder="Doe"
                  required
                />
                {errors.lastName && (
                  <span className={styles.errorText}>{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? styles.inputError : ''}
                placeholder="john.doe@example.com"
                required
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? styles.inputError : ''}
                  placeholder="+1 (555) 123-4567"
                  required
                />
                {errors.phone && (
                  <span className={styles.errorText}>{errors.phone}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="emergencyContact">Emergency Contact (Optional)</label>
                <input
                  type="tel"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="+1 (555) 987-6543"
                />
              </div>
            </div>
          </fieldset>

          {/* Address Information Section */}
          <fieldset className={styles.fieldset}>
            <legend>Service Address</legend>
            
            <div className={styles.formGroup}>
              <label htmlFor="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? styles.inputError : ''}
                placeholder="123 Main Street"
                required
              />
              {errors.address && (
                <span className={styles.errorText}>{errors.address}</span>
              )}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? styles.inputError : ''}
                  placeholder="New York"
                  required
                />
                {errors.city && (
                  <span className={styles.errorText}>{errors.city}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={errors.state ? styles.inputError : ''}
                  placeholder="NY"
                  required
                />
                {errors.state && (
                  <span className={styles.errorText}>{errors.state}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={errors.zipCode ? styles.inputError : ''}
                  placeholder="10001"
                  required
                />
                {errors.zipCode && (
                  <span className={styles.errorText}>{errors.zipCode}</span>
                )}
              </div>
            </div>
          </fieldset>

          {/* Service & Meter Information */}
          <fieldset className={styles.fieldset}>
            <legend>Service Details</legend>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="serviceType">Service Type *</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="agricultural">Agricultural</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="meterType">Preferred Meter Type *</label>
                <select
                  id="meterType"
                  name="meterType"
                  value={formData.meterType}
                  onChange={handleChange}
                >
                  <option value="smart">Smart Meter (Recommended)</option>
                  <option value="digital">Digital Meter</option>
                  <option value="analog">Analog Meter</option>
                </select>
                <small className={styles.helpText}>
                  Smart meters provide real-time usage data and automatic readings
                </small>
              </div>
            </div>
          </fieldset>

          {/* Identification Section */}
          <fieldset className={styles.fieldset}>
            <legend>Identification</legend>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="idType">ID Type *</label>
                <select
                  id="idType"
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                >
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver's License</option>
                  <option value="voter_id">Voter ID</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="idNumber">ID Number *</label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className={errors.idNumber ? styles.inputError : ''}
                  placeholder="A12345678"
                  required
                />
                {errors.idNumber && (
                  <span className={styles.errorText}>{errors.idNumber}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="referralCode">Referral Code (Optional)</label>
              <input
                type="text"
                id="referralCode"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="REF12345"
              />
              <small className={styles.helpText}>
                Enter if you were referred by an existing customer
              </small>
            </div>
          </fieldset>

          {/* Password Section */}
          <fieldset className={styles.fieldset}>
            <legend>Account Security</legend>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? styles.inputError : ''}
                  placeholder="At least 8 characters"
                  required
                />
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
                <div className={styles.passwordRequirements}>
                  <small>Must contain:</small>
                  <ul>
                    <li className={formData.password.length >= 8 ? styles.met : ''}>
                      At least 8 characters
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? styles.met : ''}>
                      One lowercase letter
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? styles.met : ''}>
                      One uppercase letter
                    </li>
                    <li className={/\d/.test(formData.password) ? styles.met : ''}>
                      One number
                    </li>
                  </ul>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? styles.inputError : ''}
                  placeholder="Re-enter your password"
                  required
                />
                {errors.confirmPassword && (
                  <span className={styles.errorText}>{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </fieldset>

          {/* Terms & Conditions */}
          <div className={styles.terms}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" required />
              <span>
                I agree to the <Link href="/terms" className={styles.link}>Terms of Service</Link> 
                and <Link href="/privacy" className={styles.link}>Privacy Policy</Link>. 
                I understand that my application requires verification and may take 2-3 business days to process.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Processing...
                </>
              ) : 'Submit Registration'}
            </button>
            
            <p className={styles.loginPrompt}>
              Already have an account? <Link href="/login" className={styles.link}>Login here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}