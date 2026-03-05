import React from 'react';
import type { RenderHistoryItem } from '../services/history';
import { Trash2, ExternalLink, Download, Clock } from 'lucide-react';

interface HistoryListProps {
    history: RenderHistoryItem[];
    onSelect: (item: RenderHistoryItem) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onDelete, onClear }) => {
    if (history.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <Clock size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Aún no tienes renders en el historial.</p>
                <p style={{ fontSize: '0.8rem' }}>Los renders que generes aparecerán aquí automáticamente.</p>
            </div>
        );
    }

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(timestamp));
    };

    const handleDownload = (item: RenderHistoryItem) => {
        const link = document.createElement('a');
        link.href = item.generatedImage;
        link.download = `VaroIntAi-History-${item.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex-between">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="var(--color-accent)" /> Historial de Diseños
                </h3>
                <button
                    onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres borrar TODO el historial?')) {
                            onClear();
                        }
                    }}
                    style={{
                        background: 'rgba(255,50,50,0.1)',
                        border: '1px solid rgba(255,50,50,0.3)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        color: '#ff6b6b',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                    }}
                >
                    Borrar Todo
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem'
            }}>
                {history.map((item) => (
                    <div
                        key={item.id}
                        className="glass-panel"
                        style={{
                            padding: '12px',
                            display: 'flex',
                            gap: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--color-border)',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}
                    >
                        <div
                            style={{
                                width: '120px',
                                height: '80px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                background: '#000',
                                position: 'relative'
                            }}
                        >
                            <img
                                src={item.generatedImage}
                                alt="Render"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {formatDate(item.timestamp)} • {item.model}
                                    </span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => handleDownload(item)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}
                                            title="Descargar"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,50,50,0.6)', cursor: 'pointer', padding: '4px' }}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--color-text-secondary)',
                                    margin: '4px 0',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: 1.3
                                }}>
                                    {item.prompt || 'Sin descripción'}
                                </p>
                            </div>

                            <button
                                onClick={() => onSelect(item)}
                                style={{
                                    alignSelf: 'flex-end',
                                    fontSize: '0.75rem',
                                    color: 'var(--color-accent)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: 600
                                }}
                            >
                                <ExternalLink size={12} /> Cargar en Visor
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryList;
