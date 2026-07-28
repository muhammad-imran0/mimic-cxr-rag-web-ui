import React, { useState } from 'react';
import { FileText, CheckCircle2, Copy, Loader2, Play, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import PromptEditor from './PromptEditor';

/* ── Static patient info ── */
const PATIENT = {
  name: 'James R. Mitchell',
  dob: '14 March 1958',
  age: 66,
  gender: 'Male',
  physician: 'Dr. Sarah Thompson, MD',
  modality: 'Chest X-ray · PA View',
  accession: 'CXR-2024-00741',
};

function todayStr() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function sanitizeReport(text) {
  if (!text) return text;
  const today = todayStr();
  const replacements = [
    [/\[Patient Name\]/gi,          PATIENT.name],
    [/\[Name\]/gi,                  PATIENT.name],
    [/\[DOB\]/gi,                   PATIENT.dob],
    [/\[Date of Birth\]/gi,         PATIENT.dob],
    [/\[Gender\]/gi,                PATIENT.gender],
    [/\[Sex\]/gi,                   PATIENT.gender],
    [/\[Referring Physician\]/gi,   PATIENT.physician],
    [/\[Physician\]/gi,             PATIENT.physician],
    [/\[Date\]/gi,                  today],
    [/\[Date of Examination\]/gi,   today],
    [/\[Examination Date\]/gi,      today],
    [/\[Location\]/gi,              'Department of Radiology'],
    [/\[Your Name\]/gi,             PATIENT.physician],
    [/\[Radiologist\]/gi,           PATIENT.physician],
    [/\[Accession.*?\]/gi,          PATIENT.accession],
  ];
  let out = text;
  for (const [pattern, value] of replacements) out = out.replace(pattern, value);
  return out;
}

function PatientBanner() {
  return (
    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--panel-bg)' }}>
      <div className="panel-label" style={{ marginBottom: 6 }}>Patient Information</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 10 }}>
        {[
          ['Patient', PATIENT.name],
          ['DOB', `${PATIENT.dob} (Age ${PATIENT.age})`],
          ['Gender', PATIENT.gender],
          ['Physician', PATIENT.physician],
          ['Modality', PATIENT.modality],
          ['Exam Date', todayStr()],
        ].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--text-disabled)', width: 80, shrink: 0 }}>{label}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderInline(text) {
  if (!text) return null;
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

function ReportDoc({ content }) {
  if (!content) return null;
  const lines = content.split('\n');
  const out = [];
  let listBuf = [];

  const flushList = () => {
    if (!listBuf.length) return;
    out.push(
      <ul key={`ul${out.length}`} style={{ paddingLeft: 16, margin: '6px 0', listStyleType: 'disc' }}>
        {listBuf.map((l, i) => (
          <li key={i} style={{ color: 'var(--text-primary)', fontSize: 12, lineHeight: 1.6, marginBottom: 2 }}>
            {renderInline(l)}
          </li>
        ))}
      </ul>
    );
    listBuf = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      listBuf.push(trimmed.slice(1).trim());
      return;
    }

    flushList();

    if (trimmed.match(/^(findings|findings:|impression|impression:|clinical history|clinical history:|comparison|comparison:|indication|indication:)/i)) {
      out.push(
        <div key={index} className="panel-label" style={{ marginTop: 12, marginBottom: 4, color: 'var(--text-secondary)' }}>
          {trimmed.replace(/:$/, '')}
        </div>
      );
    } else {
      out.push(
        <p key={index} style={{ color: 'var(--text-primary)', fontSize: 12, lineHeight: 1.6, marginBottom: 6 }}>
          {renderInline(trimmed)}
        </p>
      );
    }
  });

  flushList();
  return <div className="clinical-doc">{out}</div>;
}

