export const SAMPLE_CASES = [
  {
    id: "MIMIC-CXR-84920",
    patientName: "Anonymous Patient A-8492",
    age: 68,
    gender: "Female",
    studyDate: "2026-05-14 14:22:05",
    modality: "DICOM Chest PA (AP Portable)",
    view: "AP",
    leadCondition: "Severe Cardiomegaly & Right Pleural Effusion",
    pathologyScores: [
      { name: "Cardiomegaly", score: 0.94, risk: "High", color: "#ef4444", details: "Significant enlargement of cardiac silhouette, cardiothoracic ratio > 0.55" },
      { name: "Pleural Effusion", score: 0.88, risk: "High", color: "#f97316", details: "Blunting of right costophrenic angle consistent with fluid accumulation" },
      { name: "Atelectasis", score: 0.62, risk: "Moderate", color: "#eab308", details: "Linear opacities in lower lung zones representing compressive atelectasis" },
      { name: "Edema", score: 0.45, risk: "Moderate", color: "#3b82f6", details: "Mild peribronchial cuffing and vascular prominence" },
      { name: "Pneumonia", score: 0.28, risk: "Low", color: "#10b981", details: "No distinct focal consolidation identified" },
      { name: "Pneumothorax", score: 0.03, risk: "Low", color: "#64748b", details: "No pleural line or pneumothorax detected" },
    ],
    gradCamHighlights: [
      { layer: "DenseBlock_4", focusArea: "Cardiac Contour & Apex", weight: "96.4%" },
      { layer: "Conv4_3", focusArea: "Right Basal Costophrenic Angle", weight: "89.1%" }
    ],
    gradCamHotspots: [
      { x: 52, y: 62, radius: 28, intensity: 0.95, label: "Cardiac Silhouette Enlargement" },
      { x: 75, y: 78, radius: 20, intensity: 0.88, label: "Right Pleural Fluid Accumulation" },
      { x: 30, y: 70, radius: 15, intensity: 0.45, label: "Peribronchial Cuffing" }
    ],
    findingsText: `PA and lateral views of the chest demonstrate marked enlargement of the cardiac silhouette with prominent transverse cardiothoracic ratio. There is dense opacification at the right pulmonary base with obliteration of the costophrenic angle consistent with a moderate to large right pleural effusion. Bilateral hilar engorgement and cephalization of pulmonary vasculature are present, suggestive of elevated pulmonary venous pressures. No acute focal pulmonary consolidation or pneumothorax is identified. Osseous structures are intact without acute fracture.`,
    impressionText: `1. Severe cardiomegaly with features of congestive heart failure.
2. Moderate right-sided pleural effusion with associated compressive basal atelectasis.
3. No definite acute focal pneumonia.`,
    ragReferences: [
      {
        caseId: "MIMIC-CXR-10943",
        similarity: "96.8%",
        diagnosis: "Cardiomegaly with bilateral effusion",
        confirmedReport: "Marked cardiac enlargement and bilateral costophrenic blunting consistent with congestive failure."
      },
      {
        caseId: "MIMIC-CXR-33291",
        similarity: "92.4%",
        diagnosis: "Isolated Right Pleural Effusion",
        confirmedReport: "Dense fluid collection occupying right lowerhemithorax with blunted diaphragm boundary."
      }
    ]
  },
  {
    id: "MIMIC-CXR-50129",
    patientName: "Anonymous Patient B-5012",
    age: 52,
    gender: "Male",
    studyDate: "2026-06-02 09:15:40",
    modality: "DICOM Chest PA (Standard)",
    view: "PA",
    leadCondition: "Right Mid-Lung Pneumonia Infiltrate",
    pathologyScores: [
      { name: "Pneumonia", score: 0.91, risk: "High", color: "#ef4444", details: "Focal air space consolidation in right middle lobe" },
      { name: "Consolidation", score: 0.86, risk: "High", color: "#f97316", details: "Air bronchograms present within confluent opacity" },
      { name: "Atelectasis", score: 0.35, risk: "Low", color: "#eab308", details: "Minor adjacent subsegmental collapse" },
      { name: "Cardiomegaly", score: 0.18, risk: "Low", color: "#3b82f6", details: "Normal cardiac size and contour" },
      { name: "Pleural Effusion", score: 0.12, risk: "Low", color: "#10b981", details: "Clear costophrenic angles bilaterally" },
      { name: "Pneumothorax", score: 0.01, risk: "Low", color: "#64748b", details: "No pleural air separation detected" },
    ],
    gradCamHighlights: [
      { layer: "DenseBlock_4", focusArea: "Right Middle Lobe Confluent Opacity", weight: "94.2%" },
      { layer: "Conv4_3", focusArea: "Perihilar Branching Air Bronchograms", weight: "82.5%" }
    ],
    gradCamHotspots: [
      { x: 70, y: 48, radius: 24, intensity: 0.92, label: "RML Dense Airspace Consolidation" },
      { x: 62, y: 42, radius: 16, intensity: 0.78, label: "Air Bronchograms Region" }
    ],
    findingsText: `Standard erect PA radiograph reveals a distinct, dense area of focal airspace opacification located in the right mid-lung zone, corresponding to the right middle lobe. Air bronchograms are visualised within the area of consolidation. The left lung field is clear without pulmonary nodule or infiltrate. Cardiac size is within normal limits. Trachea is midline. Both costophrenic angles and diaphragmatic contours are preserved.`,
    impressionText: `1. Acute right middle lobe bacterial pneumonia featuring marked airspace consolidation and air bronchograms.
2. No pleural effusion or pulmonary edema.`,
    ragReferences: [
      {
        caseId: "MIMIC-CXR-77201",
        similarity: "95.1%",
        diagnosis: "Lobar Pneumonia (RML)",
        confirmedReport: "Confluent opacity in right mid lung with preserved diaphragmatic margins typical of acute middle lobe pneumonia."
      },
      {
        caseId: "MIMIC-CXR-44812",
        similarity: "91.0%",
        diagnosis: "Bacterial Airspace Consolidation",
        confirmedReport: "Dense consolidation with prominent air bronchograms in the middle right lobe."
      }
    ]
  },
  {
    id: "MIMIC-CXR-12004",
    patientName: "Anonymous Patient C-1200",
    age: 41,
    gender: "Female",
    studyDate: "2026-06-18 11:04:12",
    modality: "DICOM Chest PA",
    view: "PA",
    leadCondition: "Normal Unremarkable Radiograph",
    pathologyScores: [
      { name: "Pneumonia", score: 0.04, risk: "Low", color: "#64748b", details: "Clear lung zones bilaterally" },
      { name: "Cardiomegaly", score: 0.05, risk: "Low", color: "#64748b", details: "Normal cardiac silhouette ratio (< 0.48)" },
      { name: "Pleural Effusion", score: 0.02, risk: "Low", color: "#64748b", details: "Sharp costophrenic recesses" },
      { name: "Consolidation", score: 0.03, risk: "Low", color: "#64748b", details: "No airspace opacities" },
      { name: "Atelectasis", score: 0.06, risk: "Low", color: "#64748b", details: "No volume loss or linear collapse" },
      { name: "Pneumothorax", score: 0.01, risk: "Low", color: "#64748b", details: "Intact pleural margins" },
    ],
    gradCamHighlights: [
      { layer: "DenseBlock_4", focusArea: "Diffuse Background Anatomy (Low Variance)", weight: "12.1%" }
    ],
    gradCamHotspots: [
      { x: 50, y: 50, radius: 10, intensity: 0.15, label: "Normal Mediastinal Landmark" }
    ],
    findingsText: `Erect PA view demonstrates clear and fully expanded lung parenchyma bilaterally. There are no focal consolidation, pleural effusion, or pneumothorax. The cardiothoracic ratio is well within normal limits. The mediastinum and hilar contours are unremarkable. Osseous and soft tissue structures appear normal without acute pathology.`,
    impressionText: `1. Unremarkable chest radiograph with no acute cardiopulmonary disease.`,
    ragReferences: [
      {
        caseId: "MIMIC-CXR-00192",
        similarity: "98.5%",
        diagnosis: "Normal Chest Radiograph",
        confirmedReport: "Lungs are clear. Heart and mediastinum are within normal limits. No acute abnormality."
      }
    ]
  }
];
