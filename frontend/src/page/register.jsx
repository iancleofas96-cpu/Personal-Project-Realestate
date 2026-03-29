import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/register.css';

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate passwords match
        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle validation errors
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join(', ');
                    throw new Error(errorMessages);
                }
                throw new Error(data.message || 'Registration failed');
            }

            // Save token to localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-logo">
                    <svg viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>
                </div>
                <h1 className="register-title">Create account</h1>
                <p className="register-subtitle">Sign up to get started with your dashboard</p>

                {error && <div className="register-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="register-form-group">
                        <label htmlFor="name" className="register-label">Name</label>
                        <input
                            id="name" type="text" name="name"
                            value={formData.name} onChange={handleChange}
                            required placeholder="John Doe"
                            autoComplete="name" className="register-input"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="email" className="register-label">Email</label>
                        <input
                            id="email" type="email" name="email"
                            value={formData.email} onChange={handleChange}
                            required placeholder="you@example.com"
                            autoComplete="email" className="register-input"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="phone" className="register-label">Phone (optional)</label>
                        <input
                            id="phone" type="tel" name="phone"
                            value={formData.phone} onChange={handleChange}
                            placeholder="+63 912 345 6789"
                            autoComplete="tel" className="register-input"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="password" className="register-label">Password</label>
                        <input
                            id="password" type="password" name="password"
                            value={formData.password} onChange={handleChange}
                            required placeholder="•••••••••"
                            autoComplete="new-password" className="register-input"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="password_confirmation" className="register-label">Confirm Password</label>
                        <input
                            id="password_confirmation" type="password" name="password_confirmation"
                            value={formData.password_confirmation} onChange={handleChange}
                            required placeholder="•••••••••"
                            autoComplete="new-password" className="register-input"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="register-button">
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <div className="register-divider"><span>or</span></div>

                <button className="register-google" type="button">
                    {/* Google SVG icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>

                <p className="register-footer">
                    Already have an account? <Link to="/login" className="register-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
