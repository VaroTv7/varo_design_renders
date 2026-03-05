import React from 'react';
import type { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
    className?: string; // Allow passing standard className
    onOpenSettings?: () => void;
    extraActions?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '', onOpenSettings, extraActions }) => {
    return (
        <>
            <Header onOpenSettings={onOpenSettings} extraActions={extraActions} />
            <main className={`container ${className}`} style={{
                paddingTop: 'calc(var(--spacing-2xl) * 2 + 20px)', /* Account for fixed header */
                paddingBottom: 'var(--spacing-2xl)',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {children}
            </main>

            {/* Background ambient effects */}
            <div style={{
                position: 'fixed',
                top: '20%',
                left: '10%',
                width: '400px',
                height: '400px',
                background: 'var(--color-accent)',
                filter: 'blur(150px)',
                opacity: 0.1,
                pointerEvents: 'none',
                zIndex: -1
            }} />
            <div style={{
                position: 'fixed',
                bottom: '10%',
                right: '5%',
                width: '300px',
                height: '300px',
                background: '#a29bfe',
                filter: 'blur(120px)',
                opacity: 0.08,
                pointerEvents: 'none',
                zIndex: -1
            }} />
        </>
    );
};

export default Layout;
