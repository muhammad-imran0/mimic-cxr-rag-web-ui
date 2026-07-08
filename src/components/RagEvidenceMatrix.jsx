import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Database, ShieldCheck, FileText, Sparkles, Image as ImageIcon, CheckCircle2, ExternalLink, X, ZoomIn, AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { API_BASE } from '../config';

export default function RagEvidenceMatrix({ 
  liveRecords, 
  comparisons,
  selectedPipeline,
  onSelectPipeline,
  baseUrl = API_BASE,
  step1Loading,
  step1Error,
  step2Loading,
  step2Error,
  onImagesLoaded
}) {
  const [loadedImages, setLoadedImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [selectedModalImage, setSelectedModalImage] = useState(null);
  const [expandedFindings, setExpandedFindings] = useState({});
  const [isCardCollapsed, setIsCardCollapsed] = useState(false);
  const [retryCounts, setRetryCounts] = useState({});

  useEffect(() => {
    setLoadedImages({});
    setImageErrors({});
    setRetryCounts({});
  }, [liveRecords]);

  const handleRetryImage = (caseId, e) => {
    e.stopPropagation();
    setImageErrors(prev => {
      const next = { ...prev };
      delete next[caseId];
      return next;
    });
    setLoadedImages(prev => {
      const next = { ...prev };
      delete next[caseId];
      return next;
    });
    setRetryCounts(prev => ({
      ...prev,
      [caseId]: (prev[caseId] || 0) + 1
    }));
  };

  const handleImageLoad = (caseId) => {
    setLoadedImages(prev => ({ ...prev, [caseId]: true }));
  };

  const handleImageError = (caseId) => {
    setImageErrors(prev => ({ ...prev, [caseId]: true }));
  };

  useEffect(() => {
    if (!liveRecords || liveRecords.length === 0) return;

    const recordsToLoad = liveRecords.slice(0, 3);
    const allLoadedOrErrored = recordsToLoad.every(r => {
      const caseId = r.case_id !== undefined ? r.case_id : r.id;
      return loadedImages[caseId] || imageErrors[caseId];
    });

    const hasAnyStatus = Object.keys(loadedImages).length > 0 || Object.keys(imageErrors).length > 0;

    if (allLoadedOrErrored && hasAnyStatus && onImagesLoaded) {
      onImagesLoaded();
    }
  }, [loadedImages, imageErrors, liveRecords, onImagesLoaded]);

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

  if (step1Loading) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col items-center justify-center min-h-[320px] text-center space-y-4 animate-pulse">
        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <Database className="w-10 h-10 text-indigo-600 animate-bounce" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-[#0F172A]">Step 1: Similarity Search Active</h4>
          <p className="text-xs text-[#64748B] max-w-xs mt-1 font-medium leading-relaxed">
            Uploading patient radiograph and querying 30,600 high-dimensional clinical vectors in Qdrant DB...
          </p>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Vector Similarity Lookup...</span>
        </div>
      </div>
    );
  }

  if (step1Error) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-red-200 shadow-2xs flex flex-col items-center justify-center min-h-[320px] text-center space-y-4">
        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
          <AlertCircle className="w-10 h-10 text-red-600 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-[#0F172A]">Similarity Search Error</h4>
          <p className="text-xs text-red-600 max-w-xs mt-1 font-medium leading-relaxed">
            {step1Error}
          </p>
        </div>
      </div>
    );
  }


  if (step2Error) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-amber-200 shadow-2xs flex flex-col items-center justify-center min-h-[320px] text-center space-y-4">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <AlertCircle className="w-10 h-10 text-amber-600 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-[#0F172A]">Image Fetching Error</h4>
          <p className="text-xs text-amber-600 max-w-xs mt-1 font-medium leading-relaxed">
            {step2Error}
          </p>
        </div>
      </div>
    );
  }

  const activeRecords = (comparisons && selectedPipeline) 
    ? (comparisons[selectedPipeline] || []) 
    : liveRecords;

  if (!activeRecords || activeRecords.length === 0) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col items-center justify-center min-h-[320px] text-center">
        <Database className="w-10 h-10 text-slate-700 animate-pulse mb-3" />
        <h4 className="text-sm font-bold text-[#0F172A]">Retrieved Evidence Standby</h4>
        <p className="text-xs text-[#64748B] max-w-xs mt-1 font-medium">Ingest a radiograph to query 30,600 MIMIC-CXR vectors in Qdrant.</p>
      </div>
    );
  }

  const normalizedRecords = activeRecords.slice(0, 3).map((r, idx) => {
    const caseId = r.case_id !== undefined ? r.case_id : (r.study_id !== undefined ? r.study_id : r.id || idx);
    const rawScore = typeof r.score === 'number' ? r.score : parseFloat(r.score) || 0.95;
    
    const retryCount = retryCounts[caseId] || 0;
    const cacheBuster = retryCount > 0 ? `?retry=${retryCount}` : '';

    let fullImageUrl = "";
    if (r.image_url) {
      fullImageUrl = (r.image_url.startsWith("http") ? r.image_url : `${baseUrl}${r.image_url}`) + cacheBuster;
    } else {
      fullImageUrl = `${baseUrl}/api/v1/cases/${caseId}/image` + cacheBuster;
    }

    return {
      caseId: caseId,
      scorePercentage: (rawScore * 100).toFixed(1),
      findings: r.findings || r.finding || "Clear lung fields without focal consolidation. Heart size normal.",
      impression: r.impression || "No acute cardiopulmonary disease.",
      label: r.label || null,
      labelKeyword: r.label_keyword || r.label || "Other",
      labelChexbert: r.label_chexbert_primary || r.label || "Other",
      labelLlm: r.label_llm_primary || r.label || "Other",
      source: r.source || "MIMIC-CXR Cohort",
      imageUrl: fullImageUrl
    };
  });

  const handleImageErrorFallback = (id) => {
    // Legacy error handler if needed, though we use inline handler now
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const toggleFindings = (caseId, e) => {
    e.stopPropagation();
    setExpandedFindings(prev => ({ ...prev, [caseId]: !prev[caseId] }));
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
      
      {/* Header Bar with Collapsible Open/Hide Chevron */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div 
          onClick={() => setIsCardCollapsed(!isCardCollapsed)}
          className="flex items-center space-x-2 cursor-pointer group select-none"
        >
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200 font-mono">
            Qdrant Vector DB
          </span>
          <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-1.5 tracking-tight group-hover:text-indigo-600 transition-colors">
            <Database className="w-4 h-4 text-indigo-600" />
            Top-3 MIMIC-CXR Ground-Truth Cases
          </h2>
          <div className="p-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-slate-700 group-hover:bg-slate-100 transition-colors">
            {isCardCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>

        <span className="text-xs font-bold text-[#0F172A] bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0] font-mono">
          {normalizedRecords.length} Matches
        </span>
      </div>

      {/* Dynamic Tab Bar for Pipeline Results Comparison */}
      {!isCardCollapsed && comparisons && onSelectPipeline && (
        <div className="flex flex-wrap items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] gap-1 shrink-0">
          {[
            { id: "none", label: "No Filter (Img)" },
            { id: "keyword", label: "Keyword Filter" },
            { id: "chexbert", label: "CheXbert Filter" },
            { id: "hybrid", label: "Hybrid Filter" },
            { id: "llm", label: "LLM Filter" },
            { id: "text_rag", label: "Text RAG (MPNet)" }
          ].map((tab) => {
            const isActive = selectedPipeline === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectPipeline(tab.id)}
                className={`flex-1 text-center py-1.5 px-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#0F172A] text-white shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Case Cards Stack with Explicit Impression & Findings (COLLAPSIBLE BODY) */}
      {!isCardCollapsed && (
        <div className="animate-fade-in space-y-4 pt-1">
          {normalizedRecords.map((rec, idx) => {
            const hasErr = imageErrors[rec.caseId];
            const isLoadingImage = !loadedImages[rec.caseId] && !hasErr;
            const isExpanded = expandedFindings[rec.caseId] ?? true;

            return (
              <div 
                key={idx}
                className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E2E8F0] hover:border-slate-400 transition-all duration-200 shadow-2xs hover:shadow-sm space-y-3"
              >
                {/* Card Header with Green Score Bar (#16A34A) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#0F172A] bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0] font-mono">
                      Case #{rec.caseId}
                    </span>
                    <span className="text-[11px] text-[#64748B] font-medium hidden sm:inline">{rec.source}</span>
                  </div>

                  <div className="flex items-center space-x-2 flex-1 max-w-[160px]">
                    <div className="flex-1 bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                      <div 
                        className="bg-[#16A34A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${rec.scorePercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#16A34A] font-mono shrink-0">{rec.scorePercentage}%</span>
                  </div>
                </div>

                {/* Unified Pipeline Clinical Labels */}
                <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0] text-[11px]">
                  <div className="flex flex-col items-center justify-center text-center p-1.5 bg-white rounded-md border border-slate-200/60 shadow-3xs">
                    <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Keyword class</span>
                    <span className="font-extrabold text-[#334155] mt-0.5 truncate w-full px-1" title={rec.labelKeyword}>
                      {rec.labelKeyword}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-1.5 bg-white rounded-md border border-slate-200/60 shadow-3xs">
                    <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">CheXbert class</span>
                    <span className="font-extrabold text-[#334155] mt-0.5 truncate w-full px-1" title={rec.labelChexbert}>
                      {rec.labelChexbert}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-1.5 bg-white rounded-md border border-slate-200/60 shadow-3xs">
                    <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">LLM class</span>
                    <span className="font-extrabold text-[#334155] mt-0.5 truncate w-full px-1" title={rec.labelLlm}>
                      {rec.labelLlm}
                    </span>
                  </div>
                </div>

                {/* Layout: Thumbnail + Impression & Findings */}
                <div className="flex items-start space-x-3.5">
                  
                  {/* Thumbnail Image */}
                  <div 
                    onClick={() => !hasErr && !isLoadingImage && setSelectedModalImage(rec)}
                    className="w-24 h-24 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs cursor-pointer group"
                  >
                    {isLoadingImage && (
                      <div className="absolute inset-0 bg-[#F8FAFC] flex items-center justify-center z-10">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      </div>
                    )}
                    {!hasErr ? (
                      <img 
                        src={rec.imageUrl} 
                        alt={`Case ${rec.caseId}`}
                        onLoad={() => handleImageLoad(rec.caseId)}
                        onError={() => handleImageError(rec.caseId)}
                        className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 ${isLoadingImage ? 'opacity-0' : 'opacity-100'}`}
                      />
                    ) : (
                      <div 
                        onClick={(e) => handleRetryImage(rec.caseId, e)}
                        className="flex flex-col items-center justify-center gap-1 w-full h-full text-[#94A3B8] hover:text-[#4F46E5] hover:bg-indigo-50/50 transition-colors select-none"
                        title="Click to retry loading image"
                      >
                        <ImageIcon className="w-5 h-5 shrink-0" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Retry</span>
                      </div>
                    )}
                    {!isLoadingImage && !hasErr && (
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Clinical Content: Impression + Findings */}
                  <div className="flex-1 space-y-2 min-w-0 text-xs">
                    
                    {/* Clinical Impression */}
                    <div className="bg-[#F0FDF4] p-2.5 rounded-lg border border-[#BBF7D0]">
                      <p className="font-bold text-[#16A34A] flex items-center gap-1 mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#16A34A]" /> 
                        <span>Clinical Impression</span>
                      </p>
                      <p className="text-[#0F172A] leading-relaxed font-semibold">
                        {rec.impression}
                      </p>
                    </div>

                    {/* Radiological Findings */}
                    <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                      <div 
                        onClick={(e) => toggleFindings(rec.caseId, e)}
                        className="flex items-center justify-between font-bold text-slate-800 cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-700" />
                          <span>Radiological Findings</span>
                        </span>
                        <button className="text-slate-700 hover:text-[#0F172A]">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <p className="text-[#334155] mt-1 leading-relaxed font-medium">
                          {rec.findings}
                        </p>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Portal */}
      {selectedModalImage && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 w-screen h-screen top-0 left-0"
          onClick={() => setSelectedModalImage(null)}
        >
          <div 
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl relative my-auto mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] shrink-0">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 bg-[#0F172A] text-white rounded-md text-xs font-bold font-mono">
                  Case #{selectedModalImage.caseId}
                </span>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Historic MIMIC-CXR Radiograph & Case Findings
                </h3>
              </div>
              
              <button 
                onClick={() => setSelectedModalImage(null)}
                className="p-2 text-[#64748B] hover:text-[#0F172A] bg-[#E2E8F0] rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              >
                <span>Close (ESC)</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-black flex-1 flex items-center justify-center overflow-hidden relative">
              <img 
                src={selectedModalImage.imageUrl} 
                alt={`Case ${selectedModalImage.caseId} High Res`}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" 
              />
            </div>
            
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-xs text-[#334155] space-y-1">
              <p><strong className="text-slate-900">Findings:</strong> {selectedModalImage.findings}</p>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
