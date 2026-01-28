
import React, { useState, Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Grid } from '@react-three/drei';
import { 
  Box, Triangle, Layout, RotateCw, ZoomIn, ZoomOut, Boxes, 
  MousePointer2, RefreshCw, SlidersHorizontal, Ruler, ChevronDown, Camera, 
  Image as ImageIcon, Circle, Gift, Book, Home, Tent, Waves, Flower2, Square, 
  HardDrive, Sparkles, X, Loader2, Package, Maximize
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ShapeType, RealWorldExample } from './types';
import { SHAPES, COLORS } from './constants';
import { Cuboid, TriangularPrism, QuadrilateralPrism } from './components/Shapes';

const CameraController = ({ zoomLevel }: { zoomLevel: number }) => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.setLength(zoomLevel);
  }, [zoomLevel, camera]);
  return null;
};

const ExampleIcon = ({ name, size = 20 }: { name: string, size?: number }) => {
  switch (name) {
    case 'Gift': return <Gift size={size} />;
    case 'Book': return <Book size={size} />;
    case 'Refrigerator': return <HardDrive size={size} />;
    case 'Home': return <Home size={size} />;
    case 'Tent': return <Tent size={size} />;
    case 'Waves': return <Waves size={size} />;
    case 'Flower': return <Flower2 size={size} />;
    case 'Square': return <Square size={size} />;
    default: return <ImageIcon size={size} />;
  }
};

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string | number;
}

