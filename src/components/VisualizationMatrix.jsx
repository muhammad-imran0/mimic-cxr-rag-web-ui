import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Info } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   XAI LIGHTBOX COMPARISON — "Visual Grounding"
   Side-by-side PACS view with a vertical label divider
   ═══════════════════════════════════════════════════════════════ */

export default function VisualizationMatrix({ selectedCase, apiBase, uploadedImagePreview, autoLabel = '', caption = '' }) {
  const [promptText, setPromptText]   = useState('');
  const [heatmapImage, setHeatmapImage] = useState(null);
  const [explanation, setExplanation]   = useState(null);
  const [method, setMethod]             = useState(null);
  const [queryTerm, setQueryTerm]       = useState(null);
  const [confidenceNote, setConfidenceNote] = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState(null);
  const [autoTriggered, setAutoTriggered] = useState(false);

  const base = (apiBase || 'http://localhost:8000').replace(/\/$/, '');
  const prevAutoLabel = useRef('');

  // Auto-trigger on initial primary CheXbert class loaded
  useEffect(() => {
    if (autoLabel && autoLabel !== prevAutoLabel.current && uploadedImagePreview && !heatmapImage) {
      prevAutoLabel.current = autoLabel;
      setPromptText(autoLabel);
      triggerExplain(autoLabel, true);
    }
  }, [autoLabel, uploadedImagePreview]);

  const triggerExplain = async (query, isAuto = false) => {
    const q = (query || promptText).trim();
    if (!q || !uploadedImagePreview) return;

    setIsLoading(true);
    setError(null);
    if (isAuto) setAutoTriggered(true);

    try {
      const res  = await fetch(uploadedImagePreview);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('text', q);
      formData.append('label_chexbert', caption || q);

      const response = await fetch(`${base}/api/v1/xai/explain`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();

      setHeatmapImage(data.heatmap_url);
      setExplanation(data.explanation || null);
      setMethod(data.method || null);
      setQueryTerm(data.query_term || q);
      setConfidenceNote(data.confidence_note || null);
    } catch (err) {
      try {
        const res2  = await fetch(uploadedImagePreview);
        const blob2 = await res2.blob();
        const fd2   = new FormData();
        fd2.append('file', blob2, 'image.jpg');
        fd2.append('text', q);
        const r2 = await fetch(`${base}/api/v1/xai/heatmap`, { method: 'POST', body: fd2 });
        if (!r2.ok) throw new Error();
        const d2 = await r2.json();
        setHeatmapImage(d2.heatmap_url);
        setQueryTerm(q);
        setExplanation(null);
        setConfidenceNote('Coarse visual localization. Explanatory LLM endpoint offline.');
      } catch {
        setError('Failed to compute patches similarity.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManual = () => {
    setAutoTriggered(false);
    triggerExplain(promptText, false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: 16 }}>
      
      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="panel-label" style={{ fontSize: 13 }}>Visual Grounding (BiomedCLIP)</span>
          {autoTriggered && queryTerm && (
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--cyan)' }}>
              AUTO · {queryTerm}
            </span>
          )}
        </div>
        {heatmapImage && (
          <button
            onClick={() => { setHeatmapImage(null); setExplanation(null); setAutoTriggered(false); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-disabled)', fontSize: 12, cursor: 'pointer' }}
          >
            Clear XAI
          </button>
        )}
      </div>

      {/* ── Query Box (Underline Only) ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          id="xai-query-input"
          type="text"
          value={promptText}
          onChange={e => setPromptText(e.target.value)}
          placeholder="Enter query term (e.g. pleural effusion, cardiomegaly)..."
          className="underline-input"
          style={{ fontSize: 14 }}
          onKeyDown={e => e.key === 'Enter' && handleManual()}
        />
        <button
          id="xai-generate-btn"
          onClick={handleManual}
          disabled={isLoading || !promptText.trim()}
          className="btn-primary"
          style={{ padding: '6px 14px', fontSize: 13 }}
        >
          {isLoading ? 'Computing...' : 'Visualize'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(239,68,68,0.06)', border: '1px solid var(--border)', padding: '8px 12px' }}>
          {error}
        </div>
      )}

      {/* ── Lightbox Side-by-Side Comparison ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justify: 'center', gap: 16 }}>
        
        <div style={{ display: 'flex', background: '#070A0E', border: '1px solid var(--border)', flex: 1, maxHeight: 340, minHeight: 220 }}>
          {/* Left panel: Original */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, position: 'relative' }}>
            <img src={uploadedImagePreview} alt="Original input" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            <span style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 12, color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace" }}>ORIGINAL</span>
          </div>

          {/* Rotated text divider */}
          <div style={{
            width: 24,
            borderLeft: '1px solid var(--border)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--ws-bg)',
          }}>
            <span style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: 12,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              color: 'var(--text-disabled)',
              letterSpacing: '0.12em',
              whiteSpace: 'nowrap',
            }}>
              VISUAL GROUNDING {queryTerm ? `· ${queryTerm.toUpperCase()}` : ''}
            </span>
          </div>

          {/* Right panel: Heatmap */}
          <div
            className={`lightbox-panel ${heatmapImage ? 'xai-active' : ''}`}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, position: 'relative', border: 'none' }}
          >
            {isLoading ? (
              <Loader2 style={{ width: 20, height: 20, color: 'var(--cyan)', animation: 'spin 1s linear infinite' }} />
            ) : heatmapImage ? (
              <img src={heatmapImage} alt="BiomedCLIP Visual similarity heatmap" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace" }}>HEATMAP STANDBY</span>
            )}
            <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 12, color: 'var(--cyan)', fontFamily: "'JetBrains Mono', monospace" }}>HEATMAP OVERLAY</span>
          </div>
        </div>

        {/* ── Explanation Panel below ── */}
        <div style={{ flexShrink: 0, padding: '12px 14px', background: 'var(--panel-bg)', border: '1px solid var(--border)' }}>
          <div className="panel-label" style={{ fontSize: 13, marginBottom: 6 }}>Clinical Interpretation</div>
          {explanation ? (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{explanation}</p>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-disabled)', fontStyle: 'italic' }}>
              {isLoading ? 'Running local LLM interpretation pipeline...' : 'Provide a term above to compute patch similarity.'}
            </p>
          )}

          {confidenceNote && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <Info style={{ width: 14, height: 14, color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: 'var(--text-disabled)', lineHeight: 1.5 }}>{confidenceNote}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
