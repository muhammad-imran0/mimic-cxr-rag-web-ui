import React, { useState } from 'react';
import { Eye, Layers, Sparkles, Loader2, AlertTriangle } from 'lucide-react';

export default function VisualizationMatrix({ selectedCase, apiBase, uploadedImagePreview }) {
  const [promptText, setPromptText] = useState("");
  const [heatmapImage, setHeatmapImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateHeatmap = async () => {
    if (!promptText.trim() || !uploadedImagePreview) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(uploadedImagePreview);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('text', promptText);
      
      const response = await fetch(`${apiBase}/api/v1/xai/heatmap`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to generate heatmap");
      const data = await response.json();
      setHeatmapImage(data.heatmap_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            Zero-Shot Grounding Explainable AI (XAI)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize exactly where the BioMedCLIP model detects specific pathologies.
          </p>
        </div>
      </div>

      {/* Input Controls */}
      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="e.g., Pleural Effusion, Atelectasis, Cardiomegaly..."
          className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          onKeyDown={(e) => e.key === 'Enter' && generateHeatmap()}
        />
        <button
          onClick={generateHeatmap}
          disabled={isLoading || !promptText.trim() || !uploadedImagePreview}
          className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isLoading ? "Analyzing..." : "Generate Heatmap"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Comparison Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-600" /> Original Input Radiograph
            </span>
          </div>
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 shadow-inner">
            {uploadedImagePreview ? (
              <img src={uploadedImagePreview} alt="Original" className="w-full h-full object-contain" />
            ) : (
              <span className="text-slate-500 text-xs">No image uploaded</span>
            )}
          </div>
        </div>

        {/* Heatmap Overlay */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Zero-Shot Grounding Heatmap
            </span>
          </div>
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 shadow-inner">
            {heatmapImage ? (
              <img src={heatmapImage} alt="Heatmap" className="w-full h-full object-contain" />
            ) : (
              <span className="text-slate-500 text-xs">Enter a clinical finding to generate</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
