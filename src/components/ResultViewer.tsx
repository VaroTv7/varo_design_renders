import { Download, Share2, Maximize2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ResultViewerProps {
    originalImage: string | null;
    generatedImage: string | null;
    userPrompt?: string;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ originalImage, generatedImage, userPrompt }) => {
    const [copied, setCopied] = useState(false);
    const [sliderPos, setSliderPos] = useState(50);
    const [isResizing, setIsResizing] = useState(false);

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

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isResizing) return;
        const container = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const position = ((x - container.left) / container.width) * 100;
        setSliderPos(Math.max(0, Math.min(100, position)));
    };

    return (
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-accent)' }}>
                    ✨ Render Finalizado
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
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
                        title="Descargar imagen"
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
                            padding: '8px', borderRadius: '50%', cursor: 'pointer', color: 'white'
                        }}
                    >
                        <Download size={18} />
                    </button>
                    <button
                        title="Compartir"
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
                            padding: '8px', borderRadius: '50%', cursor: 'pointer', color: 'white'
                        }}
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* Comparison Slider */}
            <div
                style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    aspectRatio: '16/9',
                    background: '#000',
                    cursor: isResizing ? 'col-resize' : 'default',
                    userSelect: 'none'
                }}
                onMouseMove={handleMove}
                onTouchMove={handleMove}
                onMouseDown={() => setIsResizing(true)}
                onMouseUp={() => setIsResizing(false)}
                onMouseLeave={() => setIsResizing(false)}
                onTouchStart={() => setIsResizing(true)}
                onTouchEnd={() => setIsResizing(false)}
            >
                {/* Original (Bottom Layer) */}
                {originalImage && (
                    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                        <img
                            src={originalImage}
                            alt="Original Capture"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(0.5) contrast(0.8)' }}
                        />
                        <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: 'white', backdropFilter: 'blur(4px)' }}>
                            CAPTURADO (ANTES)
                        </div>
                    </div>
                )}

                {/* Generated (Top Layer with Clip) */}
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                    }}
                >
                    <img
                        src={generatedImage}
                        alt="Generated Render"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(100, 243, 213, 0.3)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: '#64f3d5', backdropFilter: 'blur(4px)', border: '1px solid rgba(100, 243, 213, 0.4)', clipPath: 'none' }}>
                        VaroIntAi RENDER (DESPUÉS)
                    </div>
                </div>

                {/* Slider Handle */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${sliderPos}%`,
                        width: '2px',
                        background: '#64f3d5',
                        boxShadow: '0 0 10px rgba(100, 243, 213, 0.5)',
                        zIndex: 10,
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#1a1a2e',
                        border: '2px solid #64f3d5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64f3d5',
                        cursor: 'col-resize',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                        <Maximize2 size={16} style={{ transform: 'rotate(45deg)' }} />
                    </div>
                </div>
            </div>

            <p style={{ marginTop: 'var(--spacing-md)', fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Desliza la barra para comparar la captura original con el render final.
            </p>
        </div>
    );
};

export default ResultViewer;
