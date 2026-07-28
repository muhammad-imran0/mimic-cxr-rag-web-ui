import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageIngestion from './components/ImageIngestion';
import RagEvidenceMatrix from './components/RagEvidenceMatrix';
import StreamingReport from './components/StreamingReport';
import VisualizationMatrix from './components/VisualizationMatrix';
import PathologyMeters from './components/PathologyMeters';
import EvalMetricsDashboard from './components/EvalMetricsDashboard';
import PipelineFilmStrip from './components/PipelineFilmStrip';
import PromptEditor from './components/PromptEditor';
import { useDiagnose } from './hooks/useDiagnose';
import { API_BASE } from './config';
import { ExternalLink } from 'lucide-react';

const REPORT_MODELS = ['llama3.2', 'meditron:7b', 'mistral:latest', 'qwen2.5vl:7b'];

export default function App() {
  const [theme, setTheme]                           = useState(() => localStorage.getItem('app-theme') || 'light');
  const [reportModel, setReportModel]               = useState('llama3.2');
  const [selectedPipeline, setSelectedPipeline]     = useState('none');
  const [showMetrics, setShowMetrics]               = useState(false);
  const [showPromptModal, setShowPromptModal]       = useState(false);
  const [customSystemPrompt, setCustomSystemPrompt] = useState(null);
  const [customUserTemplate, setCustomUserTemplate] = useState(null);
  const [hasReportGenerated, setHasReportGenerated] = useState(false);
  const [activeTab, setActiveTab]                   = useState('report'); // 'report' | 'evidence' | 'xai' | 'pathology'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  };

  const {
    diagnoseImage, generateReport, loadSampleCase,
    status, currentStep,
    retrievedRecords, reports, prompts, filledPrompts, caption,
    isLoading, isServerHealthy, checkHealth,
    uploadedImagePreview, uploadedFileName,
    uploadedCaseDetails, comparisons,
    resetDiagnosis, completeImageLoading,
    step1Loading, step1Error, step2Loading, step2Error, step3Loading, step3Error,
  } = useDiagnose(API_BASE);

  const hasActiveDiagnosis = Boolean(
    uploadedImagePreview || isLoading ||
    Object.values(reports).some(Boolean) || retrievedRecords.length > 0
  );

  const handleReset = () => {
    setHasReportGenerated(false);
    if (resetDiagnosis) resetDiagnosis(); else window.location.reload();
  };

  const handleTriggerGenerateReport = async () => {
    setHasReportGenerated(true);
    setActiveTab('report');
    const best = await generateReport(reportModel, { customSystemPrompt, customUserTemplate });
    if (best) setSelectedPipeline(best);
  };

  const handleTriggerGenerateAll = async () => {
    setHasReportGenerated(true);
    setActiveTab('report');
    for (const model of REPORT_MODELS) {
      const best = await generateReport(model, { customSystemPrompt, customUserTemplate });
      if (best) setSelectedPipeline(best);
    }
  };

  const activeCaseData = {
    id: uploadedFileName || 'sample_patient_cxr.png',
    gradCamHotspots: [
      { x: 48, y: 56, intensity: 0.94, label: 'Right Lower Lobe Parenchymal Weighting' },
      { x: 65, y: 42, intensity: 0.81, label: 'Perihilar Vascular Marking Attention' },
    ],
    pathologyScores: [
      { name: 'Pneumonia / Consolidation', score: 0.14, risk: 'Low', color: '#2563EB', details: 'No focal alveolar opacification detected.' },
      { name: 'Pleural Effusion',          score: 0.08, risk: 'Low', color: '#2563EB', details: 'Costophrenic angles are sharp and clear.' },
      { name: 'Cardiomegaly',              score: 0.22, risk: 'Low', color: '#2563EB', details: 'Cardiac silhouette within normal limits.' },
      { name: 'Pneumothorax',              score: 0.03, risk: 'Low', color: '#2563EB', details: 'Visceral pleural line not identified.' },
      { name: 'Atelectasis',               score: 0.18, risk: 'Low', color: '#2563EB', details: 'Minor discoid subsegmental changes.' },
      { name: 'Edema',                     score: 0.05, risk: 'Low', color: '#2563EB', details: 'No Kerley B lines.' },
    ],
  };

  /* ── Panel width ── */
  const LEFT_W = 350;

  /* ── Styles ── */
  const S = {
    root: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      background: 'var(--ws-bg)',
      color: 'var(--text-primary)',
      overflow: 'hidden',
    },
    workspace: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    leftPanel: {
      width: LEFT_W,
      minWidth: LEFT_W,
      maxWidth: LEFT_W,
      background: 'var(--panel-bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: 'var(--shadow)',
    },
    centerPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--ws-bg)',
    },
    sectionHeader: {
      padding: '12px 16px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    },
    footer: {
      height: 32,
      borderTop: '1px solid var(--border)',
      background: 'var(--panel-bg)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      flexShrink: 0,
    },
  };

  return (
    <div style={S.root}>

      {/* TOP BAR */}
      <Header
        isServerHealthy={isServerHealthy}
        onCheckHealth={checkHealth}
        hasActiveDiagnosis={hasActiveDiagnosis}
        onResetUpload={handleReset}
        selectedModel={reportModel}
        onSelectModel={setReportModel}
        reportModel={reportModel}
        onReportModelChange={setReportModel}
        currentStep={currentStep}
        status={status}
        isLoading={isLoading}
        showMetrics={showMetrics}
        onToggleMetrics={() => setShowMetrics(m => !m)}
        uploadedCaseDetails={uploadedCaseDetails}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenPromptModal={() => setShowPromptModal(true)}
      />

      {/* METRICS OVERLAY */}
      {showMetrics ? (
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--ws-bg)' }}>
          <EvalMetricsDashboard onClose={() => setShowMetrics(false)} />
        </div>
      ) : (
        /* ── TWO-PANEL WORKSPACE (INPUT + MAIN CONTENT) ── */
        <div style={S.workspace}>

          {/* ══ LEFT PANEL (INPUT) ══ */}
          <div style={S.leftPanel}>

            {/* Section label */}
            <div style={S.sectionHeader}>
              <span className="panel-label">Input Radiograph</span>
              {hasActiveDiagnosis && (
                <button
                  onClick={handleReset}
                  style={{
                    fontSize: 10,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--text-disabled)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-disabled)'}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Upload or X-ray display */}
            {!hasActiveDiagnosis ? (
              <div style={{ flex: 1 }}>
                <ImageIngestion
                  diagnoseImage={(file) => diagnoseImage(file, selectedPipeline)}
                  onLoadSample={loadSampleCase}
                  liveStatus={status}
                  isLoadingLive={isLoading}
                />
              </div>
            ) : (
              <div style={{ flex: 1, overflow: 'auto', padding: '14px 12px' }}>

                {/* X-ray lightbox frame */}
                <div
                  style={{
                    background: '#000000',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    aspectRatio: '4/3',
                    overflow: 'hidden',
                    marginBottom: 14,
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  {uploadedImagePreview ? (
                    <img
                      src={uploadedImagePreview}
                      alt="Uploaded Radiograph"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-disabled)' }}>Loading…</span>
                  )}
                </div>

                {/* Patient metadata summary card */}
                {uploadedCaseDetails && (
                  <div style={{ padding: '14px 16px', background: 'var(--surface-bg)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 14 }}>
                    <div className="panel-label" style={{ marginBottom: 10, fontSize: 11 }}>Dataset Case Info</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        ['Case ID', `#${uploadedCaseDetails.case_id}`],
                        ['Source', uploadedCaseDetails.source || 'MIMIC-CXR'],
                        ['Keyword Label', uploadedCaseDetails.label_keyword],
                        ['CheXbert Label', uploadedCaseDetails.label_chexbert_primary],
                        ['LLM Label', uploadedCaseDetails.label_llm_primary],
                      ].map(([k, v]) => v && (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-disabled)' }}>{k}</span>
                          <span className="mono-num" style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caption panel card */}
                {(caption || step3Loading) && (
                  <div style={{ padding: '14px 16px', background: 'var(--surface-bg)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 14 }}>
                    <div className="panel-label" style={{ marginBottom: 8, fontSize: 11 }}>Qwen2.5-VL Caption</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      {caption
                        ? `"${caption}"`
                        : step3Loading
                          ? <span style={{ color: 'var(--text-disabled)' }}>Generating caption…</span>
                          : null}
                    </p>
                  </div>
                )}

                {/* Ground truth impression card */}
                {uploadedCaseDetails?.impression && (
                  <div style={{ padding: '14px 16px', background: 'var(--surface-bg)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 14 }}>
                    <div className="panel-label" style={{ marginBottom: 8, fontSize: 11 }}>Clinical Impression</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{uploadedCaseDetails.impression}</p>
                  </div>
                )}

                {/* Pipeline comparison table card */}
                {comparisons && (
                  <div style={{ padding: '14px 16px', background: 'var(--surface-bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div className="panel-label" style={{ marginBottom: 10, fontSize: 11 }}>Pipeline Comparison</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '6px 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-disabled)', fontSize: 11 }}>Pipeline</th>
                          {[1,2,3].map(n => (
                            <th key={n} style={{ textAlign: 'center', padding: '6px 0', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-disabled)', fontSize: 11 }}>#{n}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: 'none',    name: 'No Filter',   qLabel: uploadedCaseDetails?.label_keyword,            lKey: 'label_keyword' },
                          { id: 'keyword', name: 'Keyword',     qLabel: uploadedCaseDetails?.label_keyword,            lKey: 'label_keyword' },
                          { id: 'chexbert',name: 'CheXbert',    qLabel: uploadedCaseDetails?.label_chexbert_primary,   lKey: 'label_chexbert_primary' },
                          { id: 'llm',     name: 'LLM',         qLabel: uploadedCaseDetails?.label_llm_primary,        lKey: 'label_llm_primary' },
                          { id: 'text_rag',name: 'Text RAG',    qLabel: uploadedCaseDetails?.label_chexbert_primary,   lKey: 'label_chexbert_primary' },
                          { id: 'hybrid',  name: 'Hybrid',      qLabel: uploadedCaseDetails?.label_chexbert_primary,   lKey: 'label_chexbert_primary' },
                        ].map(pipe => {
                          const matches = comparisons[pipe.id] || [];
                          const qLow = (pipe.qLabel || 'other').toLowerCase();
                          const isActive = selectedPipeline === pipe.id;
                          return (
                            <tr
                              key={pipe.id}
                              onClick={() => setSelectedPipeline(pipe.id)}
                              style={{
                                borderBottom: '1px solid var(--border)',
                                borderLeft: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
                                cursor: 'pointer',
                                height: 38,
                                background: isActive ? 'rgba(8,145,178,0.08)' : 'transparent',
                              }}
                            >
                              <td style={{ padding: '6px 0 6px 6px', fontFamily: "'Inter', sans-serif", color: isActive ? 'var(--cyan)' : 'var(--text-secondary)', fontSize: 12, fontWeight: isActive ? 600 : 400 }}>{pipe.name}</td>
                              {[0,1,2].map(idx => {
                                const m = matches[idx];
                                if (!m) return <td key={idx} style={{ textAlign: 'center', color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>—</td>;
                                const cLow = (m[pipe.lKey] || m.label || 'other').toLowerCase();
                                const isMatch = cLow === qLow;
                                return (
                                  <td key={idx} style={{ textAlign: 'center', padding: '4px 2px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                      <span className="mono-num" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>#{m.case_id}</span>
                                      <div className="dot" style={{ background: isMatch ? 'var(--green)' : 'var(--red)', width: 7, height: 7 }} title={isMatch ? 'Match' : 'Mismatch'} />
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>


          {/* ══ CENTER PANEL (MAIN CONTENT) ══ */}
          <div style={S.centerPanel}>

            {/* Pipeline Film Strip */}
            <PipelineFilmStrip
              currentStep={currentStep}
              comparisons={comparisons}
              retrievedRecords={retrievedRecords}
            />

            {hasActiveDiagnosis ? (
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

                {/* Tab bar */}
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '0 16px', flexShrink: 0, background: 'var(--panel-bg)' }}>
                  {[
                    { id: 'report',    label: 'Report Generation' },
                    { id: 'evidence',  label: 'Evidence Matrix' },
                    { id: 'xai',       label: 'Visual Grounding (XAI)' },
                    { id: 'pathology', label: 'Pathology Meters' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflow: 'auto' }}>
                  {activeTab === 'report' && (
                    <StreamingReport
                      reports={reports}
                      prompts={prompts}
                      filledPrompts={filledPrompts}
                      liveStatus={status}
                      isLoadingLive={isLoading}
                      retrievedRecords={(comparisons && selectedPipeline) ? (comparisons[selectedPipeline] || retrievedRecords) : retrievedRecords}
                      selectedModel={reportModel}
                      hasReportGenerated={hasReportGenerated}
                      onTriggerGenerate={handleTriggerGenerateReport}
                      onTriggerGenerateAll={handleTriggerGenerateAll}
                      onReportModelChange={setReportModel}
                      reportModels={REPORT_MODELS}
                      step1Loading={step1Loading}
                      step2Loading={step2Loading}
                      step3Loading={step3Loading}
                      step3Error={step3Error}
                      uploadedImagePreview={uploadedImagePreview}
                      apiBase={API_BASE}
                      customSystemPrompt={customSystemPrompt}
                      customUserTemplate={customUserTemplate}
                      onSystemPromptChange={setCustomSystemPrompt}
                      onUserTemplateChange={setCustomUserTemplate}
                    />
                  )}
                  {activeTab === 'evidence' && (
                    <RagEvidenceMatrix
                      liveRecords={retrievedRecords}
                      comparisons={comparisons}
                      selectedPipeline={selectedPipeline}
                      onSelectPipeline={setSelectedPipeline}
                      step1Loading={step1Loading}
                      step1Error={step1Error}
                      step2Loading={step2Loading}
                      step2Error={step2Error}
                      onImagesLoaded={completeImageLoading}
                    />
                  )}
                  {activeTab === 'xai' && (
                    <VisualizationMatrix
                      selectedCase={activeCaseData}
                      apiBase={API_BASE}
                      uploadedImagePreview={uploadedImagePreview}
                      autoLabel={uploadedCaseDetails?.label_chexbert_primary || ''}
                      caption={caption}
                    />
                  )}
                  {activeTab === 'pathology' && (
                    <PathologyMeters
                      apiBase={API_BASE}
                      uploadedImagePreview={uploadedImagePreview}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Empty center — show brief instruction */
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-disabled)', letterSpacing: '0.06em', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, textTransform: 'uppercase' }}>
                  Load a radiograph to begin
                </span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* PROMPT EDITOR MODAL OVERLAY */}
      <PromptEditor
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        apiBase={API_BASE}
        customSystemPrompt={customSystemPrompt}
        customUserTemplate={customUserTemplate}
        onSystemPromptChange={setCustomSystemPrompt}
        onUserTemplateChange={setCustomUserTemplate}
      />

      {/* FOOTER */}
      <footer style={S.footer}>
        <span style={{ fontSize: 12, color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace" }}>
          MSc Dissertation · Dr. Shaheen Khatoon · UEL
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {[
            { label: 'MedRAX', href: 'https://arxiv.org/abs/2502.02673' },
            { label: 'MMed-RAG', href: 'https://arxiv.org/abs/2410.13085' },
            { label: 'MARCH', href: 'https://arxiv.org/abs/2604.16175' },
            { label: 'EviAgent', href: 'https://arxiv.org/abs/2603.13956' },
          ].map(r => (
            <a
              key={r.label}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace", textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-disabled)'}
            >
              {r.label} <ExternalLink style={{ width: 8, height: 8 }} />
            </a>
          ))}
        </div>
      </footer>

    </div>
  );
}
