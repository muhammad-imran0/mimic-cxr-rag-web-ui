import React, { useState } from 'react';
import { Eye, Layers, Sliders, Sun, Contrast, Maximize2, RefreshCw, Sparkles, AlertTriangle, Crosshair, Check } from 'lucide-react';

export default function VisualizationMatrix({ selectedCase }) {
  const [opacity, setOpacity] = useState(0.75);
  const [activeLayer, setActiveLayer] = useState(selectedCase.gradCamHighlights[0]?.layer || "DenseBlock_4");
  const [colorMap, setColorMap] = useState("jet"); // jet, viridis, plasma, hot
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);

  // Gradient definitions for colormaps
  const colormapGradients = {
    jet: 'radial-gradient(circle at %X% %Y%, rgba(255, 0, 0, %OP%) 0%, rgba(255, 165, 0, %OP2%) 35%, rgba(0, 255, 255, %OP3%) 65%, rgba(0, 0, 255, 0) 100%)',
    viridis: 'radial-gradient(circle at %X% %Y%, rgba(253, 231, 37, %OP%) 0%, rgba(33, 145, 140, %OP2%) 45%, rgba(68, 1, 84, %OP3%) 75%, rgba(0, 0, 0, 0) 100%)',
    plasma: 'radial-gradient(circle at %X% %Y%, rgba(240, 249, 33, %OP%) 0%, rgba(204, 71, 120, %OP2%) 45%, rgba(13, 8, 135, %OP3%) 75%, rgba(0, 0, 0, 0) 100%)',
    hot: 'radial-gradient(circle at %X% %Y%, rgba(255, 255, 255, %OP%) 0%, rgba(255, 255, 0, %OP2%) 30%, rgba(255, 0, 0, %OP3%) 60%, rgba(0, 0, 0, 0) 100%)'
  };

  const resetControls = () => {
    setBrightness(100);
    setContrast(100);
    setOpacity(0.75);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 mb-6 border border-slate-800/80 shadow-2xl">
      
      {/* Matrix Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Dual-Pane Comparative Visualization Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side verification: Input Radiograph vs. Deep Convolutional Grad-CAM Feature Weighting Heatmap.
          </p>
        </div>

        {/* Dynamic Controls Header */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Colormap Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Palette:</span>
            {['jet', 'viridis', 'plasma', 'hot'].map((map) => (
              <button
                key={map}
                onClick={() => setColorMap(map)}
                className={`px-2 py-1 rounded capitalize font-medium text-[11px] transition-colors ${
                  colorMap === map ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {map}
              </button>
            ))}
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showGrid ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>ROI Grid</span>
          </button>

          {/* Reset */}
          <button
            onClick={resetControls}
            className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title="Reset Brightness/Contrast/Opacity"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left (Input Radiograph) vs Right (Grad-CAM Overlay) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANE 1: INPUT RADIOGRAPH */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between relative group">
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Pane A: Input DICOM Radiograph
            </span>
            <span className="text-[11px] font-mono text-slate-400">Resolution: 1024x1024 (AP)</span>
          </div>

          {/* Image Display Canvas Container */}
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-inner">
            
            {/* Simulated High-Resolution Chest X-Ray SVG Rendering */}
            <svg 
              className="w-full h-full object-contain transition-all duration-150"
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
              viewBox="0 0 400 400"
            >
              <rect width="400" height="400" fill="#04070d" />
              {/* Ribcage & Lung fields synthetic paths */}
              <path d="M 120 100 Q 200 60 280 100 Q 320 220 300 340 Q 200 380 100 340 Q 80 220 120 100 Z" fill="#121a29" stroke="#1e293b" strokeWidth="2" />
              {/* Left Lung Field */}
              <ellipse cx="150" cy="210" rx="45" ry="85" fill="#080d19" />
              {/* Right Lung Field */}
              <ellipse cx="250" cy="210" rx="45" ry="85" fill="#080d19" />
              {/* Cardiac Silhouette */}
              <path 
                d={selectedCase.id.includes('84920') 
                  ? "M 170 190 Q 240 200 230 310 Q 180 320 150 270 Z" 
                  : "M 180 200 Q 220 210 210 290 Q 180 300 160 260 Z"
                } 
                fill="#1e293b" opacity="0.9" stroke="#334155" strokeWidth="1.5"
              />
              {/* Clavicles & Spine */}
              <line x1="100" y1="100" x2="200" y2="120" stroke="#334155" strokeWidth="4" />
              <line x1="300" y1="100" x2="200" y2="120" stroke="#334155" strokeWidth="4" />
              <line x1="200" y1="80" x2="200" y2="350" stroke="#1e293b" strokeWidth="6" strokeDasharray="8,4" />
              
              {/* Rib highlights */}
              {[130, 160, 190, 220, 250, 280].map((y, i) => (
                <g key={i} stroke="#1e293b" strokeWidth="2" fill="none" opacity="0.6">
                  <path d={`M 150 ${y} Q 110 ${y+20} 105 ${y+40}`} />
                  <path d={`M 250 ${y} Q 290 ${y+20} 295 ${y+40}`} />
                </g>
              ))}
            </svg>

            {/* Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="border border-cyan-500/20 flex items-start justify-start p-1">
                    <span className="text-[9px] font-mono text-cyan-500/40">{String.fromCharCode(65 + Math.floor(i/4))}${i%4+1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls Bar for Brightness & Contrast */}
          <div className="mt-4 space-y-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-3 text-xs">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 w-16">Brightness:</span>
              <input 
                type="range" min="50" max="150" value={brightness} 
                onChange={(e) => setBrightness(e.target.value)}
                className="w-full accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
              />
              <span className="text-slate-300 font-mono w-8 text-right">{brightness}%</span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <Contrast className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 w-16">Contrast:</span>
              <input 
                type="range" min="50" max="150" value={contrast} 
                onChange={(e) => setContrast(e.target.value)}
                className="w-full accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
              />
              <span className="text-slate-300 font-mono w-8 text-right">{contrast}%</span>
            </div>
          </div>

        </div>

        {/* PANE 2: GRAD-CAM VISUAL ATTENTION HEATMAP OVERLAY */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between relative">
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Pane B: Interactive Grad-CAM Heatmap Overlay
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              Target Layer: {activeLayer}
            </span>
          </div>

          {/* Grad-CAM Heatmap Canvas Container */}
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-inner group">
            
            {/* Base Radiograph under overlay */}
            <svg 
              className="w-full h-full object-contain"
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
              viewBox="0 0 400 400"
            >
              <rect width="400" height="400" fill="#04070d" />
              <path d="M 120 100 Q 200 60 280 100 Q 320 220 300 340 Q 200 380 100 340 Q 80 220 120 100 Z" fill="#121a29" stroke="#1e293b" strokeWidth="2" />
              <ellipse cx="150" cy="210" rx="45" ry="85" fill="#080d19" />
              <ellipse cx="250" cy="210" rx="45" ry="85" fill="#080d19" />
              <path 
                d={selectedCase.id.includes('84920') 
                  ? "M 170 190 Q 240 200 230 310 Q 180 320 150 270 Z" 
                  : "M 180 200 Q 220 210 210 290 Q 180 300 160 260 Z"
                } 
                fill="#1e293b" opacity="0.9" stroke="#334155" strokeWidth="1.5"
              />
              <line x1="200" y1="80" x2="200" y2="350" stroke="#1e293b" strokeWidth="6" strokeDasharray="8,4" />
            </svg>

            {/* Multi-spot Grad-CAM Heatmap Radial Gradient Layers */}
            {selectedCase.gradCamHotspots.map((spot, idx) => {
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

            {/* Interactive Hotspot Inspection Rings */}
            {selectedCase.gradCamHotspots.map((spot, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredHotspot(spot)}
                onMouseLeave={() => setHoveredHotspot(null)}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/spot"
              >
                <div className="w-6 h-6 rounded-full border-2 border-white/80 animate-ping absolute inset-0 opacity-40"></div>
                <div className="w-6 h-6 rounded-full bg-red-500/30 border-2 border-red-400 flex items-center justify-center shadow-lg hover:scale-125 transition-transform">
                  <span className="text-[9px] font-bold text-white">{idx + 1}</span>
                </div>
              </div>
            ))}

            {/* Hotspot Tooltip */}
            {hoveredHotspot && (
              <div className="absolute top-4 left-4 right-4 bg-slate-900/95 border border-cyan-500/50 p-3 rounded-lg z-30 shadow-2xl backdrop-blur-md animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> Feature Weighting Inspection
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {(hoveredHotspot.intensity * 100).toFixed(1)}% Weight
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-semibold">{hoveredHotspot.label}</p>
              </div>
            )}

            {/* Grid Overlay on GradCAM */}
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="border border-emerald-500/20"></div>
                ))}
              </div>
            )}

          </div>

          {/* Grad-CAM Opacity Slider & Layer Selection */}
          <div className="mt-4 space-y-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-3 text-xs">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 w-24">Overlay Opacity:</span>
              <input 
                type="range" min="0" max="1" step="0.05" value={opacity} 
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-slate-700 rounded cursor-pointer"
              />
              <span className="text-slate-300 font-mono w-10 text-right">{(opacity * 100).toFixed(0)}%</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
              <span className="text-slate-400">CNN Model Layer:</span>
              <div className="flex space-x-1">
                {['DenseBlock_4', 'Conv4_3', 'ResNet_L3'].map(layer => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                      activeLayer === layer 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
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
