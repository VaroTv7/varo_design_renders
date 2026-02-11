import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SystemPrompts {
    styleCheck: string;
    objectIntegration: string;
    finalRender: string;
}

export const DEFAULT_PROMPTS: SystemPrompts = {
    styleCheck: "Analiza las imágenes de referencia y extrae el estilo clave, paleta de colores e iluminación.",
    objectIntegration: "Identifica los objetos en las imágenes subidas y determina la mejor ubicación y escala en la escena.",
    finalRender: "Genera un render fotorrealista de alta calidad aplicando el estilo extraído y los objetos a la captura del viewport."
};

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    prompts: SystemPrompts;
    onSave: (prompts: SystemPrompts, apiKey: string, isDebug: boolean) => void;
    initialApiKey: string;
    initialIsDebug: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    prompts,
    onSave,
    initialApiKey,
    initialIsDebug
}) => {
    const [localPrompts, setLocalPrompts] = useState<SystemPrompts>(prompts);
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [isDebug, setIsDebug] = useState(initialIsDebug);

    // Sync local state when prop changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalPrompts(prompts);
            setApiKey(initialApiKey);
            setIsDebug(initialIsDebug);
        }
    }, [isOpen, prompts, initialApiKey, initialIsDebug]);

    const handleSave = () => {
        onSave(localPrompts, apiKey, isDebug);
        onClose();
    };

    const handleReset = () => {
        setLocalPrompts(DEFAULT_PROMPTS);
        // Don't reset API key for safety, maybe debug mode yes
        setIsDebug(true);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 100,
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="glass-panel"
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '85vh',
                            zIndex: 101,
                            padding: 'var(--spacing-lg)',
                            display: 'flex',
                            flexDirection: 'column',
                            background: '#1a1a2e', // darker solid backing for readability
                            overflowY: 'auto'     // Allow scrolling if content is tall
                        }}
                    >
                        <div className="flex-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold' }}>Ajustes del Sistema</h2>
                            <button
                                onClick={onClose}
                                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>

                            {/* API Configuration Section */}
                            <div style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--color-accent)' }}>Configuración API</h3>

                                <div style={{ marginBottom: '12px' }}>
                                    <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={isDebug}
                                            onChange={(e) => setIsDebug(e.target.checked)}
                                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)' }}
                                        />
                                        <span style={{ fontSize: '0.95rem' }}>Modo Debug (Mock API - Sin coste)</span>
                                    </label>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '28px', marginTop: '4px' }}>
                                        Si está activo, no se enviarán peticiones reales a la API. Útil para pruebas.
                                    </p>
                                </div>

                                {!isDebug && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                            API Key (Nano Banana Pro)
                                        </label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="sk-..."
                                            style={{ background: 'rgba(0,0,0,0.3)' }}
                                        />
                                    </motion.div>
                                )}
                            </div>

                            {/* Prompts Section */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    Prompt de Análisis de Estilo
                                </label>
                                <textarea
                                    className="input-field"
                                    value={localPrompts.styleCheck}
                                    onChange={(e) => setLocalPrompts({ ...localPrompts, styleCheck: e.target.value })}
                                    style={{ minHeight: '80px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    Prompt de Integración de Objetos
                                </label>
                                <textarea
                                    className="input-field"
                                    value={localPrompts.objectIntegration}
                                    onChange={(e) => setLocalPrompts({ ...localPrompts, objectIntegration: e.target.value })}
                                    style={{ minHeight: '80px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    Prompt de Renderizado Final
                                </label>
                                <textarea
                                    className="input-field"
                                    value={localPrompts.finalRender}
                                    onChange={(e) => setLocalPrompts({ ...localPrompts, finalRender: e.target.value })}
                                    style={{ minHeight: '100px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)' }}
                                />
                            </div>
                        </div>

                        <div className="flex-between" style={{ marginTop: 'auto', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
                            <button
                                onClick={handleReset}
                                className="flex-center"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-secondary)',
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-full)',
                                    cursor: 'pointer',
                                    gap: '6px'
                                }}
                            >
                                <RotateCcw size={16} /> Restaurar Por Defecto
                            </button>

                            <button
                                className="btn-primary flex-center"
                                onClick={handleSave}
                                style={{ gap: '6px' }}
                            >
                                <Save size={18} /> Guardar Cambios
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
