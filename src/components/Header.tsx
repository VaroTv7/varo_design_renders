import React from 'react';
import { Layers, Menu } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="glass-panel" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            margin: 'var(--spacing-md)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div className="flex-center" style={{ gap: 'var(--spacing-sm)' }}>
                <Layers className="text-accent" size={24} style={{ color: 'var(--color-accent)' }} />
                <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
                    INT<span style={{ color: 'var(--color-accent)' }}>AI</span>R
                </h1>
            </div>

            <nav className="flex-center" style={{ gap: 'var(--spacing-lg)' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    History
                </button>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    Settings
                </button>
                <div style={{ width: '1px', height: '20px', background: 'var(--color-border)' }}></div>
                <button className="flex-center" style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                    <Menu size={24} />
                </button>
            </nav>
        </header>
    );
};

export default Header;
