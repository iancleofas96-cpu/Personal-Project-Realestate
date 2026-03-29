import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from './sidebar';
import '../css/dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [successMessage, setSuccessMessage] = React.useState('');
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
    });

    // Fetch user profile
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        fetch(`${API_URL}/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        })
            .then(response => {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    throw new Error('Session expired');
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                return response.json();
            })
            .then(data => {
                setUser(data.user);
                setFormData({
                    name: data.user.name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                });
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_URL}/user`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setUser(data.user);
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
        setIsEditing(false);
        setError('');
        setSuccessMessage('');
    };

    if (loading) {
        return (
            <SidebarLayout>
                <div className="dashboard-container">
                    <h1 className="dashboard-title">Profile</h1>
                    <div className="loading-message">Loading profile...</div>
                </div>
            </SidebarLayout>
        );
    }

    if (error) {
        return (
            <SidebarLayout>
                <div className="dashboard-container">
                    <h1 className="dashboard-title">Profile</h1>
                    <div className="error-message">Error: {error}</div>
                </div>
            </SidebarLayout>
        );
    }

    if (!user) {
        return (
            <SidebarLayout>
                <div className="dashboard-container">
                    <h1 className="dashboard-title">Profile</h1>
                    <div className="error-message">User not found</div>
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="dashboard-container">
                <h1 className="dashboard-title">Profile</h1>
                
                {/* Success Message */}
                {successMessage && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#d4edda',
                        color: '#155724',
                        border: '1px solid #c3e6cb',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {successMessage}
                    </div>
                )}

                {/* Profile Card */}
                <div className="recent-properties">
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '30px' 
                    }}>
                        <h2 style={{ margin: 0 }}>Profile Information</h2>
                        {!isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                style={{
                                    padding: '8px 16px',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter your name"
                                        required
                                    />
                                ) : (
                                    <div className="form-value">{user.name}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter your email"
                                        required
                                    />
                                ) : (
                                    <div className="form-value">{user.email}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter your phone number"
                                    />
                                ) : (
                                    <div className="form-value">{user.phone || 'Not provided'}</div>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div style={{ 
                                display: 'flex', 
                                gap: '10px', 
                                marginTop: '20px' 
                            }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        background: loading ? '#6c757d' : '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        marginRight: '10px'
                                    }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}

export default Profile;
