import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from './sidebar';
import '../css/properties.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function AddProperty() {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [completedSections, setCompletedSections] = React.useState({
        basic: false,
        location: false,
        details: false,
        images: false
    });
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        property_type: 'house',
        listing_type: 'sale',
        price: '',
        lot_area: '',
        floor_area: '',
        bedrooms: '',
        bathrooms: '',
        parking_spaces: '',
        address: '',
        city: '',
        province: '',
        zip_code: '',
        latitude: '',
        longitude: '',
        status: 'available',
        listed_date: new Date().toISOString().split('T')[0],
        images: []
    });

    const propertyTypes = [
        { value: 'house', label: 'House' },
        { value: 'condo', label: 'Condo' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'lot', label: 'Lot' },
        { value: 'commercial', label: 'Commercial' }
    ];

    const listingTypes = [
        { value: 'sale', label: 'For Sale' },
        { value: 'rent', label: 'For Rent' }
    ];

    const statusOptions = [
        { value: 'available', label: 'Available' },
        { value: 'sold', label: 'Sold' },
        { value: 'reserved', label: 'Reserved' },
        { value: 'pending', label: 'Pending' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        
        if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? '' : parseFloat(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // Check and update progress sections
    const updateProgress = React.useCallback(() => {
        const basicCompleted = formData.title && formData.property_type && formData.listing_type && formData.price;
        const locationCompleted = formData.address && formData.city && formData.province;
        const detailsCompleted = formData.lot_area || formData.floor_area || formData.bedrooms || formData.bathrooms || formData.parking_spaces;
        const imagesCompleted = formData.images && formData.images.length > 0;

        setCompletedSections({
            basic: basicCompleted,
            location: locationCompleted,
            details: detailsCompleted,
            images: imagesCompleted
        });
    }, [formData]);

    // Update progress whenever formData changes
    React.useEffect(() => {
        updateProgress();
    }, [formData, updateProgress]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Check if ALL sections are completed
        const allSections = ['basic', 'location', 'details', 'images'];
        const incompleteSections = allSections.filter(section => !completedSections[section]);
        
        if (incompleteSections.length > 0) {
            setError(`Please complete all sections: ${incompleteSections.join(', ')}`);
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const formDataToSend = new FormData();
            
            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'images') {
                    formDataToSend.append(key, value);
                }
            });

            // Add images
            formData.images.forEach((image, index) => {
                formDataToSend.append(`images[${index}]`, image);
            });

            const response = await fetch(`${API_URL}/properties`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const errorMessage = Object.values(data.errors).flat().join(', ');
                    throw new Error(errorMessage);
                }
                throw new Error(data.message || 'Failed to create property');
            }

            setSuccess('Property created successfully!');
            
            // Redirect to properties page after 2 seconds
            setTimeout(() => {
                navigate('/properties');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/properties');
    };

    return (
        <SidebarLayout>
            <div className="properties-container">
                <div className="add-property-form">
                    {/* Form Header */}
                    <div className="form-header">
                        <div className="form-header-icon">
                            🏠
                        </div>
                        <h1>Add New Property</h1>
                        <p>List your property and reach potential buyers or renters</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="form-progress">
                        <div className={`progress-step ${completedSections.basic ? 'completed' : 'active'}`}>
                            <div className="step-number">
                                {completedSections.basic ? '✓' : '1'}
                            </div>
                            <div className="step-label">Basic Info</div>
                        </div>
                        <div className={`progress-step ${completedSections.location ? 'completed' : completedSections.basic ? 'active' : ''}`}>
                            <div className="step-number">
                                {completedSections.location ? '✓' : '2'}
                            </div>
                            <div className="step-label">Location</div>
                        </div>
                        <div className={`progress-step ${completedSections.details ? 'completed' : completedSections.location ? 'active' : ''}`}>
                            <div className="step-number">
                                {completedSections.details ? '✓' : '3'}
                            </div>
                            <div className="step-label">Details</div>
                        </div>
                        <div className={`progress-step ${completedSections.images ? 'completed' : completedSections.details ? 'active' : ''}`}>
                            <div className="step-number">
                                {completedSections.images ? '✓' : '4'}
                            </div>
                            <div className="step-label">Images</div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <div>
                                <strong>Success!</strong> Property added successfully.
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-sections">
                            {/* Basic Information Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div>
                                        <h3 className="section-title">Basic Information</h3>
                                        <p className="section-subtitle">Tell us about your property</p>
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label required">Property Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="e.g., Modern Condo in Makati"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label required">Property Type</label>
                                        <select
                                            name="property_type"
                                            value={formData.property_type}
                                            onChange={handleInputChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="">Select Property Type</option>
                                            <option value="house">House</option>
                                            <option value="condo">Condo</option>
                                            <option value="apartment">Apartment</option>
                                            <option value="lot">Lot</option>
                                            <option value="commercial">Commercial</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label required">Listing Type</label>
                                        <select
                                            name="listing_type"
                                            value={formData.listing_type}
                                            onChange={handleInputChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="">Select Listing Type</option>
                                            <option value="sale">For Sale</option>
                                            <option value="rent">For Rent</option>
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label required">Price</label>
                                        <div className="form-input-with-icon">
                                            <span className="form-input-icon">₱</span>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="form-select"
                                        >
                                            <option value="available">Available</option>
                                            <option value="sold">Sold</option>
                                            <option value="reserved">Reserved</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Listed Date</label>
                                        <input
                                            type="date"
                                            name="listed_date"
                                            value={formData.listed_date}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="form-textarea"
                                            placeholder="Describe your property's features, amenities, and highlights..."
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div>
                                        <h3 className="section-title">Location</h3>
                                        <p className="section-subtitle">Where is your property located?</p>
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label required">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="Street address"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label required">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="e.g., Makati City"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label required">Province</label>
                                        <input
                                            type="text"
                                            name="province"
                                            value={formData.province}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="e.g., Metro Manila"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">ZIP Code</label>
                                        <input
                                            type="text"
                                            name="zip_code"
                                            value={formData.zip_code}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="e.g., 1200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Property Details Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div>
                                        <h3 className="section-title">Property Details</h3>
                                        <p className="section-subtitle">Specifications and features</p>
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Lot Area (sqm)</label>
                                        <input
                                            type="number"
                                            name="lot_area"
                                            value={formData.lot_area}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="0"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Floor Area (sqm)</label>
                                        <input
                                            type="number"
                                            name="floor_area"
                                            value={formData.floor_area}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Bedrooms</label>
                                        <input
                                            type="number"
                                            name="bedrooms"
                                            value={formData.bedrooms}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Bathrooms</label>
                                        <input
                                            type="number"
                                            name="bathrooms"
                                            value={formData.bathrooms}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Parking Spaces</label>
                                        <input
                                            type="number"
                                            name="parking_spaces"
                                            value={formData.parking_spaces}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div>
                                        <h3 className="section-title">Property Images</h3>
                                        <p className="section-subtitle">Showcase your property with photos</p>
                                    </div>
                                </div>
                                
                                <div className="image-upload-area" onClick={() => document.getElementById('image-upload').click()}>
                                    <div className="upload-icon">📷</div>
                                    <div className="upload-text">Click to upload or drag and drop</div>
                                    <div className="upload-subtext">PNG, JPG, GIF up to 10MB each</div>
                                    <div className="upload-button">Choose Files</div>
                                    <input
                                        type="file"
                                        id="image-upload"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {formData.images.length > 0 && (
                                    <div className="image-preview">
                                        {formData.images.map((image, index) => (
                                            <div key={index} className="image-preview-item">
                                                <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="image-remove"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn-cancel"
                            >
                                <span>←</span>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        Adding Property...
                                    </>
                                ) : (
                                    <>
                                        <span>+</span>
                                        Add Property
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}

export default AddProperty;
