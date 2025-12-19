import React, { useState, useEffect } from 'react';
import SimplifyDebts from './SimplifyDebts';

function GroupDetail({ group, users, currentUser, onBack, onRefresh }) {
    const [groupData, setGroupData] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [activeTab, setActiveTab] = useState('expenses');
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPaidBy, setFilterPaidBy] = useState('all');

    // Helper to get ID from either _id or id (MongoDB vs in-memory compatibility)
    const getId = (item) => item?._id || item?.id;

    useEffect(() => {
        if (group) {
            fetchGroupData();
        }
    }, [group]);

    const fetchGroupData = async () => {
        setLoading(true);
        const groupId = getId(group);

        try {
            const [groupRes, expensesRes, balancesRes, settlementsRes] = await Promise.all([
                fetch(`/api/groups/${groupId}`),
                fetch(`/api/groups/${groupId}/expenses`),
                fetch(`/api/groups/${groupId}/balances`),
                fetch(`/api/groups/${groupId}/settlements`)
            ]);

            const [groupData, expensesData, balancesData, settlementsData] = await Promise.all([
                groupRes.json(),
                expensesRes.json(),
                balancesRes.json(),
                settlementsRes.json()
            ]);

            setGroupData(groupData);
            setExpenses(Array.isArray(expensesData) ? expensesData : []);
            setBalances(Array.isArray(balancesData) ? balancesData : []);
            setSettlements(Array.isArray(settlementsData) ? settlementsData : []);
        } catch (error) {
            console.error('Error fetching group data:', error);
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

    // Get member name - handles both populated objects and IDs
    const getMemberName = (member) => {
        if (!member) return 'Unknown';
        // If it's a populated object, return the name directly
        if (typeof member === 'object' && member.name) return member.name;
        // If it's an ID, look up in memberDetails
        const found = groupData?.memberDetails?.find(m => getId(m) === member);
        return found?.name || 'Unknown';
    };

    const getMemberId = (member) => {
        if (!member) return null;
        if (typeof member === 'object') return getId(member);
        return member;
    };

    const deleteExpense = async (expenseId) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            const response = await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
            if (response.ok) {
                fetchGroupData();
            } else {
                alert('Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const exportToCSV = () => {
        if (expenses.length === 0) {
            alert('No expenses to export');
            return;
        }

        const headers = ['Date', 'Description', 'Amount', 'Paid By', 'Category', 'Split Type'];
        const rows = expenses.map(e => [
            new Date(e.createdAt).toLocaleDateString(),
            e.description,
            e.amount,
            getMemberName(e.paidBy),
            e.category || 'other',
            e.splitType
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${groupData?.name || 'expenses'}_export.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Filter expenses based on search and payer filter
    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
        const payerId = getMemberId(expense.paidBy);
        const matchesPaidBy = filterPaidBy === 'all' || payerId === filterPaidBy;
        return matchesSearch && matchesPaidBy;
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const categoryIcons = {
        food: '🍔', transport: '🚗', shopping: '🛍️', entertainment: '🎬',
        utilities: '💡', rent: '🏠', travel: '✈️', other: '📦'
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
                <p style={{ color: 'var(--text-muted)' }}>Loading group details...</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '10px 16px' }}>
                    ← Back
                </button>
                <div style={{ flex: 1 }}>
                    <h1 className="page-title" style={{ marginBottom: '4px' }}>
                        👥 {groupData?.name}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {groupData?.memberDetails?.length || 0} members • Total: {formatCurrency(totalExpenses)}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setShowAddMemberModal(true)}>
                        + Add Member
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
                        + Add Expense
                    </button>
                    {balances.length > 0 && (
                        <button className="btn btn-success" onClick={() => setShowSettleModal(true)}>
                            💸 Settle Up
                        </button>
                    )}
                </div>
            </div>

            {/* Members Row */}
            <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '8px' }}>Members:</span>
                    {groupData?.memberDetails?.map((member) => (
                        <div key={getId(member)} className="user-badge">
                            <div className="user-avatar" style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                width: '28px',
                                height: '28px',
                                fontSize: '0.75rem'
                            }}>
                                {member.name?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.85rem' }}>{member.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
                    📝 Expenses ({expenses.length})
                </button>
                <button className={`tab ${activeTab === 'balances' ? 'active' : ''}`} onClick={() => setActiveTab('balances')}>
                    💳 Balances ({balances.length})
                </button>
                <button className={`tab ${activeTab === 'settlements' ? 'active' : ''}`} onClick={() => setActiveTab('settlements')}>
                    ✅ Settlements ({settlements.length})
                </button>
            </div>

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
                <div className="slide-up">
                    {/* Search and Filter */}
                    {expenses.length > 0 && (
                        <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="🔍 Search expenses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ flex: '1', minWidth: '200px' }}
                                />
                                <select
                                    className="form-select"
                                    value={filterPaidBy}
                                    onChange={(e) => setFilterPaidBy(e.target.value)}
                                    style={{ minWidth: '150px' }}
                                >
                                    <option value="all">All Payers</option>
                                    {groupData?.memberDetails?.map(member => (
                                        <option key={getId(member)} value={getId(member)}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                                <button className="btn btn-secondary" onClick={exportToCSV}>
                                    📥 Export
                                </button>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {filteredExpenses.length} of {expenses.length}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        {filteredExpenses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>
                                    {expenses.length === 0 ? '📝' : '🔍'}
                                </div>
                                <p style={{ marginBottom: '16px' }}>
                                    {expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}
                                </p>
                                {expenses.length === 0 && (
                                    <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
                                        Add First Expense
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredExpenses.map((expense) => (
                                <div key={getId(expense)} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px',
                                    borderBottom: '1px solid var(--border-default)',
                                    gap: '16px'
                                }}>
                                    {/* Category Icon */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'var(--bg-surface)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                    }}>
                                        {categoryIcons[expense.category] || '📦'}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{expense.description}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span>Paid by {getMemberName(expense.paidBy)}</span>
                                            <span>•</span>
                                            <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                                            <span style={{
                                                padding: '2px 8px',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                color: '#a5b4fc'
                                            }}>{expense.splitType}</span>
                                        </div>
                                        {expense.notes && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                                                📝 {expense.notes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Amount & Actions */}
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                            {formatCurrency(expense.amount)}
                                        </div>
                                        <button
                                            onClick={() => deleteExpense(getId(expense))}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--text-muted)',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                marginTop: '4px'
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Balances Tab */}
            {activeTab === 'balances' && (
                <div className="slide-up">
                    <div className="card">
                        {balances.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                                <p>All settled up! No outstanding balances.</p>
                            </div>
                        ) : (
                            <>
                                {balances.map((balance, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '16px',
                                        borderBottom: '1px solid var(--border-default)',
                                        gap: '16px'
                                    }}>
                                        {/* From User */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '120px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '0.9rem'
                                            }}>
                                                {balance.from?.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span style={{ fontWeight: '500' }}>{balance.from?.name || 'Unknown'}</span>
                                        </div>

                                        {/* Arrow */}
                                        <div style={{ color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>
                                            owes →
                                        </div>

                                        {/* To User */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '120px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '0.9rem'
                                            }}>
                                                {balance.to?.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span style={{ fontWeight: '500' }}>{balance.to?.name || 'Unknown'}</span>
                                        </div>

                                        {/* Amount */}
                                        <div style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '700',
                                            color: '#f87171',
                                            minWidth: '100px',
                                            textAlign: 'right'
                                        }}>
                                            {formatCurrency(balance.amount)}
                                        </div>
                                    </div>
                                ))}
                                <SimplifyDebts balances={balances} formatCurrency={formatCurrency} />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Settlements Tab */}
            {activeTab === 'settlements' && (
                <div className="card slide-up">
                    {settlements.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.5 }}>💸</div>
                            <p>No settlements recorded yet.</p>
                        </div>
                    ) : (
                        settlements.map((settlement) => (
                            <div key={getId(settlement)} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '16px',
                                borderBottom: '1px solid var(--border-default)',
                                gap: '16px'
                            }}>
                                {/* From User */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '600'
                                    }}>
                                        {settlement.fromUser?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <span>{settlement.fromUser?.name || 'Unknown'}</span>
                                </div>

                                <span style={{ color: '#34d399' }}>paid →</span>

                                {/* To User */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '600'
                                    }}>
                                        {settlement.toUser?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <span>{settlement.toUser?.name || 'Unknown'}</span>
                                </div>

                                <div style={{ flex: 1 }} />

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#34d399' }}>
                                        {formatCurrency(settlement.amount)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(settlement.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add Expense Modal */}
            {showExpenseModal && (
                <AddExpenseModal
                    groupData={groupData}
                    currentUser={currentUser}
                    onClose={() => setShowExpenseModal(false)}
                    onSuccess={() => {
                        setShowExpenseModal(false);
                        fetchGroupData();
                    }}
                    formatCurrency={formatCurrency}
                    getId={getId}
                />
            )}

            {/* Settle Up Modal */}
            {showSettleModal && (
                <SettleUpModal
                    groupData={groupData}
                    balances={balances}
                    currentUser={currentUser}
                    onClose={() => setShowSettleModal(false)}
                    onSuccess={() => {
                        setShowSettleModal(false);
                        fetchGroupData();
                    }}
                    formatCurrency={formatCurrency}
                    getId={getId}
                />
            )}

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <AddMemberModal
                    groupData={groupData}
                    onClose={() => setShowAddMemberModal(false)}
                    onSuccess={() => {
                        setShowAddMemberModal(false);
                        fetchGroupData();
                    }}
                    getId={getId}
                />
            )}
        </div>
    );
}

// Category options for expenses
const categoryOptions = [
    { value: 'food', label: '🍔 Food & Drinks', color: '#f59e0b' },
    { value: 'transport', label: '🚗 Transport', color: '#3b82f6' },
    { value: 'shopping', label: '🛍️ Shopping', color: '#ec4899' },
    { value: 'entertainment', label: '🎬 Entertainment', color: '#8b5cf6' },
    { value: 'utilities', label: '💡 Utilities', color: '#10b981' },
    { value: 'rent', label: '🏠 Rent', color: '#6366f1' },
    { value: 'travel', label: '✈️ Travel', color: '#14b8a6' },
    { value: 'other', label: '📦 Other', color: '#64748b' }
];

// Add Expense Modal
function AddExpenseModal({ groupData, currentUser, onClose, onSuccess, formatCurrency, getId }) {
    const currentUserId = getId(currentUser);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        paidBy: currentUserId || '',
        splitType: 'EQUAL',
        category: 'other',
        notes: '',
        splits: groupData?.memberDetails?.map(m => ({
            userId: getId(m),
            name: m.name,
            amount: '',
            percentage: ''
        })) || []
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSplitTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            splitType: type,
            splits: prev.splits.map(s => ({
                ...s,
                amount: '',
                percentage: type === 'PERCENTAGE' ? (100 / prev.splits.length).toFixed(2) : ''
            }))
        }));
    };

    const handleSplitChange = (userId, field, value) => {
        setFormData(prev => ({
            ...prev,
            splits: prev.splits.map(s =>
                s.userId === userId ? { ...s, [field]: value } : s
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let splits = formData.splits.map(s => ({
                userId: s.userId,
                amount: formData.splitType === 'EXACT' ? parseFloat(s.amount) || 0 : undefined,
                percentage: formData.splitType === 'PERCENTAGE' ? parseFloat(s.percentage) || 0 : undefined
            }));

            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: getId(groupData),
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    paidBy: formData.paidBy,
                    splitType: formData.splitType,
                    category: formData.category,
                    notes: formData.notes,
                    splits
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add expense');
            }

            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculatePreview = () => {
        const amount = parseFloat(formData.amount) || 0;
        if (formData.splitType === 'EQUAL') {
            const perPerson = amount / formData.splits.length;
            return formData.splits.map(s => ({ ...s, previewAmount: perPerson }));
        } else if (formData.splitType === 'EXACT') {
            return formData.splits.map(s => ({ ...s, previewAmount: parseFloat(s.amount) || 0 }));
        } else {
            return formData.splits.map(s => ({
                ...s,
                previewAmount: (amount * (parseFloat(s.percentage) || 0)) / 100
            }));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Add New Expense</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '12px',
                            color: '#f87171',
                            marginBottom: '16px'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Description & Amount */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Dinner, Uber"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Amount (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="0"
                                min="1"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Paid By */}
                    <div className="form-group">
                        <label className="form-label">Paid By</label>
                        <select
                            className="form-select"
                            value={formData.paidBy}
                            onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                            required
                        >
                            {groupData?.memberDetails?.map((member) => (
                                <option key={getId(member)} value={getId(member)}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {categoryOptions.map(cat => (
                                <div
                                    key={cat.value}
                                    onClick={() => setFormData({ ...formData, category: cat.value })}
                                    style={{
                                        padding: '10px',
                                        background: formData.category === cat.value ? `${cat.color}20` : 'var(--bg-surface)',
                                        border: formData.category === cat.value ? `2px solid ${cat.color}` : '1px solid var(--border-default)',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    <div style={{ fontSize: '1.25rem' }}>{cat.label.split(' ')[0]}</div>
                                    <div style={{ color: formData.category === cat.value ? cat.color : 'var(--text-muted)' }}>
                                        {cat.label.split(' ').slice(1).join(' ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">Notes (optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Add any notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    {/* Split Type */}
                    <div className="form-group">
                        <label className="form-label">Split Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {['EQUAL', 'EXACT', 'PERCENTAGE'].map(type => (
                                <div
                                    key={type}
                                    onClick={() => handleSplitTypeChange(type)}
                                    style={{
                                        padding: '14px',
                                        background: formData.splitType === type ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
                                        border: formData.splitType === type ? '2px solid #6366f1' : '1px solid var(--border-default)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                                        {type === 'EQUAL' ? '⚖️' : type === 'EXACT' ? '💰' : '📊'}
                                    </div>
                                    <div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{type.charAt(0) + type.slice(1).toLowerCase()}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Split Inputs */}
                    {formData.splitType !== 'EQUAL' && (
                        <div className="form-group">
                            <label className="form-label">
                                {formData.splitType === 'EXACT' ? 'Enter Amounts' : 'Enter Percentages'}
                            </label>
                            <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '12px' }}>
                                {formData.splits.map((split) => (
                                    <div key={split.userId} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <span style={{ minWidth: '100px', fontSize: '0.9rem' }}>{split.name}</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            style={{ width: '100px' }}
                                            placeholder="0"
                                            min="0"
                                            value={formData.splitType === 'EXACT' ? split.amount : split.percentage}
                                            onChange={(e) => handleSplitChange(
                                                split.userId,
                                                formData.splitType === 'EXACT' ? 'amount' : 'percentage',
                                                e.target.value
                                            )}
                                        />
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            {formData.splitType === 'EXACT' ? '₹' : '%'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {formData.amount && (
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '12px', color: '#a5b4fc' }}>Split Preview</div>
                            {calculatePreview().map(split => (
                                <div key={split.userId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                                    <span>{split.name}</span>
                                    <span>{formatCurrency(split.previewAmount)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '⏳ Adding...' : '✨ Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Settle Up Modal
function SettleUpModal({ groupData, balances, currentUser, onClose, onSuccess, formatCurrency, getId }) {
    const [formData, setFormData] = useState({
        fromUserId: '',
        toUserId: '',
        amount: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Pre-fill with first balance if exists
    useEffect(() => {
        if (balances.length > 0) {
            const firstBalance = balances[0];
            setFormData({
                fromUserId: getId(firstBalance.from),
                toUserId: getId(firstBalance.to),
                amount: firstBalance.amount.toString()
            });
        }
    }, [balances]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/settlements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: getId(groupData),
                    fromUserId: formData.fromUserId,
                    toUserId: formData.toUserId,
                    amount: parseFloat(formData.amount)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to record settlement');
            }

            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">💸 Record Settlement</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '12px',
                            color: '#f87171',
                            marginBottom: '16px'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Quick Select from Balances */}
                    {balances.length > 0 && (
                        <div className="form-group">
                            <label className="form-label">Suggested Settlements</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {balances.slice(0, 3).map((balance, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setFormData({
                                            fromUserId: getId(balance.from),
                                            toUserId: getId(balance.to),
                                            amount: balance.amount.toString()
                                        })}
                                        style={{
                                            padding: '12px',
                                            background: 'var(--bg-surface)',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            border: '1px solid var(--border-default)'
                                        }}
                                    >
                                        <span>{balance.from?.name} → {balance.to?.name}</span>
                                        <span style={{ fontWeight: '600', color: '#f87171' }}>{formatCurrency(balance.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">From (who paid)</label>
                        <select
                            className="form-select"
                            value={formData.fromUserId}
                            onChange={(e) => setFormData({ ...formData, fromUserId: e.target.value })}
                            required
                        >
                            <option value="">Select...</option>
                            {groupData?.memberDetails?.map(member => (
                                <option key={getId(member)} value={getId(member)}>{member.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">To (who received)</label>
                        <select
                            className="form-select"
                            value={formData.toUserId}
                            onChange={(e) => setFormData({ ...formData, toUserId: e.target.value })}
                            required
                        >
                            <option value="">Select...</option>
                            {groupData?.memberDetails?.map(member => (
                                <option key={getId(member)} value={getId(member)}>{member.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0"
                            min="1"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '⏳ Recording...' : '✅ Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Add Member Modal
function AddMemberModal({ groupData, onClose, onSuccess, getId }) {
    const [email, setEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const searchUser = async () => {
        if (!email.trim()) return;

        setSearching(true);
        setError('');
        setFoundUser(null);

        try {
            const response = await fetch(`/api/users/email/${encodeURIComponent(email)}`);
            const data = await response.json();

            if (response.ok && data.exists) {
                // Check if already a member
                const isMember = groupData?.memberDetails?.some(m =>
                    getId(m) === data.user.id || m.email === email
                );

                if (isMember) {
                    setError('This user is already a member of this group');
                } else {
                    setFoundUser(data.user);
                }
            } else {
                setError('No user found with this email. They need to register first.');
            }
        } catch (err) {
            setError('Error searching for user');
        } finally {
            setSearching(false);
        }
    };

    const addMember = async () => {
        if (!foundUser) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/groups/${getId(groupData)}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: foundUser.id })
            });

            if (response.ok) {
                onSuccess();
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add member');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Add Member</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="form-group">
                    <label className="form-label">Search by Email</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Enter email address..."
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setFoundUser(null); setError(''); }}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchUser())}
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={searchUser}
                            disabled={searching}
                        >
                            {searching ? '🔍...' : '🔍 Find'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: error.includes('already') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: error.includes('already') ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '10px',
                        color: error.includes('already') ? '#fbbf24' : '#f87171',
                        marginBottom: '16px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                {foundUser && (
                    <div style={{
                        padding: '16px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '12px',
                        marginBottom: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1.25rem'
                            }}>
                                {foundUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600' }}>{foundUser.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{foundUser.email}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={addMember}
                        disabled={!foundUser || loading}
                    >
                        {loading ? '⏳ Adding...' : '➕ Add to Group'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GroupDetail;
