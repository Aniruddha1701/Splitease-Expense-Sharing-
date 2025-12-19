import React from 'react';

function SimplifyDebts({ balances, formatCurrency }) {
    if (!balances || balances.length === 0) {
        return null;
    }

    const totalTransactions = balances.length;
    const totalAmount = balances.reduce((sum, b) => sum + b.amount, 0);

    return (
        <div style={{
            marginTop: '24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative gradient line at top */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #10b981, #059669)'
            }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}>
                        💡
                    </div>
                    <div>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#34d399',
                            marginBottom: '2px'
                        }}>
                            Smart Settlement Suggestion
                        </h3>
                        <p style={{
                            fontSize: '0.75rem',
                            color: '#64748b'
                        }}>
                            Optimal way to settle all debts
                        </p>
                    </div>
                </div>

                {/* Stats badges */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                        padding: '6px 12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#34d399'
                    }}>
                        {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
                    </div>
                    <div style={{
                        padding: '6px 12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#34d399'
                    }}>
                        Total: {formatCurrency(totalAmount)}
                    </div>
                </div>
            </div>

            {/* Settlement suggestions */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {balances.map((balance, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        borderRadius: '12px',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        transition: 'all 0.2s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            {/* Step number */}
                            <div style={{
                                width: '28px',
                                height: '28px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                {index + 1}
                            </div>

                            {/* From user */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>
                                    {balance.from?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span style={{ fontWeight: '600' }}>{balance.from?.name || 'Unknown'}</span>
                            </div>

                            {/* Arrow */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#fbbf24'
                            }}>
                                <span style={{ fontSize: '0.8rem' }}>pays</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>

                            {/* To user */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>
                                    {balance.to?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span style={{ fontWeight: '600' }}>{balance.to?.name || 'Unknown'}</span>
                            </div>
                        </div>

                        {/* Amount */}
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#34d399',
                            fontVariantNumeric: 'tabular-nums'
                        }}>
                            {formatCurrency(balance.amount)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer tip */}
            <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.8rem',
                color: '#94a3b8'
            }}>
                <span style={{ fontSize: '1rem' }}>✨</span>
                <span>
                    This is the <strong style={{ color: '#34d399' }}>minimum number of transactions</strong> needed to settle all debts in this group.
                </span>
            </div>
        </div>
    );
}

export default SimplifyDebts;
