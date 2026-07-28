import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Database, Loader2, AlertCircle, ZoomIn, X, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE } from '../config';

/* ═══════════════════════════════════════════════════
   EVIDENCE STRIP — Dark PACS-style retrieved cases
   Horizontal thumbnails + data columns + modal lightbox
   ═══════════════════════════════════════════════════ */

export default function RagEvidenceMatrix({
  liveRecords, comparisons, selectedPipeline, onSelectPipeline,
  baseUrl = API_BASE,
  step1Loading, step1Error, step2Loading, step2Error, onImagesLoaded
}) {
  const [loadedImages, setLoadedImages]   = useState({});
  const [imageErrors, setImageErrors]     = useState({});
  const [retryCounts, setRetryCounts]     = useState({});
  const [selectedModal, setSelectedModal] = useState(null);
  const [expandedIdx, setExpandedIdx]     = useState(null);

  useEffect(() => { setLoadedImages({}); setImageErrors({}); setRetryCounts({}); }, [liveRecords]);

  useEffect(() => {
    if (selectedModal) {
      document.body.style.overflow = 'hidden';
      const onKey = (e) => { if (e.key === 'Escape') setSelectedModal(null); };
      window.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
    }
  }, [selectedModal]);

  useEffect(() => {
    if (!liveRecords?.length) return;
    const recs = liveRecords.slice(0, 3);
    const allDone = recs.every(r => {
      const id = r.case_id ?? r.id;
      return loadedImages[id] || imageErrors[id];
    });
    if (allDone && (Object.keys(loadedImages).length || Object.keys(imageErrors).length)) {
      onImagesLoaded?.();
    }
  }, [loadedImages, imageErrors, liveRecords, onImagesLoaded]);

  const retry = (id, e) => {
    e.stopPropagation();
    setImageErrors(p => { const n = { ...p }; delete n[id]; return n; });
    setLoadedImages(p => { const n = { ...p }; delete n[id]; return n; });
    setRetryCounts(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  };

  /* ── Loading / Error states ── */
  if (step1Loading) return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <Database style={{ width: 24, height: 24, color: 'var(--blue)', animation: 'pulse 2s infinite' }} />
      <span className="panel-label" style={{ fontSize: 13 }}>Querying 30,600 MIMIC-CXR Vectors…</span>
    </div>
  );

  if (step1Error) return (
    <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
      <AlertCircle style={{ width: 16, height: 16, color: 'var(--red)', flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'var(--red)' }}>{step1Error}</span>
    </div>
  );

  const activeRecords = (comparisons && selectedPipeline)
    ? (comparisons[selectedPipeline] || [])
    : liveRecords;

  if (!activeRecords?.length) return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <Database style={{ width: 20, height: 20, color: 'var(--text-disabled)' }} />
      <span className="panel-label" style={{ fontSize: 13 }}>Evidence Standby</span>
      <span style={{ fontSize: 12, color: 'var(--text-disabled)', textAlign: 'center', maxWidth: 240 }}>
        Upload a radiograph to retrieve similar MIMIC-CXR cases.
      </span>
    </div>
  );

  const normalised = activeRecords.slice(0, 3).map((r, idx) => {
    const id      = r.case_id ?? r.study_id ?? r.id ?? idx;
    const score   = typeof r.score === 'number' ? r.score : parseFloat(r.score) || 0.95;
    const retry   = retryCounts[id] || 0;
    const imgUrl  = r.image_url
      ? (r.image_url.startsWith('http') ? r.image_url : `${baseUrl}${r.image_url}`) + (retry ? `?retry=${retry}` : '')
      : `${baseUrl}/api/v1/cases/${id}/image` + (retry ? `?retry=${retry}` : '');
    return {
      id, score, imgUrl,
      scoreP: (score * 100).toFixed(1),
      impression: r.impression || 'No acute cardiopulmonary disease.',
      findings: r.findings || r.finding || '',
      labelKw:  r.label_keyword || r.label || 'Other',
      labelCx:  r.label_chexbert_primary || r.label || 'Other',
      labelLlm: r.label_llm_primary || r.label || 'Other',
      source: r.source || 'MIMIC-CXR',
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Pipeline selector tabs ── */}
      {comparisons && onSelectPipeline && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px', background: 'var(--panel-bg)', flexShrink: 0 }}>
          {[
            { id: 'none',    label: 'No Filter' },
            { id: 'keyword', label: 'Keyword' },
            { id: 'chexbert',label: 'CheXbert' },
            { id: 'hybrid',  label: 'Hybrid' },
            { id: 'llm',     label: 'LLM' },
            { id: 'text_rag',label: 'Text RAG' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onSelectPipeline(tab.id)}
              className={`tab-btn ${selectedPipeline === tab.id ? 'active' : ''}`}
              style={{ borderColor: selectedPipeline === tab.id ? 'var(--cyan)' : 'transparent', fontSize: 13 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Horizontal evidence strip ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {normalised.map((rec, i) => {
          const hasErr  = imageErrors[rec.id];
          const loading = !loadedImages[rec.id] && !hasErr;
          return (
            <div
              key={rec.id}
              className={`evidence-thumb ${i === 0 ? 'active' : ''}`}
              onClick={() => !hasErr && !loading && setSelectedModal(rec)}
              style={{
                flex: 1,
                borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                aspectRatio: '1',
                cursor: hasErr ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {loading && (
                <Loader2 style={{ width: 16, height: 16, color: 'var(--blue)', animation: 'spin 1s linear infinite' }} />
              )}
              {hasErr ? (
                <div
                  onClick={(e) => retry(rec.id, e)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace" }}>RETRY</span>
                </div>
              ) : (
                <img
                  src={rec.imgUrl}
                  alt={`Case ${rec.id}`}
                  onLoad={() => setLoadedImages(p => ({ ...p, [rec.id]: true }))}
                  onError={() => setImageErrors(p => ({ ...p, [rec.id]: true }))}
                  style={{
                    width: '100%', height: '100%', objectFit: 'contain',
                    opacity: loading ? 0 : 1, transition: 'opacity 0.2s',
                    display: 'block',
                  }}
                />
              )}
              {/* Zoom hint */}
              {!loading && !hasErr && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                  display: 'flex', alignItems: 'center', justify: 'center',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                >
                  <ZoomIn style={{ width: 16, height: 16, color: 'white', opacity: 0, transition: 'opacity 0.15s', pointerEvents: 'none' }}
                    ref={el => el && (el.style.opacity = '0')}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Data strip below thumbnails ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {normalised.map((rec, i) => (
          <div
            key={rec.id}
            style={{
              flex: 1,
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono-num" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>#{rec.id}</span>
              <span className="mono-num" style={{ color: 'var(--green)', fontSize: 13 }}>{rec.scoreP}%</span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--cyan)', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {rec.labelCx}
            </span>
          </div>
        ))}
      </div>

      {/* ── Scrollable detail rows ── */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {normalised.map((rec, i) => (
          <div
            key={rec.id}
            style={{ borderBottom: '1px solid var(--border)', padding: '12px 14px' }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: expandedIdx === i ? 8 : 0 }}
              onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="panel-label" style={{ fontSize: 12 }}>Case #{rec.id}</span>
                <div className="dot dot-green" style={{ width: 8, height: 8 }} />
              </div>
              {expandedIdx === i
                ? <ChevronUp style={{ width: 14, height: 14, color: 'var(--text-disabled)' }} />
                : <ChevronDown style={{ width: 14, height: 14, color: 'var(--text-disabled)' }} />
              }
            </div>

            {expandedIdx === i && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                {/* Labels */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {[['Keyword', rec.labelKw], ['CheXbert', rec.labelCx], ['LLM', rec.labelLlm]].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--surface-bg)', padding: '8px 10px', borderRadius: 2 }}>
                      <div className="panel-label" style={{ fontSize: 11, marginBottom: 2 }}>{k}</div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--cyan)', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Impression */}
                <div>
                  <span className="panel-label" style={{ marginBottom: 4, display: 'block', fontSize: 12 }}>Impression</span>
                  <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7 }}>{rec.impression}</p>
                </div>

                {/* Findings */}
                {rec.findings && (
                  <div>
                    <span className="panel-label" style={{ marginBottom: 4, display: 'block', fontSize: 12 }}>Findings</span>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.findings}</p>
                  </div>
                )}

                {/* Similarity bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${rec.scoreP}%`, height: '100%', background: 'var(--green)', transition: 'width 0.5s ease' }} />
                  </div>
                  <span className="mono-num" style={{ color: 'var(--green)', fontSize: 13 }}>{rec.scoreP}%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Lightbox portal ── */}
      {selectedModal && ReactDOM.createPortal(
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSelectedModal(null)}
        >
          <div
            style={{ background: 'var(--panel-bg)', border: '1px solid var(--border)', width: '80vw', maxWidth: 900, height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-bg)' }}>
              <span className="mono-num" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Case #{selectedModal.id} · MIMIC-CXR</span>
              <button onClick={() => setSelectedModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div style={{ flex: 1, background: '#070A0E', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={selectedModal.imgUrl} alt={`Case ${selectedModal.id}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
            </div>
            {selectedModal.findings && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface-bg)' }}>
                <span className="panel-label" style={{ marginBottom: 4, display: 'block', fontSize: 12 }}>Findings</span>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedModal.findings}</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
