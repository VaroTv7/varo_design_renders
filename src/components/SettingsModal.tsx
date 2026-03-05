import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Server, MessageSquare, Sliders, Info, Plus, Trash2, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Key, Database, Code, FlaskConical, Layout as LayoutIcon, Settings as SettingsIconLucide } from 'lucide-react';
import { testConnection } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/modal.css';

export interface SystemPrompts {
    styleCheck: string;
    objectIntegration: string;
    finalRender: string;
}

export const DEFAULT_PROMPTS: SystemPrompts = {
    styleCheck: "Eres un experto en diseño de interiores y renderizado arquitectónico. Analiza la imagen base del viewport y las referencias de estilo proporcionadas. Extrae la paleta de colores, materiales, iluminación y atmósfera general para aplicarlos al render final.",
    objectIntegration: "Identifica los objetos y muebles en las imágenes de referencia. Intégralos de forma natural en la escena respetando la perspectiva, la escala, las sombras y la iluminación del entorno. Los objetos deben parecer parte orgánica del espacio.",
    finalRender: "Genera un render fotorrealista de alta calidad profesional. El resultado debe parecer una fotografía de revista de arquitectura: iluminación natural suave, materiales realistas, reflejos sutiles y profundidad de campo. Mantén la composición y perspectiva de la imagen original."
};

interface Preset {
    name: string;
    prompts: SystemPrompts;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    prompts: SystemPrompts;
    onSave: (prompts: SystemPrompts, apiKey: string, model: string, isDebug: boolean, upscale: string, format: string, history: boolean) => void;
    initialApiKey: string;
    initialModel: string;
    initialIsDebug: boolean;
    initialUpscale: string;
    initialFormat: string;
    initialHistory: boolean;
}

