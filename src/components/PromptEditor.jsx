import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Terminal, RotateCcw, Edit3, Loader2, AlertTriangle, X, SlidersHorizontal, Check } from 'lucide-react';

/* Template variable names the backend supports */
const TEMPLATE_VARS = ['{rag_context}', '{caption}', '{disease_labels}', '{findings}', '{label}'];

function HighlightedPrompt({ text }) {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let earliestVar = null;
    for (const tv of TEMPLATE_VARS) {
      const idx = remaining.indexOf(tv);
      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
        earliest = idx;
        earliestVar = tv;
      }
    }

    if (earliest === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliest > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, earliest)}</span>);
    }
    parts.push(
      <span key={key++} className="tpl-var">{earliestVar}</span>
    );
    remaining = remaining.slice(earliest + earliestVar.length);
  }

  return <>{parts}</>;
}

export default function PromptEditor({
  isOpen,
  onClose,
  apiBase,
  customSystemPrompt,
  customUserTemplate,
  onSystemPromptChange,
  onUserTemplateChange,
}) {
  const [loading, setLoading]     = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [defaults, setDefaults]   = useState({ system_prompt: '', user_template: '' });
  const [previewMode, setPreviewMode] = useState('edit'); // 'edit' | 'highlight'

  // Local state for draft edits inside modal
  const [draftSystem, setDraftSystem] = useState(customSystemPrompt || '');
  const [draftUser, setDraftUser]     = useState(customUserTemplate || '');

  const base = (apiBase || 'http://localhost:8000').replace(/\/$/, '');

  /* Fetch defaults once when modal opens */
  const fetchDefaults = useCallback(async () => {
    if (defaults.system_prompt) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${base}/api/v1/prompts`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setDefaults(data);
      if (!customSystemPrompt) setDraftSystem(data.system_prompt);
      if (!customUserTemplate) setDraftUser(data.user_template);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [base, defaults.system_prompt, customSystemPrompt, customUserTemplate]);

  useEffect(() => {
    if (isOpen) {
      setDraftSystem(customSystemPrompt || defaults.system_prompt || '');
      setDraftUser(customUserTemplate || defaults.user_template || '');
      fetchDefaults();
      document.body.style.overflow = 'hidden';
      const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [isOpen, customSystemPrompt, customUserTemplate, defaults, fetchDefaults, onClose]);

  const handleSave = () => {
    onSystemPromptChange(draftSystem);
    onUserTemplateChange(draftUser);
    onClose?.();
  };

  const handleReset = () => {
    setDraftSystem(defaults.system_prompt);
    setDraftUser(defaults.user_template);
  };

  const isModified =
    (draftSystem && draftSystem !== defaults.system_prompt) ||
    (draftUser && draftUser !== defaults.user_template);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          background: 'var(--panel-bg)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SlidersHorizontal style={{ width: 18, height: 18, color: 'var(--blue)' }} />
            <div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: 'var(--text-primary)',
                }}
              >
                Prompt Editor — Customise LLM Instructions
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                Session-only instruction parameters for radiology report generation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 24, justifyContent: 'center' }}>
              <Loader2 style={{ width: 16, height: 16, color: 'var(--blue)', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading default system prompts...</span>
            </div>
          )}

          {loadError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 12, color: 'var(--red)', background: 'rgba(220,38,38,0.06)', border: '1px solid var(--border)', borderRadius: 6 }}>
              <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
              Failed to load defaults: {loadError}
            </div>
          )}

          {!loading && (
            <>
              {/* Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode:</span>
                  <div style={{ display: 'flex', background: 'var(--surface-bg)', padding: 2, borderRadius: 6, border: '1px solid var(--border)' }}>
                    {[['edit', 'Edit Text'], ['highlight', 'Preview Variables']].map(([mode, label]) => (
                      <button
                        key={mode}
                        onClick={() => setPreviewMode(mode)}
                        style={{
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 4,
                          cursor: 'pointer',
                          border: 'none',
                          background: previewMode === mode ? 'var(--panel-bg)' : 'transparent',
                          color: previewMode === mode ? 'var(--text-primary)' : 'var(--text-secondary)',
                          boxShadow: previewMode === mode ? 'var(--shadow)' : 'none',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace" }}>
                  Variables: {TEMPLATE_VARS.map(v => <span key={v} className="tpl-var" style={{ marginLeft: 4 }}>{v}</span>)}
                </div>
              </div>

              {/* System Prompt Textarea */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  <Terminal style={{ width: 14, height: 14, color: 'var(--blue)' }} />
                  System Prompt
                </label>
                {previewMode === 'edit' ? (
                  <textarea
                    id="modal-prompt-system"
                    value={draftSystem}
                    onChange={e => setDraftSystem(e.target.value)}
                    rows={6}
                    placeholder="Enter system instructions for the LLM radiologist..."
                    style={{
                      width: '100%',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      lineHeight: 1.6,
                      padding: '12px 14px',
                      background: 'var(--surface-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      resize: 'vertical',
                    }}
                  />
                ) : (
                  <div className="prompt-terminal" style={{ maxHeight: 180, borderRadius: 8 }}>
                    <HighlightedPrompt text={draftSystem} />
                  </div>
                )}
              </div>

              {/* User Template Textarea */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  <Edit3 style={{ width: 14, height: 14, color: 'var(--blue)' }} />
                  User Prompt Template
                </label>
                {previewMode === 'edit' ? (
                  <textarea
                    id="modal-prompt-user"
                    value={draftUser}
                    onChange={e => setDraftUser(e.target.value)}
                    rows={7}
                    placeholder="Use {rag_context}, {caption}, {disease_labels} as placeholders..."
                    style={{
                      width: '100%',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      lineHeight: 1.6,
                      padding: '12px 14px',
                      background: 'var(--surface-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      resize: 'vertical',
                    }}
                  />
                ) : (
                  <div className="prompt-terminal" style={{ maxHeight: 200, borderRadius: 8 }}>
                    <HighlightedPrompt text={draftUser} />
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-bg)',
          }}
        >
          <button
            onClick={handleReset}
            disabled={!isModified}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isModified ? 1 : 0.5 }}
          >
            <RotateCcw style={{ width: 12, height: 12 }} /> Reset Default
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontSize: 13 }}
            >
              <Check style={{ width: 14, height: 14 }} /> Save Instructions
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
