import React, { useEffect } from 'react';
import { Activity, Server, Stethoscope, Wifi, WifiOff } from 'lucide-react';

export default function Header({ isLiveServer, onToggleLiveServer, isServerHealthy, onCheckHealth }) {
  
  useEffect(() => {
    onCheckHealth();
    const interval = setInterval(onCheckHealth, 5000);
    return () => clearInterval(interval);
  }, [onCheckHealth]);

  return (
    <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50 shadow-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Project Metadata */}
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md flex items-center justify-center">
              <Activity className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  MIMIC-CXR RAG <span className="text-xs px-2.5 py-0.5 rounded-md bg-gray-800 text-gray-200 border border-gray-700 font-bold uppercase tracking-wide">Workstation v2.4</span>
                </h1>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                <span className="text-gray-200 font-bold">Multimodal Decision Support System</span>
                <span className="text-gray-700">•</span>
                <span className="text-gray-400 flex items-center gap-1 font-medium">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-400" /> MSc AI Dissertation (University of East London)
                </span>
              </p>
            </div>
          </div>

          {/* FastAPI Backend Status Badge */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleLiveServer}
              className={`flex items-center space-x-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border shadow-sm ${
                isLiveServer 
                  ? 'bg-indigo-600 text-white border-indigo-500' 
                  : 'bg-gray-900 text-gray-300 border-gray-800 hover:bg-gray-800'
              }`}
              title="FastAPI endpoint http://localhost:8000 status"
            >
              <Server className="w-4 h-4 text-white animate-pulse" />
              <span>{isLiveServer ? 'FastAPI Connected' : 'Simulated Engine'}</span>
              
              {isServerHealthy ? (
                <span className="flex items-center text-[11px] text-emerald-300 font-mono bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-800 font-extrabold ml-1">
                  <Wifi className="w-3 h-3 mr-1 text-emerald-400" /> 8000
                </span>
              ) : (
                <span className="flex items-center text-[11px] text-amber-300 font-mono bg-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-800 font-extrabold ml-1">
                  <WifiOff className="w-3 h-3 mr-1 text-amber-400" /> Offline
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
