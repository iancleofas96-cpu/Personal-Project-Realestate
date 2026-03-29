# Real Estate Tracker - How It Works

This document explains the complete workflow of the Real Estate Tracker application.

---

## Architecture Overview

```
┌─────────────────┐    API Calls     ┌─────────────────┐
│   React App     │ ───────────────► │  Laravel API    │
│  (Frontend)     │                  │   (Backend)     │
│  Port 5174      │                  │   Port 8000     │
└─────────────────┘                  └─────────────────┘
         │                                   │
         │                                   ▼
         │                          ┌─────────────────┐
         │                          │ PostgreSQL DB   │
         │                          │  (Users, etc.)  │
         │                          └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Browser      │
│   (User sees)  │
└─────────────────┘
```

---

## Data Flow: User Registration

```
1. User fills registration form (React)
   ↓
2. React sends POST request to /api/register
   ↓
3. Laravel validates data and creates user in database
   ↓
4. Laravel generates authentication token
   ↓
5. Laravel returns user data + token to React
   ↓
6. React saves token to localStorage
   ↓
7. React redirects user to dashboard
```

---

## Data Flow: User Login

```
1. User enters email/password (React)
   ↓
2. React sends POST request to /api/login
   ↓
3. Laravel verifies credentials against database
   ↓
4. Laravel generates authentication token
   ↓
5. Laravel returns user data + token to React
   ↓
6. React saves token to localStorage
   ↓
7. React redirects user to dashboard
```

---

## Data Flow: Protected Routes

```
1. User tries to access dashboard (React)
   ↓
2. React checks if token exists in localStorage
   ↓
3. If token exists, React shows dashboard
   ↓
4. Dashboard makes API calls with token in headers
   ↓
5. Laravel validates token using Sanctum
   ↓
6. If valid, Laravel returns requested data
   ↓
7. React displays data to user
```

---

## File Structure and Responsibilities

### Frontend (React)
```
frontend/
├── src/
│   ├── main.jsx           # App entry point, routing setup
│   ├── page/
│   │   ├── app.jsx        # Home page (now /home)
│   │   ├── login.jsx      # Login form and logic
│   │   ├── register.jsx   # Registration form and logic
│   │   └── dashboard.jsx  # Dashboard with data display
│   └── index.css          # Global styles
├── .env                   # Environment variables (API URL)
└── vite.config.ts         # Vite configuration, API proxy
```

**Responsibilities:**
- Display user interface
- Handle user input and forms
- Make HTTP requests to backend
- Store authentication tokens
- Navigate between pages

### Backend (Laravel)
```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── AuthController.php  # Auth logic
│   └── Models/
│       └── User.php               # User model with Sanctum
├── routes/
│   └── api.php                    # API routes
├── database/
│   └── migrations/                # Database schema
└── config/
    └── database.php               # Database connection
```

**Responsibilities:**
- Handle HTTP requests
- Validate user input
- Authenticate users
- Interact with database
- Return JSON responses

---

## Key Technologies

### Frontend
- **React**: UI framework
- **React Router**: Page navigation
- **Vite**: Build tool and dev server
- **JavaScript**: Programming language

### Backend
- **Laravel**: PHP framework
- **Sanctum**: API authentication
- **PostgreSQL**: Database
- **PHP**: Programming language

---

## API Endpoints

| Method | Endpoint | Description | Protected? |
|--------|----------|-------------|------------|
| GET | /api/test | Test connection | No |
| GET | /api/dashboard | Dashboard data | No (for demo) |
| POST | /api/register | Create user | No |
| POST | /api/login | Authenticate user | No |
| POST | /api/logout | Logout user | Yes |
| GET | /api/user | Get current user | Yes |

---

## Authentication Flow

### 1. Registration
```javascript
// React sends this data to Laravel
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "password123",
    "password_confirmation": "password123"
}

// Laravel responds with
{
    "status": "success",
    "message": "User registered successfully",
    "user": { /* user data */ },
    "token": "abc123token456"
}
```

### 2. Login
```javascript
// React sends this data to Laravel
{
    "email": "john@example.com",
    "password": "password123"
}

// Laravel responds with
{
    "status": "success",
    "message": "Login successful",
    "user": { /* user data */ },
    "token": "abc123token456"
}
```

### 3. Protected Requests
```javascript
// React includes token in headers
fetch('/api/user', {
    headers: {
        'Authorization': 'Bearer abc123token456'
    }
})
```

---

## Database Schema

### Users Table
```sql
- id (primary key)
- name (string)
- email (unique string)
- role (string, default: 'agent')
- phone (string, nullable)
- password (hashed)
- created_at, updated_at (timestamps)
```

### Personal Access Tokens Table (Sanctum)
```sql
- id (primary key)
- tokenable_id (references users.id)
- tokenable_type (App\Models\User)
- name (string)
- token (hashed)
- abilities (json)
- expires_at (datetime, nullable)
- created_at, updated_at (timestamps)
```

---

## Development Workflow

### 1. Setup
```bash
# Terminal 1: Laravel Backend
cd backend
php artisan serve  # Runs on http://127.0.0.1:8000

# Terminal 2: React Frontend
cd frontend
npm run dev       # Runs on http://localhost:5174
```

### 2. Making Changes
1. **Backend Changes**: Edit Laravel files, refresh browser
2. **Frontend Changes**: Edit React files, Vite auto-reloads
3. **Database Changes**: Create migrations, run `php artisan migrate`

### 3. Testing API
```bash
# Test endpoints directly
curl http://127.0.0.1:8000/api/test
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## Security Considerations

### Frontend
- Tokens stored in localStorage (not in cookies)
- HTTPS in production (not in development)
- Input validation in forms

### Backend
- Passwords are hashed before storing
- Tokens are hashed in database
- CORS configuration limits origins
- Request validation prevents malicious data

---

## Common Issues and Solutions

### 1. "createToken() method not found"
**Problem**: User model missing Sanctum trait
**Solution**: Add `use HasApiTokens` to User model

### 2. CORS errors
**Problem**: Frontend and backend on different ports
**Solution**: Configure CORS in `backend/config/cors.php`

### 3. Database connection errors
**Problem**: PostgreSQL not running or wrong credentials
**Solution**: Check `backend/.env` database configuration

### 4. Token not working
**Problem**: Token expired or invalid
**Solution**: User must login again to get new token

---

## Next Steps

1. **Add Protected Routes**: Check authentication before showing pages
2. **Add Logout Functionality**: Clear localStorage and redirect
3. **Add Form Validation**: Better error messages
4. **Add User Profile**: Edit user information
5. **Add Real Features**: Properties, listings, etc.
6. **Add Error Handling**: Better user experience
7. **Add Loading States**: Show loading indicators
8. **Add Testing**: Unit and integration tests

---

## Summary

This application follows a standard client-server architecture:

1. **React Frontend**: Handles user interface and interactions
2. **Laravel Backend**: Handles business logic and data
3. **PostgreSQL**: Stores user and application data
4. **Sanctum**: Provides API authentication
5. **Vite**: Serves and builds the frontend

The key is understanding that React only displays what Laravel tells it to display, and Laravel only does what React asks it to do. They communicate through HTTP requests and responses in JSON format.
