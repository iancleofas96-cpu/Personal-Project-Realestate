import React from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [apiMessage, setApiMessage] = React.useState('');
  const [apiStatus, setApiStatus] = React.useState('');

  React.useEffect(() => {
    fetch(`${API_URL}/test`)
      .then(res => res.json())
      .then(data => {
        setApiStatus(data.status);
        setApiMessage(data.message);
      })
      .catch(err => {
        setApiStatus('error');
        setApiMessage('Failed to connect to backend');
        console.error('API Error:', err);
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        <h1 style={{ 
          marginBottom: '30px',
          color: '#333',
          fontSize: '32px',
        }}>Real Estate Tracker</h1>
        
        {/* Navigation */}
        <nav style={{ marginBottom: '30px' }}>
          <Link to="/home" style={{ marginRight: '15px', color: '#007bff', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
          <Link to="/dashboard" style={{ marginRight: '15px', color: '#007bff', fontWeight: '500', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/login" style={{ marginRight: '15px', color: '#007bff', fontWeight: '500', textDecoration: 'none' }}>Login</Link>
          <Link to="/register" style={{ color: '#007bff', fontWeight: '500', textDecoration: 'none' }}>Register</Link>
        </nav>
        
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          textAlign: 'left',
          backgroundColor: apiStatus === 'success' ? '#d4edda' : '#f8d7da',
          borderLeft: `4px solid ${apiStatus === 'success' ? '#28a745' : '#dc3545'}`,
        }}>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>Backend Connection Test</h3>
          <p style={{ margin: '5px 0' }}><strong>Status:</strong> {apiStatus || 'Loading...'}</p>
          <p style={{ margin: '5px 0' }}><strong>Message:</strong> {apiMessage || 'Connecting to Laravel...'}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
