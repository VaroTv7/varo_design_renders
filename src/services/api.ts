import type { SystemPrompts } from '../components/SettingsModal';

export interface GenerationRequest {
    image: File;
    styleRefs: Array<{ file: File; comment: string }>;
    objectRefs: Array<{ file: File; comment: string }>;
    prompt: string;
    systemPrompts: SystemPrompts;
    isDebug: boolean;
    apiKey?: string;
    model?: string;
    upscale?: number;
    format?: 'png' | 'webp' | 'jpg';
    history?: boolean;
    mask?: Blob | null;
}

export interface GenerationResponse {
    imageUrl: string;
    error?: string;
}

// --- Helpers ---

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data:...;base64, prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// --- Main API Function ---

export const generateRender = async (request: GenerationRequest): Promise<GenerationResponse> => {
    // Debug / Mock Mode
    if (request.isDebug) {
        console.log('[API Mock] Processing Request:', {
            prompt: request.prompt,
            model: request.model,
            hasImage: !!request.image,
            styleRefs: request.styleRefs.length,
            objectRefs: request.objectRefs.length,
            hasMask: !!request.mask
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        imageUrl: e.target?.result as string || ''
                    });
                };
                reader.readAsDataURL(request.image);
            }, 2000);
        });
    }

    // --- Real Gemini API Call ---
    try {
        if (!request.apiKey) {
            throw new Error("Falta la API Key. Ve a Ajustes → API y Modelo para configurarla.");
        }

        const model = request.model || 'gemini-3.1-flash-image-preview';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        // Build multimodal parts array
        const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

        // 1. System instruction + User prompt
        const systemContext = [
            request.systemPrompts.styleCheck,
            request.systemPrompts.objectIntegration,
            request.systemPrompts.finalRender
        ].filter(Boolean).join('\n\n');

        parts.push({
            text: `${systemContext}\n\n--- Instrucciones del Usuario ---\n${request.prompt}`
        });

        // 2. Base viewport image
        const base64Image = await fileToBase64(request.image);
        parts.push({
            inline_data: {
                mime_type: request.image.type || 'image/png',
                data: base64Image
            }
        });

        // 3. Mask / Annotations (if exists)
        if (request.mask) {
            parts.push({ text: "Máscara de control con anotaciones espaciales:" });
            const base64Mask = await blobToBase64(request.mask);
            parts.push({
                inline_data: {
                    mime_type: 'image/png',
                    data: base64Mask
                }
            });
        }

        // 4. Style References
        if (request.styleRefs.length > 0) {
            parts.push({ text: "Imágenes de referencia de estilo:" });
            for (const ref of request.styleRefs) {
                if (ref.comment) {
                    parts.push({ text: `Nota de estilo: ${ref.comment}` });
                }
                const b64 = await fileToBase64(ref.file);
                parts.push({
                    inline_data: {
                        mime_type: ref.file.type || 'image/png',
                        data: b64
                    }
                });
            }
        }

        // 5. Object / Furniture References
        if (request.objectRefs.length > 0) {
            parts.push({ text: "Objetos y muebles a integrar en la escena:" });
            for (const ref of request.objectRefs) {
                if (ref.comment) {
                    parts.push({ text: `Descripción del objeto: ${ref.comment}` });
                }
                const b64 = await fileToBase64(ref.file);
                parts.push({
                    inline_data: {
                        mime_type: ref.file.type || 'image/png',
                        data: b64
                    }
                });
            }
        }

        // Final prompt to reinforce image generation
        parts.push({
            text: "Genera una imagen fotorrealista de alta calidad basada en la captura del viewport, aplicando el estilo y los objetos proporcionados. Devuelve SOLO la imagen generada."
        });

        // Build payload
        const payload = {
            contents: [{
                parts: parts
            }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 8192,
            }
        };

        console.log('[Gemini API] Sending request to:', endpoint);
        console.log('[Gemini API] Parts count:', parts.length);

        // Execute request
        const response = await fetch(`${endpoint}?key=${request.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = (errorData as any)?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(`Error de API: ${errorMsg}`);
        }

        const data = await response.json();

        // Parse response - look for image data in parts
        const candidates = (data as any)?.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error("La API no devolvió candidatos. Intenta con un prompt diferente.");
        }

        const responseParts = candidates[0]?.content?.parts;
        if (!responseParts) {
            throw new Error("Respuesta vacía de la API.");
        }

        // Find the image part
        for (const part of responseParts) {
            if (part.inlineData || part.inline_data) {
                const imgData = part.inlineData || part.inline_data;
                const mimeType = imgData.mimeType || imgData.mime_type || 'image/png';
                const base64Data = imgData.data;
                const imageUrl = `data:${mimeType};base64,${base64Data}`;

                console.log('[Gemini API] ✅ Image received successfully');
                return { imageUrl };
            }
        }

        // If no image found, check if there's text describing why
        const textParts = responseParts.filter((p: any) => p.text).map((p: any) => p.text).join('\n');
        if (textParts) {
            throw new Error(`La API respondió con texto en lugar de imagen: "${textParts.substring(0, 200)}"`);
        }

        throw new Error("La respuesta no contiene una imagen. Intenta con un prompt más descriptivo.");

    } catch (error) {
        console.error('[API Error]', error);
        return {
            imageUrl: '',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};
