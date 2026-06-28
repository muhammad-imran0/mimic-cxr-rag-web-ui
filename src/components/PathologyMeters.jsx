import React from 'react';
import { Activity, ShieldAlert, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

export default function PathologyMeters({ selectedCase }) {
  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-400 border border-red-800/80 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> High Risk</span>;
      case 'Moderate':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800/80 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Moderate</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Low Risk</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 mb-6 border border-slate-800/80 shadow-2xl">
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Multi-Label Pathology Probability Meters
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time dense multi-label convolutional classifier output calibrated across MIMIC-CXR benchmark distribution.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multi-label Sigmoid Threshold: <strong>0.50</strong></span>
        </div>
      </div>

      {/* Probability Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedCase.pathologyScores.map((pathology, idx) => {
          const percentage = (pathology.score * 100).toFixed(1);
          return (
            <div 
              key={idx}
              className="bg-slate-900/70 rounded-xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {pathology.name}
                  </span>
                  {getRiskBadge(pathology.risk)}
                </div>

                {/* Progress Bar Container */}
                <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-2">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: pathology.color,
                      boxShadow: `0 0 12px ${pathology.color}80`
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400 font-mono text-[11px]">Classifier Score:</span>
                  <span className="font-mono font-bold text-slate-100 text-sm" style={{ color: pathology.color }}>
                    {percentage}%
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 pt-2 border-t border-slate-800/60 font-sans leading-relaxed">
                {pathology.details}
              </p>

            </div>
          );
        })}
      </div>

    </div>
  );
}
