import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
    onImageSelect: (file: File) => void;
    label?: string;
    previewUrl?: string | null;
    onClear?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onImageSelect,
    label = "Upload Image",
    previewUrl,
    onClear
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageSelect(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {label}
                </h3>
                {previewUrl && (
                    <button
                        onClick={onClear}
                        style={{
                            background: 'rgba(255, 59, 48, 0.1)',
                            color: '#ff3b30',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            padding: '4px 8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <X size={12} /> Clear
                    </button>
                )}
            </div>

            <AnimatePresence mode='wait'>
                {previewUrl ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-panel"
                        style={{
                            position: 'relative',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            aspectRatio: '16/9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)'
                        }}
                    >
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`glass-panel flex-center`}
                        style={{
                            flexDirection: 'column',
                            padding: 'var(--spacing-2xl)',
                            border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            background: isDragging ? 'rgba(100, 243, 213, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: '200px'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '16px',
                            borderRadius: '50%',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            <Upload size={32} color={isDragging ? 'var(--color-accent)' : 'var(--color-text-muted)'} />
                        </div>

                        <p style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                            Click or drag image here
                        </p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            Supports JPG, PNG (Max 10MB)
                        </p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageUpload;