type Tab = 'api' | 'prompts' | 'advanced';

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    prompts,
    onSave,
    initialApiKey,
    initialModel,
    initialIsDebug,
    initialUpscale,
    initialFormat,
    initialHistory
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('api');
    const [localPrompts, setLocalPrompts] = useState<SystemPrompts>(prompts);
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [model, setModel] = useState(initialModel);
    const [isDebug, setIsDebug] = useState(initialIsDebug);

    // Advanced Settings State
    const [upscale, setUpscale] = useState(initialUpscale);
    const [format, setFormat] = useState(initialFormat);
    const [history, setHistory] = useState(initialHistory);

    // Presets State
    const [presets, setPresets] = useState<Preset[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<string>('');

    // API Testing State
    const [testStatus, setTestStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    const handleTestConnection = async () => {
        setTestStatus({ type: 'loading', message: 'Verificando con Google...' });
        const result = await testConnection(apiKey, model);
        if (result.success) {
            setTestStatus({ type: 'success', message: result.message });
        } else {
            setTestStatus({ type: 'error', message: result.message });
        }
    };

    useEffect(() => {
        if (isOpen) {
            setLocalPrompts(prompts);
            setApiKey(initialApiKey);
            setModel(initialModel);
            setIsDebug(initialIsDebug);
            setUpscale(initialUpscale);
            setFormat(initialFormat);
            setHistory(initialHistory);
            setActiveTab('api');
            setTestStatus({ type: 'idle', message: '' });

            // Load presets
            const savedPresets = localStorage.getItem('interiorismo_prompt_presets');
            if (savedPresets) {
                try {
                    setPresets(JSON.parse(savedPresets));
                } catch (e) {
                    console.error("Failed to parse presets", e);
                }
            }
        }
    }, [isOpen, prompts, initialApiKey, initialModel, initialIsDebug, initialUpscale, initialFormat, initialHistory]);

    const handleSave = () => {
        onSave(localPrompts, apiKey, model, isDebug, upscale, format, history);
        onClose();
    };

    const handleResetPrompts = () => {
        if (window.confirm('¿Estás seguro de que quieres restaurar todos los prompts a sus valores por defecto?')) {
            setLocalPrompts(DEFAULT_PROMPTS);
            setSelectedPreset('');
        }
    };

    const handleSavePreset = () => {
        const name = prompt("Nombre para este Preset de Prompts:", "Nuevo Preset");
        if (name) {
            const newPreset = { name, prompts: localPrompts };
            const newPresets = [...presets, newPreset];
            setPresets(newPresets);
            localStorage.setItem('interiorismo_prompt_presets', JSON.stringify(newPresets));
            setSelectedPreset(name);
            alert(`Preset "${name}" guardado.`);
        }
    };

    const handleLoadPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const name = e.target.value;
        setSelectedPreset(name);

        if (name === '') return;

        const preset = presets.find(p => p.name === name);
        if (preset) {
            setLocalPrompts(preset.prompts);
        }
    };

    const handleDeletePreset = () => {
        if (!selectedPreset) return;
        if (window.confirm(`¿Eliminar preset "${selectedPreset}"?`)) {
            const newPresets = presets.filter(p => p.name !== selectedPreset);
            setPresets(newPresets);
            localStorage.setItem('interiorismo_prompt_presets', JSON.stringify(newPresets));
            setSelectedPreset('');
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="settings-modal"
                    >
                        {/* Header */}
                        <div className="flex-between" style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <SettingsIcon /> Ajustes de Configuración
                            </h2>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                            <TabButton id="api" icon={Server} label="API y Modelo" />
                            <TabButton id="prompts" icon={MessageSquare} label="Prompts del Sistema" />
                            <TabButton id="advanced" icon={Sliders} label="Avanzado" />
                        </div>

                        {/* Content - Scrollable */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-lg)', minHeight: 0 }}>

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
                                                        Modelo de IA (Nano Banana Series)
                                                    </label>
                                                    <select
                                                        className="input-field"
                                                        value={model}
                                                        onChange={(e) => setModel(e.target.value)}
                                                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: model.includes('pro') ? '1px solid var(--color-accent)' : '1px solid var(--color-border)' }}
                                                    >
                                                        <option value="gemini-3-pro-image-preview">💎 Nano Banana Pro (Gemini 3 Pro Image — Recomendado Pago/Pro)</option>
                                                        <option value="gemini-3.1-flash-image-preview">⭐ Nano Banana 2 (Gemini 3.1 Flash Image — Alta Eficiencia)</option>
                                                        <option value="gemini-2.5-flash-image">⚡ Nano Banana (Gemini 2.5 Flash Image — Rápido/Gratis)</option>
                                                        <option value="gemini-2.0-flash">🚀 Gemini 2.0 Flash (Multimodal Estable — Backup)</option>
                                                    </select>

                                                    <button
                                                        onClick={handleTestConnection}
                                                        disabled={testStatus.type === 'loading' || !apiKey}
                                                        style={{
                                                            marginTop: '12px',
                                                            width: '100%',
                                                            padding: '10px',
                                                            borderRadius: 'var(--radius-sm)',
                                                            background: 'rgba(100, 243, 213, 0.1)',
                                                            border: '1px solid rgba(100, 243, 213, 0.3)',
                                                            color: 'var(--color-accent)',
                                                            cursor: (testStatus.type === 'loading' || !apiKey) ? 'not-allowed' : 'pointer',
                                                            fontSize: '0.85rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {testStatus.type === 'loading' ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                                        Probar Conexión y Cuota 0
                                                    </button>

                                                    {testStatus.type !== 'idle' && (
                                                        <div style={{
                                                            marginTop: '10px',
                                                            padding: '10px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.8rem',
                                                            background: testStatus.type === 'success' ? 'rgba(0,255,100,0.05)' : 'rgba(255,0,0,0.05)',
                                                            border: `1px solid ${testStatus.type === 'success' ? 'rgba(0,255,100,0.2)' : 'rgba(255,0,0,0.2)'}`,
                                                            color: testStatus.type === 'success' ? '#50fa7b' : '#ff5555',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {testStatus.message}
                                                        </div>
                                                    )}

                                                    <div style={{
                                                        marginTop: '20px',
                                                        padding: '12px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        borderRadius: 'var(--radius-md)',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
                                                            <Info size={14} color="var(--color-accent)" /> Ayuda para Usuarios Pro
                                                        </h4>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.4', margin: 0 }}>
                                                            ⚠️ Si tienes la suscripción <strong>Gemini Advanced</strong> de 20€/mes, esta NO te da créditos para la API.
                                                            <br /><br />
                                                            Para usar los modelos Pro aquí, necesitas asociar una "Tarjeta de Facturación" directamente en la <a href="https://console.cloud.google.com/billing" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>Consola de Google Cloud</a> de tu proyecto.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                                        API Key (Google AI Studio)
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="input-field"
                                                        value={apiKey}
                                                        onChange={(e) => setApiKey(e.target.value)}
                                                        placeholder="AIza..."
                                                        style={{ background: 'rgba(0,0,0,0.3)', fontFamily: 'monospace' }}
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

                                    {/* PRESETS CONTROL */}
                                    <div className="glass-panel" style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                            <div style={{ flex: 1, minWidth: '200px' }}>
                                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                                    Versión / Preset:
                                                </label>
                                                <select
                                                    className="input-field"
                                                    style={{ width: '100%', padding: '8px' }}
                                                    value={selectedPreset}
                                                    onChange={handleLoadPreset}
                                                >
                                                    <option value="">-- Personalizado --</option>
                                                    {presets.map((p, idx) => (
                                                        <option key={idx} value={p.name}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                                                <button
                                                    onClick={handleSavePreset}
                                                    title="Guardar como Preset"
                                                    style={{ background: 'var(--color-accent)', border: 'none', borderRadius: '4px', padding: '8px', color: '#000', cursor: 'pointer' }}
                                                >
                                                    <Plus size={18} />
                                                </button>
                                                {selectedPreset && (
                                                    <button
                                                        onClick={handleDeletePreset}
                                                        title="Eliminar Preset"
                                                        style={{ background: 'rgba(255, 50, 50, 0.2)', border: '1px solid rgba(255, 50, 50, 0.5)', borderRadius: '4px', padding: '8px', color: '#ff6b6b', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

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

                            {/* ADVANCED TAB */}
                            {activeTab === 'advanced' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div className="glass-panel" style={{ padding: '20px', borderStyle: 'dashed' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                            <Info size={18} color="var(--color-accent)" />
                                            <h4 style={{ margin: 0 }}>Funciones Avanzadas</h4>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <label style={{ color: 'var(--color-text-secondary)' }}>Factor de Escalado (Upscale)</label>
                                                <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{upscale}x</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="4"
                                                step="1"
                                                value={upscale}
                                                onChange={(e) => setUpscale(e.target.value)}
                                                style={{ width: '100%', cursor: 'pointer' }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                                <span>1x (Original)</span>
                                                <span>2x (HD)</span>
                                                <span>3x</span>
                                                <span>4x (Ultra)</span>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Formato de Salida</label>
                                            <select
                                                className="input-field"
                                                value={format}
                                                onChange={(e) => setFormat(e.target.value)}
                                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)' }}
                                            >
                                                <option value="png">PNG (Lossless)</option>
                                                <option value="webp">WEBP (Optimized)</option>
                                                <option value="jpg">JPG (Standard)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Historial de Renders</label>
                                            <label className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                                <div style={{ position: 'relative', width: '40px', height: '22px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={history}
                                                        onChange={(e) => setHistory(e.target.checked)}
                                                        style={{ opacity: 0, width: 0, height: 0 }}
                                                    />
                                                    <span style={{
                                                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                                        backgroundColor: history ? 'var(--color-accent)' : '#ccc',
                                                        transition: '.4s', borderRadius: '34px'
                                                    }} />
                                                    <span style={{
                                                        position: 'absolute', content: '""', height: '16px', width: '16px', left: history ? '20px' : '4px', bottom: '3px',
                                                        backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                                                    }} />
                                                </div>
                                                <span style={{ color: 'var(--color-text-muted)' }}>Guardar historial localmente</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex-end" style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)', gap: '12px', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
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
