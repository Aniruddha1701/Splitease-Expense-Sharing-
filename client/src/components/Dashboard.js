import React, { useState, useEffect } from 'react';

function Dashboard({ users, groups, currentUser, onViewGroup }) {
    const [balanceSummary, setBalanceSummary] = useState(null);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTimeFilter, setActiveTimeFilter] = useState('all');

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const userId = currentUser?.id || currentUser?._id;
            if (userId) {
                const balanceRes = await fetch(`/api/users/${userId}/balances`);
                const balanceData = await balanceRes.json();
                setBalanceSummary(balanceData);
            }

            // Fetch recent expenses from all groups
            const allExpenses = [];
            for (const group of groups) {
                const groupId = group.id || group._id;
                const expensesRes = await fetch(`/api/groups/${groupId}/expenses`);
                const expensesData = await expensesRes.json();
                allExpenses.push(...expensesData.map(e => ({ ...e, groupName: group.name })));
            }
            allExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRecentExpenses(allExpenses.slice(0, 10));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const getRelativeTime = (date) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return then.toLocaleDateString();
    };

    const totalExpenses = recentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const expensesByCategory = recentExpenses.reduce((acc, e) => {
        const cat = e.category || 'other';
        acc[cat] = (acc[cat] || 0) + e.amount;
        return acc;
    }, {});

    const categoryIcons = {
        food: '🍔', transport: '🚗', shopping: '🛍️', entertainment: '🎬',
        utilities: '💡', rent: '🏠', travel: '✈️', other: '📦'
    };

    const categoryColors = {
        food: '#f59e0b', transport: '#3b82f6', shopping: '#ec4899', entertainment: '#8b5cf6',
        utilities: '#10b981', rent: '#6366f1', travel: '#14b8a6', other: '#64748b'
    };

    if (!currentUser) {
        return (
            <div className="fade-in">
                <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.6 }}>👋</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Welcome to SplitEase</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                        Please login or create an account to start splitting expenses with friends
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Welcome Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span>👋</span>
                            <span>Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}!</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Here's your expense summary and recent activity
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['all', 'week', 'month'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveTimeFilter(filter)}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: activeTimeFilter === filter
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : 'var(--bg-surface)',
                                    color: activeTimeFilter === filter ? 'white' : 'var(--text-secondary)',
                                    boxShadow: activeTimeFilter === filter ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                                }}
                            >
                                {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                {/* Total Owed to You */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '80px', opacity: 0.1 }}>💰</div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                            You are owed
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#34d399', marginBottom: '4px' }}>
                            {formatCurrency(balanceSummary?.totalOwed || 0)}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            from {balanceSummary?.details?.filter(d => d.type === 'OWED').length || 0} people
                        </div>
                    </div>
                </div>

                {/* Total You Owe */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '80px', opacity: 0.1 }}>💸</div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                            You owe
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f87171', marginBottom: '4px' }}>
                            {formatCurrency(balanceSummary?.totalOwes || 0)}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            to {balanceSummary?.details?.filter(d => d.type === 'OWES').length || 0} people
                        </div>
                    </div>
                </div>

                {/* Net Balance */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '80px', opacity: 0.1 }}>⚖️</div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                            Net Balance
                        </div>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: (balanceSummary?.netBalance || 0) >= 0 ? '#34d399' : '#f87171',
                            marginBottom: '4px'
                        }}>
                            {(balanceSummary?.netBalance || 0) >= 0 ? '+' : ''}{formatCurrency(balanceSummary?.netBalance || 0)}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {(balanceSummary?.netBalance || 0) >= 0 ? 'You\'re in good shape! 🎉' : 'Time to settle up'}
                        </div>
                    </div>
                </div>

                {/* Total Expenses */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '80px', opacity: 0.1 }}>📊</div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                            Total Expenses
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fbbf24', marginBottom: '4px' }}>
                            {formatCurrency(totalExpenses)}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            across {recentExpenses.length} transactions
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>

                {/* Left Column */}
                <div>
                    {/* Quick Actions */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div className="card-header">
                            <h2 className="card-title">⚡ Quick Actions</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <button style={{
                                padding: '20px 16px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>➕</div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.85rem' }}>Add Expense</div>
                            </button>
                            <button style={{
                                padding: '20px 16px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>👥</div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.85rem' }}>New Group</div>
                            </button>
                            <button style={{
                                padding: '20px 16px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>💸</div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.85rem' }}>Settle Up</div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">📝 Recent Activity</h2>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{recentExpenses.length} expenses</span>
                        </div>

                        {recentExpenses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📝</div>
                                <p>No expenses yet. Add your first expense!</p>
                            </div>
                        ) : (
                            <div>
                                {recentExpenses.slice(0, 5).map((expense, index) => (
                                    <div key={expense._id || index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        background: index % 2 === 0 ? 'transparent' : 'rgba(148, 163, 184, 0.03)',
                                        borderRadius: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            width: '46px',
                                            height: '46px',
                                            background: `linear-gradient(135deg, ${categoryColors[expense.category || 'other']}20, ${categoryColors[expense.category || 'other']}10)`,
                                            border: `1px solid ${categoryColors[expense.category || 'other']}30`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem'
                                        }}>
                                            {categoryIcons[expense.category || 'other']}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                                                {expense.description}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span>{expense.groupName}</span>
                                                <span>•</span>
                                                <span>{getRelativeTime(expense.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                                                {formatCurrency(expense.amount)}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {expense.splitType}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    {/* Your Groups */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div className="card-header">
                            <h2 className="card-title">👥 Your Groups</h2>
                            <span style={{
                                background: 'var(--bg-surface)',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)'
                            }}>{groups.length}</span>
                        </div>

                        {groups.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                                <p>No groups yet</p>
                            </div>
                        ) : (
                            <div>
                                {groups.slice(0, 4).map((group) => (
                                    <div
                                        key={group._id || group.id}
                                        onClick={() => onViewGroup(group)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            padding: '14px',
                                            background: 'var(--bg-surface)',
                                            borderRadius: '12px',
                                            marginBottom: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: '1px solid transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.1rem'
                                        }}>
                                            👥
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{group.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {group.members?.length || 0} members
                                            </div>
                                        </div>
                                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Spending by Category */}
                    {Object.keys(expensesByCategory).length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">📊 By Category</h2>
                            </div>
                            <div>
                                {Object.entries(expensesByCategory)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([category, amount]) => {
                                        const percentage = (amount / totalExpenses) * 100;
                                        return (
                                            <div key={category} style={{ marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span>{categoryIcons[category]}</span>
                                                        <span style={{ textTransform: 'capitalize', fontWeight: '500', fontSize: '0.9rem' }}>{category}</span>
                                                    </div>
                                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{formatCurrency(amount)}</span>
                                                </div>
                                                <div style={{
                                                    height: '8px',
                                                    background: 'var(--bg-surface)',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${percentage}%`,
                                                        background: `linear-gradient(90deg, ${categoryColors[category]}, ${categoryColors[category]}aa)`,
                                                        borderRadius: '4px',
                                                        transition: 'width 0.5s ease'
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
