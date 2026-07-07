import React, { useState, useMemo } from 'react';
import { FileText, CheckCircle2, Copy, Sparkles, Loader2, ShieldAlert, Cpu, RefreshCw, Play, ZoomIn, X, ImageIcon, Database, ChevronDown, ChevronUp, User } from 'lucide-react';
import ReactDOM from 'react-dom';

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

/* ── Replace bracket placeholders the LLM emits with real dummy values ── */
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
    [/\[Location\]/gi,              'Department of Radiology, City General Hospital'],
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
    <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="text-[11px] font-bold text-[#374151] uppercase tracking-widest">Patient Information</span>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[12px]">
        {[
          ['Patient', PATIENT.name],
          ['Date of Birth', `${PATIENT.dob} (Age ${PATIENT.age})`],
          ['Gender', PATIENT.gender],
          ['Referring Physician', PATIENT.physician],
          ['Modality', PATIENT.modality],
          ['Date of Examination', todayStr()],
          ['Accession No.', PATIENT.accession],
        ].map(([label, val]) => (
          <div key={label} className="flex gap-2">
            <span className="text-[#9CA3AF] w-36 shrink-0">{label}</span>
            <span className="font-semibold text-[#111827]">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Simple inline renderer: bold + code only ── */
function renderInline(text) {
  if (!text) return null;
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-[#111827]">{part.slice(2, -2)}</strong>;
    return part;
  });
}

/* ── Markdown renderer – plain document style ── */
function ReportDoc({ content }) {
  if (!content) return null;
  const lines = content.split('\n');
  const out = [];
  let listBuf = [];

  const flushList = () => {
    if (!listBuf.length) return;
    out.push(
      <ul key={`ul${out.length}`} className="my-1.5 space-y-0.5 pl-5 list-disc text-[13px] text-[#374151] leading-relaxed">
        {listBuf.map((l, i) => <li key={i}>{renderInline(l)}</li>)}
      </ul>
    );
    listBuf = [];
  };

  lines.forEach((raw, i) => {
    const t = raw.trim();
    // Skip lines that are entirely bracket placeholders e.g. [Patient Name] or [DOB]
    if (/^\[.*\]$/.test(t)) return;
    // Skip patient info lines the LLM echoes back (name, dob, gender, physician, accession)
    const lc = t.toLowerCase();
    if (
      lc.startsWith('patient name:') || lc.startsWith('date of birth:') ||
      lc.startsWith('gender:') || lc.startsWith('referring physician:') ||
      lc.startsWith('accession') || lc.startsWith('date of examination:') ||
      lc.startsWith('modality:') || lc.startsWith('location:') ||
      lc.startsWith('imaging details') || lc.startsWith('patient information')
    ) return;

    if (/^#{1,4}\s/.test(t)) {
      flushList();
      const txt = t.replace(/^#{1,4}\s/, '');
      out.push(<p key={i} className="mt-4 mb-1 text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">{txt}</p>);
    } else if (/^(\*|-)\s/.test(t)) {
      listBuf.push(t.slice(2));
    } else if (/^\d+\.\s/.test(t)) {
      flushList();
      out.push(<p key={i} className="text-[13px] text-[#374151] leading-relaxed mb-1">{renderInline(t)}</p>);
    } else if (t === '---') {
      flushList();
      out.push(<hr key={i} className="my-3 border-[#E5E7EB]" />);
    } else if (t.length > 0) {
      flushList();
      out.push(<p key={i} className="text-[13px] text-[#374151] leading-relaxed mb-1.5">{renderInline(t)}</p>);
    } else {
      flushList();
      out.push(<div key={i} className="h-1.5" />);
    }
  });
  flushList();
  return <div>{out}</div>;
}

/* ── Lightbox ── */
function Lightbox({ src, label, onClose }) {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/70 flex items-center justify-center p-8" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5E7EB]">
          <span className="text-xs font-semibold text-[#374151]">{label}</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F3F4F6] cursor-pointer"><X className="w-4 h-4 text-[#6B7280]" /></button>
        </div>
        <div className="bg-[#111827] flex items-center justify-center p-4" style={{minHeight:320}}>
          <img src={src} alt={label} className="max-h-[65vh] max-w-full object-contain" />
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Thumbnail ── */
function Thumb({ rec, apiBase, idx }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const base = (apiBase || 'http://localhost:8000').replace(/\/$/, '');
  const caseId = rec.case_id ?? rec.caseId;
  const score = rec.score != null ? (rec.score * 100).toFixed(0) : null;

  const cacheBuster = retryCount > 0 ? `?retry=${retryCount}` : '';
  const src = (rec.image_url
    ? (rec.image_url.startsWith('http') ? rec.image_url : `${base}${rec.image_url}`)
    : `${base}/api/v1/cases/${caseId}/image`) + cacheBuster;

  const handleRetry = (e) => {
    e.stopPropagation();
    setErr(false);
    setLoaded(false);
    setRetryCount(prev => prev + 1);
  };

  return (
    <>
      {zoom && <Lightbox src={src} label={`Retrieved Case #${caseId}`} onClose={() => setZoom(false)} />}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider text-center">Match {idx}</span>
        <div
          onClick={() => loaded && !err && setZoom(true)}
          className={`relative w-full aspect-square bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg overflow-hidden flex items-center justify-center ${loaded && !err ? 'cursor-zoom-in hover:border-[#9CA3AF] transition-colors' : ''}`}
        >
          {!loaded && !err && <Loader2 className="w-4 h-4 text-[#9CA3AF] animate-spin" />}
          {!err
            ? <img src={src} alt={`Case ${caseId}`} onLoad={() => setLoaded(true)} onError={() => setErr(true)} className={`w-full h-full object-contain transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
            : (
              <div 
                className="flex flex-col items-center justify-center gap-0.5 w-full h-full text-[#D1D5DB] hover:text-indigo-500 hover:bg-indigo-50/50 transition-colors select-none"
                onClick={handleRetry}
                title="Failed to load. Click to retry."
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="text-[8px] font-bold uppercase tracking-wider">Retry</span>
              </div>
            )}
          {loaded && !err && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-end justify-center pb-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-white opacity-0 hover:opacity-100" />
            </div>
          )}
        </div>
        {score && <span className="text-[10px] text-center text-[#6B7280] font-mono">{score}% sim.</span>}
        <span className="text-[9px] text-center text-[#9CA3AF] font-mono">#{caseId}</span>
      </div>
    </>
  );
}

/* ── Disease class extractor from RAG impression text ── */
const DISEASE_PATTERNS = [
  { label: 'Pneumonia',          color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', re: /pneumonia|consolidation|lobar\s+opacity|alveolar\s+filling/i },
  { label: 'Pleural Effusion',   color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD', re: /pleural\s+effusion|fluid\s+in\s+the\s+pleural|blunting\s+of\s+the\s+costophrenic/i },
  { label: 'Cardiomegaly',       color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD', re: /cardiomegaly|enlarged\s+cardiac|enlarged\s+heart|cardiac\s+silhouette\s+is\s+enlarged/i },
  { label: 'Atelectasis',        color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', re: /atelectasis|atelectatic|collapse\s+of\s+the\s+lobe|volume\s+loss/i },
  { label: 'Pulmonary Edema',    color: '#0891B2', bg: '#ECFEFF', border: '#67E8F9', re: /pulmonary\s+edema|vascular\s+congestion|interstitial\s+edema|kerley/i },
  { label: 'Pneumothorax',       color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74', re: /pneumothorax|visceral\s+pleural\s+line/i },
  { label: 'Interstitial Disease',color: '#65A30D', bg: '#F7FEE7', border: '#BEF264', re: /interstitial|reticular|fibrosis|ILD/i },
  { label: 'No Acute Finding',   color: '#059669', bg: '#F0FDF4', border: '#86EFAC', re: /no\s+acute|unremarkable|within\s+normal\s+limits|no\s+significant\s+abnormality/i },
];

function extractDiseaseClass(retrievedRecords) {
  const allText = retrievedRecords
    .map(r => `${r.impression || ''} ${r.findings || ''}`)
    .join(' ');

  const sentences = allText.split(/[.!?;\n]/).map(s => s.trim().toLowerCase()).filter(Boolean);
  const activeDiseases = new Set();

  const negations = [
    'no ', 'not ', 'negative', 'free of', 'clear of', 'without', 
    'rule out', 'ruled out', 'unremarkable', 'normal', 'none', 'clear'
  ];

  for (const sentence of sentences) {
    for (const pattern of DISEASE_PATTERNS) {
      if (pattern.label === 'No Acute Finding') continue;

      const match = sentence.match(pattern.re);
      if (match) {
        let isNegated = false;
        for (const neg of negations) {
          const negIdx = sentence.indexOf(neg);
          // If a negation keyword appears before the matched pathology keyword in the sentence, treat it as negative.
          if (negIdx !== -1 && negIdx < match.index) {
            isNegated = true;
            break;
          }
        }
        if (!isNegated) {
          activeDiseases.add(pattern.label);
        }
      }
    }
  }

  if (activeDiseases.size > 0) {
    return DISEASE_PATTERNS.find(p => activeDiseases.has(p.label));
  }
  return DISEASE_PATTERNS.find(p => p.label === 'No Acute Finding');
}

/* ── 5-section report parser ── */
function parseReport(text) {
  if (!text) return {};
  const SECTIONS = ['EXAMINATION', 'FINDINGS', 'IMPRESSION', 'RECOMMENDATION', 'LIMITATIONS'];
  const result = {};
  const clean = sanitizeReport(text);
  // split on each section header
  let remaining = clean;
  for (let i = 0; i < SECTIONS.length; i++) {
    const sec = SECTIONS[i];
    const nextSecs = SECTIONS.slice(i + 1);
    const pattern = new RegExp(`${sec}:\s*`, 'i');
    const idx = remaining.search(pattern);
    if (idx === -1) continue;
    const afterHeader = remaining.slice(idx).replace(pattern, '');
    // Find where the next section starts
    let end = afterHeader.length;
    for (const ns of nextSecs) {
      const ni = afterHeader.search(new RegExp(`${ns}:\s*`, 'i'));
      if (ni !== -1 && ni < end) end = ni;
    }
    result[sec] = afterHeader.slice(0, end).trim();
    remaining = afterHeader.slice(end);
  }
  // Fallback: if no sections parsed, treat whole text as FINDINGS
  if (Object.keys(result).length === 0) result['FINDINGS'] = clean.trim();
  return result;
}

/* ── Main Component ── */
export default function StreamingReport({
  liveReport, isLoadingLive, retrievedRecords = [], selectedModel = 'meditron:7b',
  hasReportGenerated, onTriggerGenerate,
  onReportModelChange, reportModels = ['meditron:7b', 'mistral:7b'],
  step1Loading, step2Loading, step3Loading, step3Error,
  uploadedImagePreview, apiBase,
}) {
  const [copied, setCopied] = useState(false);
  const [lbSrc, setLbSrc] = useState(null);
  const [viewMode, setViewMode] = useState('structured'); // 'structured' | 'raw'
  const [openSections, setOpenSections] = useState({ EXAMINATION: false, FINDINGS: true, IMPRESSION: true, RECOMMENDATION: false, LIMITATIONS: false });
  
  const [chexbertLoading, setChexbertLoading] = useState(false);
  const [chexbertLabels, setChexbertLabels] = useState(null);
  const [chexbertError, setChexbertError] = useState(null);

  const toggleSection = (s) => setOpenSections(p => ({ ...p, [s]: !p[s] }));

  const copy = () => { navigator.clipboard.writeText(liveReport || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const runChexbert = async () => {
    // Use the generated report if available; otherwise build text from retrieved records
    let textToClassify = liveReport;
    if (!textToClassify && retrievedRecords.length > 0) {
      textToClassify = retrievedRecords
        .map((r, i) => {
          const findings = r.findings || r.payload?.findings || '';
          const impression = r.impression || r.payload?.impression || '';
          return `Case ${i + 1}:\nFindings: ${findings}\nImpression: ${impression}`;
        })
        .join('\n\n');
    }
    if (!textToClassify) return;

    setChexbertLoading(true);
    setChexbertError(null);
    try {
      const base = (apiBase || 'http://localhost:8000').replace(/\/$/, '');
      const res = await fetch(`${base}/api/v1/report/classify/chexbert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_text: textToClassify }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Status ${res.status}: ${errText}`);
      }
      const data = await res.json();
      setChexbertLabels(data.labels);
    } catch (e) {
      console.error('CheXbert classification error:', e);
      setChexbertError(e.message || 'Failed to classify');
    } finally {
      setChexbertLoading(false);
    }
  };

  const sections = parseReport(liveReport);
  const diseaseClass = extractDiseaseClass(retrievedRecords);


  // ── UX States ──
  const retrievalInProgress = step1Loading || step2Loading;
  const readyToGenerate = !retrievalInProgress && retrievedRecords.length > 0 && !hasReportGenerated && !liveReport && !step3Loading && !step3Error;
  const reportActive = step3Loading || step3Error || isLoadingLive || !!liveReport || hasReportGenerated;

  if (retrievalInProgress || (!retrievedRecords.length && !reportActive)) {
    return <div className="h-full" />;
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col h-full min-h-[560px] max-h-[840px] overflow-hidden shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-[#374151]" />
          <div>
            <h2 className="text-sm font-bold text-[#111827]">Radiology Report</h2>
            <p className="text-[11px] text-[#9CA3AF] font-mono">AI · {selectedModel}</p>
          </div>
        </div>
        {liveReport && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#ECECF1] p-0.5 rounded-lg border border-[#E5E7EB] mr-2">
              <button
                onClick={() => setViewMode('structured')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${
                  viewMode === 'structured' ? 'bg-white text-[#111827] shadow-xs' : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                Structured
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${
                  viewMode === 'raw' ? 'bg-white text-[#111827] shadow-xs' : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                Raw Text
              </button>
            </div>
            <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#374151] border border-[#E5E7EB] rounded-lg bg-white hover:bg-[#F3F4F6] cursor-pointer transition-colors">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* Patient banner — always visible when report is active */}
      {reportActive && <PatientBanner />}

      <div className="flex-1 overflow-y-auto">

        {/* ── State 2: Ready — show model selector + generate ── */}
        {readyToGenerate && (
          <div className="flex flex-col items-center justify-center min-h-[480px] gap-5 text-center p-8">

            {/* Model selector */}
            <div className="flex gap-2">
              {reportModels.map(m => (
                <button
                  key={m}
                  onClick={() => onReportModelChange && onReportModelChange(m)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-semibold cursor-pointer transition-colors ${
                    selectedModel === m
                      ? 'bg-[#111827] text-white border-[#111827]'
                      : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <Cpu className="w-3 h-3 inline mr-1" />{m}
                </button>
              ))}
            </div>
            <button
              onClick={onTriggerGenerate}
              className="px-8 py-3 bg-[#111827] text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#1F2937] active:scale-95 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Generate Report
            </button>
          </div>
        )}

        {/* ── State 3: Report active ── */}
        {reportActive && (
          <div>

            {/* Error */}
            {step3Error && (
              <div className="m-4 p-4 border border-[#FCA5A5] bg-[#FEF2F2] rounded-lg text-xs text-[#991B1B]">
                <p className="font-bold mb-1">Report generation failed</p>
                <p className="text-[#DC2626] mb-3">{step3Error}</p>
                <button onClick={onTriggerGenerate} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DC2626] text-white rounded font-semibold cursor-pointer hover:bg-[#B91C1C] transition-colors w-max">
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}

            {/* Streaming indicator */}
            {(step3Loading || isLoadingLive) && (
              <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#E5E7EB] text-xs text-[#6B7280]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9CA3AF]" />
                <span>Generating report with <span className="font-mono">{selectedModel}</span>…</span>
              </div>
            )}



            {/* Image comparison */}
            {(uploadedImagePreview || retrievedRecords.length > 0) && liveReport && (
              <div className="px-5 py-3 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span className="text-[11px] font-semibold text-[#374151] uppercase tracking-wider">Radiograph Comparison</span>
                  <span className="ml-auto text-[10px] text-[#9CA3AF] font-mono">1 uploaded · {retrievedRecords.length} retrieved</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {uploadedImagePreview && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-[#374151] uppercase tracking-wider text-center">Patient</span>
                      <div onClick={() => setLbSrc(uploadedImagePreview)} className="w-full aspect-square bg-[#111827] border-2 border-[#374151] rounded-lg overflow-hidden cursor-zoom-in">
                        <img src={uploadedImagePreview} alt="Uploaded" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                  {retrievedRecords.slice(0, 3).map((rec, i) => (
                    <Thumb key={i} rec={rec} apiBase={apiBase} idx={i + 1} />
                  ))}
                </div>
              </div>
            )}


            {/* Report body */}
            {liveReport && (
              <div>
                {viewMode === 'raw' ? (
                  <div className="px-5 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] font-mono text-[11px] text-[#374151] leading-relaxed whitespace-pre-wrap select-text">
                    {liveReport}
                  </div>
                ) : (
                  <>
                    {Object.keys(sections).length === 0 ? (
                      <div className="px-5 py-4"><ReportDoc content={liveReport} /></div>
                    ) : (
                      (() => {
                        const SEC_CONFIG = {
                          EXAMINATION:   { icon: '📋', label: 'Examination',   accent: '#6B7280' },
                          FINDINGS:      { icon: '🔍', label: 'Findings',      accent: '#374151' },
                          IMPRESSION:    { icon: '🩺', label: 'Impression',    accent: '#059669' },
                          RECOMMENDATION:{ icon: '💊', label: 'Recommendation',accent: '#2563EB' },
                          LIMITATIONS:   { icon: '⚠️', label: 'Limitations',   accent: '#D97706' },
                        };
                        return Object.entries(SEC_CONFIG).map(([key, cfg]) => {
                          const content = sections[key];
                          if (!content) return null;
                          const isOpen = openSections[key];
                          return (
                            <div key={key} className="border-b border-[#E5E7EB]">
                              <button
                                onClick={() => toggleSection(key)}
                                className="w-full flex items-center justify-between px-5 py-2.5 text-left bg-[#F9FAFB] hover:bg-[#F3F4F6] cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{cfg.icon}</span>
                                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: cfg.accent }}>{cfg.label}</span>
                                </div>
                                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#9CA3AF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />}
                              </button>
                              {isOpen && (
                                <div className="px-5 py-4">
                                  <ReportDoc content={content} />
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {lbSrc && <Lightbox src={lbSrc} label="Uploaded Radiograph" onClose={() => setLbSrc(null)} />}
    </div>
  );
}

