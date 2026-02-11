import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Server, MessageSquare, Sliders, Info } from 'lucide-react';
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
    onSave: (prompts: SystemPrompts, apiKey: string, apiUrl: string, isDebug: boolean) => void;
    initialApiKey: string;
    initialApiUrl: string;
    initialIsDebug: boolean;
}

type Tab = 'api' | 'prompts' | 'advanced';

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    prompts,
    onSave,
    initialApiKey,
    initialApiUrl,
    initialIsDebug
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('api');
    const [localPrompts, setLocalPrompts] = useState<SystemPrompts>(prompts);
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [apiUrl, setApiUrl] = useState(initialApiUrl);
    const [isDebug, setIsDebug] = useState(initialIsDebug);

    useEffect(() => {
        if (isOpen) {
            setLocalPrompts(prompts);
            setApiKey(initialApiKey);
            setApiUrl(initialApiUrl);
            setIsDebug(initialIsDebug);
            setActiveTab('api');
        }
    }, [isOpen, prompts, initialApiKey, initialApiUrl, initialIsDebug]);

    const handleSave = () => {
        onSave(localPrompts, apiKey, apiUrl, isDebug);
        onClose();
    };

    const handleResetPrompts = () => {
        if (window.confirm('¿Estás seguro de que quieres restaurar todos los prompts a sus valores por defecto?')) {
            setLocalPrompts(DEFAULT_PROMPTS);
        }
    };

    const TabButton = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                flex: 1,
                padding: '12px',
                background: activeTab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === id ? '2px solid var(--color-accent)' : '2px solid transparent',
                color: activeTab === id ? 'white' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
            }}
        >
            <Icon size={16} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
        </button>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="modal-backdrop"
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, backdropFilter: 'blur(5px)' }}
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
                            maxWidth: '700px',
                            height: '80vh',
                            zIndex: 101,
                            display: 'flex',
                            flexDirection: 'column',
                            background: '#1a1a2e',
                            overflow: 'hidden',
                            padding: 0
                        }}
                    >
                        {/* Header */}
                        <div className="flex-between" style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <SettingsIcon /> Ajustes de Configuración
                            </h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)' }}>
                            <TabButton id="api" icon={Server} label="API y Modelo" />
                            <TabButton id="prompts" icon={MessageSquare} label="Prompts del Sistema" />
                            <TabButton id="advanced" icon={Sliders} label="Avanzado" />
                        </div>

                        {/* Content Content - Scrollable */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-lg)' }}>

                            {/* API TAB */}
                            {activeTab === 'api' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.03)' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--color-accent)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <Server size={18} /> Configuración del Servidor
                                        </h3>

                                        <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                                            <div style={{ position: 'relative', width: '40px', height: '22px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isDebug}
                                                    onChange={(e) => setIsDebug(e.target.checked)}
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                />
                                                <span style={{
                                                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                                    backgroundColor: isDebug ? 'var(--color-accent)' : '#ccc',
                                                    transition: '.4s', borderRadius: '34px'
                                                }} />
                                                <span style={{
                                                    position: 'absolute', content: '""', height: '16px', width: '16px', left: isDebug ? '20px' : '4px', bottom: '3px',
                                                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '1rem', fontWeight: 500 }}>Modo Debug (Mock API)</span>
                                        </label>

                                        {!isDebug && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                                        Endpoint de la API
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="input-field"
                                                        value={apiUrl}
                                                        onChange={(e) => setApiUrl(e.target.value)}
                                                        placeholder="https://api.nanobanana.com/v1/generate"
                                                        style={{ background: 'rgba(0,0,0,0.3)', fontFamily: 'monospace' }}
                                                    />
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                                                        URL completa del endpoint para generación de imágenes.
                                                    </p>
                                                </div>

                                                <div>
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
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PROMPTS TAB */}
                            {activeTab === 'prompts' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div className="flex-between">
                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                            Edita las instrucciones internas que guían a la IA en cada paso del proceso.
                                        </p>
                                        <button
                                            onClick={handleResetPrompts}
                                            style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '4px', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <RotateCcw size={14} /> Restaurar Todo
                                        </button>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>
                                            1. Análisis de Estilo
                                        </label>
                                        <textarea
                                            className="input-field"
                                            value={localPrompts.styleCheck}
                                            onChange={(e) => setLocalPrompts({ ...localPrompts, styleCheck: e.target.value })}
                                            style={{ minHeight: '100px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)', lineHeight: 1.5 }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>
                                            2. Integración de Objetos
                                        </label>
                                        <textarea
                                            className="input-field"
                                            value={localPrompts.objectIntegration}
                                            onChange={(e) => setLocalPrompts({ ...localPrompts, objectIntegration: e.target.value })}
                                            style={{ minHeight: '100px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)', lineHeight: 1.5 }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>
                                            3. Renderizado Final
                                        </label>
                                        <textarea
                                            className="input-field"
                                            value={localPrompts.finalRender}
                                            onChange={(e) => setLocalPrompts({ ...localPrompts, finalRender: e.target.value })}
                                            style={{ minHeight: '120px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)', lineHeight: 1.5 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ADVANCED TAB (Placeholders) */}
                            {activeTab === 'advanced' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', opacity: 0.7 }}>
                                    <div className="glass-panel" style={{ padding: '20px', borderStyle: 'dashed' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                            <Info size={18} color="var(--color-accent)" />
                                            <h4 style={{ margin: 0 }}>Funciones Experimentales (Próximamente)</h4>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Factor de Escalado (Upscale)</label>
                                            <input type="range" disabled style={{ width: '100%' }} />
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Formato de Salida</label>
                                            <select disabled className="input-field" style={{ width: '100%' }}>
                                                <option>PNG (Lossless)</option>
                                                <option>WEBP</option>
                                                <option>JPG</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Historial de Renders</label>
                                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px' }}>
                                                <input type="checkbox" disabled />
                                                <span style={{ color: 'var(--color-text-muted)' }}>Guardar historial localmente</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex-end" style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    padding: '8px 16px'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-primary flex-center"
                                onClick={handleSave}
                                style={{ gap: '6px', padding: '10px 24px' }}
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

const SettingsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
)

export default SettingsModal;
