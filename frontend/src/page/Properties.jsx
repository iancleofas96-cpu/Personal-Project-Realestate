import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarLayout from './sidebar';
import '../css/properties.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function Properties() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [stats, setStats] = React.useState(null);
    const [filters, setFilters] = React.useState({
        search: '',
        status: '',
        listing_type: '',
        property_type: '',
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 1
    });

    // Check if we're viewing/editing a specific property
    const isViewingProperty = !!id;
    const isEditingProperty = window.location.pathname.endsWith('/edit');

    const fetchProperties = React.useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        fetch(`${API_URL}/properties?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        })
            .then(res => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    throw new Error('Session expired');
                }
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                return res.json();
            })
            .then(data => {
                setProperties(data.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [filters, navigate]);

    const fetchStats = React.useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch(`${API_URL}/properties/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch statistics');
                return res.json();
            })
            .then(data => setStats(data.data))
            .catch(err => console.error('Stats error:', err));
    }, []);

    React.useEffect(() => {
        fetchProperties();
        fetchStats();
    }, [fetchProperties, fetchStats]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            status: '',
            listing_type: '',
            property_type: '',
            sort_by: 'created_at',
            sort_order: 'desc',
            page: 1
        });
    };

    const handlePageChange = (newPage) => {
        if (!newPage) return;
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleDeleteProperty = async (propertyId) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/properties/${propertyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (!res.ok) throw new Error('Failed to delete property');
            fetchProperties();
            fetchStats();
        } catch (err) {
            alert('Error deleting property: ' + err.message);
        }
    };

    if (loading) {
        return (
            <SidebarLayout>
                <div className="properties-container">
                    <h1 className="properties-title">Properties</h1>
                    <div className="properties-loading">Loading properties...</div>
                </div>
            </SidebarLayout>
        );
    }

    if (error) {
        return (
            <SidebarLayout>
                <div className="properties-container">
                    <h1 className="properties-title">Properties</h1>
                    <div className="properties-error">Error: {error}</div>
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <div className="properties-container">

                {/* Header */}
                <div className="properties-header">
                    <h1 className="properties-title">Properties</h1>
                    <button
                        onClick={() => navigate('/properties/add')}
                        className="add-property-btn"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add Property
                    </button>
                </div>

                {/* Stat Cards */}
                {stats && (
                    <div className="properties-stats">
                        <div className="stat-card total-properties">
                            <h3>Total Properties</h3>
                            <p>{stats.total_properties}</p>
                        </div>
                        <div className="stat-card available-properties">
                            <h3>Available</h3>
                            <p>{stats.available_properties}</p>
                        </div>
                        <div className="stat-card sold-properties">
                            <h3>Sold</h3>
                            <p>{stats.sold_properties}</p>
                        </div>
                        <div className="stat-card total-value">
                            <h3>Total Value</h3>
                            <p>₱{Number(stats.total_value).toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="properties-filters">
                    <h2>Filters</h2>
                    <div className="filters-row">
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search properties..."
                            className="filter-input"
                        />
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="reserved">Reserved</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select name="listing_type" value={filters.listing_type} onChange={handleFilterChange} className="filter-select">
                            <option value="">All Types</option>
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                        </select>
                        <select name="property_type" value={filters.property_type} onChange={handleFilterChange} className="filter-select">
                            <option value="">Property Type</option>
                            <option value="house">House</option>
                            <option value="condo">Condo</option>
                            <option value="apartment">Apartment</option>
                            <option value="lot">Lot</option>
                            <option value="commercial">Commercial</option>
                        </select>
                        <button onClick={resetFilters} className="filter-btn">Reset</button>
                    </div>
                </div>

                {/* Properties Section */}
                <div className="properties-section">
                    <div className="section-header">
                        <h2>All Properties</h2>
                        <span className="properties-count">
                            {properties.total ?? properties.data?.length ?? 0} properties
                        </span>
                    </div>

                    {!properties.data?.length ? (
                        <div className="properties-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            <h3>No properties found</h3>
                            <p>Click "Add Property" to create your first listing.</p>
                            <button onClick={() => navigate('/properties/add')} className="btn">
                                Add Your First Property
                            </button>
                        </div>
                    ) : (
                        <div className="properties-grid">
                            {properties.data.map(property => (
                                <div
                                    key={property.id}
                                    className="property-card"
                                    onClick={() => navigate(`/properties/${property.id}`)}
                                >
                                    {/* Image */}
                                    <div className="property-image">
                                        {property.images && property.images.length > 0 ? (
                                            <img 
                                                src={`/storage/app/public/${property.images[0].image_path}`} 
                                                alt={property.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <svg className="property-image-placeholder" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                                <polyline points="21 15 16 10 5 21"/>
                                            </svg>
                                        )}
                                        <div className={`property-status ${property.status}`}>
                                            {property.status}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="property-details">
                                        <h3 className="property-title">{property.title}</h3>
                                        <p className="property-address">
                                            {property.address || 'No address provided'}
                                        </p>

                                        <div className="property-price-row">
                                            <span className="property-price">
                                                ₱{Number(property.price).toLocaleString()}
                                            </span>
                                            <span className="property-listing-type">
                                                {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                                            </span>
                                        </div>

                                        <div className="property-features">
                                            {property.bedrooms && <span>🛏 {property.bedrooms} bed</span>}
                                            {property.bathrooms && <span>🚿 {property.bathrooms} bath</span>}
                                            {property.floor_area && <span>📐 {property.floor_area} sqm</span>}
                                        </div>

                                        <div className="property-actions">
                                            <button
                                                className="property-action-btn edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/properties/${property.id}/edit`);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="property-action-btn delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProperty(property.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {properties.last_page > 1 && (
                        <div className="properties-pagination">
                            <button
                                className="pagination-btn"
                                disabled={!properties.prev_page_url}
                                onClick={() => handlePageChange(filters.page - 1)}
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {properties.current_page} of {properties.last_page}
                            </span>
                            <button
                                className="pagination-btn"
                                disabled={!properties.next_page_url}
                                onClick={() => handlePageChange(filters.page + 1)}
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

export default Properties;