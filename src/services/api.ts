import type { SystemPrompts } from '../components/SettingsModal';

export interface GenerationRequest {
    image: File;
    styleRefs: Array<{ file: File; comment: string }>;
    objectRefs: Array<{ file: File; comment: string }>;
    prompt: string;
    systemPrompts: SystemPrompts;
    isDebug: boolean;
    apiKey?: string;
    apiUrl?: string;
}

export interface GenerationResponse {
    imageUrl: string;
    error?: string;
}

export const generateRender = async (request: GenerationRequest): Promise<GenerationResponse> => {
    // Debug / Mock Mode
    if (request.isDebug) {
        console.log('[API Mock] Processing Request:', request);

        return new Promise((resolve) => {
            setTimeout(() => {
                // Return original image as "generated" result for now
                // In a real mock, maybe return a static placeholder or processed version
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

    // Real API Call Implementation
    try {
        if (!request.apiKey) {
            throw new Error("API Key is missing for production mode");
        }

        const endpoint = request.apiUrl || 'https://api.nanobanana.com/v1/generate';

        // TODO: Replace with actual Nano Banana Pro API endpoint and payload structure
        // This is a placeholder for the actual implementation
        // const formData = new FormData();
        // formData.append('image', request.image);
        // ... append other fields

        // const response = await fetch(endpoint, {
        //   method: 'POST',
        //   headers: { 'Authorization': `Bearer ${request.apiKey}` },
        //   body: formData
        // });

        // const data = await response.json();
        // return { imageUrl: data.url };

        throw new Error(`Real API integration to ${endpoint} not yet implemented`);

    } catch (error) {
        console.error('[API Error]', error);
        return {
            imageUrl: '',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
