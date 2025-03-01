import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Layout.css';

const Layout = ({ children, onResetView }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const handleHomeClick = (e) => {
        e.preventDefault();
        onResetView && onResetView();
        navigate('/');
    };

    const handleSignOut = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    const sidebarItems = [
        {
            id: 'home',
            label: 'Home',
            icon: 'home',
            path: '/',
            action: handleHomeClick,
            active: location.pathname === '/'
        },
        {
            id: 'social',
            label: 'Social Media Accounts',
            icon: 'share',
            path: '/social-media-accounts',
            active: location.pathname === '/social-media-accounts'
        },
        {
            id: 'ai',
            label: 'AI Models',
            icon: 'smart_toy',
            path: '/ai-models',
            active: location.pathname === '/ai-models'
        }
    ];

    const handleNavClick = (e, item) => {
        e.preventDefault();
        if (item.action) {
            item.action(e);
        } else {
            navigate(item.path);
        }
    };

    return (
        <div className="layout">
            <button 
                className={`sidebar-toggle ${isSidebarOpen ? 'open' : ''}`}
                onClick={toggleSidebar}
                aria-label="Toggle Sidebar"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>AI-PR-Bot</h2>
                </div>

                <nav className="sidebar-nav">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={(e) => handleNavClick(e, item)}
                            className={`nav-item ${item.active ? 'active' : ''}`}
                        >
                            <span className="material-symbols-rounded">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Settings Section - Now at the bottom */}
                <div className="settings-section">
                    <button
                        onClick={toggleSettings}
                        className={`nav-item settings-button ${isSettingsOpen ? 'active' : ''}`}
                    >
                        <div className="profile-preview">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="profile-image" />
                            ) : (
                                <span className="material-symbols-rounded profile-icon">account_circle</span>
                            )}
                        </div>
                        <span className="nav-label">Settings</span>
                        <span className="material-symbols-rounded settings-arrow">
                            {isSettingsOpen ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>

                    {/* Settings Dropdown */}
                    {isSettingsOpen && (
                        <div className="settings-dropdown">
                            <div className="user-info">
                                <div className="user-email">
                                    <span className="material-symbols-rounded">mail</span>
                                    {user?.email || 'Not signed in'}
                                </div>
                                <div className="user-name">
                                    <span className="material-symbols-rounded">person</span>
                                    {user?.displayName || 'Anonymous'}
                                </div>
                            </div>
                            <div className="settings-actions">
                                <Link to="/profile" className="settings-action">
                                    <span className="material-symbols-rounded">manage_accounts</span>
                                    Profile Settings
                                </Link>
                                <button onClick={handleSignOut} className="settings-action sign-out-button">
                                    <span className="material-symbols-rounded">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                {children}
            </main>
        </div>
    );
};

export default Layout;