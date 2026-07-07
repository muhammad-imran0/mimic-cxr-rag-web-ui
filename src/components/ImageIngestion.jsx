import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Sparkles, ShieldCheck, Stethoscope, GraduationCap } from 'lucide-react';

export default function ImageIngestion({ diagnoseImage, liveStatus, isLoadingLive }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    if (diagnoseImage) diagnoseImage(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center space-y-5 py-2 px-4 h-full my-auto">
      
      {/* Hero Greeting with Compact Typography */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#0F766E] text-[11px] font-semibold shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>MSc Dissertation Project • University of East London</span>
        </div>
        
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-snug max-w-2xl mx-auto">
          A Multimodal Retrieval-Augmented Generation System for Explainable Diagnosis and Evidence-Grounded Report Generation
        </h2>

        <p className="text-xs font-semibold text-[#64748B]">
          Supervisor: <strong className="text-[#0F172A]">Dr. Shaheen Khatoon</strong>
        </p>
        
        <p className="text-xs text-[#334155] max-w-xl mx-auto font-normal leading-relaxed">
          Upload a chest radiograph to execute real-time <strong>BiomedCLIP visual encoding</strong>, vector retrieval against 30,600 <strong>MIMIC-CXR cases in Qdrant</strong>, and automated clinical report generation.
        </p>
      </div>

      {/* Main Upload Box with Compact Dimensions */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 shadow-md border border-[#E2E8F0] relative overflow-hidden w-full">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*,.dcm"
          onChange={handleFileInput}
          className="hidden" 
        />

        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 relative cursor-pointer group ${
            isDragging 
              ? 'border-indigo-600 bg-indigo-50/50 shadow-md scale-[1.01]' 
              : 'border-[#CBD5E1] hover:border-slate-800 bg-[#F8FAFC] hover:bg-[#FFFFFF] shadow-2xs'
          }`}
        >
          <div className="p-4 bg-indigo-50 rounded-xl group-hover:scale-110 group-hover:bg-[#0F172A] transition-all duration-300 mb-3 shadow-2xs border border-indigo-100">
            {isLoadingLive ? (
              <Loader2 className="w-8 h-8 text-indigo-600 group-hover:text-white animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
            )}
          </div>
          
          <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            {isLoadingLive ? 'Ingesting Radiograph Pipeline...' : 'Upload Medical Chest Radiograph'}
          </h3>
          
          <p className="text-xs text-[#64748B] mt-1.5 max-w-sm leading-relaxed font-medium">
            {isLoadingLive ? (liveStatus || 'Computing visual embeddings & querying Qdrant vector database...') : 'Drag & drop DICOM or JPEG radiograph here, or click to browse files from your workstation.'}
          </p>

          <div className="mt-5 flex items-center space-x-2 text-[11px] font-medium text-[#64748B] bg-[#FFFFFF] px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Supports standard DICOM (.dcm), PNG, & JPEG image formats</span>
          </div>
        </div>

      </div>

    </div>
  );
}
