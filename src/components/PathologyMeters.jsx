import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';

export default function PathologyMeters({ apiBase, uploadedImagePreview }) {
  const [pathologies, setPathologies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPathologies = async () => {
      if (!uploadedImagePreview) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(uploadedImagePreview);
        const blob = await res.blob();

        const formData = new FormData();
        formData.append("file", blob, "image.jpg");

        const apiRes = await fetch(`${apiBase}/api/v1/xai/classify`, {
          method: 'POST',
          body: formData
        });

        if (!apiRes.ok) throw new Error("Failed to classify image.");

        const data = await apiRes.json();

        if (isMounted) {
          setPathologies(data.pathologies || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPathologies();

    return () => {
      isMounted = false;
    };
  }, [uploadedImagePreview, apiBase]);

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-200 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> High Risk</span>;
      case 'Moderate':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Moderate</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Low Risk</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Zero-Shot Disease Classification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-label classification using BioMedCLIP zero-shot inference.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-xs text-slate-500">Evaluating 14 disease categories...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && !uploadedImagePreview && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <p className="text-xs">Please upload an image to see zero-shot classification results.</p>
        </div>
      )}

      {!isLoading && !error && pathologies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pathologies.map((pathology, idx) => {
            const percentage = (pathology.score * 100).toFixed(1);
            return (
              <div 
                key={idx}
                className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {pathology.name}
                    </span>
                    {getRiskBadge(pathology.risk)}
                  </div>

                  {/* Progress Bar Container */}
                  <div className="relative w-full h-2 bg-slate-200/70 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: pathology.color
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-slate-400 font-mono">Zero-Shot Prob:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-sans leading-relaxed">
                  {pathology.details}
                </p>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
