import React, { useRef, useState, useEffect } from 'react';
import { Save, Eraser, Square, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface Zone {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    color: string;
}

interface CanvasEditorProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
    onSave: (maskBlob: Blob | null, zones: Zone[]) => void;
    initialZones?: Zone[];
}

type Tool = 'rect' | 'brush';

const CanvasEditor: React.FC<CanvasEditorProps> = ({
    isOpen,
    onClose,
    imageUrl,
    onSave,
    initialZones = []
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [tool, setTool] = useState<Tool>('rect');
    const [zones, setZones] = useState<Zone[]>(initialZones);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [brushSize] = useState(5);
    const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
    const [tempZone, setTempZone] = useState<Zone | null>(null);

    // Brush State
    const [annotations, setAnnotations] = useState<Array<{ points: { x: number, y: number }[], color: string, size: number }>>([]);
    const [currentPath, setCurrentPath] = useState<{ points: { x: number, y: number }[], color: string, size: number } | null>(null);

    // Initial Load / Reset
    useEffect(() => {
        if (isOpen) {
            setZones(initialZones);
            setAnnotations([]);
        }
    }, [isOpen]);

    // Canvas Draw Loop for Annotations
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw saved annotations
        annotations.forEach(path => {
            if (path.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.size;
            ctx.moveTo(path.points[0].x, path.points[0].y);
            path.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        });

        // Draw current path
        if (currentPath && currentPath.points.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = currentPath.color;
            ctx.lineWidth = currentPath.size;
            ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
            currentPath.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }

    }, [annotations, currentPath, imgSize]);

    const handleZoneFinish = (zone: Zone) => {
        const label = prompt("Etiqueta para esta zona (ej. Sofá, Mesa):", "Mueble");
        if (label) {
            setZones([...zones, { ...zone, label, id: Date.now().toString(), color: 'rgba(0, 255, 0, 0.3)' }]);
        }
        setTempZone(null);
    };

    const getMousePos = (e: React.MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        // Calculate scale based on displayed size vs internal size
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDrawing(true);
        const { x, y } = getMousePos(e);
        setStartPos({ x, y });

        if (tool === 'brush') {
            setCurrentPath({ points: [{ x, y }], color: '#ff4444', size: brushSize });
        } else if (tool === 'rect') {
            setTempZone({ id: 'temp', x, y, width: 0, height: 0, label: '', color: 'rgba(0, 255, 0, 0.3)' });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const { x, y } = getMousePos(e);

        if (tool === 'brush' && currentPath) {
            setCurrentPath({ ...currentPath, points: [...currentPath.points, { x, y }] });
        } else if (tool === 'rect') {
            setTempZone({
                id: 'temp',
                x: Math.min(startPos.x, x),
                y: Math.min(startPos.y, y),
                width: Math.abs(x - startPos.x),
                height: Math.abs(y - startPos.y),
                label: '',
                color: 'rgba(0, 255, 0, 0.3)'
            });
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (tool === 'brush' && currentPath) {
            setAnnotations([...annotations, currentPath]);
            setCurrentPath(null);
        } else if (tool === 'rect' && tempZone) {
            if (tempZone.width > 20 && tempZone.height > 20) {
                handleZoneFinish(tempZone);
            } else {
                setTempZone(null);
            }
        }
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
        if (canvasRef.current) {
            canvasRef.current.width = img.naturalWidth;
            canvasRef.current.height = img.naturalHeight;
        }
    };

    const handleSaveEditor = () => {
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = imgSize.width;
        maskCanvas.height = imgSize.height;
        const ctx = maskCanvas.getContext('2d');

        if (ctx) {
            // Fill black background
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

            // Draw Zones (White filled)
            ctx.fillStyle = 'white';
            zones.forEach(z => {
                ctx.fillRect(z.x, z.y, z.width, z.height);
            });

            // Draw Annotations (White stroked)
            ctx.strokeStyle = 'white';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            annotations.forEach(path => {
                if (path.points.length < 2) return;
                ctx.beginPath();
                ctx.lineWidth = path.size;
                ctx.moveTo(path.points[0].x, path.points[0].y);
                path.points.forEach(p => ctx.lineTo(p.x, p.y));
                ctx.stroke();
            });

            maskCanvas.toBlob((blob) => {
                onSave(blob, zones);
                onClose();
            }, 'image/png');
        }
    };

    const handleClear = () => {
        if (window.confirm("¿Borrar todo (zonas y dibujos)?")) {
            setZones([]);
            setAnnotations([]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-backdrop"
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200, background: '#0d0d0d',
                        display: 'flex', flexDirection: 'column'
                    }}
                >
                    {/* Toolbar */}
                    <div style={{ padding: '10px 20px', background: '#1a1a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <ToolButton active={tool === 'rect'} onClick={() => setTool('rect')} icon={Square} label="Crear Zona" />
                            <ToolButton active={tool === 'brush'} onClick={() => setTool('brush')} icon={PenTool} label="Pincel" />
                            <button onClick={handleClear} style={{ background: 'transparent', border: '1px solid #444', color: '#aaa', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '6px' }}>
                                <Eraser size={18} /> Borrar Todo
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={onClose} style={{ color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSaveEditor} style={{ background: 'var(--color-accent)', padding: '8px 20px', borderRadius: '4px', border: 'none', fontWeight: 600, cursor: 'pointer', color: '#000', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Save size={18} /> Guardar Edición
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
                        {imageUrl ? (
                            <div
                                style={{ position: 'relative', border: '1px solid #333', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <img
                                    src={imageUrl}
                                    alt="Base"
                                    onLoad={handleImageLoad}
                                    style={{ display: 'block', maxWidth: 'none' }}
                                    draggable={false}
                                />

                                {/* Drawing Canvas */}
                                <canvas
                                    ref={canvasRef}
                                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                                />

                                {/* Zones Overlay */}
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                    {[...zones, tempZone].filter(Boolean).map((z, i) => (
                                        <div key={i} style={{
                                            position: 'absolute',
                                            left: z!.x, top: z!.y, width: z!.width, height: z!.height,
                                            border: '2px solid ' + (z!.id === 'temp' ? '#00ff00' : '#00ccff'),
                                            background: 'rgba(0, 255, 0, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {z!.label && (
                                                <span style={{ background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                                                    {z!.label}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#666' }}>Cargando imagen...</p>
                        )}
                    </div>

                    {/* Status Bar */}
                    <div style={{ padding: '8px 20px', background: '#1a1a2e', color: '#666', fontSize: '0.8rem', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Modo: {tool === 'rect' ? 'Zonas (Rectángulo)' : 'Pincel (Dibujo Libre)'}</span>
                        <span>{zones.length} Zonas | {annotations.length} Trazos</span>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ToolButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        title={label}
        style={{
            background: active ? 'var(--color-accent)' : 'transparent',
            color: active ? '#000' : '#ddd',
            border: active ? 'none' : '1px solid #444',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
        }}
    >
        <Icon size={18} />
        <span style={{ fontSize: '0.8rem' }}>{label}</span>
    </button>
);

export default CanvasEditor;
