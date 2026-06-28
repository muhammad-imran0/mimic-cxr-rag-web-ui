import React, { useState } from 'react';
import { UploadCloud, Loader2, Sparkles } from 'lucide-react';

export default function ImageIngestion({ diagnoseImage, liveStatus, isLoadingLive }) {
  const [isDragging, setIsDragging] = useState(false);

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
    <div className="glass-panel-accent rounded-3xl p-8 w-full max-w-[1400px] mx-auto shadow-xl relative overflow-hidden transition-all duration-200 border border-gray-800">
      
      {/* Widescreen Central Upload Box */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all duration-200 relative cursor-pointer group ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-950/40 shadow-xl scale-[1.005]' 
            : 'border-gray-700 hover:border-indigo-400 bg-gray-900/80 hover:bg-gray-900 shadow-inner'
        }`}
      >
        <input 
          type="file" 
          accept="image/*,.dcm"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
        />
        
        <div className="p-5 bg-gray-800 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-200 mb-4 shadow-md border border-gray-700 group-hover:border-indigo-500">
          {isLoadingLive ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : (
            <UploadCloud className="w-10 h-10 text-indigo-400 group-hover:text-white transition-colors" />
          )}
        </div>
        
        <h3 className="text-xl font-extrabold text-white tracking-tight">
          {isLoadingLive ? 'Analyzing Radiograph Pipeline...' : 'Upload Medical Chest Radiograph'}
        </h3>
        
        <p className="text-sm text-gray-300 mt-2 max-w-lg leading-relaxed font-medium">
          {isLoadingLive ? (liveStatus || 'Streaming BiomedCLIP embeddings & Qdrant vector retrieval...') : 'Drag & drop DICOM or JPEG radiograph here, or click to browse files from your workstation.'}
        </p>

        <div className="mt-6 flex items-center space-x-2 text-xs font-mono font-semibold text-indigo-300 bg-gray-950 px-4 py-2 rounded-xl border border-gray-800 shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Endpoint: POST http://localhost:8000/api/v1/diagnose</span>
        </div>
      </div>

    </div>
  );
}
