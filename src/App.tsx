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

    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const [systemPrompts, setSystemPrompts] = useState<SystemPrompts>(DEFAULT_PROMPTS);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('interiorismo_api_key') || '');
    const [model, setModel] = useState(() => localStorage.getItem('interiorismo_model') || 'gemini-3.1-flash-image-preview');
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

        setIsLoading(true);
        setResult(null);

        try {
            const response = await generateRender({
                image,
                styleRefs,
                objectRefs,
                prompt,
                systemPrompts,
                isDebug,
                apiKey,
                model,
                upscale: parseInt(upscale),
                format: format as 'png' | 'webp' | 'jpg',
                history,
                mask: maskBlob // Pass the mask blob
            });

            if (response.error) {
                alert(`Error: ${response.error}`);
            } else {
                setResult(response.imageUrl);
            }
        } catch (error) {
            console.error(error);
            alert('Ocurrió un error inesperado al generar el render.');
        } finally {
            setIsLoading(false);
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
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #64f3d5, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                        Interiorismo AI
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-md)' }}>
                        Transforma tus capturas del viewport en renders profesionales con IA.
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
                        <PromptInput
                            prompt={prompt}
                            setPrompt={setPrompt}
                            onGenerate={handleGenerate}
                            isLoading={isLoading}
                        />
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
