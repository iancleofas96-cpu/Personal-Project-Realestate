# How to Create a New Page Connected to Laravel Backend

This guide explains how to create a new page in React that fetches data from the Laravel API.

---

## Step 1: Create API Endpoint in Laravel

Open `backend/routes/api.php` and add a new route:

```php
Route::get('/your-endpoint', function () {
    return response()->json([
        'key' => 'value',
        'data' => [
            ['id' => 1, 'name' => 'Item 1'],
            ['id' => 2, 'name' => 'Item 2'],
        ]
    ]);
});
```

Test the endpoint in browser or terminal:
```
http://127.0.0.1:8000/api/your-endpoint
```

---

## Step 2: Create React Component

Create a new file in `frontend/src/page/your-page.jsx`:

```jsx
import React from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function YourPage() {
    // State for data, loading, and error
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Fetch data from API when component loads
    React.useEffect(() => {
        fetch(`${API_URL}/your-endpoint`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    // Show loading state
    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }

    // Show error state
    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
    }

    // Show data
    return (
        <div style={{ padding: '20px' }}>
            <h1>Your Page Title</h1>
            <p>{data.key}</p>
            <ul>
                {data.data.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default YourPage;
```

---

## Step 3: Add Route in main.jsx

Open `frontend/src/main.jsx` and add the route:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import YourPage from './page/your-page.jsx'

// Inside the Routes component:
<Routes>
    <Route path="/" element={<App />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/your-page" element={<YourPage />} />
</Routes>
```

---

## Step 4: Add Navigation Link

Add a link to navigate to your new page:

```jsx
import { Link } from 'react-router-dom';

// In your navigation:
<Link to="/your-page">Your Page</Link>
```

---

## File Structure

```
frontend/
  src/
    main.jsx           --> Entry point with routing
    page/
      app.jsx          --> Home page
      dashboard.jsx    --> Dashboard page
      your-page.jsx    --> Your new page

backend/
  routes/
    api.php            --> API endpoints
```

---

## Quick Reference

| Task | File | What to do |
|------|------|------------|
| Create API endpoint | `backend/routes/api.php` | Add `Route::get('/endpoint', ...)` |
| Create page component | `frontend/src/page/*.jsx` | Create component with fetch |
| Add route | `frontend/src/main.jsx` | Add `<Route path="..." />` |
| Add navigation | Any component | Add `<Link to="...">` |

---

## API URL

The API URL is defined in `frontend/.env`:
```
VITE_API_URL=/api
```

Use it in components:
```jsx
const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/your-endpoint`)
```

---

## Running the Application

Terminal 1 (Laravel):
```
cd backend
php artisan serve
```

Terminal 2 (React):
```
cd frontend
npm run dev
```

Access the app at: http://localhost:5173
