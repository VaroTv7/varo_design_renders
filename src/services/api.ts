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

        // Build multimodal parts array with properly labeled images
        const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

        // ---- 1. MASTER PROMPT: System context + role + user instructions (ONCE) ----
        const masterPrompt = [
            `ROL: ${request.systemPrompts.styleCheck}`,
            `INTEGRACIÓN DE OBJETOS: ${request.systemPrompts.objectIntegration}`,
            `CALIDAD FINAL: ${request.systemPrompts.finalRender}`,
            '',
            '--- INSTRUCCIONES DEL USUARIO ---',
            request.prompt,
            '',
            'REGLAS OBLIGATORIAS:',
            '1. La imagen generada DEBE mantener EXACTAMENTE la misma resolución, perspectiva y relación de aspecto que la IMAGEN BASE.',
            '2. Las REFERENCIAS DE ESTILO solo definen la estética (colores, materiales, iluminación). NO copies su composición ni layout.',
            '3. Los OBJETOS/MUEBLES deben integrarse de forma natural en el espacio base, respetando la perspectiva, escala y sombras.',
            '4. El resultado debe ser una fotografía fotorrealista de revista de arquitectura.',
            request.upscale === 2 ? '5. Aumenta el detalle y la nitidez para un resultado de alta resolución.' : '',
        ].filter(Boolean).join('\n');

        parts.push({ text: masterPrompt });

        // ---- 2. BASE IMAGE (the viewport capture to transform) ----
        request.onProgress?.("Comprimiendo imágenes...");
        parts.push({ text: '[IMAGEN BASE DEL ESPACIO — Esta es la fotografía principal a transformar. Mantén su composición, perspectiva y proporciones exactas]:' });
        const base64Image = await fileToBase64(request.image);
        parts.push({
            inline_data: { mime_type: 'image/webp', data: base64Image }
        });

        // ---- 3. MASK (optional editing zones) ----
        if (request.mask) {
            parts.push({ text: '[MÁSCARA DE EDICIÓN — Las zonas marcadas indican dónde aplicar cambios]:' });
            const base64Mask = await blobToBase64(request.mask);
            parts.push({
                inline_data: { mime_type: 'image/webp', data: base64Mask }
            });
        }

        // ---- 4. STYLE REFERENCES (aesthetic inspiration only) ----
        for (let i = 0; i < request.styleRefs.length; i++) {
            const ref = request.styleRefs[i];
            const label = ref.comment
                ? `[REFERENCIA DE ESTILO ${i + 1} — ${ref.comment}. Usa SOLO su estética, colores y materiales. NO copies su layout]:`
                : `[REFERENCIA DE ESTILO ${i + 1} — Usa SOLO su estética, colores y materiales. NO copies su layout]:`;
            parts.push({ text: label });
            const b64 = await fileToBase64(ref.file);
            parts.push({
                inline_data: { mime_type: 'image/webp', data: b64 }
            });
        }

        // ---- 5. OBJECTS / FURNITURE to integrate ----
        for (let i = 0; i < request.objectRefs.length; i++) {
            const ref = request.objectRefs[i];
            const label = ref.comment
                ? `[OBJETO/MUEBLE ${i + 1} — ${ref.comment}. Intégralo naturalmente en el espacio base respetando perspectiva y escala]:`
                : `[OBJETO/MUEBLE ${i + 1} — Intégralo naturalmente en el espacio base respetando perspectiva y escala]:`;
            parts.push({ text: label });
            const b64 = await fileToBase64(ref.file);
            parts.push({
                inline_data: { mime_type: 'image/webp', data: b64 }
            });
        }

        // ---- 6. FINAL INSTRUCTION ----
        parts.push({
            text: 'Genera la imagen final transformada. Devuelve SOLO la imagen, sin texto.'
        });

        const payload = {
            contents: [{ parts }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 8192,
                responseModalities: ["TEXT", "IMAGE"],
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
                errorMsg = `⚠️ MODELO BLOQUEADO (Límite 0): El modelo "${model}" no tiene cuota asignada en tu cuenta gratuita.\n\nSOLUCIÓN:\n1. Selecciona "Gemini 2.0 Flash" en Ajustes (Suele tener cuota gratuita).\n2. O vincula una tarjeta en console.cloud.google.com/billing para activar modelos Pro/Nano.`;
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
                return { success: false, message: `❌ ERROR DE CUOTA (Límite 0): "${model}" requiere Facturación activada.\n\nPrueba con "Gemini 2.0 Flash" si usas AI Studio gratis.` };
            }
            return { success: false, message: `❌ Error: ${msg}` };
        }
    } catch (e) {
        return { success: false, message: "❌ Error de red al contactar con Google." };
    }
};
