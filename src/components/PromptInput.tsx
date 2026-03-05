import React from 'react';
import { Zap } from 'lucide-react';

interface PromptInputProps {
    prompt: string;
    setPrompt: React.Dispatch<React.SetStateAction<string>>;
    onGenerate: () => void;
    isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
    return (
        <div className="glass-panel" style={{ padding: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
            <div style={{ position: 'relative' }}>
                <textarea
                    className="input-field"
                    placeholder="Describe el render que necesitas (ej: 'Salón minimalista con sofá gris, mesa de nogal, iluminación cálida natural, acabado fotorrealista 4K')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    style={{
                        minHeight: '100px',
                        resize: 'vertical',
                        background: 'rgba(0,0,0,0.3)',
                        paddingRight: '60px'
                    }}
                />
                <button
                    className="btn-primary"
                    onClick={onGenerate}
                    disabled={isLoading || !prompt.trim()}
                    style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        padding: '8px 16px',
                        fontSize: 'var(--font-size-sm)',
                        opacity: isLoading || !prompt.trim() ? 0.5 : 1,
                        cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {isLoading ? (
                        'Generando...'
                    ) : (
                        <>
                            Generar <Zap size={16} fill="currentColor" />
                        </>
                    )}
                </button>
            </div>

            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginTop: '12px' }}>
                {['Moderno', 'Industrial', 'Nórdico', 'Lujo', 'Rústico', 'Japandi'].map((style) => (
                    <button
                        key={style}
                        onClick={() => setPrompt((prev) => `${prev} estilo ${style.toLowerCase()}, `)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-full)',
                            padding: '4px 12px',
                            color: 'var(--color-text-secondary)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        + {style}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PromptInput;