const AccordionSection: React.FC<AccordionProps> = ({ title, icon, isOpen, onToggle, children, badge }) => (
  <div className={`border-b border-slate-100 last:border-none overflow-hidden transition-all ${isOpen ? 'bg-slate-50/50' : 'bg-white'}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
          {icon}
        </div>
        <span className={`text-sm font-black tracking-tight ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>{title}</span>
        {badge !== undefined && (
          <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full ml-2">
            {badge}
          </span>
        )}
      </div>
      <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
    </button>
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 pb-6 px-5' : 'max-h-0 opacity-0 pointer-events-none'}`}>
      {children}
    </div>
  </div>
);

const App: React.FC = () => {
  const [selectedShape, setSelectedShape] = useState<ShapeType>(ShapeType.CUBOID);
  const [foldProgress, setFoldProgress] = useState<number>(0);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(true);
  const [colors] = useState(COLORS);
  const [openSection, setOpenSection] = useState<string | null>('storage');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [currentExample, setCurrentExample] = useState<RealWorldExample | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const [dimensions, setDimensions] = useState({
    width: 3.0,
    height: 4.0,
    depth: 2.0,
    width2: 2.0,
  });

  const currentShapeInfo = SHAPES.find(s => s.id === selectedShape)!;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const sensitivity = 0.0006;
      setFoldProgress(prev => {
        const next = Math.max(0, Math.min(1, prev + e.deltaY * sensitivity));
        if (next !== prev) setShowScrollHint(false);
        return next;
      });
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const handleGenerateIllustration = async (example: RealWorldExample) => {
    setCurrentExample(example);
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `3D educational illustration of a ${example.title} (${example.description}). Style: Modern 3D isometric, white background, soft lighting.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const renderActiveShape = () => {
    const props = { foldProgress, showLabels, colors, dimensions };
    switch (selectedShape) {
      case ShapeType.CUBOID: return <Cuboid {...props} />;
      case ShapeType.TRIANGULAR_PRISM: return <TriangularPrism {...props} />;
      case ShapeType.QUADRILATERAL_PRISM: return <QuadrilateralPrism {...props} />;
      default: return null;
    }
  };

  const resetView = () => {
    setZoomLevel(12);
    setFoldProgress(0);
    setIsRotating(false);
    setShowLabels(true);
    setDimensions({ width: 3.0, height: 4.0, depth: 2.0, width2: 2.0 });
  };

  const handleQuickAction = (shapeId: ShapeType, targetFold: number) => {
    setSelectedShape(shapeId);
    setFoldProgress(targetFold);
    setShowScrollHint(false);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50 select-none font-sans">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between z-20 shadow-sm fixed top-0 w-full">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-xl shadow-blue-200 flex items-center justify-center">
            <Boxes size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black font-heading text-slate-800 tracking-tight leading-none text-blue-600">Geom3D</h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Học Hình Học Không Gian</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-slate-100 px-4 py-2 rounded-full border border-slate-200 flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentShapeInfo.name}</span>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-mono text-[10px] font-black shadow-lg shadow-blue-200 border-2 border-white">
                {Math.round(foldProgress * 100)}%
              </div>
           </div>
        </div>
      </header>

      <main className="flex-1 flex pt-20">
        <aside className="w-[400px] bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <AccordionSection title="KHO MÔ HÌNH" icon={<Package size={18} />} isOpen={openSection === 'storage'} onToggle={() => toggleSection('storage')} badge={SHAPES.length}>
              <div className="grid grid-cols-1 gap-3">
                {SHAPES.map((shape) => (
                  <div key={shape.id} className={`p-1 rounded-[2rem] transition-all border-2 ${selectedShape === shape.id ? 'border-blue-600 bg-blue-50 shadow-xl' : 'border-slate-100 bg-white'}`}>
                    <div onClick={() => { setSelectedShape(shape.id); setFoldProgress(0); }} className="cursor-pointer p-4 flex gap-4 items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedShape === shape.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        {shape.id === ShapeType.CUBOID && <Box size={30} />}
                        {shape.id === ShapeType.TRIANGULAR_PRISM && <Triangle size={30} />}
                        {shape.id === ShapeType.QUADRILATERAL_PRISM && <Layout size={30} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-xs uppercase tracking-tight text-slate-800">{shape.name}</h3>
                      </div>
                    </div>
                    <div className="flex border-t border-slate-100 bg-white/50 rounded-b-[1.9rem] overflow-hidden">
                      <button onClick={() => handleQuickAction(shape.id, 0)} className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">Trải phẳng</button>
                      <button onClick={() => handleQuickAction(shape.id, 1)} className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 border-l border-slate-100">Gập khối</button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection title="ĐIỀU KHIỂN" icon={<SlidersHorizontal size={18} />} isOpen={openSection === 'folding'} onToggle={() => toggleSection('folding')}>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <input type="range" min="0" max="1" step="0.005" value={foldProgress} onChange={(e) => setFoldProgress(parseFloat(e.target.value))} className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600" />
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Khởi đầu</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Kết thúc</span>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="KÍCH THƯỚC" icon={<Ruler size={18} />} isOpen={openSection === 'dimensions'} onToggle={() => toggleSection('dimensions')}>
              <div className="space-y-4">
                {[
                  { label: 'Rộng', key: 'width' as const, min: 1, max: 6 },
                  { label: 'Cao', key: 'height' as const, min: 2, max: 8 },
                  { label: 'Sâu', key: 'depth' as const, min: 1, max: 6 }
                ].map((dim) => (
                  <div key={dim.key} className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase">{dim.label}</span><span className="text-xs font-mono font-bold text-blue-600">{dimensions[dim.key]!.toFixed(1)}</span></div>
                    <input type="range" min={dim.min} max={dim.max} step="0.1" value={dimensions[dim.key]} onChange={(e) => setDimensions(prev => ({...prev, [dim.key]: parseFloat(e.target.value)}))} className="w-full h-2 bg-slate-200 rounded-full appearance-none accent-blue-600" />
                  </div>
                ))}
                {selectedShape === ShapeType.QUADRILATERAL_PRISM && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase">Rộng mặt sau</span><span className="text-xs font-mono font-bold text-blue-600">{dimensions.width2.toFixed(1)}</span></div>
                    <input type="range" min="1" max="5" step="0.1" value={dimensions.width2} onChange={(e) => setDimensions(prev => ({...prev, width2: parseFloat(e.target.value)}))} className="w-full h-2 bg-slate-200 rounded-full appearance-none accent-blue-600" />
                  </div>
                )}
              </div>
            </AccordionSection>

            <AccordionSection title="VÍ DỤ AI" icon={<ImageIcon size={18} />} isOpen={openSection === 'examples'} onToggle={() => toggleSection('examples')}>
              <div className="flex flex-col gap-3">
                {currentShapeInfo.realWorldExamples.map((ex, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><ExampleIcon name={ex.iconName} size={20} /></div>
                      <div><h4 className="font-black text-slate-800 text-xs">{ex.title}</h4></div>
                    </div>
                    <button onClick={() => handleGenerateIllustration(ex)} className="w-full py-2 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                      <Sparkles size={12} /> Tạo minh họa AI
                    </button>
                  </div>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection title="GIAO DIỆN" icon={<Camera size={18} />} isOpen={openSection === 'camera'} onToggle={() => toggleSection('camera')}>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setIsRotating(!isRotating)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${isRotating ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-100 text-slate-500'}`}>
                  <RotateCw size={24} className={isRotating ? 'animate-spin-slow' : ''} /><span className="text-[8px] font-black uppercase">Xoay tự động</span>
                </button>
                <button onClick={() => setShowLabels(!showLabels)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${showLabels ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-100 text-slate-500'}`}>
                  {showLabels ? <Circle size={24} /> : <Circle size={24} className="opacity-30" />}<span className="text-[8px] font-black uppercase">Hiện nhãn</span>
                </button>
              </div>
            </AccordionSection>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <button onClick={resetView} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 font-black text-xs py-4 rounded-2xl border border-slate-200 shadow-sm transition-all">
                <RefreshCw size={18} /> ĐẶT LẠI KHÔNG GIAN
              </button>
          </div>
        </aside>

        <section className="flex-1 bg-slate-100 relative">
          {showScrollHint && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-slate-900/90 text-white px-8 py-5 rounded-[2.5rem] flex flex-col items-center gap-4 shadow-2xl backdrop-blur-xl animate-float">
                <MousePointer2 size={32} className="text-blue-400 animate-bounce" />
                <span className="font-black text-xs uppercase tracking-[0.2em]">Cuộn chuột để gập hình</span>
              </div>
            </div>
          )}

          <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>}>
            <Canvas shadows camera={{ position: [8, 8, 8], fov: 40 }}>
              <color attach="background" args={['#f8fafc']} />
              <ambientLight intensity={0.8} />
              <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
              <CameraController zoomLevel={zoomLevel} />
              <Float speed={isRotating ? 1.5 : 0} rotationIntensity={0.2} floatIntensity={0.1}>
                <group position={[0, -1, 0]}>
                  {renderActiveShape()}
                </group>
              </Float>
              <Grid infiniteGrid fadeDistance={40} fadeStrength={5} cellSize={1} sectionSize={5} sectionThickness={1.5} sectionColor="#cbd5e1" cellColor="#e2e8f0" position={[0, -1.05, 0]} />
              <ContactShadows position={[0, -1.02, 0]} opacity={0.3} scale={30} blur={3} far={1.5} />
              <OrbitControls makeDefault autoRotate={isRotating} autoRotateSpeed={1} enableZoom={false} target={[0, 0, 0]} />
              <Environment preset="city" />
            </Canvas>
          </Suspense>

          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 items-center">
            <div className="bg-white/95 backdrop-blur-xl p-3 rounded-[3rem] shadow-2xl border border-white flex flex-col gap-4 items-center">
              <div className="flex flex-col items-center gap-1">
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(5, prev - 1))} 
                  className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  title="Phóng to"
                >
                  <ZoomIn size={22} />
                </button>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{Math.round((20 - zoomLevel) / 15 * 100 + 100)}%</span>
              </div>

              <div className="h-48 flex items-center py-2 relative group">
                <input 
                  type="range" 
                  min="5" 
                  max="20" 
                  step="0.5" 
                  value={zoomLevel} 
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))} 
                  className="appearance-none h-40 w-1.5 bg-slate-100 rounded-full cursor-pointer accent-blue-600 vertical-range"
                  style={{ transform: 'rotate(180deg)', writingMode: 'bt-lr' } as any}
                />
              </div>

              <div className="flex flex-col items-center gap-1">
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(20, prev + 1))} 
                  className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  title="Thu nhỏ"
                >
                  <ZoomOut size={22} />
                </button>
              </div>

              <div className="w-8 h-px bg-slate-200 mx-auto" />

              <button 
                onClick={() => setZoomLevel(12)} 
                className="p-3 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all"
                title="Khôi phục góc nhìn"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {(isGenerating || generatedImageUrl) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { if(!isGenerating) { setGeneratedImageUrl(null); } }}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-scale-up">
            <button onClick={() => { setGeneratedImageUrl(null); }} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-all z-20"><X size={20} /></button>
            <div className="p-8 pb-4 text-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{currentExample?.title}</h2>
            </div>
            <div className="relative aspect-square bg-slate-50 m-8 mt-0 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-100">
              {isGenerating ? <Loader2 size={48} className="text-blue-600 animate-spin" /> : <img src={generatedImageUrl!} alt={currentExample?.title} className="w-full h-full object-cover" />}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow { animation: spin 8s linear infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        
        .vertical-range {
          -webkit-appearance: none;
          appearance: none;
          height: 160px;
          width: 6px;
          background: #f1f5f9;
          border-radius: 9999px;
          outline: none;
          -webkit-appearance: slider-vertical;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px;
          background: #3b82f6; cursor: pointer;
          border-radius: 50%; border: 4px solid #ffffff;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
        }

        .vertical-range::-webkit-slider-runnable-track {
           border-radius: 9999px;
        }
      ` }} />
    </div>
  );
};

export default App;
