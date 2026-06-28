import React, { useState } from 'react';
import { FileText, CheckCircle2, Copy, Sparkles, BookmarkCheck, Stethoscope, Loader2 } from 'lucide-react';

export default function StreamingReport({ liveReport, liveStatus, isLoadingLive }) {
  const [copied, setCopied] = useState(false);

  if (!liveReport && !isLoadingLive) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center border border-gray-800 flex flex-col items-center justify-center min-h-[350px]">
        <Stethoscope className="w-10 h-10 text-gray-600 mb-3" />
        <h4 className="text-sm font-bold text-gray-300">LLM Diagnostic Stream Standby</h4>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Upload a chest radiograph to generate real-time synthesized findings and impressions.
        </p>
      </div>
    );
  }

  const copyReport = () => {
    if (liveReport) {
      navigator.clipboard.writeText(liveReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parseLiveReportSections = (text) => {
    if (!text) return { findings: '', impression: '', examination: '' };

    let examination = '';
    let findings = '';
    let impression = '';

    const lines = text.split('\n');
    let currentSection = 'body';

    for (const line of lines) {
      if (line.includes('EXAMINATION:')) {
        examination = line.replace('EXAMINATION:', '').trim();
      } else if (line.includes('FINDINGS:')) {
        currentSection = 'findings';
      } else if (line.includes('IMPRESSION:')) {
        currentSection = 'impression';
      } else if (line.includes('RETRIEVED HISTORIC SIMILARITIES:')) {
        currentSection = 'skip';
      } else {
        if (currentSection === 'findings') findings += line + '\n';
        else if (currentSection === 'impression') impression += line + '\n';
        else if (currentSection === 'body' && line.trim() && !line.includes('---')) findings += line + '\n';
      }
    }

    return { 
      examination: examination || "Chest Radiograph (PA and Lateral views)", 
      findings: findings.trim() || text, 
      impression: impression.trim() 
    };
  };

  const parsed = parseLiveReportSections(liveReport);

  return (
    <div className="glass-panel-accent rounded-3xl p-8 shadow-md relative overflow-hidden space-y-6 border border-gray-800">
      
      {/* Top Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-800">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Stethoscope className="w-5 h-5 text-indigo-400" />
            Automated LLM Synthesized Clinical Report
          </h2>
          <p className="text-xs text-gray-300 mt-1 font-medium">
            Real-time streaming tokens from FastAPI backend (`/api/v1/diagnose`).
          </p>
        </div>

        {liveReport && (
          <button
            onClick={copyReport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gray-900 border border-gray-700 hover:border-indigo-500 text-gray-200 hover:text-white transition-all shadow-sm shrink-0"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copied ? 'Copied!' : 'Copy Report'}</span>
          </button>
        )}
      </div>

      {/* Structured Clean Report Cards */}
      <div className="space-y-5">
        
        {/* EXAMINATION BADGE */}
        <div className="flex items-center justify-between bg-gray-950 px-4 py-3 rounded-xl border border-gray-800 text-xs shadow-inner">
          <span className="text-gray-300 flex items-center gap-2 font-medium truncate">
            <FileText className="w-4 h-4 text-indigo-400 shrink-0" /> Modality: <strong className="text-white font-semibold truncate">{parsed.examination}</strong>
          </span>
          <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800 flex items-center gap-1.5 font-bold shadow-sm shrink-0 ml-2">
            {isLoadingLive ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            {isLoadingLive ? 'Streaming...' : 'Synthesis Complete'}
          </span>
        </div>

        {/* FINDINGS CARD */}
        <div className="bg-gray-950 rounded-2xl p-6 border border-gray-800 shadow-inner space-y-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gray-900 rounded-lg border border-gray-800 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
              Radiological Findings
            </h3>
          </div>
          
          <div className="text-sm text-gray-200 leading-relaxed font-sans space-y-2 whitespace-pre-line pl-1 font-normal">
            {parsed.findings || (isLoadingLive ? "Receiving live findings tokens from FastAPI stream..." : "")}
            {isLoadingLive && !parsed.impression && (
              <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse"></span>
            )}
          </div>
        </div>

        {/* IMPRESSION CALLOUT CARD */}
        {(parsed.impression || isLoadingLive) && (
          <div className="bg-emerald-950/40 rounded-2xl p-6 border border-emerald-900/60 shadow-sm relative overflow-hidden space-y-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gray-900 rounded-lg border border-gray-800 shadow-sm">
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Clinical Impression & Summary
              </h3>
            </div>

            <div className="text-sm font-semibold text-white leading-relaxed font-sans pl-1 whitespace-pre-line">
              {parsed.impression || (isLoadingLive ? "Awaiting impression tokens..." : "")}
              {isLoadingLive && parsed.impression && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse"></span>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
