import { createSlice } from '@reduxjs/toolkit';

const initialInvestigation = {
  id: null,
  title: '',
  deviation_id: '',
  product_name: '',
  batch_number: '',
  manufacturing_date: '',
  incident_date: new Date().toISOString().split('T')[0],
  manufacturing_stage: '',
  department: '',
  deviation_category: '',
  severity: 'Major',
  incident_description: '',
  expected_specification: '',
  actual_observation: '',
  immediate_actions_taken: '',
  potential_impact: '',
  status: 'Draft',
  final_root_cause: '',
  confirmed_by: '',
  five_whys_data: [],
  fishbone_data: {
    man: [],
    machine: [],
    method: [],
    material: [],
    measurement: [],
    environment: []
  },
  missing_evidence_data: [],
  potential_root_causes: [],
  capa_actions: [],
  document_meta: null,
  ai_confidence_score: 0.85,
  is_ai_extracted: false,
  missing_fields: []
};

const initialState = {
  currentInvestigation: { ...initialInvestigation },
  activeInputTab: 'text', // 'upload' | 'text' | 'email'
  pastedText: '',
  emailContent: '',
  uploadedFile: null,
  isAnalyzing: false,
  analysisError: null,
  analysisSuccess: false,
  workflowTrace: [],
  notification: null,
};

