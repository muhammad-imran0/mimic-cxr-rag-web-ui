import React from 'react';
import { Cpu, Database, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

export default function PipelineTracker({ currentStep, status, isLoading }) {
  const steps = [
    { id: 1, label: "512-dim BiomedCLIP", sub: "Visual Embedding", icon: Cpu },
    { id: 2, label: "Qdrant Vector Search", sub: "Historic MIMIC-CXR Lookup", icon: Database },
    { id: 3, label: "LLM Synthesis", sub: "Clinical Report Streaming", icon: Sparkles },
  ];

  if (!isLoading && currentStep === 0) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4.5 mb-6 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Status indicator */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gray-950 border border-gray-800 rounded-xl shadow-sm">
            <Loader2 className={`w-5 h-5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Live Pipeline Status
            </span>
            <p className="text-xs font-extrabold text-white mt-0.5">{status || "Processing multimodal radiograph..."}</p>
          </div>
        </div>

        {/* Step progress pills */}
        <div className="flex items-center space-x-2.5">
          {steps.map((step) => {
            const isDone = currentStep > step.id || currentStep === 4;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div 
                key={step.id}
                className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                  isDone 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800 font-bold shadow-sm' 
                    : isCurrent 
                      ? 'bg-indigo-950 text-indigo-200 border-indigo-500 font-extrabold shadow-sm ring-1 ring-indigo-500 animate-pulse' 
                      : 'bg-gray-950 text-gray-400 border-gray-800'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-indigo-400' : 'text-gray-500'}`} />
                )}
                <div>
                  <p className="font-bold text-[11px] leading-tight">{step.label}</p>
                  <p className="text-[9px] text-gray-400 font-mono mt-0.5">{step.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
