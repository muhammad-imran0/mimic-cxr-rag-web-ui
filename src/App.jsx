import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ImageIngestion from './components/ImageIngestion';
import RagEvidenceMatrix from './components/RagEvidenceMatrix';
import StreamingReport from './components/StreamingReport';
import VisualizationMatrix from './components/VisualizationMatrix';
import PathologyMeters from './components/PathologyMeters';
import { useDiagnose } from './hooks/useDiagnose';
import { API_BASE } from './config';
import { Stethoscope, ShieldCheck, ImageIcon, RefreshCw, Layers, Sparkles, Eye, TrendingUp, BookOpen, ExternalLink, MessageSquareText, Database, Layers3, ChevronDown, Check, X, Maximize2, PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactDOM from 'react-dom';

export default function App() {
  const [isLiveServer, setIsLiveServer] = useState(true);
  const [reportModel, setReportModel] = useState('llama3.2');
  const REPORT_MODELS = ['llama3.2', 'qwen2.5vl:7b'];
  const [selectedPipeline, setSelectedPipeline] = useState('none');
  
  
  // View Mode for Image Analysis: 'radiograph' | 'xai' | 'pathology'
  const [viewMode, setViewMode] = useState('radiograph'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Left Panel Collapse State (True = Hidden, False = Expanded)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);

  // Quick Modal for viewing User's Original Uploaded Radiograph across any view
  const [showOriginalModal, setShowOriginalModal] = useState(false);

  // FE Trigger state for report generation
  const [hasReportGenerated, setHasReportGenerated] = useState(false);

  const dropdownRef = useRef(null);

  const { 
    diagnoseImage, 
    generateReport,
    status, 
    currentStep,
    retrievedRecords, 
    report,
    caption,
    isLoading, 
    isServerHealthy, 
    checkHealth,
    uploadedImagePreview,
    uploadedFileName,
    uploadedCaseDetails,
    comparisons,
    resetDiagnosis,
    completeImageLoading,
    step1Loading,
    step1Error,
    step2Loading,
    step2Error,
    step3Loading,
    step3Error
  } = useDiagnose(API_BASE);

  const hasActiveDiagnosis = Boolean(uploadedImagePreview || isLoading || report || retrievedRecords.length > 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReset = () => {
    setHasReportGenerated(false);
    if (resetDiagnosis) {
      resetDiagnosis();
    } else {
      window.location.reload();
    }
  };

  const handleTriggerGenerateReport = async () => {
    setHasReportGenerated(true);
    const bestPipeline = await generateReport(reportModel);
    if (bestPipeline) {
      setSelectedPipeline(bestPipeline);
    }
  };

  const activeCaseData = {
    id: uploadedFileName || 'sample_patient_cxr.png',
    gradCamHotspots: [
      { x: 48, y: 56, intensity: 0.94, label: "Right Lower Lobe Parenchymal Weighting" },
      { x: 65, y: 42, intensity: 0.81, label: "Perihilar Vascular Marking Attention" }
    ],
    pathologyScores: [
      { name: "Pneumonia / Consolidation", score: 0.14, risk: "Low", color: "#2563EB", details: "No focal alveolar opacification detected." },
      { name: "Pleural Effusion", score: 0.08, risk: "Low", color: "#2563EB", details: "Costophrenic angles are sharp and clear." },
      { name: "Cardiomegaly", score: 0.22, risk: "Low", color: "#2563EB", details: "Cardiac silhouette within normal limits." },
      { name: "Pneumothorax", score: 0.03, risk: "Low", color: "#2563EB", details: "Visceral pleural line not identified." },
      { name: "Atelectasis", score: 0.18, risk: "Low", color: "#2563EB", details: "Minor discoid subsegmental changes." },
      { name: "Edema", score: 0.05, risk: "Low", color: "#2563EB", details: "No Kerley B lines or vascular redistribution." }
    ]
  };

  const viewOptions = [
    { id: 'radiograph', label: 'Radiograph & BLIP-2 Caption', icon: ImageIcon, desc: 'Original DICOM input & visual scene description' },
    { id: 'xai', label: 'Grad-CAM XAI Heatmap', icon: Eye, desc: 'Deep CNN visual feature attention weights' },
    { id: 'pathology', label: 'Pathology Probability Meters', icon: TrendingUp, desc: 'Quantitative multi-label pathology classification' }
  ];

  const currentViewOption = viewOptions.find(o => o.id === viewMode);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between selection:bg-[#0F172A] selection:text-white font-sans antialiased">
      
      {/* LOCKED TOP HEADER NAVBAR */}
      <Header 
        isLiveServer={isLiveServer}
        onToggleLiveServer={() => setIsLiveServer(!isLiveServer)}
        isServerHealthy={isServerHealthy}
        onCheckHealth={checkHealth}
        hasActiveDiagnosis={hasActiveDiagnosis}
        onResetUpload={handleReset}
        selectedModel={reportModel}
        onSelectModel={setReportModel}
        selectedPipeline={selectedPipeline}
        onSelectPipeline={setSelectedPipeline}
        currentStep={currentStep}
        status={status}
        isLoading={isLoading}
      />

      {/* FIXED VIEWPORT MAIN WORKSPACE */}
      <main className="flex-1 max-w-[1750px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 overflow-hidden flex flex-col justify-center">
        
        {/* INITIAL LANDING UPLOAD SCREEN */}
        {!hasActiveDiagnosis ? (
          <div className="animate-fade-in flex-1 flex flex-col items-center justify-center overflow-hidden">
            <ImageIngestion 
              diagnoseImage={(file) => diagnoseImage(file, selectedPipeline)}
              liveStatus={status}
              isLoadingLive={isLoading}
            />
          </div>
        ) : (
          /* ACTIVE CLINICAL DIAGNOSTIC WORKSPACE */
          <div className="animate-fade-in flex-1 flex flex-col overflow-hidden py-1 relative">
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-hidden min-h-0 relative">
              
              {/* LEFT PANEL: INDEPENDENT INTERNAL SCROLL CONTAINER */}
              {!isLeftCollapsed ? (
                <div className="lg:col-span-6 h-full overflow-y-auto pr-2 space-y-6 transition-all duration-300 relative">
                  
                  {/* CARD 1: PATIENT RADIOGRAPH INPUT & VISUAL INSPECTION WITH CUSTOM DROPDOWN */}
                  <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-4">
                    
                    {/* Header Bar with Title & Custom Dropdown */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-3 gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping"></span>
                        <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                          Patient Radiograph Input
                        </h3>
                      </div>

                      <div className="flex items-center space-x-2">
                        
                        {/* PREMIUM CUSTOM DROPDOWN MENU */}
                        <div className="relative" ref={dropdownRef}>
                          <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-slate-400 rounded-lg text-xs font-bold text-[#0F172A] transition-all cursor-pointer shadow-2xs"
                          >
                            {React.createElement(currentViewOption.icon, { className: "w-4 h-4 text-indigo-600" })}
                            <span>{currentViewOption.label}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-fade-in">
                              <div className="px-3 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono border-b border-[#E2E8F0]">
                                Select Visual Analysis Mode
                              </div>
                              {viewOptions.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = viewMode === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    onClick={() => {
                                      setViewMode(opt.id);
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left p-2.5 rounded-lg flex items-start space-x-2.5 transition-all cursor-pointer ${
                                      isSelected 
                                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' 
                                        : 'hover:bg-[#F8FAFC] text-[#334155]'
                                    }`}
                                  >
                                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-[#64748B]'}`} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold leading-tight">{opt.label}</p>
                                      <p className="text-[10px] text-[#64748B] mt-0.5 font-normal leading-tight">{opt.desc}</p>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Button to View User's Original Uploaded Radiograph when in XAI/Pathology modes */}
                        {viewMode !== 'radiograph' && (
                          <button
                            onClick={() => setShowOriginalModal(true)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                            title="View Original Uploaded Image"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>View Original</span>
                          </button>
                        )}

                        <button 
                          onClick={handleReset}
                          className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                          title="Upload New Image"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-700" /> <span className="hidden sm:inline">New</span>
                        </button>
                      </div>
                    </div>

                    {/* VIEW MODE CONTENT DISPLAY */}
                    {viewMode === 'xai' ? (
                      <VisualizationMatrix selectedCase={activeCaseData} />
                    ) : viewMode === 'pathology' ? (
                      <PathologyMeters selectedCase={activeCaseData} />
                    ) : (
                      /* Standard Radiograph & BLIP-2 Caption Display */
                      <div className="space-y-4">
                        <div className="bg-[#F1F5F9] p-3 rounded-xl border border-[#E2E8F0] shadow-inner flex flex-col items-center justify-center relative">
                          {uploadedImagePreview ? (
                            <img 
                              src={uploadedImagePreview} 
                              alt="Patient Chest X-Ray" 
                              className="max-h-[380px] w-full object-contain rounded-lg shadow-2xs"
                            />
                          ) : (
                            <div className="py-16 text-center space-y-2">
                              <ImageIcon className="w-10 h-10 text-[#94A3B8] mx-auto" />
                              <p className="text-xs text-[#64748B]">Radiograph standby</p>
                            </div>
                          )}
                        </div>

                        {/* Ground-Truth Details of the Uploaded Dataset Image */}
                        {uploadedCaseDetails && (
                          <div className="bg-[#EFF6FF] p-4 rounded-xl border border-[#BFDBFE] space-y-2.5 shadow-2xs">
                            <div className="flex items-center space-x-1.5 border-b border-[#DBEAFE] pb-1.5 text-xs font-bold text-blue-900 uppercase font-mono tracking-wider">
                              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                              <span>Dataset Ground-Truth Case #{uploadedCaseDetails.case_id}</span>
                            </div>
                            
                            {/* Clinical Labels Grid for Uploaded Case */}
                            {(uploadedCaseDetails.label_keyword || uploadedCaseDetails.label_chexbert_primary || uploadedCaseDetails.label_llm_primary) && (
                              <div className="grid grid-cols-3 gap-2 bg-blue-50/70 p-2 rounded-lg border border-blue-200/50 text-[10px] my-1">
                                <div className="flex flex-col items-center justify-center text-center p-1.5 bg-white rounded-md border border-blue-100 shadow-3xs">
                                  <span className="text-[8px] font-bold text-blue-700 uppercase tracking-wider">Keyword class</span>
                                  <span className="font-extrabold text-blue-900 mt-0.5 truncate w-full px-1" title={uploadedCaseDetails.label_keyword}>
                                    {uploadedCaseDetails.label_keyword || "Other"}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center p-1.5 bg-white rounded-md border border-blue-100 shadow-3xs">
                                  <span className="text-[8px] font-bold text-blue-700 uppercase tracking-wider">CheXbert class</span>
                                  <span className="font-extrabold text-blue-900 mt-0.5 truncate w-full px-1" title={uploadedCaseDetails.label_chexbert_primary}>
                                    {uploadedCaseDetails.label_chexbert_primary || "Other"}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center p-1.5 bg-white rounded-md border border-blue-100 shadow-3xs">
                                  <span className="text-[8px] font-bold text-blue-700 uppercase tracking-wider">LLM class</span>
                                  <span className="font-extrabold text-blue-900 mt-0.5 truncate w-full px-1" title={uploadedCaseDetails.label_llm_primary}>
                                    {uploadedCaseDetails.label_llm_primary || "Other"}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed font-medium">
                              {uploadedCaseDetails.impression && (
                                <div>
                                  <span className="font-bold text-blue-950 block">Clinical Impression:</span>
                                  <p className="bg-[#FFFFFF]/75 p-2 rounded-lg border border-[#DBEAFE]/50 mt-0.5 font-semibold text-[#0F172A]">{uploadedCaseDetails.impression}</p>
                                </div>
                              )}
                              {uploadedCaseDetails.findings && (
                                <div>
                                  <span className="font-bold text-blue-950 block">Radiological Findings:</span>
                                  <p className="bg-[#FFFFFF]/75 p-2 rounded-lg border border-[#DBEAFE]/50 mt-0.5 text-[#334155]">{uploadedCaseDetails.findings}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* qwen2.5vl Real-time Caption */}
                        <div className="bg-[#F1F5F9] p-3.5 rounded-xl border border-[#E2E8F0] space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                            <MessageSquareText className="w-4 h-4 text-indigo-600" />
                            <span>qwen2.5vl Visual Caption</span>
                            {step3Loading && !caption && (
                              <span className="ml-auto text-[10px] text-indigo-500 font-mono animate-pulse">generating...</span>
                            )}
                          </div>
                          <p className="text-xs text-[#334155] leading-relaxed font-medium italic">
                            {caption
                              ? `"${caption}"`
                              : step3Loading
                              ? 'Analysing image with qwen2.5vl:7b...'
                              : 'Caption will appear after generating the report.'}
                          </p>
                        </div>

                        {/* Cross-Pipeline Retrieval Matrix Table */}
                        {comparisons && (
                          <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs space-y-3.5">
                            <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2.5">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                                Cross-Pipeline Evaluation
                              </span>
                              <h3 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                                Comparative Retrieval Matrix
                              </h3>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-[11px] text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold">
                                    <th className="py-2 pr-2">Pipeline Mode</th>
                                    <th className="py-2 px-2 text-center">Retrieved Case #1</th>
                                    <th className="py-2 px-2 text-center">Retrieved Case #2</th>
                                    <th className="py-2 px-2 text-center">Retrieved Case #3</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[
                                    { id: "none", name: "No Filter (Img)", queryLabel: uploadedCaseDetails?.label_keyword, labelKey: "label_keyword" },
                                    { id: "keyword", name: "Keyword Filter", queryLabel: uploadedCaseDetails?.label_keyword, labelKey: "label_keyword" },
                                    { id: "chexbert", name: "CheXbert Filter", queryLabel: uploadedCaseDetails?.label_chexbert_primary, labelKey: "label_chexbert_primary" },
                                    { id: "llm", name: "LLM Filter", queryLabel: uploadedCaseDetails?.label_llm_primary, labelKey: "label_llm_primary" },
                                    { id: "text_rag", name: "Text RAG (MPNet)", queryLabel: uploadedCaseDetails?.label_chexbert_primary, labelKey: "label_chexbert_primary" }
                                  ].map((pipe) => {
                                    const pipeMatches = comparisons[pipe.id] || [];
                                    const queryLabelLower = (pipe.queryLabel || "Other").toLowerCase();
                                    
                                    return (
                                      <tr key={pipe.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                                        <td className="py-2.5 pr-2 font-bold text-[#334155]">{pipe.name}</td>
                                        {[0, 1, 2].map((idx) => {
                                          const match = pipeMatches[idx];
                                          if (!match) return <td key={idx} className="py-2.5 px-2 text-center text-slate-400 font-mono">—</td>;
                                          
                                          const scorePercent = (match.score * 100).toFixed(1);
                                          const candLabel = match[pipe.labelKey] || match.label || "Other";
                                          const candLabelLower = candLabel.toLowerCase();
                                          const isMatch = candLabelLower === queryLabelLower;
                                          
                                          return (
                                            <td key={idx} className="py-2.5 px-2">
                                              <div className="flex flex-col items-center space-y-1">
                                                <span className="font-mono font-bold text-slate-800">#{match.case_id}</span>
                                                <span className="text-[10px] font-mono text-[#16A34A] font-medium">({scorePercent}%)</span>
                                                <span 
                                                  className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                                    isMatch 
                                                      ? "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]" 
                                                      : "bg-[#FEE2E2] text-[#EF4444] border border-[#FCA5A5]"
                                                  }`}
                                                  title={`Candidate: ${candLabel} | Query: ${pipe.queryLabel}`}
                                                >
                                                  {isMatch ? "Match" : "Mismatch"}
                                                </span>
                                              </div>
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            
                            <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] text-[10px] text-[#64748B] flex items-start gap-1.5 leading-relaxed">
                              <span className="font-bold text-[#475569]">Analysis:</span>
                              <span>
                                Green <strong>Match</strong> badges highlight retrieved cases that share the exact clinical diagnosis of the query patient. Red <strong>Mismatch</strong> badges indicate visual-bias errors (e.g. support tubes mismatching disease findings).
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* CARD 2: QDRANT VECTOR SIMILARITY CASES */}
                  <RagEvidenceMatrix 
                    liveRecords={retrievedRecords}
                    comparisons={comparisons}
                    selectedPipeline={selectedPipeline}
                    onSelectPipeline={setSelectedPipeline}
                    step1Loading={step1Loading}
                    step1Error={step1Error}
                    step2Loading={step2Loading}
                    step2Error={step2Error}
                    onImagesLoaded={completeImageLoading}
                  />

                </div>
              ) : null}

              {/* RIGHT PANEL: INDEPENDENT INTERNAL SCROLL CONTAINER */}
              <div className={`${isLeftCollapsed ? 'lg:col-span-12' : 'lg:col-span-6'} h-full overflow-y-auto transition-all duration-300 relative`}>
                
                {/* VERTICAL SIDE CONTROL DIVIDER BUTTON (ATTACHED REAL-TIME ON LEFT EDGE OF RIGHT PANEL) */}
                <button
                  onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                  className="absolute top-4 left-2 z-40 bg-[#0F172A] hover:bg-slate-800 text-white p-1.5 rounded-r-xl shadow-md border-y border-r border-slate-700 transition-all cursor-pointer flex items-center justify-center group"
                  title={isLeftCollapsed ? "Expand Left Evidence Panel" : "Collapse Left Evidence Panel"}
                >
                  {isLeftCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  )}
                </button>

                <StreamingReport 
                  liveReport={report}
                  liveStatus={status}
                  isLoadingLive={isLoading}
                  retrievedRecords={(comparisons && selectedPipeline) ? (comparisons[selectedPipeline] || retrievedRecords) : retrievedRecords}
                  selectedModel={reportModel}
                  hasReportGenerated={hasReportGenerated}
                  onTriggerGenerate={handleTriggerGenerateReport}
                  onReportModelChange={setReportModel}
                  reportModels={REPORT_MODELS}
                  step1Loading={step1Loading}
                  step2Loading={step2Loading}
                  step3Loading={step3Loading}
                  step3Error={step3Error}
                  uploadedImagePreview={uploadedImagePreview}
                  apiBase={API_BASE}
                />
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ORIGINAL UPLOADED RADIOGRAPH LIGHTBOX MODAL */}
      {showOriginalModal && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 w-screen h-screen top-0 left-0"
          onClick={() => setShowOriginalModal(false)}
        >
          <div 
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl max-w-3xl w-full h-[80vh] flex flex-col overflow-hidden shadow-2xl relative my-auto mx-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] shrink-0">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 bg-[#0F172A] text-white rounded-md text-xs font-bold font-mono">
                  Active Input
                </span>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Patient Original Uploaded Radiograph
                </h3>
              </div>
              
              <button 
                onClick={() => setShowOriginalModal(false)}
                className="p-2 text-[#64748B] hover:text-[#0F172A] bg-[#E2E8F0] rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              >
                <span>Close (ESC)</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-black flex-1 flex items-center justify-center overflow-hidden relative">
              {uploadedImagePreview ? (
                <img 
                  src={uploadedImagePreview} 
                  alt="Original Uploaded Radiograph" 
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" 
                />
              ) : (
                <p className="text-white text-xs">No image uploaded yet</p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FOOTER LOCKED AT BOTTOM */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] py-2 text-xs text-[#64748B] w-full shrink-0">
        <div className="w-full px-4 sm:px-8 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-3.5 h-3.5 text-slate-800" />
            <span className="font-bold text-[#0F172A] text-[11px]">MSc Dissertation Research Workstation</span>
            <span className="text-[#64748B] text-[11px]">• Dr. Shaheen Khatoon (UEL)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-medium text-[#64748B]">
            <span className="font-bold text-[#0F172A] flex items-center gap-1"><BookOpen className="w-3 h-3 text-slate-700" /> Ref Papers:</span>
            <a href="https://arxiv.org/abs/2502.02673" target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline flex items-center gap-0.5">MedRAX (ICML 2025) <ExternalLink className="w-2.5 h-2.5"/></a>
            <span>•</span>
            <a href="https://arxiv.org/abs/2410.13085" target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline flex items-center gap-0.5">MMed-RAG (2025) <ExternalLink className="w-2.5 h-2.5"/></a>
            <span>•</span>
            <a href="https://arxiv.org/abs/2604.16175" target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline flex items-center gap-0.5">MARCH (ACL 2026) <ExternalLink className="w-2.5 h-2.5"/></a>
            <span>•</span>
            <a href="https://arxiv.org/abs/2603.13956" target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline flex items-center gap-0.5">EviAgent (2026) <ExternalLink className="w-2.5 h-2.5"/></a>
          </div>
        </div>
      </footer>

    </div>
  );
}
