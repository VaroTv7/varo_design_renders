import { Download, Share2, Maximize2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ResultViewerProps {
    originalImage: string | null;
    generatedImage: string | null;
    userPrompt?: string;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ originalImage: _originalImage, generatedImage, userPrompt }) => {
    const [copied, setCopied] = useState(false);

    if (!generatedImage) return null;

    const handleCopyPrompt = () => {
        if (!userPrompt) return;
        navigator.clipboard.writeText(userPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>Resultado Generado</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {userPrompt && (
                        <button
                            onClick={handleCopyPrompt}
                            className="btn-secondary"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: copied ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255,255,255,0.1)',
                                border: 'none', padding: '6px 12px', borderRadius: '20px',
                                cursor: 'pointer', color: copied ? '#50fa7b' : 'white',
                                fontSize: '12px', transition: 'all 0.2s'
                            }}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? '¡Copiado!' : 'Copiar Prompt'}
                        </button>
                    )}
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
