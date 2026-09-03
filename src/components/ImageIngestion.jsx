import React, { useState, useRef } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

/* ═══════════════════════════════════════════════════
   FILM SLOT — Upload area styled as a radiograph slot
   Clinical Light/Dark surround, crosshair centre
   ═══════════════════════════════════════════════════ */

export default function ImageIngestion({ diagnoseImage, liveStatus, isLoadingLive, onLoadSample }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const processFile = (file) => {
    if (diagnoseImage) diagnoseImage(file);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '24px 20px',
        gap: 18,
      }}
    >
      {/* ── Film slot ── */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.dcm"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      <div
        onClick={() => !isLoadingLive && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`film-slot ${isDragging ? 'dragging' : ''}`}
        style={{
          width: '100%',
          aspectRatio: '1',
          maxWidth: 290,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isLoadingLive ? 'wait' : 'pointer',
          borderRadius: 10,
        }}
        role="button"
        tabIndex={0}
        aria-label="Click to upload chest radiograph"
        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        {isLoadingLive ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 1 }}>
            <Loader2
              style={{ width: 24, height: 24, color: 'var(--blue)', animation: 'spin 1s linear infinite' }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--blue)',
                letterSpacing: '0.06em',
                textAlign: 'center',
                maxWidth: 220,
                fontWeight: 600,
              }}
            >
              {liveStatus || 'PROCESSING...'}
            </span>
          </div>
        ) : (
          /* Crosshair + label */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 1, pointerEvents: 'none' }}>
            {/* Crosshair SVG */}
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="16" y1="0" x2="16" y2="12" stroke="var(--film-slot-icon)" strokeWidth="1.2"/>
              <line x1="16" y1="20" x2="16" y2="32" stroke="var(--film-slot-icon)" strokeWidth="1.2"/>
              <line x1="0" y1="16" x2="12" y2="16" stroke="var(--film-slot-icon)" strokeWidth="1.2"/>
              <line x1="20" y1="16" x2="32" y2="16" stroke="var(--film-slot-icon)" strokeWidth="1.2"/>
              <rect x="12" y="12" width="8" height="8" stroke="var(--film-slot-icon)" strokeWidth="1" fill="none"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                }}
              >
                Load Radiograph
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: 'var(--text-disabled)',
                  letterSpacing: '0.04em',
                }}
              >
                DICOM · PNG · JPEG
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Sample Case Button ── */}
      {onLoadSample && (
        <button
          type="button"
          onClick={onLoadSample}
          disabled={isLoadingLive}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--blue)',
            background: 'var(--surface-bg)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '7px 14px',
            cursor: isLoadingLive ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            opacity: isLoadingLive ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!isLoadingLive) e.currentTarget.style.borderColor = 'var(--blue)'; }}
          onMouseLeave={e => { if (!isLoadingLive) e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <Sparkles style={{ width: 13, height: 13, color: 'var(--blue)' }} />
          Load Sample MIMIC-CXR Case
        </button>
      )}

      {/* ── Subtitle below slot ── */}
      <div style={{ textAlign: 'center', maxWidth: 280 }}>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: 4,
          }}
        >
          DiagX-RAG · Multi-Level Explainable Medical RAG
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-disabled)', lineHeight: 1.5 }}>
          Diagnostic-aware retrieval across 29,101 MIMIC-CXR cases with multi-level XAI & Mistral-7B generation.

        </p>
      </div>

    </div>
  );
}
