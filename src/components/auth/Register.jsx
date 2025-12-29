'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/Login.module.css';

export default function Register({ onSwitchToLogin, onClose }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        customerType: 'residential',
        role: 'customer', // ✅ added role
        agreeToTerms: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();

    const states = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
        'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
        'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
        'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
        'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
        'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
        'FCT Abuja'
    ];

    // Disable customer type if role is superAdmin
    useEffect(() => {
        if (formData.role === 'superAdmin') {
            setFormData(prev => ({ ...prev, customerType: null }));
        } else if (!formData.customerType) {
            setFormData(prev => ({ ...prev, customerType: 'residential' }));
        }
    }, [formData.role]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (!formData.agreeToTerms) {
            setError('Please agree to the terms and conditions');
            setLoading(false);
            return;
        }

        const userData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            streetAddress: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            customerType: formData.customerType,
            role: formData.role // ✅ include role
        };

        try {
            const result = await register(userData);

       if (result.success) {
    onClose?.();       // closes the modal
    onSwitchToLogin(); // redirects to login
} else {
    setError(result.error || 'Registration failed. Please try again.');
}

        } catch (err) {
            console.error('Unexpected register error:', err);
            setError('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authModal}>
            <div className={styles.authContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    <i className="bi bi-x-lg"></i>
                </button>

                <div className={styles.authHeader}>
                    <i className="bi bi-person-plus"></i>
                    <h2>Create Account</h2>
                    <p>Join thousands of satisfied customers</p>
                </div>

                {error && (
                    <div className={`alert alert-danger ${styles.alert}`}>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <div className={styles.inputGroup}>
                                <i className="bi bi-person"></i>
                                <input type="text" className="form-control" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <div className={styles.inputGroup}>
                                <i className="bi bi-person"></i>
                                <input type="text" className="form-control" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <div className={styles.inputGroup}>
                            <i className="bi bi-envelope"></i>
                            <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <div className={styles.inputGroup}>
                            <i className="bi bi-phone"></i>
                            <input type="tel" className="form-control" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+234..." />
                        </div>
                    </div>

                    {/* Customer Type */}
                    <div className="mb-3">
                        <label className="form-label">Customer Type</label>
                        <div className="row">
                            <div className="col-6">
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="customerType" id="residential" value="residential" checked={formData.customerType === 'residential'} onChange={handleChange} disabled={formData.role === 'superAdmin'} />
                                    <label className="form-check-label" htmlFor="residential">Residential</label>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="customerType" id="commercial" value="commercial" checked={formData.customerType === 'commercial'} onChange={handleChange} disabled={formData.role === 'superAdmin'} />
                                    <label className="form-check-label" htmlFor="commercial">Commercial</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select 
                            className="form-select" 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="customer">Customer</option>
                            <option value="superAdmin">Super Admin</option>
                        </select>
                    </div>

                    {/* Address, Password, and Terms remain the same */}
                    <div className="mb-3">
                        <label htmlFor="street" className="form-label">Street Address</label>
                        <input type="text" className="form-control" id="street" name="street" value={formData.street} onChange={handleChange} required />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="city" className="form-label">City</label>
                            <input type="text" className="form-control" id="city" name="city" value={formData.city} onChange={handleChange} required />
                        </div>

                        <div className="col-md-3 mb-3">
                            <label htmlFor="state" className="form-label">State</label>
                            <select className="form-select" id="state" name="state" value={formData.state} onChange={handleChange} required>
                                <option value="">Select</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3 mb-3">
                            <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                            <input type="text" className="form-control" id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className={styles.inputGroup}>
                                <i className="bi bi-lock"></i>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                />
                                <i
                                    className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} ${styles.eyeIcon}`}
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: 'pointer' }}
                                ></i>
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <div className={styles.inputGroup}>
                                <i className="bi bi-lock"></i>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="form-control"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <i
                                    className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} ${styles.eyeIcon}`}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ cursor: 'pointer' }}
                                ></i>
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} required />
                            <label className="form-check-label" htmlFor="agreeToTerms">
                                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className={`btn btn-primary w-100 ${styles.authButton}`} disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        Already have an account?{' '}
                        <button className={styles.switchLink} onClick={onSwitchToLogin}>
                            Sign in here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
