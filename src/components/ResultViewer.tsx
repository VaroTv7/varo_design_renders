import React from 'react';
import { Download, Share2, Maximize2 } from 'lucide-react';

interface ResultViewerProps {
    originalImage: string | null;
    generatedImage: string | null;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ originalImage: _originalImage, generatedImage }) => {
    if (!generatedImage) return null;

    return (
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>Resultado Generado</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                        <Download size={18} />
                    </button>
                    <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                aspectRatio: '16/9',
                background: 'black'
            }}>
                <img
                    src={generatedImage}
                    alt="Generated Design"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />

                <button style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    color: 'white',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                }}>
                    <Maximize2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default ResultViewer;
