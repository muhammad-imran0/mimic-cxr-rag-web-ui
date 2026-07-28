import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   PATHOLOGY METERS — "Zero-Shot Disease Classification"
   Dense data grids with JetBrains Mono numbers & clean risk states
   ══════════════════════════════════════════════════════════════ */

export default function PathologyMeters({ apiBase, uploadedImagePreview }) {
  const [pathologies, setPathologies] = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPathologies = async () => {
      if (!uploadedImagePreview) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(uploadedImagePreview);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append("file", blob, "image.jpg");

        const apiRes = await fetch(`${apiBase}/api/v1/xai/classify`, {
          method: 'POST',
          body: formData
        });
        if (!apiRes.ok) throw new Error("Failed to classify image.");
        const data = await apiRes.json();
        if (isMounted) setPathologies(data.pathologies || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchPathologies();
    return () => { isMounted = false; };
  }, [uploadedImagePreview, apiBase]);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High':     return 'var(--red)';
      case 'Moderate': return 'var(--amber)';
      default:         return 'var(--green)';
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="panel-label" style={{ fontSize: 13 }}>Pathology Probability Profile</span>
        <span style={{ fontSize: 12, color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace" }}>BioMedCLIP</span>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 24, justifyContent: 'center' }}>
          <Loader2 style={{ width: 16, height: 16, color: 'var(--cyan)', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Evaluating disease indices...</span>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--red)', fontSize: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid var(--border)', padding: '8px 12px' }}>
          {error}
        </div>
      )}

      {!isLoading && !error && pathologies.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {pathologies.map((pathology, idx) => {
            const percentage = (pathology.score * 100).toFixed(1);
            const riskCol = getRiskColor(pathology.risk);
            return (
              <div 
                key={idx}
                style={{
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--border)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                {/* Title and risk status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                    {pathology.name}
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    color: riskCol,
                    letterSpacing: '0.04em'
                  }}>
                    {pathology.risk.toUpperCase()}
                  </span>
                </div>

                {/* Progress mini bar */}
                <div style={{ height: 4, background: 'var(--surface-bg)', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      background: riskCol,
                      width: `${percentage}%`,
                      transition: 'width 0.4s ease-out'
                    }}
                  />
                </div>

                {/* Value statistics */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>PROB</span>
                  <span className="mono-num" style={{ color: riskCol, fontWeight: 700, fontSize: 16 }}>{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