export const rcaSlice = createSlice({
  name: 'rca',
  initialState,
  reducers: {
    setInputTab: (state, action) => {
      state.activeInputTab = action.payload;
    },
    setPastedText: (state, action) => {
      state.pastedText = action.payload;
    },
    setEmailContent: (state, action) => {
      state.emailContent = action.payload;
    },
    setUploadedFile: (state, action) => {
      state.uploadedFile = action.payload;
    },
    clearUploadedFile: (state) => {
      state.uploadedFile = null;
    },
    startAnalysis: (state) => {
      state.isAnalyzing = true;
      state.analysisError = null;
      state.analysisSuccess = false;
      state.workflowTrace = [];
    },
    analysisFailed: (state, action) => {
      state.isAnalyzing = false;
      state.analysisError = action.payload;
      state.analysisSuccess = false;
    },
    setAnalysisResults: (state, action) => {
      const {
        extracted_data,
        five_whys,
        fishbone,
        potential_root_causes,
        missing_evidence,
        capa_recommendations,
        confidence_score,
        workflow_trace
      } = action.payload;

      state.isAnalyzing = false;
      state.analysisSuccess = true;
      state.analysisError = null;
      state.workflowTrace = workflow_trace || [];

      // Populate current investigation form fields
      state.currentInvestigation = {
        ...state.currentInvestigation,
        title: extracted_data.investigation_title || `Deviation Investigation for ${extracted_data.product_name || 'API'}`,
        deviation_id: extracted_data.deviation_id || `DEV-TEMP-${Math.floor(1000 + Math.random() * 9000)}`,
        product_name: extracted_data.product_name || '',
        batch_number: extracted_data.batch_number || '',
        manufacturing_date: extracted_data.manufacturing_date || '',
        incident_date: extracted_data.incident_date || new Date().toISOString().split('T')[0],
        manufacturing_stage: extracted_data.manufacturing_stage || '',
        department: extracted_data.department || '',
        deviation_category: extracted_data.deviation_category || '',
        severity: extracted_data.severity || 'Major',
        incident_description: extracted_data.incident_description || '',
        expected_specification: extracted_data.expected_specification || '',
        actual_observation: extracted_data.actual_observation || '',
        immediate_actions_taken: extracted_data.immediate_actions_taken || '',
        potential_impact: extracted_data.potential_impact || '',
        five_whys_data: five_whys || [],
        fishbone_data: fishbone || { man: [], machine: [], method: [], material: [], measurement: [], environment: [] },
        missing_evidence_data: missing_evidence || [],
        potential_root_causes: potential_root_causes || [],
        capa_actions: capa_recommendations || [],
        ai_confidence_score: confidence_score || 0.88,
        is_ai_extracted: true,
        missing_fields: extracted_data.missing_fields || []
      };
    },
    updateInvestigationField: (state, action) => {
      const { field, value } = action.payload;
      state.currentInvestigation[field] = value;
      // If user filled in a missing field, remove it from missing_fields
      if (state.currentInvestigation.missing_fields?.includes(field) && value?.trim()) {
        state.currentInvestigation.missing_fields = state.currentInvestigation.missing_fields.filter(f => f !== field);
      }
    },
    setFullInvestigation: (state, action) => {
      state.currentInvestigation = {
        ...initialInvestigation,
        ...action.payload,
        is_ai_extracted: true
      };
    },
    resetInvestigationForm: (state) => {
      state.currentInvestigation = { ...initialInvestigation };
      state.uploadedFile = null;
      state.pastedText = '';
      state.emailContent = '';
      state.analysisSuccess = false;
      state.analysisError = null;
      state.workflowTrace = [];
    },
    // 5 Whys actions
    updateFiveWhyStep: (state, action) => {
      const { index, field, value } = action.payload;
      if (state.currentInvestigation.five_whys_data[index]) {
        state.currentInvestigation.five_whys_data[index][field] = value;
      }
    },
    addFiveWhyStep: (state) => {
      const nextStep = (state.currentInvestigation.five_whys_data.length || 0) + 1;
      state.currentInvestigation.five_whys_data.push({
        step: nextStep,
        why: `Why did step ${nextStep - 1} occur?`,
        answer: '',
        is_hypothesis: true,
        is_unsupported: false
      });
    },
    removeFiveWhyStep: (state, action) => {
      const index = action.payload;
      state.currentInvestigation.five_whys_data.splice(index, 1);
      // Re-index remaining steps
      state.currentInvestigation.five_whys_data.forEach((step, idx) => {
        step.step = idx + 1;
      });
    },
    // Fishbone actions
    updateFishboneCategory: (state, action) => {
      const { category, factors } = action.payload;
      if (state.currentInvestigation.fishbone_data[category]) {
        state.currentInvestigation.fishbone_data[category] = factors;
      }
    },
    addFishboneFactor: (state, action) => {
      const { category, factor } = action.payload;
      if (!state.currentInvestigation.fishbone_data[category]) {
        state.currentInvestigation.fishbone_data[category] = [];
      }
      state.currentInvestigation.fishbone_data[category].push(factor);
    },
    toggleFishboneFactorContributing: (state, action) => {
      const { category, index } = action.payload;
      const cat = state.currentInvestigation.fishbone_data[category];
      if (cat && cat[index]) {
        cat[index].is_contributing = !cat[index].is_contributing;
      }
    },
    removeFishboneFactor: (state, action) => {
      const { category, index } = action.payload;
      if (state.currentInvestigation.fishbone_data[category]) {
        state.currentInvestigation.fishbone_data[category].splice(index, 1);
      }
    },
    // Potential Root Causes actions
    updateRootCause: (state, action) => {
      const { index, field, value } = action.payload;
      if (state.currentInvestigation.potential_root_causes[index]) {
        state.currentInvestigation.potential_root_causes[index][field] = value;
      }
    },
    addRootCause: (state, action) => {
      state.currentInvestigation.potential_root_causes.push(action.payload);
    },
    removeRootCause: (state, action) => {
      state.currentInvestigation.potential_root_causes.splice(action.payload, 1);
    },
    // Missing Evidence actions
    updateMissingEvidenceStatus: (state, action) => {
      const { id, status } = action.payload;
      const item = state.currentInvestigation.missing_evidence_data.find(e => e.id === id);
      if (item) {
        item.status = status;
      }
    },
    updateMissingEvidenceNotes: (state, action) => {
      const { id, notes } = action.payload;
      const item = state.currentInvestigation.missing_evidence_data.find(e => e.id === id);
      if (item) {
        item.notes = notes;
      }
    },
    addMissingEvidenceItem: (state, action) => {
      state.currentInvestigation.missing_evidence_data.push(action.payload);
    },
    // CAPA actions
    updateCapaItem: (state, action) => {
      const { index, field, value } = action.payload;
      if (state.currentInvestigation.capa_actions[index]) {
        state.currentInvestigation.capa_actions[index][field] = value;
      }
    },
    addCapaItem: (state, action) => {
      state.currentInvestigation.capa_actions.push(action.payload);
    },
    removeCapaItem: (state, action) => {
      state.currentInvestigation.capa_actions.splice(action.payload, 1);
    },
    // Notifications
    setNotification: (state, action) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    }
  }
});

export const {
  setInputTab,
  setPastedText,
  setEmailContent,
  setUploadedFile,
  clearUploadedFile,
  startAnalysis,
  analysisFailed,
  setAnalysisResults,
  updateInvestigationField,
  setFullInvestigation,
  resetInvestigationForm,
  updateFiveWhyStep,
  addFiveWhyStep,
  removeFiveWhyStep,
  updateFishboneCategory,
  addFishboneFactor,
  toggleFishboneFactorContributing,
  removeFishboneFactor,
  updateRootCause,
  addRootCause,
  removeRootCause,
  updateMissingEvidenceStatus,
  updateMissingEvidenceNotes,
  addMissingEvidenceItem,
  updateCapaItem,
  addCapaItem,
  removeCapaItem,
  setNotification,
  clearNotification
} = rcaSlice.actions;

export default rcaSlice.reducer;
