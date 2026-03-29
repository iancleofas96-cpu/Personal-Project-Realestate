import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from './sidebar';
import '../css/dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function AuditLogs() {
    const navigate = useNavigate();
    const [logs, setLogs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [stats, setStats] = React.useState(null);
    const [filters, setFilters] = React.useState({
        module: '',
        date_from: '',
        date_to: '',
        user_id: '',
        page: 1
    });

    // Fetch activity logs and statistics
    React.useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        // Fetch logs
        fetch(`${API_URL}/activity-logs?module=${filters.module}&date_from=${filters.date_from}&date_to=${filters.date_to}&user_id=${filters.user_id}&page=${filters.page}`, {
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
                    throw new Error('Failed to fetch audit logs');
                }
                return response.json();
            })
            .then(data => {
                setLogs(data.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });

        // Fetch statistics
        fetch(`${API_URL}/activity-logs/stats`, {
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
                    throw new Error('Failed to fetch statistics');
                }
                return response.json();
            })
            .then(data => {
                setStats(data.data);
            })
            .catch(err => {
                console.error('Failed to fetch statistics:', err);
            });
    }, [navigate, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Reset to first page when filter changes
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const resetFilters = () => {
        setFilters({
            module: '',
            date_from: '',
            date_to: '',
            user_id: '',
            page: 1
        });
    };

    if (loading) {
        return (
            <SidebarLayout>
                <div className="dashboard-container">
                    <h1 className="dashboard-title">Audit Logs</h1>
                    <div className="loading-message">Loading audit logs...</div>
                </div>
            </SidebarLayout>
        );
    }

    if (error) {
        return (
            <SidebarLayout>
                <div className="dashboard-container">
                    <h1 className="dashboard-title">Audit Logs</h1>
                    <div className="error-message">Error: {error}</div>
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="dashboard-container">
                <h1 className="dashboard-title">Audit Logs</h1>
                
                {/* Statistics Cards */}
                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card total-properties">
                            <h3>Total Logs</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total_logs}</p>
                        </div>
                        <div className="stat-card active-listings">
                            <h3>Today</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.today_logs}</p>
                        </div>
                        <div className="stat-card sold-month">
                            <h3>This Week</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.this_week_logs}</p>
                        </div>
                        <div className="stat-card revenue">
                            <h3>This Month</h3>
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.this_month_logs}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="recent-properties" style={{ marginBottom: '20px' }}>
                    <h2>Filters</h2>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <select
                            value={filters.module}
                            onChange={handleFilterChange}
                            name="module"
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">All Modules</option>
                            {stats?.by_module?.map(module => (
                                <option key={module.module} value={module.module}>
                                    {module.module} ({module.count})
                                </option>
                            ))}
                        </select>
                        
                        <input
                            type="date"
                            value={filters.date_from}
                            onChange={handleFilterChange}
                            name="date_from"
                            placeholder="From Date"
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '14px'
                            }}
                        />
                        
                        <input
                            type="date"
                            value={filters.date_to}
                            onChange={handleFilterChange}
                            name="date_to"
                            placeholder="To Date"
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '14px'
                            }}
                        />
                        
                        <button
                            onClick={resetFilters}
                            style={{
                                padding: '8px 16px',
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Activity Logs Table */}
                <div className="recent-properties">
                    <h2>Activity Logs</h2>
                    <table className="properties-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Module</th>
                                <th>Description</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data?.map(log => (
                                <tr key={log.id}>
                                    <td>
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td>{log.user?.name || 'System'}</td>
                                    <td>
                                        <span className={`status-badge ${
                                            log.action === 'created' ? 'available' : 
                                            log.action === 'updated' ? 'sold' : 
                                            log.action === 'deleted' ? 'sold' : 
                                            log.action === 'error' ? 'sold' : 'available'
                                        }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.module}</td>
                                    <td>{log.description}</td>
                                    <td>{log.ip_address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {logs.links && (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '10px', 
                            marginTop: '20px' 
                        }}>
                            <button
                                onClick={() => handlePageChange(logs.links.prev)}
                                disabled={!logs.links.prev}
                                style={{
                                    padding: '8px 16px',
                                    background: logs.links.prev ? '#007bff' : '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: logs.links.prev ? 'pointer' : 'not-allowed',
                                    fontSize: '14px'
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ padding: '8px 16px' }}>
                                Page {logs.current_page} of {logs.last_page}
                            </span>
                            <button
                                onClick={() => handlePageChange(logs.links.next)}
                                disabled={!logs.links.next}
                                style={{
                                    padding: '8px 16px',
                                    background: logs.links.next ? '#007bff' : '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: logs.links.next ? 'pointer' : 'not-allowed',
                                    fontSize: '14px'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}

export default AuditLogs;
