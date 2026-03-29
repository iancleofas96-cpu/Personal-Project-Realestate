import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from './sidebar';
import '../css/dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function Dashboard() {
    const navigate = useNavigate();
    // Step 2a: State para sa data mula sa backend
    const [dashboardData, setDashboardData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Step 2b: Fetch data mula sa Laravel API with JWT token
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        fetch(`${API_URL}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        })
            .then(response => {
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    throw new Error('Session expired');
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }
                return response.json();
            })
            .then(data => {
                setDashboardData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [navigate]);

    // Step 2c: Display loading state
    if (loading) {
        return (
            <SidebarLayout>
                <div className="dashboard-container">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <div className="loading-message">Loading data from backend...</div>
                </div>
            </SidebarLayout>
        );
    }

    // Step 2d: Display error state
    if (error) {
        return (
            <SidebarLayout>
                <div className="dashboard-container">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <div className="error-message">Error: {error}</div>
                </div>
            </SidebarLayout>
        );
    }

    // Step 2e: Display data mula sa backend
    return (
        <SidebarLayout>
            <div className="dashboard-container">
                <h1 className="dashboard-title">Dashboard</h1>
                
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card total-properties">
                        <h3>Total Properties</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{dashboardData.total_properties}</p>
                    </div>
                    <div className="stat-card active-listings">
                        <h3>Active Listings</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{dashboardData.active_listings}</p>
                    </div>
                    <div className="stat-card sold-month">
                        <h3>Sold This Month</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{dashboardData.sold_this_month}</p>
                    </div>
                    <div className="stat-card revenue">
                        <h3>Revenue</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₱{dashboardData.revenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Recent Properties Table */}
                <div className="recent-properties">
                    <h2>Recent Properties</h2>
                    <table className="properties-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.recent_properties.map(property => (
                                <tr key={property.id}>
                                    <td>{property.id}</td>
                                    <td>{property.name}</td>
                                    <td>₱{property.price.toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${property.status === 'available' ? 'available' : 'sold'}`}>
                                            {property.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SidebarLayout>
    );
}

export default Dashboard;