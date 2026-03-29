import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './css/global.css'
import './index.css'
import App from './page/app.jsx'
import Dashboard from './page/dashboard.jsx'
import Login from './page/login.jsx'
import Register from './page/register.jsx'
import AuditLogs from './page/AuditLogs.jsx'
import Profile from './page/Profile.jsx'
import Properties from './page/Properties.jsx'
import AddProperty from './page/AddProperty.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<App />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/properties" element={
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        } />
        <Route path="/properties/add" element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        } />
        <Route path="/properties/:id" element={
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        } />
        <Route path="/properties/:id/edit" element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        } />
        <Route path="/audit-logs" element={
          <ProtectedRoute>
            <AuditLogs />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
