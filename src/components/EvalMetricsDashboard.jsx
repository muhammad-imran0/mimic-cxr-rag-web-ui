import React from 'react';
import { BarChart2, Award } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   STATIC EVALUATION METRICS DASHBOARD — "Data Wall"
   Locked validated results – PACS-style control room design
   ══════════════════════════════════════════════════════════════ */

const RETRIEVAL_DATA = [
  { config: 'CLIP Baseline',        p3: '3.33%',  ci: '[1.67%, 5.33%]',   pval: 'p<0.001',    best: false, warn: false },
  { config: 'BiomedCLIP No Filter', p3: '10.33%', ci: '[6.67%, 14.67%]',  pval: 'p<0.001',    best: false, warn: false },
  { config: 'Keyword Filter',       p3: '26.00%', ci: '[19.67%, 32.00%]', pval: 'p<0.001',    best: false, warn: false },
  { config: 'LLM Filter',           p3: '24.67%', ci: '[19.00%, 31.00%]', pval: 'p<0.001',    best: false, warn: false },
  { config: 'Text RAG Oracle',      p3: '32.33%', ci: '[25.67%, 38.67%]', pval: 'p<0.001',    best: false, warn: false },
  { config: 'Hybrid Filter',        p3: '49.00%', ci: '[41.33%, 56.67%]', pval: 'p=0.0996',   best: false, warn: false },
  { config: 'CheXbert Filter',      p3: '50.33%', ci: '[42.67%, 58.33%]', pval: 'Reference',  best: false, warn: false },
  { config: 'Ensemble Router',      p3: '60.67%', ci: '[53.33%, 67.67%]', pval: 'p=0.000003', best: true,  warn: false },
];

const GENERATION_DATA = [
  { model: 'Llama 3.2 Zero-Shot', bleu4: '0.0395', rougeL: '0.1870', bert: '0.8190', meteor: '0.3394', chex: '0.6420', radgraph: '0.2006', best: false, warn: false },
  { model: 'Llama 3.2 + RAG',     bleu4: '0.0483', rougeL: '0.1960', bert: '0.8250', meteor: '0.3567', chex: '0.6003', radgraph: '0.1892', best: false, warn: false },
  { model: 'Mistral + RAG',       bleu4: '0.0699', rougeL: '0.2549', bert: '0.8450', meteor: '0.4028', chex: '0.5888', radgraph: '0.2733', best: true,  warn: false },
  { model: 'Meditron + RAG',      bleu4: '0.0097', rougeL: '0.0617', bert: '0.7508', meteor: '0.1718', chex: '0.1946', radgraph: '0.0568', best: false, warn: true  },
];

export default function EvalMetricsDashboard({ onClose }) {
  return (
    <div className="data-wall fade-in" style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart2 style={{ width: 16, height: 16, color: 'var(--cyan)' }} />
          <span className="font-display" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            System Evaluation Performance
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          Close Dashboard
        </button>
      </div>

      {/* ── Main Layout: Side by Side tables ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Table A: Retrieval Performance */}
        <div>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="panel-label">Table A — Retrieval Performance</span>
            <span style={{ fontSize: 9, color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace" }}>n=100 test queries</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Configuration</th>
                <th>Precision@3</th>
                <th>95% CI</th>
                <th>Statistical Significance</th>
              </tr>
            </thead>
            <tbody>
              {RETRIEVAL_DATA.map((row, i) => {
                const isEnsemble = row.config.includes('Ensemble');
                const isWorst = i === 0;
                return (
                  <tr
                    key={row.config}
                    className={`${row.best ? 'row-best' : ''} ${isWorst ? 'row-worst' : ''}`}
                    style={{
                      borderTop: isEnsemble ? '1px solid var(--border)' : 'none',
                      background: isEnsemble ? 'rgba(6, 182, 212, 0.05)' : undefined,
                    }}
                  >
                    <td style={{
                      fontWeight: isEnsemble ? 600 : 400,
                      color: isEnsemble ? 'var(--cyan)' : undefined,
                    }}>
                      {isEnsemble ? 'ENSEMBLE (ADAPTIVE)' : row.config}
                    </td>
                    <td style={{ fontWeight: row.best || isEnsemble ? 600 : 400 }}>{row.p3}</td>
                    <td style={{ color: 'var(--text-disabled)', fontSize: 10 }}>{row.ci}</td>
                    <td style={{ fontSize: 10, color: row.pval.includes('Reference') ? 'var(--text-disabled)' : undefined }}>{row.pval}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table B: Report Generation quality */}
        <div>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="panel-label">Table B — Clinical Report Generation Accuracy</span>
            <span style={{ fontSize: 9, color: 'var(--text-disabled)', fontFamily: "'JetBrains Mono', monospace" }}>Reference dataset</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Model / Config</th>
                <th>BLEU-4</th>
                <th>ROUGE-L</th>
                <th>BERTScore</th>
                <th>METEOR</th>
                <th>CheXbert-F1</th>
                <th>RadGraph-F1</th>
              </tr>
            </thead>
            <tbody>
              {GENERATION_DATA.map((row) => (
                <tr
                  key={row.model}
                  className={`${row.best ? 'row-best' : ''} ${row.warn ? 'row-worst' : ''}`}
                >
                  <td style={{ fontWeight: row.best ? 600 : 400 }}>{row.model}</td>
                  <td>{row.bleu4}</td>
                  <td>{row.rougeL}</td>
                  <td>{row.bert}</td>
                  <td>{row.meteor}</td>
                  <td>{row.chex}</td>
                  <td>{row.radgraph}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note strip */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', gap: 12 }}>
          <Award style={{ width: 14, height: 14, color: 'var(--cyan)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>Statistical Findings:</strong> Adaptive routing of queries based on visual features yields an absolute precision improvement of 
            <span className="mono-num" style={{ color: 'var(--cyan)' }}> +10.34%</span> against static CheXbert filters, and 
            <span className="mono-num" style={{ color: 'var(--cyan)' }}> +57.34%</span> against the visual baseline. 
            All numbers are locked reference values.
          </p>
        </div>

      </div>

    </div>
  );
}
