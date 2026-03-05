import { Download, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ResultViewerProps {
    generatedImage: string | null;
    userPrompt?: string;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ generatedImage, userPrompt }) => {
    const [copied, setCopied] = useState(false);

    if (!generatedImage) return null;

    const handleCopyPrompt = () => {
        if (!userPrompt) return;
        navigator.clipboard.writeText(userPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `VaroIntAi-Render-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)', border: '1px solid rgba(100, 243, 213, 0.3)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✨ Render Generado
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {userPrompt && (
                        <button
                            onClick={handleCopyPrompt}
                            className="btn-secondary"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: copied ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '20px',
                                cursor: 'pointer', color: copied ? '#50fa7b' : 'var(--color-text-secondary)',
                                fontSize: '12px', transition: 'all 0.2s'
                            }}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? '¡Copiado!' : 'Copiar Prompt'}
                        </button>
                    )}
                    <button
                        onClick={handleDownload}
                        className="btn-primary"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem',
                            boxShadow: '0 0 15px rgba(100, 243, 213, 0.2)'
                        }}
                    >
                        <Download size={18} /> Descargar Imagen
                    </button>
                    <button
                        title="Compartir"
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
                            padding: '10px', borderRadius: '50%', cursor: 'pointer', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Final Image Display */}
            <div
                style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: '#000',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <img
                    src={generatedImage}
                    alt="Generated Render"
                    style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '80vh', objectFit: 'contain' }}
                />

                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#64f3d5',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(100, 243, 213, 0.3)'
                }}>
                    RENDER FINAL
                </div>
            </div>

            <p style={{ marginTop: 'var(--spacing-md)', fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Tu render está listo. Puedes descargarlo o usar el prompt para crear variaciones.
            </p>
        </div>
    );
};

export default ResultViewer;
