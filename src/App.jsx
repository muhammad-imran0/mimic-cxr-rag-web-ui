import React, { useState } from 'react';
import Header from './components/Header';
import ImageIngestion from './components/ImageIngestion';
import PipelineTracker from './components/PipelineTracker';
import RagEvidenceMatrix from './components/RagEvidenceMatrix';
import StreamingReport from './components/StreamingReport';
import { useDiagnose } from './hooks/useDiagnose';
import { API_BASE } from './config';
import { Stethoscope, ShieldCheck, ImageIcon } from 'lucide-react';

export default function App() {
  const [isLiveServer, setIsLiveServer] = useState(true);

  const { 
    diagnoseImage, 
    status, 
    currentStep,
    retrievedRecords, 
    report, 
    isLoading, 
    isServerHealthy, 
    checkHealth,
    uploadedImagePreview,
    uploadedFileName
  } = useDiagnose(API_BASE);

  const hasActiveDiagnosis = uploadedImagePreview || isLoading || report || retrievedRecords.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      
      <div>
        {/* Workstation Navigation Header */}
        <Header 
          isLiveServer={isLiveServer}
          onToggleLiveServer={() => setIsLiveServer(!isLiveServer)}
          isServerHealthy={isServerHealthy}
          onCheckHealth={checkHealth}
        />

        {/* Main Clinical Workstation Area */}
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Top Section: Upload Boundary & Live Pipeline Tracker */}
          <div className="space-y-6">
            <ImageIngestion 
              diagnoseImage={diagnoseImage}
              liveStatus={status}
              isLoadingLive={isLoading}
            />

            <PipelineTracker 
              currentStep={currentStep} 
              status={status} 
              isLoading={isLoading} 
            />
          </div>

          {/* Active Diagnosis Results Dashboard */}
          {hasActiveDiagnosis && (
            <div className="space-y-8 animate-fade-in pt-2">
              
              {/* 2-Column Core Diagnostic Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (5 Cols): Patient Radiograph Viewer & Metadata */}
                <div className="lg:col-span-5 space-y-6">
                  {uploadedImagePreview ? (
                    <div className="glass-panel-accent rounded-3xl p-6 border border-gray-800 shadow-md space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Active Patient Input</h3>
                        </div>
                        <span className="text-[11px] font-mono text-gray-300 bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800 font-bold">
                          DICOM Ingested
                        </span>
                      </div>

                      {/* Image Frame */}
                      <div className="bg-black p-3 rounded-2xl border border-gray-800 shadow-md flex flex-col items-center justify-center relative group">
                        <img 
                          src={uploadedImagePreview} 
                          alt="Patient Chest X-Ray" 
                          className="max-h-96 w-full object-contain rounded-xl border border-gray-900"
                        />
                      </div>

                      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-xs space-y-1.5 font-mono">
                        <p className="text-gray-300 flex items-center justify-between">
                          <span>File Name:</span>
                          <strong className="text-indigo-400">{uploadedFileName || "sample.png"}</strong>
                        </p>
                        <p className="text-gray-400 flex items-center justify-between">
                          <span>Pipeline Endpoint:</span>
                          <span className="text-white">POST /api/v1/diagnose</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel rounded-3xl p-8 text-center border border-gray-800 flex flex-col items-center justify-center min-h-[300px]">
                      <ImageIcon className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-xs text-gray-400">Radiograph viewer standby</p>
                    </div>
                  )}
                </div>

                {/* Right Column (7 Cols): Automated LLM Clinical Report */}
                <div className="lg:col-span-7">
                  <StreamingReport 
                    liveReport={report}
                    liveStatus={status}
                    isLoadingLive={isLoading}
                  />
                </div>

              </div>

              {/* Bottom Section (Full Width): Qdrant Matched Historic Cases */}
              <RagEvidenceMatrix 
                liveRecords={retrievedRecords}
              />

            </div>
          )}

        </main>
      </div>

      {/* Clinician Workstation Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 py-6 mt-16 text-xs text-gray-400">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">Multimodal RAG Clinical Workstation</span>
          </div>

          <div className="flex items-center space-x-4 text-gray-400">
            <span>University of East London</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Human Auditing Engine
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
