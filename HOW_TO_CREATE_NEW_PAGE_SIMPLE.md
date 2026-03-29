# How to Create a New Page - Step by Step

This guide shows you exactly how to add a new page to your Real Estate Tracker app.

---

## Example: Creating a "Properties" Page

### Step 1: Create the API Endpoint in Laravel

Open `backend/routes/api.php` and add your new route:

```php
// Add this at the bottom of the file
Route::get('/properties', function () {
    return response()->json([
        'properties' => [
            ['id' => 1, 'name' => 'Modern Condo', 'price' => 3500000, 'location' => 'Manila'],
            ['id' => 2, 'name' => 'Family House', 'price' => 5000000, 'location' = 'Quezon City'],
            ['id' => 3, 'name' => 'Studio Unit', 'price' => 1800000, 'location' = 'Makati'],
        ]
    ]);
});
```

**What this does:**
- Creates a new URL: `http://127.0.0.1:8000/api/properties`
- Returns sample property data as JSON

---

### Step 2: Create the React Component

Create a new file: `frontend/src/page/properties.jsx`

```jsx
import React from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function Properties() {
    // State to store data from API
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch data when component loads
    React.useEffect(() => {
        fetch(`${API_URL}/properties`)
            .then(response => response.json())
            .then(data => {
                setProperties(data.properties);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false);
            });
    }, []);

    // Show loading message
    if (loading) {
        return <div style={{ padding: '20px' }}>Loading properties...</div>;
    }

    // Show the actual page
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Properties</h1>
            
            <div style={{ display: 'grid', gap: '15px' }}>
                {properties.map(property => (
                    <div key={property.id} style={{
                        padding: '15px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <h3>{property.name}</h3>
                        <p><strong>Price:</strong> ₱{property.price.toLocaleString()}</p>
                        <p><strong>Location:</strong> {property.location}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Properties;
```

**What this does:**
- Creates a React component called Properties
- Fetches data from `/api/properties` when page loads
- Displays properties in a nice grid layout

---

### Step 3: Add the Route

Open `frontend/src/main.jsx` and add your new route:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './page/app.jsx'
import Dashboard from './page/dashboard.jsx'
import Login from './page/login.jsx'
import Register from './page/register.jsx'
import Properties from './page/properties.jsx'  // <-- ADD THIS LINE

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />  // <-- ADD THIS LINE
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
```

**What this does:**
- Imports your new Properties component
- Creates a new URL: `http://localhost:5174/properties`

---

### Step 4: Add Navigation Link

Open any page (like `app.jsx`) and add a link to your new page:

```jsx
import { Link } from 'react-router-dom';

// In your JSX, add this navigation:
<nav style={{ marginBottom: '20px' }}>
    <Link to="/home" style={{ marginRight: '15px' }}>Home</Link>
    <Link to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</Link>
    <Link to="/properties" style={{ marginRight: '15px' }}>Properties</Link>
    <Link to="/login" style={{ marginRight: '15px' }}>Login</Link>
    <Link to="/register">Register</Link>
</nav>
```

**What this does:**
- Adds a clickable link to your Properties page

---

## That's It! Your New Page is Ready

Now you can:
1. Go to `http://localhost:5174/properties`
2. See your new page with data from the backend
3. Navigate to it using the link

---

## Quick Template for Any New Page

### 1. API Route (backend/routes/api.php):
```php
Route::get('/your-page', function () {
    return response()->json([
        'data' => 'your data here'
    ]);
});
```

### 2. React Component (frontend/src/page/your-page.jsx):
```jsx
import React from 'react';
const API_URL = import.meta.env.VITE_API_URL;

function YourPage() {
    const [data, setData] = React.useState(null);
    
    React.useEffect(() => {
        fetch(`${API_URL}/your-page`)
            .then(res => res.json())
            .then(setData);
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Your Page</h1>
            <p>{data?.data}</p>
        </div>
    );
}

export default YourPage;
```

### 3. Add Route (frontend/src/main.jsx):
```jsx
import YourPage from './page/your-page.jsx';
// Add: <Route path="/your-page" element={<YourPage />} />
```

### 4. Add Navigation Link:
```jsx
<Link to="/your-page">Your Page</Link>
```

---

## Files You Need to Edit

| What you want to do | Which file to edit |
|---------------------|-------------------|
| Add new API endpoint | `backend/routes/api.php` |
| Create new page | `frontend/src/page/your-page.jsx` |
| Add route for page | `frontend/src/main.jsx` |
| Add navigation link | Any page component (like `app.jsx`) |

---

## Common Mistakes to Avoid

1. **Forgot to import component** in `main.jsx`
2. **Wrong file path** - make sure files are in `frontend/src/page/`
3. **Forgot export default** at the end of your component
4. **Wrong API URL** - use `${API_URL}/your-endpoint`
5. **Forgot to add Link** from `react-router-dom`

---

## Test Your New Page

1. Start both servers:
   ```bash
   # Terminal 1
   cd backend && php artisan serve
   
   # Terminal 2  
   cd frontend && npm run dev
   ```

2. Go to your new page: `http://localhost:5174/your-page`

3. Check browser console for errors (F12 → Console)

That's all you need to create unlimited new pages!
