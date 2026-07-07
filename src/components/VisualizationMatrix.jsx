import React, { useState } from 'react';
import { Eye, Layers, Sliders, Sun, Contrast, Maximize2, RefreshCw, Sparkles, AlertTriangle, Crosshair, Check } from 'lucide-react';

export default function VisualizationMatrix({ selectedCase }) {
  const [opacity, setOpacity] = useState(0.75);
  const [activeLayer, setActiveLayer] = useState("DenseBlock_4");
  const [colorMap, setColorMap] = useState("jet"); // jet, viridis, plasma, hot
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);

  const hotspots = selectedCase?.gradCamHotspots || [
    { x: 45, y: 55, intensity: 0.92, label: "Right Lower Lobe Parenchymal Weighting" },
    { x: 68, y: 40, intensity: 0.78, label: "Perihilar Vascular Marking Attention" }
  ];

  const colormapGradients = {
    jet: 'radial-gradient(circle at %X% %Y%, rgba(239, 68, 68, %OP%) 0%, rgba(249, 115, 22, %OP2%) 35%, rgba(6, 182, 212, %OP3%) 65%, rgba(59, 130, 246, 0) 100%)',
    viridis: 'radial-gradient(circle at %X% %Y%, rgba(234, 179, 8, %OP%) 0%, rgba(13, 148, 136, %OP2%) 45%, rgba(67, 56, 202, %OP3%) 75%, rgba(0, 0, 0, 0) 100%)',
    plasma: 'radial-gradient(circle at %X% %Y%, rgba(250, 204, 21, %OP%) 0%, rgba(219, 39, 119, %OP2%) 45%, rgba(79, 70, 229, %OP3%) 75%, rgba(0, 0, 0, 0) 100%)',
    hot: 'radial-gradient(circle at %X% %Y%, rgba(255, 255, 255, %OP%) 0%, rgba(250, 204, 21, %OP2%) 30%, rgba(239, 68, 68, %OP3%) 60%, rgba(0, 0, 0, 0) 100%)'
  };

  const resetControls = () => {
    setBrightness(100);
    setContrast(100);
    setOpacity(0.75);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6">
      
      {/* Matrix Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            Grad-CAM Explainable AI (XAI) Visual Attention Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative visual inspection: Input DICOM Radiograph vs. Deep CNN Activation Heatmap.
          </p>
        </div>

        {/* Dynamic Controls Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-[11px] text-slate-500 px-2 font-medium">Colormap:</span>
            {['jet', 'viridis', 'plasma', 'hot'].map((map) => (
              <button
                key={map}
                onClick={() => setColorMap(map)}
                className={`px-2 py-1 rounded-lg capitalize font-bold text-[11px] transition-all cursor-pointer ${
                  colorMap === map ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {map}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showGrid ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>ROI Grid</span>
          </button>

          <button
            onClick={resetControls}
            className="p-2 bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
            title="Reset Controls"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left (Input Radiograph) vs Right (Grad-CAM Overlay) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANE 1: INPUT RADIOGRAPH */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-600" /> Pane A: Input DICOM Radiograph
            </span>
            <span className="text-[11px] font-mono text-slate-400">1024x1024 (AP)</span>
          </div>

          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 shadow-inner">
            <svg 
              className="w-full h-full object-contain"
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
              viewBox="0 0 400 400"
            >
              <rect width="400" height="400" fill="#0f172a" />
              <path d="M 120 100 Q 200 60 280 100 Q 320 220 300 340 Q 200 380 100 340 Q 80 220 120 100 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <ellipse cx="150" cy="210" rx="45" ry="85" fill="#0f172a" />
              <ellipse cx="250" cy="210" rx="45" ry="85" fill="#0f172a" />
              <path d="M 180 200 Q 220 210 210 290 Q 180 300 160 260 Z" fill="#334155" opacity="0.9" stroke="#475569" strokeWidth="1.5" />
              <line x1="200" y1="80" x2="200" y2="350" stroke="#334155" strokeWidth="6" strokeDasharray="8,4" />
            </svg>

            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="border border-teal-500/30 flex items-start justify-start p-1">
                    <span className="text-[9px] font-mono text-teal-400/60">{String.fromCharCode(65 + Math.floor(i/4))}${i%4+1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-3 text-xs">
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-slate-500 w-16">Brightness:</span>
              <input 
                type="range" min="50" max="150" value={brightness} 
                onChange={(e) => setBrightness(e.target.value)}
                className="w-full accent-teal-600 h-1 bg-slate-200 rounded cursor-pointer"
              />
              <span className="text-slate-700 font-mono w-8 text-right">{brightness}%</span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <Contrast className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="text-slate-500 w-16">Contrast:</span>
              <input 
                type="range" min="50" max="150" value={contrast} 
                onChange={(e) => setContrast(e.target.value)}
                className="w-full accent-teal-600 h-1 bg-slate-200 rounded cursor-pointer"
              />
              <span className="text-slate-700 font-mono w-8 text-right">{contrast}%</span>
            </div>
          </div>
        </div>

        {/* PANE 2: GRAD-CAM HEATMAP OVERLAY */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Pane B: Grad-CAM Feature Weighting
            </span>
            <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-bold">
              Layer: {activeLayer}
            </span>
          </div>

          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 shadow-inner group">
            <svg 
              className="w-full h-full object-contain"
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
              viewBox="0 0 400 400"
            >
              <rect width="400" height="400" fill="#0f172a" />
              <path d="M 120 100 Q 200 60 280 100 Q 320 220 300 340 Q 200 380 100 340 Q 80 220 120 100 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <ellipse cx="150" cy="210" rx="45" ry="85" fill="#0f172a" />
              <ellipse cx="250" cy="210" rx="45" ry="85" fill="#0f172a" />
              <path d="M 180 200 Q 220 210 210 290 Q 180 300 160 260 Z" fill="#334155" opacity="0.9" stroke="#475569" strokeWidth="1.5" />
            </svg>

            {hotspots.map((spot, idx) => {
              const op1 = opacity.toFixed(2);
              const op2 = (opacity * 0.6).toFixed(2);
              const op3 = (opacity * 0.2).toFixed(2);
              const bgGradient = colormapGradients[colorMap]
                .replace('%X%', `${spot.x}%`)
                .replace('%Y%', `${spot.y}%`)
                .replace('%OP%', op1)
                .replace('%OP2%', op2)
                .replace('%OP3%', op3);

              return (
                <div 
                  key={idx}
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{ background: bgGradient }}
                />
              );
            })}

            {hotspots.map((spot, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredHotspot(spot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              >
                <div className="w-6 h-6 rounded-full border-2 border-white/80 animate-ping absolute inset-0 opacity-40"></div>
                <div className="w-6 h-6 rounded-full bg-red-500/80 border-2 border-white flex items-center justify-center shadow-lg hover:scale-125 transition-transform">
                  <span className="text-[9px] font-extrabold text-white">{idx + 1}</span>
                </div>
              </div>
            ))}

            {hoveredHotspot && (
              <div className="absolute top-4 left-4 right-4 bg-slate-900/95 border border-teal-500/50 p-3 rounded-xl z-30 shadow-xl backdrop-blur-md text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5 text-teal-400" /> Feature Inspection
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {(hoveredHotspot.intensity * 100).toFixed(1)}% Weight
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-semibold">{hoveredHotspot.label}</p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-3 text-xs">
              <Sliders className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="text-slate-500 w-24">Overlay Opacity:</span>
              <input 
                type="range" min="0" max="1" step="0.05" value={opacity} 
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-teal-600 h-1 bg-slate-200 rounded cursor-pointer"
              />
              <span className="text-slate-700 font-mono w-10 text-right">{(opacity * 100).toFixed(0)}%</span>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500">Target Layer:</span>
              <div className="flex space-x-1">
                {['DenseBlock_4', 'Conv4_3', 'ResNet_L3'].map(layer => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                      activeLayer === layer 
                        ? 'bg-teal-50 text-teal-700 border border-teal-200 font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {layer}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
