import React, { useState } from 'react';

function Users({ users, onRefresh, currentUser }) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            setFormData({ name: '', email: '' });
            setShowModal(false);
            onRefresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ name: '', email: '' });
        setError('');
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    };

    const avatarColors = [
        'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #ec4899, #db2777)',
        'linear-gradient(135deg, #3b82f6, #2563eb)',
        'linear-gradient(135deg, #14b8a6, #0d9488)',
    ];

    const getAvatarColor = (index) => avatarColors[index % avatarColors.length];

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '4px' }}>👤 Users</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        View all registered users
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add User
                </button>
            </div>

            {/* Search and Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '16px',
                marginBottom: '24px',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative' }}>
                    <span style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)'
                    }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '44px' }}
                    />
                </div>
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '12px 20px',
                    background: 'var(--bg-surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-default)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>{users.length}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-default)' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#34d399' }}>{filteredUsers.length}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Showing</div>
                    </div>
                </div>
            </div>

            {/* Current User Card */}
            {currentUser && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                    }}>
                        {getInitials(currentUser.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(99, 102, 241, 0.2)',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            color: '#a5b4fc',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Your Account
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {currentUser.name}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {currentUser.email}
                        </div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        color: 'white'
                    }}>
                        ✓
                    </div>
                </div>
            )}

            {/* Users Grid */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Users</h2>
                </div>

                {filteredUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>
                            {searchQuery ? '🔍' : '👤'}
                        </div>
                        <p style={{ fontSize: '1rem', marginBottom: '8px' }}>
                            {searchQuery ? 'No users found matching your search' : 'No users yet'}
                        </p>
                        {!searchQuery && (
                            <p style={{ fontSize: '0.85rem' }}>Add your first user to get started!</p>
                        )}
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px'
                    }}>
                        {filteredUsers.map((user, index) => {
                            const userId = user.id || user._id;
                            const isCurrentUser = userId === (currentUser?.id || currentUser?._id);

                            return (
                                <div
                                    key={userId}
                                    style={{
                                        padding: '20px',
                                        background: isCurrentUser
                                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)'
                                            : 'var(--bg-surface)',
                                        border: isCurrentUser
                                            ? '2px solid rgba(99, 102, 241, 0.4)'
                                            : '1px solid var(--border-default)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}
                                >
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        background: getAvatarColor(index),
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: 'white',
                                        flexShrink: 0
                                    }}>
                                        {getInitials(user.name)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: '600',
                                            color: 'var(--text-primary)',
                                            marginBottom: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {user.name}
                                            </span>
                                            {isCurrentUser && (
                                                <span style={{
                                                    background: '#10b981',
                                                    color: 'white',
                                                    fontSize: '0.65rem',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontWeight: '600'
                                                }}>YOU</span>
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New User</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div style={{
                                    padding: '14px 16px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '12px',
                                    color: '#f87171',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{
                                padding: '14px 16px',
                                background: 'rgba(99, 102, 241, 0.08)',
                                borderRadius: '12px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    <span>💡</span>
                                    <span>Users added here can be included in expense groups.</span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? '⏳ Adding...' : '✨ Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;
