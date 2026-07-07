import { useState, useCallback } from "react";
import { API_BASE } from "../config";

const FALLBACK_BACKEND_URL = "http://localhost:8000";

export function useDiagnose(rawBaseUrl = API_BASE) {
  // Ensure we never use an empty string or local origin when deployed
  const baseUrl = (rawBaseUrl && rawBaseUrl.trim() !== "") ? rawBaseUrl : FALLBACK_BACKEND_URL;

  const [status, setStatus] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [retrievedRecords, setRetrievedRecords] = useState([]);
  const [report, setReport] = useState("");
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedImageBase64, setUploadedImageBase64] = useState("");
  const [uploadedCaseDetails, setUploadedCaseDetails] = useState(null);
  const [comparisons, setComparisons] = useState(null);

  // Step-specific loading and error states
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Error, setStep1Error] = useState(null);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step2Error, setStep2Error] = useState(null);
  const [step3Loading, setStep3Loading] = useState(false);
  const [step3Error, setStep3Error] = useState(null);

  const checkHealth = useCallback(async () => {
    try {
      const targetUrl = `${baseUrl.replace(/\/$/, '')}/health`;
      const res = await fetch(targetUrl, { method: "GET" });
      if (res.ok) {
        setIsServerHealthy(true);
        return true;
      }
    } catch (err) {
      setIsServerHealthy(false);
    }
    return false;
  }, [baseUrl]);

  const resetDiagnosis = useCallback(() => {
    setStatus("");
    setCurrentStep(0);
    setRetrievedRecords([]);
    setReport("");
    setCaption("");
    setIsLoading(false);
    setError(null);
    setUploadedImagePreview(null);
    setUploadedFileName("");
    setUploadedImageBase64("");
    setUploadedCaseDetails(null);
    setComparisons(null);
    setStep1Loading(false);
    setStep1Error(null);
    setStep2Loading(false);
    setStep2Error(null);
    setStep3Loading(false);
    setStep3Error(null);
  }, []);

  const completeImageLoading = useCallback(() => {
    setStep2Loading(false);
    setCurrentStep(3);
    setStatus("Similar cases retrieved. Ready to generate report.");
  }, []);

  const diagnoseImage = async (file, pipeline = "none") => {
    setIsLoading(true);
    setReport("");
    setRetrievedRecords([]);
    setError(null);

    // Reset step-specific states
    setStep1Loading(true);
    setStep1Error(null);
    setStep2Loading(false);
    setStep2Error(null);
    setStep3Loading(false);
    setStep3Error(null);

    setStatus("Uploading radiograph to pipeline...");
    setCurrentStep(1);

    // Create browser object URL for instant local preview of uploaded image and convert to base64
    if (file instanceof File || file instanceof Blob) {
      const objectUrl = URL.createObjectURL(file);
      setUploadedImagePreview(objectUrl);
      setUploadedFileName(file.name || "Uploaded Radiograph");

      // Generate base64 encoding asynchronously
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result.split(',')[1];
        setUploadedImageBase64(base64Str);
      };
      reader.onerror = (err) => {
        console.error("FileReader failed to convert file to base64:", err);
      };
    }

    const formData = new FormData();
    formData.append("file", file);

    let searchResults = [];

    // --- STEP 1: SIMILARITY SEARCH ---
    try {
      const targetEndpoint = `${baseUrl.replace(/\/$/, '')}/api/v1/search/image?limit=3&pipeline=${pipeline}`;
      const response = await fetch(targetEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Similarity search failed with status: ${response.status}`);
      }

      const data = await response.json();
      searchResults = data.results || [];
      setRetrievedRecords(searchResults);
      if (data.query_case) {
        setUploadedCaseDetails(data.query_case);
      } else {
        setUploadedCaseDetails(null);
      }
      if (data.comparisons) {
        setComparisons(data.comparisons);
      } else {
        setComparisons(null);
      }
      setStep1Loading(false);
    } catch (err) {
      console.error("Step 1 failed:", err);
      const errMsg = err.message || "Failed to complete similarity search";
      setStep1Error(errMsg);
      setError(errMsg);
      setStep1Loading(false);
      setIsLoading(false);
      return;
    }

    // --- STEP 2: FETCH IMAGES (DELEGATED TO NATIVE BROWSER RENDER) ---
    try {
      setCurrentStep(2);
      setStep2Loading(true);
      setStatus("Loading case radiographs...");
    } catch (err) {
      console.error("Step 2 transition failed:", err);
      const errMsg = err.message || "Failed to load case images";
      setStep2Error(errMsg);
      setError(errMsg);
      setStep2Loading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportModel = "llama3.2") => {
    if (retrievedRecords.length === 0) {
      console.warn("No retrieved records available for report generation");
      return;
    }

    setIsLoading(true);
    setStep3Loading(true);
    setStep3Error(null);
    setError(null);
    setReport("");
    setCaption("");
    setStatus("Synthesizing clinical report...");
    setCurrentStep(3);

    let bestRecordsToUse = retrievedRecords;

    if (comparisons && uploadedCaseDetails) {
      // Evaluate pipelines in priority order (LLM is preferred if there's a tie)
      const pipelinesToEvaluate = [
        { id: "llm", labelKey: "label_llm_primary", queryLabel: uploadedCaseDetails.label_llm_primary },
        { id: "chexbert", labelKey: "label_chexbert_primary", queryLabel: uploadedCaseDetails.label_chexbert_primary },
        { id: "text_rag", labelKey: "label_chexbert_primary", queryLabel: uploadedCaseDetails.label_chexbert_primary },
        { id: "keyword", labelKey: "label_keyword", queryLabel: uploadedCaseDetails.label_keyword }
      ];

      let maxMatches = -1;
      let bestPipeline = null;

      pipelinesToEvaluate.forEach(pipe => {
        const matches = comparisons[pipe.id] || [];
        const qLabel = (pipe.queryLabel || "Other").toLowerCase();
        
        let matchCount = 0;
        matches.forEach(m => {
          const cLabel = (m[pipe.labelKey] || m.label || "Other").toLowerCase();
          if (cLabel === qLabel) matchCount++;
        });

        // We use > so that earlier items in the array win ties (e.g. LLM > CheXbert)
        if (matchCount > maxMatches) {
          maxMatches = matchCount;
          bestPipeline = pipe.id;
        }
      });

      if (bestPipeline && comparisons[bestPipeline] && comparisons[bestPipeline].length > 0) {
        console.log(`[Ensemble Router] Selected '${bestPipeline}' pipeline with ${maxMatches}/3 perfect matches.`);
        bestRecordsToUse = comparisons[bestPipeline];
      }
    }

    // Map records to expected backend format
    const matchesPayload = bestRecordsToUse.map((r) => ({
      case_id: r.case_id !== undefined ? r.case_id : r.caseId,
      score: r.score !== undefined ? r.score : 0.95,
      findings: r.findings || "",
      impression: r.impression || "",
      source: r.source || "MIMIC-CXR Cohort",
    }));

    let autoSelectedPipeline = null;
    if (comparisons && uploadedCaseDetails && bestRecordsToUse !== retrievedRecords) {
        // Find which pipeline id matches bestRecordsToUse to return it
        const keys = Object.keys(comparisons);
        for (let k of keys) {
            if (comparisons[k] === bestRecordsToUse) {
                autoSelectedPipeline = k;
                break;
            }
        }
    }

    try {
      const targetEndpoint = `${baseUrl.replace(/\/$/, '')}/api/v1/report/synthesize`;
      const response = await fetch(targetEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          matches: matchesPayload,
          image_base64: uploadedImageBase64 || null,
          report_model: reportModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Report generation failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);

            if (data.type === "status") {
              setStatus(data.content);
            } else if (data.type === "caption") {
              setCaption(data.content);
            } else if (data.type === "token") {
              setReport((prev) => prev + data.content);
            } else if (data.type === "done") {
              setStatus("Diagnosis completed successfully.");
              setCurrentStep(4);
            } else if (data.type === "error") {
              console.error("LLM Generation Error:", data.content);
              setStep3Error(data.content);
              setError(data.content);
            }
          } catch (e) {
            console.warn("Malformed NDJSON line:", line);
          }
        }
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
      const errMsg = err.message || "Failed to generate report from matches";
      setStep3Error(errMsg);
      setError(errMsg);
    } finally {
      setStep3Loading(false);
      setIsLoading(false);
    }
    
    return autoSelectedPipeline;
  };

  return {
    diagnoseImage,
    generateReport,
    status,
    currentStep,
    retrievedRecords,
    report,
    caption,
    isLoading,
    error,
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
    step3Error,
  };
}
