import React from 'react';

function Footer() {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '24px 0',
            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
            background: 'rgba(15, 23, 42, 0.5)'
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem'
                    }}>
                        💰
                    </div>
                    <span style={{
                        fontSize: '0.875rem',
                        color: '#64748b'
                    }}>
                        SplitEase — Split expenses with ease
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    fontSize: '0.8rem',
                    color: '#64748b'
                }}>
                    <span>Built with React + Express</span>
                    <span style={{ color: '#475569' }}>•</span>
                    <span>© 2024 SplitEase</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
