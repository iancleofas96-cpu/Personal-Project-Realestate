import React from 'react';
import Sidebar from '../components/Sidebar';
import '../css/sidebar.css';

function SidebarLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="app-layout">
            <button 
                className="mobile-menu-toggle"
                onClick={toggleSidebar}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </button>
            
            <Sidebar className={sidebarOpen ? 'open' : ''} />
            
            <div className="main-content">
                {children}
            </div>
        </div>
    );
}

export default SidebarLayout;
