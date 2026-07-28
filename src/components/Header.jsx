import React, { useEffect, useState } from 'react';
import { Activity, ChevronDown, Sun, Moon, SlidersHorizontal } from 'lucide-react';

const MODELS = ['llama3.2', 'meditron:7b', 'mistral:latest', 'qwen2.5vl:7b'];

export default function Header({
  isServerHealthy,
  onCheckHealth,
  hasActiveDiagnosis,
  onResetUpload,
  selectedModel,
  onSelectModel,
  status,
  isLoading,
  showMetrics,
  onToggleMetrics,
  uploadedCaseDetails,
  reportModel,
  onReportModelChange,
  theme = 'light',
  onToggleTheme,
  onOpenPromptModal,
}) {
  const [modelOpen, setModelOpen] = useState(false);

  useEffect(() => {
    onCheckHealth();
    const iv = setInterval(onCheckHealth, 6000);
    return () => clearInterval(iv);
  }, [onCheckHealth]);

  useEffect(() => {
    const close = (e) => { if (!e.target.closest('#model-selector')) setModelOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header
      style={{
        height: 48,
        background: 'var(--panel-bg)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 14,
        flexShrink: 0,
        zIndex: 50,
        position: 'relative',
      }}
    >
      {/* LEFT — System name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Activity style={{ width: 16, height: 16, color: 'var(--cyan)', flexShrink: 0 }} />
        <span
          className="font-display"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          Multimodal RAG Workstation
        </span>
      </div>

      {/* CENTER — Case info / pipeline status */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, overflow: 'hidden' }}>
        {hasActiveDiagnosis && uploadedCaseDetails ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-secondary)' }}>
              CASE #{uploadedCaseDetails.case_id}
            </span>
            {uploadedCaseDetails.label_chexbert_primary && (
              <>
                <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--cyan)' }}>
                  {uploadedCaseDetails.label_chexbert_primary}
                </span>
              </>
            )}
            {status && (
              <>
                <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-disabled)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {status}
                </span>
              </>
            )}
          </div>
        ) : status && isLoading ? (
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>{status}</span>
        ) : (
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13,
              letterSpacing: '0.06em',
              color: 'var(--text-disabled)',
              textTransform: 'uppercase',
            }}
          >
            MIMIC-CXR · 30,600 Cases · Qdrant Vector DB
          </span>
        )}
      </div>

      {/* RIGHT — Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

        {/* Edit Prompt Button (Modal Trigger) */}
        <button
          id="btn-open-prompt-modal"
          onClick={onOpenPromptModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface-bg)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '5px 11px',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--blue)';
            e.currentTarget.style.color = 'var(--blue)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          <SlidersHorizontal style={{ width: 14, height: 14 }} />
          Edit Prompt
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

        {/* Theme Toggle (Sun / Moon) */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            background: 'var(--surface-bg)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--blue)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {theme === 'light' ? (
            <Moon style={{ width: 15, height: 15 }} />
          ) : (
            <Sun style={{ width: 15, height: 15 }} />
          )}
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

        {/* Model selector */}
        <div style={{ position: 'relative' }} id="model-selector">
          <button
            onClick={() => setModelOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'var(--surface-bg)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '5px 10px',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              transition: 'border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {reportModel || selectedModel}
            <ChevronDown style={{ width: 12, height: 12, flexShrink: 0 }} />
          </button>

          {modelOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: 'var(--panel-bg)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                zIndex: 100,
                minWidth: 150,
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
              }}
            >
              {MODELS.map(m => (
                <button
                  key={m}
                  onClick={() => { (onReportModelChange || onSelectModel)?.(m); setModelOpen(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 14px',
                    textAlign: 'left',
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: (reportModel || selectedModel) === m ? 'var(--blue)' : 'var(--text-secondary)',
                    background: (reportModel || selectedModel) === m ? 'var(--surface-bg)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = (reportModel || selectedModel) === m ? 'var(--surface-bg)' : 'transparent'}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

        {/* System Performance button */}
        <button
          id="btn-system-performance"
          onClick={onToggleMetrics}
          style={{
            fontSize: 13,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: showMetrics ? 'var(--blue)' : 'var(--text-secondary)',
            background: 'none',
            border: 'none',
            borderBottom: `1px solid ${showMetrics ? 'var(--blue)' : 'transparent'}`,
            padding: '2px 0',
            cursor: 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = showMetrics ? 'var(--blue)' : 'var(--text-secondary)'; }}
        >
          Metrics
        </button>

        {/* New Case button */}
        {hasActiveDiagnosis && (
          <button
            onClick={onResetUpload}
            style={{
              fontSize: 13,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid transparent',
              padding: '2px 0',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            New Case
          </button>
        )}

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />

        {/* Connection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }} title={`Backend: ${isServerHealthy ? 'Connected' : 'Disconnected'}`}>
          <div
            className="dot"
            style={{ background: isServerHealthy ? 'var(--green)' : 'var(--red)', width: 8, height: 8 }}
          />
          <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-disabled)', letterSpacing: '0.04em' }}>
            {isServerHealthy ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

      </div>
    </header>
  );
}
