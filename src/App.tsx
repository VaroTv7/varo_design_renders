import Layout from './components/Layout'
import ImageUpload from './components/ImageUpload'
import MultiImageUpload from './components/MultiImageUpload'
import type { ImageReference } from './components/MultiImageUpload'
import PromptInput from './components/PromptInput'
import ResultViewer from './components/ResultViewer'
import SettingsModal, { DEFAULT_PROMPTS } from './components/SettingsModal'
import type { SystemPrompts } from './components/SettingsModal'
import { useState } from 'react'
import { generateRender } from './services/api'

function App() {
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [styleRefs, setStyleRefs] = useState<ImageReference[]>([]);
    const [objectRefs, setObjectRefs] = useState<ImageReference[]>([]);

    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const [systemPrompts, setSystemPrompts] = useState<SystemPrompts>(DEFAULT_PROMPTS);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('interiorismo_api_key') || '');
    const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('interiorismo_api_url') || 'https://api.nanobanana.com/v1/generate');
    const [isDebug, setIsDebug] = useState(() => localStorage.getItem('interiorismo_debug') !== 'false'); // Default true

    // Advanced Settings
    const [upscale, setUpscale] = useState(() => localStorage.getItem('interiorismo_upscale') || '1');
    const [format, setFormat] = useState(() => localStorage.getItem('interiorismo_format') || 'png');
    const [history, setHistory] = useState(() => localStorage.getItem('interiorismo_history') === 'true'); // Default false

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleImageSelect = (file: File) => {
        setImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setResult(null);
    };

    const handleClear = () => {
        setImage(null);
        setPreviewUrl(null);
        setResult(null);
    };

    const handleGenerate = async () => {
        if (!image) return;

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
                apiUrl,
                upscale: parseInt(upscale),
                format: format as 'png' | 'webp' | 'jpg',
                history
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
        newApiUrl: string,
        newIsDebug: boolean,
        newUpscale: string,
        newFormat: string,
        newHistory: boolean
    ) => {
        setSystemPrompts(prompts);

        setApiKey(newApiKey);
        localStorage.setItem('interiorismo_api_key', newApiKey);

        setApiUrl(newApiUrl);
        localStorage.setItem('interiorismo_api_url', newApiUrl);

        setIsDebug(newIsDebug);
        localStorage.setItem('interiorismo_debug', String(newIsDebug));

        setUpscale(newUpscale);
        localStorage.setItem('interiorismo_upscale', newUpscale);

        setFormat(newFormat);
        localStorage.setItem('interiorismo_format', newFormat);

        setHistory(newHistory);
        localStorage.setItem('interiorismo_history', String(newHistory));
    };

    return (
        <Layout className="flex-center" onOpenSettings={() => setIsSettingsOpen(true)}>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                prompts={systemPrompts}
                onSave={handleSaveSettings}
                initialApiKey={apiKey}
                initialApiUrl={apiUrl}
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
                    <ImageUpload
                        onImageSelect={handleImageSelect}
                        previewUrl={previewUrl}
                        onClear={handleClear}
                        label="1. Captura del Viewport (Base)"
                    />

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
                        />
                    )}
                </div>
            </div>
        </Layout >
    )
}

export default App
