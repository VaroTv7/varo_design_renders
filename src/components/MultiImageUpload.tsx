import React, { useRef } from 'react';
import { Upload, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ImageReference {
    id: string;
    file: File;
    preview: string;
    comment: string;
}

interface MultiImageUploadProps {
    label: string;
    images: ImageReference[];
    onImagesChange: (images: ImageReference[]) => void;
    maxImages?: number;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
    label,
    images,
    onImagesChange,
    maxImages = 5
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages: ImageReference[] = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36), // improved uniqueness
                file,
                preview: URL.createObjectURL(file), // Note: In a real app complexity, manage URL revocation
                comment: ''
            }));

            onImagesChange([...images, ...newImages].slice(0, maxImages));
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    const removeImage = (id: string) => {
        onImagesChange(images.filter(img => img.id !== id));
    };

    const updateComment = (id: string, comment: string) => {
        onImagesChange(images.map(img =>
            img.id === id ? { ...img, comment } : img
        ));
    };

    return (
        <div className="w-full" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {label}
                </h3>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {images.length} / {maxImages}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
                <AnimatePresence>
                    {images.map((img) => (
                        <motion.div
                            key={img.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-panel"
                            style={{ padding: 'var(--spacing-sm)', position: 'relative' }}
                        >
                            <button
                                onClick={() => removeImage(img.id)}
                                style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: '#ff3b30',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    zIndex: 10
                                }}
                            >
                                <X size={14} />
                            </button>

                            <div style={{ aspectRatio: '1', marginBottom: '8px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                <img src={img.preview} alt="Ref" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>

                            <textarea
                                className="input-field"
                                placeholder="Comentario..."
                                value={img.comment}
                                onChange={(e) => updateComment(img.id, e.target.value)}
                                style={{
                                    width: '100%',
                                    fontSize: '12px',
                                    padding: '8px',
                                    minHeight: '60px',
                                    resize: 'none',
                                    background: 'rgba(0,0,0,0.2)'
                                }}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {images.length < maxImages && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-panel flex-center"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            aspectRatio: '1',
                            border: '2px dashed var(--color-border)',
                            background: 'transparent',
                            cursor: 'pointer',
                            flexDirection: 'column',
                            gap: '8px',
                            color: 'var(--color-text-muted)',
                            minHeight: '150px' // Match grid item height approx
                        }}
                    >
                        <Plus size={24} />
                        <span style={{ fontSize: '12px' }}>Añadir</span>
                    </motion.button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default MultiImageUpload;
