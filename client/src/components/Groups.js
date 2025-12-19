import React, { useState } from 'react';

function Groups({ groups, users, currentUser, onRefresh, onViewGroup }) {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', memberIds: [] });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Email lookup state
    const [emailInput, setEmailInput] = useState('');
    const [emailSearching, setEmailSearching] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [addedMembers, setAddedMembers] = useState([]);

    const handleEmailLookup = async () => {
        if (!emailInput.trim()) return;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        // Check if already added
        if (addedMembers.some(m => m.email.toLowerCase() === emailInput.toLowerCase())) {
            setEmailError('This user is already added');
            return;
        }

        // Check if it's the current user
        if (currentUser?.email?.toLowerCase() === emailInput.toLowerCase()) {
            setEmailError('You are automatically added as a member');
            return;
        }

        setEmailSearching(true);
        setEmailError('');

        try {
            const response = await fetch(`/api/users/email/${encodeURIComponent(emailInput)}`);
            const data = await response.json();

            if (response.ok && data.exists) {
                // User found - add to list
                setAddedMembers(prev => [...prev, data.user]);
                setFormData(prev => ({
                    ...prev,
                    memberIds: [...prev.memberIds, data.user.id]
                }));
                setEmailInput('');
                setEmailError('');
            } else {
                setEmailError(`No user found with email "${emailInput}". They need to register first.`);
            }
        } catch (err) {
            setEmailError('Error searching for user');
        } finally {
            setEmailSearching(false);
        }
    };

    const removeMember = (userId) => {
        setAddedMembers(prev => prev.filter(m => m.id !== userId));
        setFormData(prev => ({
            ...prev,
            memberIds: prev.memberIds.filter(id => id !== userId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            setError('Please login first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create the group
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    createdBy: currentUser.id || currentUser._id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create group');
            }

            // Add selected members
            for (const memberId of formData.memberIds) {
                const currentUserId = currentUser.id || currentUser._id;
                if (memberId !== currentUserId) {
                    await fetch(`/api/groups/${data._id || data.id}/members`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: memberId })
                    });
                }
            }

            // Reset form
            setFormData({ name: '', memberIds: [] });
            setAddedMembers([]);
            setEmailInput('');
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
        setFormData({ name: '', memberIds: [] });
        setAddedMembers([]);
        setEmailInput('');
        setError('');
        setEmailError('');
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>
                    👥 Groups
                </h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                    disabled={!currentUser}
                >
                    + Create Group
                </button>
            </div>

            {!currentUser && (
                <div style={{
                    padding: '16px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '14px',
                    color: '#fbbf24',
                    marginBottom: '24px'
                }}>
                    ⚠️ Please login first to create groups.
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Groups</h2>
                    <span style={{ color: 'var(--text-muted)' }}>{groups.length} groups</span>
                </div>

                {groups.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📁</div>
                        <p className="empty-state-text">No groups yet. Create your first group to start splitting expenses!</p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div
                            key={group._id || group.id}
                            className="list-item"
                            onClick={() => onViewGroup(group)}
                        >
                            <div className="list-item-info">
                                <div className="list-item-icon">👥</div>
                                <div>
                                    <div className="list-item-title">{group.name}</div>
                                    <div className="list-item-subtitle">
                                        {group.members?.length || 0} members • Created {new Date(group.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>→</span>
                        </div>
                    ))
                )}
            </div>

            {/* Create Group Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create New Group</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div style={{
                                    padding: '12px 16px',
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
                                <label className="form-label">Group Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Trip to Goa, Roommates"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Email-based member lookup */}
                            <div className="form-group">
                                <label className="form-label">Add Members by Email</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Enter email address..."
                                        value={emailInput}
                                        onChange={(e) => {
                                            setEmailInput(e.target.value);
                                            setEmailError('');
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleEmailLookup();
                                            }
                                        }}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleEmailLookup}
                                        disabled={emailSearching || !emailInput.trim()}
                                        style={{ minWidth: '100px' }}
                                    >
                                        {emailSearching ? '🔍...' : '🔍 Find'}
                                    </button>
                                </div>

                                {emailError && (
                                    <div style={{
                                        marginTop: '10px',
                                        padding: '10px 14px',
                                        background: emailError.includes('No user found')
                                            ? 'rgba(245, 158, 11, 0.1)'
                                            : 'rgba(239, 68, 68, 0.1)',
                                        border: emailError.includes('No user found')
                                            ? '1px solid rgba(245, 158, 11, 0.3)'
                                            : '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '10px',
                                        fontSize: '0.85rem',
                                        color: emailError.includes('No user found') ? '#fbbf24' : '#f87171'
                                    }}>
                                        {emailError.includes('No user found') ? '⚠️' : '❌'} {emailError}
                                    </div>
                                )}

                                {/* Added members list */}
                                {addedMembers.length > 0 && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '16px',
                                        background: 'var(--bg-surface)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-default)'
                                    }}>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                            marginBottom: '12px',
                                            fontWeight: '500'
                                        }}>
                                            Members to add ({addedMembers.length}):
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {addedMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '8px 12px',
                                                        background: 'rgba(99, 102, 241, 0.15)',
                                                        borderRadius: '20px',
                                                        border: '1px solid rgba(99, 102, 241, 0.3)'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{member.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{member.email}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMember(member.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--text-muted)',
                                                            cursor: 'pointer',
                                                            padding: '2px',
                                                            marginLeft: '4px',
                                                            fontSize: '1rem',
                                                            lineHeight: 1
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <small style={{
                                    color: 'var(--text-muted)',
                                    marginTop: '12px',
                                    display: 'block',
                                    padding: '10px 14px',
                                    background: 'rgba(99, 102, 241, 0.05)',
                                    borderRadius: '10px'
                                }}>
                                    💡 You ({currentUser?.name}) will be automatically added as a member. Search for other users by their registered email.
                                </small>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? '⏳ Creating...' : '✨ Create Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Groups;
