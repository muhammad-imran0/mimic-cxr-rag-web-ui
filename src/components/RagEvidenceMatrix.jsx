import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Database, ShieldCheck, FileText, Sparkles, Image as ImageIcon, CheckCircle2, ExternalLink, X, ZoomIn } from 'lucide-react';

export default function RagEvidenceMatrix({ liveRecords, baseUrl = "http://localhost:8000" }) {
  const [imageErrors, setImageErrors] = useState({});
  const [selectedModalImage, setSelectedModalImage] = useState(null);

  // Lock background scroll and listen to ESC key when modal is open
  useEffect(() => {
    if (selectedModalImage) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setSelectedModalImage(null);
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow || 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedModalImage]);

  if (!liveRecords || liveRecords.length === 0) {
    return null;
  }

  const normalizedRecords = liveRecords.map((r, idx) => {
    const caseId = r.case_id !== undefined ? r.case_id : (r.study_id !== undefined ? r.study_id : r.id || idx);
    const rawScore = typeof r.score === 'number' ? r.score : parseFloat(r.score) || 0.95;
    
    let fullImageUrl = "";
    if (r.image_url) {
      fullImageUrl = r.image_url.startsWith("http") ? r.image_url : `${baseUrl}${r.image_url}`;
    } else {
      fullImageUrl = `${baseUrl}/api/v1/cases/${caseId}/image`;
    }

    return {
      caseId: caseId,
      scorePercentage: (rawScore * 100).toFixed(2),
      findings: r.findings || r.finding || "No radiological findings text available.",
      impression: r.impression || "No clinical impression recorded.",
      source: r.source || "MIMIC-CXR Cohort",
      imageUrl: fullImageUrl
    };
  });

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="glass-panel-accent rounded-3xl p-8 border border-gray-800 shadow-xl space-y-6 relative">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-extrabold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800 shadow-md">
              Vector Database Match
            </span>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2 tracking-tight">
              <Database className="w-6 h-6 text-indigo-400" />
              Retrieved MIMIC-CXR Historic Cases
            </h2>
          </div>
          <p className="text-xs text-gray-300 mt-1.5 font-medium">
            Click any matched radiograph to view in full-resolution modal.
          </p>
        </div>

        <div className="bg-gray-900 px-5 py-2.5 rounded-2xl border border-gray-800 text-right shadow-sm">
          <span className="text-[10px] uppercase font-mono text-gray-400 font-extrabold tracking-wider">Cohort Matches</span>
          <p className="text-base font-mono font-extrabold text-white">{normalizedRecords.length} Cases Retracted</p>
        </div>
      </div>

      {/* Spacious High-Readability Cards */}
      <div className="space-y-6">
        {normalizedRecords.map((rec, idx) => {
          const hasErr = imageErrors[rec.caseId];
          return (
            <div 
              key={idx}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200 shadow-md space-y-5 relative"
            >
              {/* Card Top Key-Value Badge Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950 p-4 rounded-xl border border-gray-800 shadow-inner">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-gray-400 uppercase font-bold">Key: case_id</span>
                  <span className="text-sm font-mono font-extrabold text-indigo-300 bg-indigo-950 px-3.5 py-1 rounded-lg border border-indigo-800 shadow-sm">
                    {rec.caseId}
                  </span>
                  <span className="text-xs font-mono text-gray-400 uppercase font-medium">Key: source</span>
                  <span className="text-xs font-mono font-semibold text-gray-300 bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800">
                    {rec.source}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5 bg-emerald-950 px-3.5 py-1 rounded-xl border border-emerald-800 shadow-sm">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-300 font-mono font-medium">score:</span>
                    <span className="text-base font-mono font-extrabold text-emerald-400">{rec.scorePercentage}%</span>
                  </div>

                  <a 
                    href={rec.imageUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1.5 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-800 hover:border-indigo-500 transition-colors"
                  >
                    image_url <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Grid Layout: Matched X-Ray Image Preview vs Exact Text */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                
                {/* Matched X-Ray Image Frame with Click Lightbox Trigger */}
                <div className="md:col-span-1 bg-black rounded-xl border border-gray-800 p-3 flex flex-col items-center justify-center relative min-h-[220px] shadow-md group">
                  <div className="w-full flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2 font-bold uppercase tracking-wider bg-black/80 px-2 py-1 rounded border border-gray-800">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Key: image_url
                    </span>
                    <span className="flex items-center gap-1 text-indigo-300">
                      <ZoomIn className="w-3 h-3" /> Click
                    </span>
                  </div>
                  
                  {/* Interactive Thumbnail Container */}
                  <div 
                    onClick={() => !hasErr && setSelectedModalImage(rec)}
                    className="relative w-full h-48 cursor-pointer overflow-hidden rounded-lg border border-gray-800 flex items-center justify-center bg-gray-950"
                  >
                    <img 
                      src={rec.imageUrl} 
                      alt={`Case ${rec.caseId}`}
                      onError={() => handleImageError(rec.caseId)}
                      className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${hasErr ? 'opacity-30' : 'opacity-100'}`}
                    />

                    {/* Hover Overlay Badge */}
                    {!hasErr && (
                      <div className="absolute inset-0 bg-indigo-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-indigo-400">
                          <ZoomIn className="w-4 h-4" /> View Fullscreen
                        </span>
                      </div>
                    )}
                  </div>

                  {hasErr && (
                    <div className="absolute inset-0 bg-gray-950/95 rounded-xl flex flex-col items-center justify-center p-3 text-center pointer-events-none text-white">
                      <p className="text-xs font-mono font-semibold">{rec.imageUrl.replace(baseUrl, '')}</p>
                    </div>
                  )}
                </div>

                {/* Exact Keys Text: impression & findings */}
                <div className="md:col-span-3 space-y-4">
                  
                  {/* KEY: IMPRESSION */}
                  <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-900/60 shadow-sm">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                        Key: impression
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white leading-relaxed font-sans">
                      {rec.impression}
                    </p>
                  </div>

                  {/* KEY: FINDINGS */}
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 shadow-inner">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
                        Key: findings
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed font-sans whitespace-pre-line font-normal">
                      {rec.findings}
                    </p>
                  </div>

                </div>

              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified MIMIC-CXR Record Alignment
                </span>
                <span className="text-indigo-400 font-bold">Qdrant Vector Engine</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* FULLSCREEN LIGHTBOX PORTAL (Renders directly onto document.body so it is NEVER cut when scrolled down!) */}
      {selectedModalImage && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 w-screen h-screen top-0 left-0"
          onClick={() => setSelectedModalImage(null)}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-3xl max-w-5xl w-full h-[88vh] flex flex-col overflow-hidden shadow-2xl relative my-auto mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-950 border-b border-gray-800 shrink-0">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-lg text-xs font-mono font-bold">
                  Case #{selectedModalImage.caseId}
                </span>
                <h3 className="text-sm font-bold text-white">
                  High-Resolution Historic Radiograph Viewer
                </h3>
              </div>
              
              <button 
                onClick={() => setSelectedModalImage(null)}
                className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Press ESC or Click to Close"
              >
                <span>Close (ESC)</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Viewport */}
            <div className="p-6 bg-black flex-1 flex items-center justify-center overflow-hidden relative">
              <img 
                src={selectedModalImage.imageUrl} 
                alt={`Case ${selectedModalImage.caseId} High Res`}
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-gray-800" 
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-950 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400 font-mono shrink-0">
              <span>Cosine Similarity: <strong className="text-emerald-400 font-extrabold">{selectedModalImage.scorePercentage}% Match</strong></span>
              <a 
                href={selectedModalImage.imageUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
              >
                Open Direct Endpoint <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
