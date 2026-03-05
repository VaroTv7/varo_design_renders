import Layout from './components/Layout'
import ImageUpload from './components/ImageUpload'
import MultiImageUpload from './components/MultiImageUpload'
import type { ImageReference } from './components/MultiImageUpload'
import PromptInput from './components/PromptInput'
import ResultViewer from './components/ResultViewer'
import SettingsModal, { DEFAULT_PROMPTS } from './components/SettingsModal'
import type { SystemPrompts } from './components/SettingsModal'
import CanvasEditor, { type Zone } from './components/CanvasEditor'
import { useState, useEffect } from 'react'
import { generateRender } from './services/api'
import { Edit2, Check } from 'lucide-react'

function App() {
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Memory Management: Revoke preview URLs
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const [styleRefs, setStyleRefs] = useState<ImageReference[]>([]);
    const [objectRefs, setObjectRefs] = useState<ImageReference[]>([]);

    const [prompt, setPrompt] = useState(() => sessionStorage.getItem('interiorismo_current_prompt') || '');
    const [showGuide, setShowGuide] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
    const isLoading = !!loadingStatus;
    const [result, setResult] = useState<string | null>(null);

    const [systemPrompts, setSystemPrompts] = useState<SystemPrompts>(DEFAULT_PROMPTS);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('interiorismo_api_key') || '');
    const [model, setModel] = useState(() => {
        const saved = localStorage.getItem('interiorismo_model');
        // Migración: Si el usuario tiene el modelo preview que falla con cuota 0, 
        // lo pasamos automáticamente al estable de la versión 1.1.
        if (saved === 'gemini-3.1-flash-image-preview' || !saved) {
            localStorage.setItem('interiorismo_model', 'gemini-2.0-flash');
            return 'gemini-2.0-flash';
        }
        return saved;
    });
    const [isDebug, setIsDebug] = useState(() => localStorage.getItem('interiorismo_debug') === 'true'); // Default false (production)

    // Advanced Settings
    const [upscale, setUpscale] = useState(() => localStorage.getItem('interiorismo_upscale') || '1');
    const [format, setFormat] = useState(() => localStorage.getItem('interiorismo_format') || 'png');
    const [history, setHistory] = useState(() => localStorage.getItem('interiorismo_history') === 'true'); // Default false

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [maskBlob, setMaskBlob] = useState<Blob | null>(null);
    const [editorZones, setEditorZones] = useState<Zone[]>([]);

    // Persistent Prompt
    useEffect(() => {
        sessionStorage.setItem('interiorismo_current_prompt', prompt);
    }, [prompt]);

    // Global Drag & Drop Support
    useEffect(() => {
        const handleGlobalDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    handleImageSelect(file);
                }
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        window.addEventListener('drop', handleGlobalDrop);
        window.addEventListener('dragover', handleDragOver);

        return () => {
            window.removeEventListener('drop', handleGlobalDrop);
            window.removeEventListener('dragover', handleDragOver);
        };
    }, []);

    const handleImageSelect = (file: File) => {
        setImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setResult(null);
        // Reset editor on new image
        setMaskBlob(null);
        setEditorZones([]);
    };

    const handleClear = () => {
        setImage(null);
        setPreviewUrl(null);
        setResult(null);
        setMaskBlob(null);
        setEditorZones([]);
    };

    const handleGenerate = async () => {
        if (!image) return;

        if (!isDebug && !apiKey) {
            setIsSettingsOpen(true);
            alert('Introduce tu API Key de Google AI Studio en Ajustes para generar renders.');
            return;
        }

        setLoadingStatus("Preparando imágenes...");
        try {
            const res = await generateRender({
                image,
                styleRefs,
                objectRefs,
                prompt,
                systemPrompts,
                isDebug,
                apiKey,
                model,
                upscale: parseInt(upscale),
                format: format as any,
                history,
                mask: maskBlob,
                onProgress: (status) => setLoadingStatus(status)
            });

            if (res.error) {
                alert(res.error);
            } else {
                setResult(res.imageUrl);
                // Optionally scroll to result
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error en la generación');
        } finally {
            setLoadingStatus(null);
        }
    };

    const handleSaveSettings = (
        prompts: SystemPrompts,
        newApiKey: string,
        newModel: string,
        newIsDebug: boolean,
        newUpscale: string,
        newFormat: string,
        newHistory: boolean
    ) => {
        setSystemPrompts(prompts);

        setApiKey(newApiKey);
        localStorage.setItem('interiorismo_api_key', newApiKey);

        setModel(newModel);
        localStorage.setItem('interiorismo_model', newModel);

        setIsDebug(newIsDebug);
        localStorage.setItem('interiorismo_debug', String(newIsDebug));

        setUpscale(newUpscale);
        localStorage.setItem('interiorismo_upscale', newUpscale);

        setFormat(newFormat);
        localStorage.setItem('interiorismo_format', newFormat);

        setHistory(newHistory);
        localStorage.setItem('interiorismo_history', String(newHistory));
    };

    const handleSaveEditorMask = (blob: Blob | null, zones: Zone[]) => {
        setMaskBlob(blob);
        setEditorZones(zones);
        setIsEditorOpen(false);
    };

    return (
        <Layout className="flex-center" onOpenSettings={() => setIsSettingsOpen(true)}>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                prompts={systemPrompts}
                onSave={handleSaveSettings}
                initialApiKey={apiKey}
                initialModel={model}
                initialIsDebug={isDebug}
                initialUpscale={upscale}
                initialFormat={format}
                initialHistory={history}
            />

            <div style={{ maxWidth: '800px', width: '100%', paddingBottom: '100px' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #64f3d5, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                        VaroIntAi Designs
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)' }}>
                        Transforma capturas del viewport en renders fotorrealistas con IA.
                    </p>
                    {isDebug && (
                        <div style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: 'rgba(255, 193, 7, 0.2)',
                            color: '#ffc107',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255, 193, 7, 0.3)'
                        }}>
                            MODO DEBUG ACTIVO (MOCK)
                        </div>
                    )}
                </div>

                {/* Instructions Panel */}
                <div className="glass-panel" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        style={{
                            width: '100%',
                            padding: '14px 20px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.95rem',
                            fontWeight: 600
                        }}
                    >
                        <span>📋 ¿Cómo funciona? — Guía rápida</span>
                        <span style={{ transform: showGuide ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: '1.2rem' }}>▼</span>
                    </button>
                    {showGuide && (
                        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '4px' }} />
                            {[
                                { step: '1', icon: '📸', title: 'Sube tu captura', desc: 'Sube una captura de pantalla de tu modelo 3D o del espacio que quieres transformar.' },
                                { step: '2', icon: '🎨', title: 'Añade referencias de estilo', desc: 'Sube imágenes de referencia (Pinterest, revistas, etc.) para guiar la estética del render.' },
                                { step: '3', icon: '🪑', title: 'Añade muebles/objetos', desc: 'Sube recortes de muebles u objetos específicos que quieres integrar en la escena.' },
                                { step: '4', icon: '✏️', title: 'Usa el Editor (opcional)', desc: 'Dibuja zonas para indicar dónde colocar cada objeto y añade anotaciones a mano alzada.' },
                                { step: '5', icon: '💬', title: 'Escribe tu prompt', desc: 'Describe el resultado deseado: materiales, iluminación, estilo, ambiente. Usa los tags rápidos.' },
                                { step: '6', icon: '⚡', title: 'Generar Render', desc: 'Pulsa "Generar" y la IA creará un render fotorrealista basado en tus instrucciones.' },
                            ].map((item) => (
                                <div key={item.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        minWidth: '36px', height: '36px',
                                        borderRadius: '50%',
                                        background: 'rgba(100, 243, 213, 0.15)',
                                        border: '1px solid rgba(100, 243, 213, 0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                                            {item.step}. {item.title}
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.4, marginTop: '2px' }}>
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(100, 243, 213, 0.08)', border: '1px solid rgba(100, 243, 213, 0.2)', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                                💡 <strong>Consejo:</strong> Usa <strong>Gemini 2.0 Flash</strong> con tu API Key gratuita de <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>Google AI Studio</a> (500 renders/día gratis). Los modelos Nano Banana requieren facturación.
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ImageUpload
                            onImageSelect={handleImageSelect}
                            previewUrl={previewUrl}
                            onClear={handleClear}
                            label="1. Captura del Viewport (Base)"
                        />

                        {previewUrl && (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setIsEditorOpen(true)}
                                    className="glass-panel"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '8px 16px', borderRadius: '8px',
                                        cursor: 'pointer', border: '1px solid var(--color-border)',
                                        background: maskBlob ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                        color: maskBlob ? '#50fa7b' : 'var(--color-text-primary)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {maskBlob ? <Check size={16} /> : <Edit2 size={16} />}
                                    {maskBlob ? 'Edición Aplicada' : 'Dibujar Zonas / Anotar'}
                                </button>
                            </div>
                        )}
                    </div>

                    {previewUrl && (
                        <div className="glass-panel" style={{ padding: 'var(--spacing-lg)' }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                                2. Contexto y Detalles
                            </h2>

                            <MultiImageUpload
                                label="Referencias de Estilo"
                                images={styleRefs}
                                onImagesChange={setStyleRefs}
                                maxImages={5}
                            />

                            <MultiImageUpload
                                label="Objetos y Muebles a Integrar"
                                images={objectRefs}
                                onImagesChange={setObjectRefs}
                                maxImages={5}
                            />
                        </div>
                    )}

                    {previewUrl && (
                        <div style={{ position: 'relative' }}>
                            <PromptInput
                                prompt={prompt}
                                setPrompt={setPrompt}
                                onGenerate={handleGenerate}
                                isLoading={isLoading}
                            />
                            {loadingStatus && (
                                <div style={{
                                    marginTop: '8px',
                                    textAlign: 'center',
                                    fontSize: '0.85rem',
                                    color: 'var(--color-accent)',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    <div className="pulse-loader" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)' }} />
                                    {loadingStatus}
                                </div>
                            )}
                        </div>
                    )}

                    {result && (
                        <ResultViewer
                            originalImage={previewUrl}
                            generatedImage={result}
                            userPrompt={prompt}
                        />
                    )}
                </div>
            </div>

            <CanvasEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                imageUrl={previewUrl}
                onSave={handleSaveEditorMask}
                initialZones={editorZones}
            />

        </Layout >
    )
}

export default App
