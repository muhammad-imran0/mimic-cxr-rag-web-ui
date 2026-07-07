import React from 'react';
import { Cpu, Database, Sparkles, CheckCircle2, Loader2, GitMerge } from 'lucide-react';

export default function PipelineTracker({ currentStep, status, isLoading }) {
  const steps = [
    { id: 1, label: "1. BiomedCLIP", sub: "Visual Encoding", icon: Cpu },
    { id: 2, label: "2. Qdrant Search", sub: "Cosine Lookup", icon: Database },
    { id: 3, label: "3. Reranker", sub: "Cross-Encoder", icon: GitMerge },
    { id: 4, label: "4. LLM Report", sub: "Clinical Stream", icon: Sparkles },
  ];

  if (!isLoading && currentStep === 0) return null;

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 sm:px-6 shadow-sm mb-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-2.5 bg-[#CCFBF1]/60 border border-[#99F6E4] rounded-xl">
            <Loader2 className={`w-5 h-5 text-[#0F766E] ${isLoading ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
              Multimodal RAG Telemetry
            </span>
            <p className="text-xs font-bold text-[#0F172A] mt-0.5">{status || "Diagnosis completed successfully."}</p>
          </div>
        </div>

        {/* 4-Stage Progress Pills with Visible Labels */}
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step) => {
            const isDone = currentStep > step.id || currentStep === 5;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div 
                key={step.id}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 border ${
                  isDone 
                    ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] font-bold shadow-2xs' 
                    : isCurrent 
                      ? 'bg-[#CCFBF1]/60 text-[#0F766E] border-[#0F766E] font-bold shadow-2xs ring-2 ring-[#0F766E]/20 animate-pulse' 
                      : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] font-medium'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                ) : (
                  <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-[#0F766E]' : 'text-[#94A3B8]'}`} />
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-[11px] leading-tight whitespace-nowrap">{step.label}</span>
                  <span className="text-[9px] text-[#64748B] whitespace-nowrap">{step.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
