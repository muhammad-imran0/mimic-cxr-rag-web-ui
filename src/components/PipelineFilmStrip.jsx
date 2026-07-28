import React, { useEffect, useState } from 'react';
import { Upload, Cpu, Filter, FileText, CheckCircle2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════
   PIPELINE FILM STRIP — Signature UI Element
   Shows pipeline progress left-to-right with stagger.
   Stays visible after completion as audit trail.
   ═══════════════════════════════════════════════════ */

const STAGES = [
  { id: 'upload',   icon: Upload,       label: 'INPUT' },
  { id: 'encode',   icon: Cpu,          label: 'ENCODE' },
  { id: 'retrieve', icon: null,         label: 'RETRIEVE' }, // dots
  { id: 'filter',   icon: Filter,       label: 'FILTER' },
  { id: 'select',   icon: null,         label: 'TOP-3' },    // dots
  { id: 'report',   icon: FileText,     label: 'REPORT' },
];

function stepToDone(currentStep) {
  if (currentStep >= 4) return ['upload', 'encode', 'retrieve', 'filter', 'select', 'report'];
  if (currentStep >= 3) return ['upload', 'encode', 'retrieve', 'filter', 'select'];
  if (currentStep >= 2) return ['upload', 'encode', 'retrieve'];
  if (currentStep >= 1) return ['upload'];
  return [];
}

function stepToActive(currentStep) {
  if (currentStep === 4) return null;
  if (currentStep === 3) return 'report';
  if (currentStep === 2) return 'filter';
  if (currentStep === 1) return 'encode';
  return null;
}

export default function PipelineFilmStrip({ currentStep = 0, comparisons, retrievedRecords }) {
  const [visibleDone, setVisibleDone] = useState([]);

  useEffect(() => {
    const done = stepToDone(currentStep);
    done.forEach((id, i) => {
      setTimeout(() => {
        setVisibleDone(prev => prev.includes(id) ? prev : [...prev, id]);
      }, i * 180);
    });
    if (currentStep === 0) setVisibleDone([]);
  }, [currentStep]);

  const activeId = stepToActive(currentStep);

  const allCandidateIds = comparisons
    ? Object.values(comparisons).flat().map(r => r.case_id).filter(Boolean)
    : [];
  const uniqueCandidates = [...new Set(allCandidateIds)].slice(0, 18);
  const selectedIds = retrievedRecords?.slice(0, 3).map(r => r.case_id) || [];

  const getCandidateDotClass = (id) => {
    if (!visibleDone.includes('retrieve')) return '';
    if (selectedIds.includes(id)) return 'selected';
    if (visibleDone.includes('filter')) return 'kept';
    return 'kept';
  };

  if (currentStep === 0) return null;

  return (
    <div className="film-strip fade-in" role="status" aria-label="Pipeline progress">

      {STAGES.map((stage, idx) => {
        const isDone   = visibleDone.includes(stage.id);
        const isActive = activeId === stage.id && !isDone;
        const Icon     = stage.icon;

        return (
          <React.Fragment key={stage.id}>
            {/* Connector line before (except first) */}
            {idx > 0 && (
              <div className={`film-strip-connector ${visibleDone.includes(STAGES[idx - 1].id) ? 'done' : ''}`} />
            )}

            {/* ── Special dot stages ── */}
            {stage.id === 'retrieve' ? (
              <div className="film-strip-node" title="Candidate pool from Qdrant">
                <div className="flex items-center gap-0.5 h-6 px-1">
                  {uniqueCandidates.length > 0
                    ? uniqueCandidates.map((id, di) => (
                        <div
                          key={id}
                          className={`candidate-dot ${getCandidateDotClass(id)}`}
                          style={{ transitionDelay: `${di * 40}ms` }}
                        />
                      ))
                    : Array.from({ length: 12 }).map((_, di) => (
                        <div
                          key={di}
                          className={`candidate-dot ${isDone ? 'kept' : ''}`}
                          style={{ transitionDelay: `${di * 40}ms` }}
                        />
                      ))
                  }
                </div>
                <span className="panel-label" style={{ fontSize: 11 }}>{stage.label}</span>
              </div>
            ) : stage.id === 'select' ? (
              <div className="film-strip-node" title="Top-3 retrieved cases">
                <div className="flex items-center gap-1 h-6">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`candidate-dot ${isDone ? 'selected' : ''}`}
                      style={{ width: 8, height: 8, transitionDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
                <span className="panel-label" style={{ fontSize: 11 }}>{stage.label}</span>
              </div>

            ) : (
              /* ── Icon stages ── */
              <div
                className={`film-strip-node ${isDone ? 'done' : isActive ? 'active' : ''}`}
                title={stage.label}
              >
                <div className="node-icon">
                  {isDone
                    ? <CheckCircle2 style={{ width: 15, height: 15, color: 'var(--green)' }} />
                    : Icon
                      ? <Icon style={{ width: 15, height: 15, color: isActive ? 'var(--blue)' : 'var(--text-disabled)' }} />
                      : null
                  }
                </div>
                <span
                  className="panel-label"
                  style={{
                    fontSize: 11,
                    color: isDone ? 'var(--green)' : isActive ? 'var(--blue)' : undefined,
                  }}
                >
                  {stage.label}
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Right side: completion label */}
      {currentStep >= 4 && (
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <div className="dot dot-green" />
          <span className="panel-label" style={{ color: 'var(--green)', fontSize: 11 }}>PIPELINE COMPLETE</span>
        </div>
      )}

      {/* Active status pulse */}
      {currentStep > 0 && currentStep < 4 && (
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <div className="dot dot-cyan pulse-cyan" />
          <span className="panel-label" style={{ color: 'var(--cyan)', fontSize: 11 }}>RUNNING</span>
        </div>
      )}
    </div>
  );
}
