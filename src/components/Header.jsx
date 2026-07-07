import React, { useEffect } from 'react';
import { Activity, Server, Stethoscope, Wifi, WifiOff, RefreshCw, Sparkles, ShieldCheck, Cpu, Database, GitMerge, CheckCircle2, Loader2, Plus, Image } from 'lucide-react';
import { API_BASE } from '../config';

export default function Header({ 
  isLiveServer, 
  onToggleLiveServer, 
  isServerHealthy, 
  onCheckHealth, 
  hasActiveDiagnosis, 
  onResetUpload, 
  selectedModel, 
  onSelectModel,
  selectedPipeline,
  onSelectPipeline,
  currentStep,
  status,
  isLoading
}) {
  
  useEffect(() => {
    onCheckHealth();
    const interval = setInterval(onCheckHealth, 5000);
    return () => clearInterval(interval);
  }, [onCheckHealth]);

  const modelOptions = [
    { id: 'llama3.2', name: 'Ollama (Llama-3.2 3B)' },
    { id: 'biogpt', name: 'BioGPT (7B Medical)' },
    { id: 'clinical-camel', name: 'Clinical Camel (13B)' },
    { id: 'gpt4o', name: 'OpenAI GPT-4o' }
  ];

  const steps = [
    { id: 1, label: "1. Similarity Search", icon: Database },
    { id: 2, label: "2. Fetch Images", icon: Image },
    { id: 3, label: "3. LLM Report", icon: Sparkles },
  ];

  return (
    <header className="border-b border-[#E2E8F0] bg-[#FFFFFF] sticky top-0 z-50 shadow-2xs w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-2.5 md:h-16 gap-3">
          
          {/* Brand Logo & Title (LEFT) */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-2 bg-[#0F172A] rounded-xl shadow-2xs flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#0F172A] flex items-center gap-1.5">
                  MIMIC-CXR <span className="text-indigo-600">Multimodal RAG</span>
                </h1>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold uppercase tracking-wide font-mono">
                  MSc Dissertation
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] hidden xl:block font-medium">
                Dr. Shaheen Khatoon (Supervisor) • University of East London
              </p>
            </div>
          </div>

          {/* TELEMETRY PIPELINE STAGES (CRISP RECTANGULAR BADGES) */}
          {hasActiveDiagnosis && (
            <div className="flex items-center space-x-1.5 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl text-xs overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase text-slate-700 mr-1 shrink-0 hidden sm:inline">Telemetry:</span>
              {steps.map((step) => {
                const isDone = currentStep > step.id || currentStep === 4;
                const isCurrent = currentStep === step.id;
                const Icon = step.icon;

                return (
                  <div 
                    key={step.id}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all duration-200 shrink-0 border ${
                      isDone 
                        ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] font-bold' 
                        : isCurrent 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold ring-1 ring-indigo-300 animate-pulse' 
                          : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0] font-medium'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    ) : (
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-indigo-600' : 'text-[#94A3B8]'}`} />
                    )}
                    <span className="whitespace-nowrap font-semibold">{step.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* RIGHT ACTION BAR: Model Selector, Pipeline Selector, Plus Button & Compact Live Icon */}
          <div className="flex items-center space-x-2 shrink-0">
            



            {/* Compact Plus Icon Button to Upload New Radiograph */}
            {hasActiveDiagnosis && (
              <button
                onClick={onResetUpload}
                className="flex items-center justify-center p-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
                title="Upload New Radiograph"
              >
                <Plus className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            )}

            {/* Compact Minimal Live Connection Status Icon Badge */}
            <button
              onClick={onToggleLiveServer}
              className="flex items-center justify-center p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all cursor-pointer shrink-0 relative group"
              title={`FastAPI Backend: ${isLiveServer ? 'HuggingFace Space Live' : 'Simulated Mode'}`}
            >
              {isServerHealthy ? (
                <div className="flex items-center space-x-1.5 px-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5 text-[#16A34A]" />
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 px-1">
                  <span className="h-2 w-2 rounded-full bg-[#D97706]"></span>
                  <WifiOff className="w-3.5 h-3.5 text-[#D97706]" />
                </div>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
