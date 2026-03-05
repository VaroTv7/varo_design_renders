import React from 'react';
import { Layers, Menu } from 'lucide-react';

interface HeaderProps {
    onOpenSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
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
                    Varo<span style={{ color: 'var(--color-accent)' }}>INT</span>AIR
                </h1>
            </div>

            <nav className="flex-center" style={{ gap: 'var(--spacing-lg)' }}>
                <button style={{
                    background: 'none', border: 'none', color: 'var(--color-text-secondary)',
                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px'
                }} className="hover-highlight">
                    Historial
                </button>
                <button
                    onClick={onOpenSettings}
                    style={{
                        background: 'none', border: 'none', color: 'var(--color-text-primary)',
                        cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', fontSize: '14px'
                    }}
                    className="hover-highlight"
                >
                    Ajustes
                </button>
                <div style={{ width: '1px', height: '20px', background: 'var(--color-border)' }}></div>
                <button className="flex-center hover-highlight" style={{
                    background: 'none', border: 'none', color: 'var(--color-text-primary)',
                    cursor: 'pointer', transition: 'all 0.2s'
                }}>
                    <Menu size={24} />
                </button>
            </nav>
        </header>
    );
};

export default Header;
