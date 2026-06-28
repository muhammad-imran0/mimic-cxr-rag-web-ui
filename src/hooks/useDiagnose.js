import { useState, useCallback } from "react";
import { API_BASE } from "../config";

const FALLBACK_BACKEND_URL = "https://imranyasin7866-mimic-cxr-rag-api.hf.space";

export function useDiagnose(rawBaseUrl = API_BASE) {
  // Ensure we never use an empty string or local origin when deployed
  const baseUrl = (rawBaseUrl && rawBaseUrl.trim() !== "") ? rawBaseUrl : FALLBACK_BACKEND_URL;

  const [status, setStatus] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [retrievedRecords, setRetrievedRecords] = useState([]);
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isServerHealthy, setIsServerHealthy] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

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

  const diagnoseImage = async (file) => {
    setIsLoading(true);
    setReport("");
    setRetrievedRecords([]);
    setStatus("Uploading radiograph to pipeline...");
    setCurrentStep(1);
    setError(null);

    // Create browser object URL for instant local preview of uploaded image
    if (file instanceof File || file instanceof Blob) {
      const objectUrl = URL.createObjectURL(file);
      setUploadedImagePreview(objectUrl);
      setUploadedFileName(file.name || "Uploaded Radiograph");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const targetEndpoint = `${baseUrl.replace(/\/$/, '')}/api/v1/diagnose`;
      const response = await fetch(targetEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
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
              if (data.content.includes("BiomedCLIP")) setCurrentStep(1);
              else if (data.content.includes("Qdrant")) setCurrentStep(2);
              else if (data.content.includes("Synthesizing")) setCurrentStep(3);
            } else if (data.type === "retrieval_context" || data.type === "matches") {
              setRetrievedRecords(data.records || []);
            } else if (data.type === "token") {
              setReport((prev) => prev + data.content);
            } else if (data.type === "done") {
              setStatus("Diagnosis completed successfully.");
              setCurrentStep(4);
            } else if (data.type === "error") {
              console.error("Pipeline Error:", data.content);
              setError(data.content);
            }
          } catch (e) {
            console.warn("Malformed NDJSON line:", line);
          }
        }
      }
    } catch (err) {
      console.error("Failed to diagnose:", err);
      setError(err.message || "Failed to connect to FastAPI backend server");
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    diagnoseImage, 
    status, 
    currentStep,
    retrievedRecords, 
    report, 
    isLoading, 
    error, 
    isServerHealthy, 
    checkHealth,
    uploadedImagePreview,
    uploadedFileName
  };
}
