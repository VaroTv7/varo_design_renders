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
    onProgress?: (status: string) => void;
}

export interface GenerationResponse {
    imageUrl: string;
    error?: string;
}

// --- Helpers ---

const compressImage = (file: File | Blob, maxWidth = 1920, maxHeight = 1920): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Error al comprimir imagen"));
            }, 'image/webp', 0.85);
        };
        img.onerror = reject;
    });
};

const fileToBase64 = async (file: File, compress = true): Promise<string> => {
    const target = compress ? await compressImage(file) : file;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(target);
    });
};

const blobToBase64 = async (blob: Blob, compress = true): Promise<string> => {
    const target = compress ? await compressImage(blob) : blob;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(target);
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

    try {
        if (!request.apiKey) {
            return { imageUrl: '', error: "Falta la API Key. Ve a Ajustes → API y Modelo para configurarla." };
        }

        const model = request.model || 'gemini-2.0-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        // Build multimodal parts array
        const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

        // 1. System context + User prompt
        const systemContext = [
            request.systemPrompts.styleCheck,
            request.systemPrompts.objectIntegration,
            request.systemPrompts.finalRender
        ].filter(Boolean).join('\n\n');

        parts.push({
            text: `${systemContext}\n\n--- Instrucciones del Usuario ---\n${request.prompt}`
        });

        // 2. Base images
        request.onProgress?.("Comprimiendo imágenes...");
        const base64Image = await fileToBase64(request.image);
        parts.push({
            inline_data: {
                mime_type: 'image/webp',
                data: base64Image
            }
        });

        if (request.mask) {
            const base64Mask = await blobToBase64(request.mask);
            parts.push({
                inline_data: {
                    mime_type: 'image/webp',
                    data: base64Mask
                }
            });
        }

        // 3. Style Refs
        for (const ref of request.styleRefs) {
            const b64 = await fileToBase64(ref.file);
            parts.push({
                inline_data: {
                    mime_type: 'image/webp',
                    data: b64
                }
            });
        }

        // 4. Object Refs
        for (const ref of request.objectRefs) {
            const b64 = await fileToBase64(ref.file);
            parts.push({
                inline_data: {
                    mime_type: 'image/webp',
                    data: b64
                }
            });
        }

        parts.push({
            text: "Genera una imagen fotorrealista de alta calidad. Devuelve SOLO la imagen generada."
        });

        const payload = {
            contents: [{ parts }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 8192,
                // Si el usuario es Pro, forzar alta resolución si se desea
                ...(model.includes('pro') ? { image_size: '2K' } : {})
            }
        };

        request.onProgress?.("Enviando a la IA...");
        const response = await fetch(`${endpoint}?key=${request.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        request.onProgress?.("Procesando respuesta...");

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            let errorMsg = (errorData as any)?.error?.message || `HTTP ${response.status}`;

            if (errorMsg.includes("limit: 0")) {
                errorMsg = `⚠️ Error de Cuota (Límite 0): Google ha bloqueado este modelo para tu proyecto.\n\nESTO SUELE PASAR SI:\n1. Tienes "Gemini Advanced" pero NO has configurado "Facturación" en Google Cloud.\n2. Tu clave de API es de un proyecto gratuito que Google ha limitado temporalmente.\n\nSOLUCIÓN: Ve a console.cloud.google.com/billing y vincula tu tarjeta.`;
            }
            return { imageUrl: '', error: errorMsg };
        }

        const data = await response.json();
        const candidates = (data as any)?.candidates;

        if (!candidates?.[0]?.content?.parts) {
            return { imageUrl: '', error: "La IA no devolvió ninguna imagen. Revisa el prompt." };
        }

        for (const part of candidates[0].content.parts) {
            if (part.inlineData || part.inline_data) {
                const imgData = part.inlineData || part.inline_data;
                const base64Data = imgData.data;
                const mimeType = imgData.mimeType || imgData.mime_type || 'image/png';
                return { imageUrl: `data:${mimeType};base64,${base64Data}` };
            }
        }

        return { imageUrl: '', error: "No se encontró imagen en la respuesta de Gemini." };

    } catch (error) {
        console.error('[API Error]', error);
        return { imageUrl: '', error: error instanceof Error ? error.message : 'Error desconocido' };
    }
};

export const testConnection = async (apiKey: string, model: string): Promise<{ success: boolean; message: string }> => {
    if (!apiKey) return { success: false, message: "No hay API Key para probar." };
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
        const response = await fetch(`${endpoint}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "ping" }] }],
                generationConfig: { maxOutputTokens: 1 }
            })
        });

        if (response.ok) {
            return { success: true, message: "✅ ¡Conexión exitosa! Tu API Key tiene cuota activa para este modelo." };
        } else {
            const data = await response.json().catch(() => ({}));
            const msg = data?.error?.message || `Error ${response.status}`;
            if (msg.includes("limit: 0")) {
                return { success: false, message: "❌ ERROR DE CUOTA (Límite 0): Revisa tu facturación en Google Cloud." };
            }
            return { success: false, message: `❌ Error: ${msg}` };
        }
    } catch (e) {
        return { success: false, message: "❌ Error de red al contactar con Google." };
    }
};
