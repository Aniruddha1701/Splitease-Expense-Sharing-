import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import Groups from './components/Groups';
import GroupDetail from './components/GroupDetail';
import Users from './components/Users';
import Footer from './components/Footer';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authUser, setAuthUser] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // Check for existing auth on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setAuthUser(user);
                setAuthToken(storedToken);
                setCurrentUser(user);
                setIsAuthenticated(true);
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setAuthLoading(false);
    }, []);

    // Fetch data when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
            fetchGroups();
        }
    }, [isAuthenticated]);

    const handleLogin = (user, token) => {
        setAuthUser(user);
        setAuthToken(token);
        setCurrentUser(user);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthUser(null);
        setAuthToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        setCurrentView('dashboard');
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);

            // Set current user if not already set
            if (data.length > 0 && !currentUser) {
                // Find the authenticated user in the list
                const matchingUser = data.find(u => u.email === authUser?.email);
                if (matchingUser) {
                    setCurrentUser(matchingUser);
                } else if (authUser) {
                    setCurrentUser(authUser);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/groups');
            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleViewGroup = (group) => {
        setSelectedGroup(group);
        setCurrentView('groupDetail');
    };

    const handleBackToGroups = () => {
        setSelectedGroup(null);
        setCurrentView('groups');
        fetchGroups();
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <Dashboard
                        users={users}
                        groups={groups}
                        currentUser={currentUser}
                        onViewGroup={handleViewGroup}
                    />
                );
            case 'groups':
                return (
                    <Groups
                        groups={groups}
                        users={users}
                        currentUser={currentUser}
                        onRefresh={fetchGroups}
                        onViewGroup={handleViewGroup}
                    />
                );
            case 'groupDetail':
                return (
                    <GroupDetail
                        group={selectedGroup}
                        users={users}
                        currentUser={currentUser}
                        onBack={handleBackToGroups}
                        onRefresh={fetchGroups}
                    />
                );
            case 'users':
                return (
                    <Users
                        users={users}
                        onRefresh={fetchUsers}
                        currentUser={currentUser}
                    />
                );
            default:
                return <Dashboard users={users} groups={groups} currentUser={currentUser} />;
        }
    };

    // Show loading state
    if (authLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-base)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        margin: '0 auto 16px',
                        animation: 'pulse 1.5s infinite'
                    }}>
                        💰
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading SplitEase...</p>
                </div>
            </div>
        );
    }

    // Show auth page if not authenticated
    if (!isAuthenticated) {
        return <AuthPage onLogin={handleLogin} />;
    }

    // Main app
    return (
        <div className="app">
            <header className="header">
                <div className="container header-content">
                    <div className="logo">
                        <div className="logo-icon">💰</div>
                        <span className="logo-text">SplitEase</span>
                    </div>
                    <nav className="nav">
                        <button
                            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setCurrentView('dashboard')}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            className={`nav-btn ${currentView === 'groups' || currentView === 'groupDetail' ? 'active' : ''}`}
                            onClick={() => { setCurrentView('groups'); setSelectedGroup(null); }}
                        >
                            👥 Groups
                        </button>
                        <button
                            className={`nav-btn ${currentView === 'users' ? 'active' : ''}`}
                            onClick={() => setCurrentView('users')}
                        >
                            👤 Users
                        </button>
                    </nav>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {currentUser && (
                            <div className="user-badge">
                                <div className="user-avatar">
                                    {currentUser.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span>{currentUser.name}</span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: '10px',
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    {renderView()}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default App;