export default function StreamingReport({
  reports = {}, prompts = {}, filledPrompts = {}, isLoadingLive, retrievedRecords = [], selectedModel = 'llama3.2',
  hasReportGenerated, onTriggerGenerate, onTriggerGenerateAll,
  onReportModelChange, reportModels = ['llama3.2', 'meditron:7b', 'mistral:latest', 'qwen2.5vl:7b'],
  step1Loading, step2Loading, step3Loading, step3Error,
  uploadedImagePreview, apiBase,
  customSystemPrompt, customUserTemplate, onSystemPromptChange, onUserTemplateChange,
}) {
  const liveReport = reports[selectedModel] || "";
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('structured'); // 'structured' | 'raw'
  const [promptOpen, setPromptOpen] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(liveReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanReport = sanitizeReport(liveReport);
  const anyReport = Object.values(reports).some(Boolean);
  const reportActive = step3Loading || step3Error || isLoadingLive || !!liveReport || anyReport;
  const readyToGenerate = !step1Loading && !step2Loading && retrievedRecords.length > 0 && !liveReport && !step3Loading && !isLoadingLive;

  if (step1Loading || step2Loading) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Model / Generate Toolbar ── */}
      {reportActive && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--panel-bg)', padding: '0 16px', alignItems: 'center', flexShrink: 0 }}>
          {reportModels.map(m => {
            const hasReport = !!reports[m];
            const isActive = selectedModel === m;
            return (
              <button
                key={m}
                onClick={() => onReportModelChange && onReportModelChange(m)}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}
              >
                {m}
                {hasReport && <span className="dot dot-green" style={{ marginLeft: 4, width: 4, height: 4 }} />}
              </button>
            );
          })}

          {onTriggerGenerateAll && (
            <button
              onClick={onTriggerGenerateAll}
              className="btn-ghost"
              style={{ marginLeft: 'auto', fontSize: 9, padding: '3px 8px', borderRadius: 2 }}
            >
              Generate All
            </button>
          )}
        </div>
      )}

      {/* ── Ready to generate ── */}
      {readyToGenerate && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
          <span className="panel-label">Radiology Report Standby</span>
          <button
            onClick={onTriggerGenerate}
            id="generate-report-btn"
            className="btn-primary"
            style={{ width: '100%', maxWidth: 200 }}
          >
            {isLoadingLive ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      )}

      {/* ── Active Report View ── */}
      {reportActive && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Patient Banner */}
          <PatientBanner />

          {/* Action strip */}
          {liveReport && (
            <div style={{ display: 'flex', gap: 8, padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--panel-bg)', flexShrink: 0 }}>
              <button
                onClick={() => setViewMode(v => v === 'structured' ? 'raw' : 'structured')}
                className="btn-ghost"
                style={{ fontSize: 9, padding: '3px 6px' }}
              >
                {viewMode === 'structured' ? 'Raw View' : 'Structured View'}
              </button>
              <button
                onClick={() => window.print()}
                className="btn-ghost"
                style={{ fontSize: 9, padding: '3px 6px' }}
              >
                Print
              </button>
              <button
                onClick={copy}
                className="btn-ghost"
                style={{ fontSize: 9, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 3 }}
              >
                {copied ? <CheckCircle2 style={{ width: 10, height: 10, color: 'var(--green)' }} /> : null}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}

          {/* Report Body */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }} id="printable-radiology-report">
            {step3Error && (
              <div style={{ border: '1px solid var(--border)', padding: 12, marginBottom: 12, borderRadius: 2, color: 'var(--red)', fontSize: 11 }}>
                <span className="panel-label" style={{ color: 'var(--red)', display: 'block', marginBottom: 4 }}>Generation Error</span>
                {step3Error}
              </div>
            )}

            {isLoadingLive && !liveReport && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-disabled)', fontSize: 11 }}>
                <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
                <span>Running generation pipeline on model...</span>
              </div>
            )}

            {liveReport && (
              viewMode === 'structured' ? (
                <ReportDoc content={cleanReport} />
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6 }}>
                  {cleanReport}
                </pre>
              )
            )}
          </div>

          {/* Prompt Viewer Terminal */}
          {liveReport && (
            <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button
                onClick={() => setPromptOpen(o => !o)}
                style={{
                  width: '100%',
                  background: 'var(--panel-bg)',
                  border: 'none',
                  padding: '8px 14px',
                  display: 'flex',
                  justifyContent: 'between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <span className="panel-label">System Prompt Details</span>
                <span style={{ fontSize: 9, color: 'var(--text-disabled)', marginLeft: 'auto' }}>
                  {promptOpen ? 'Hide' : 'Show'}
                </span>
              </button>

              {promptOpen && (
                <PromptEditor
                  apiBase={apiBase}
                  customSystemPrompt={customSystemPrompt}
                  customUserTemplate={customUserTemplate}
                  onSystemPromptChange={onSystemPromptChange}
                  onUserTemplateChange={onUserTemplateChange}
                  filledPrompt={filledPrompts[selectedModel] || null}
                />
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
