import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  UploadCloud,
  FileText,
  Mail,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  FileCheck,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  setInputTab,
  setPastedText,
  setEmailContent,
  setUploadedFile,
  clearUploadedFile,
  startAnalysis,
  analysisFailed,
  setAnalysisResults,
  updateInvestigationField,
  resetInvestigationForm,
  setNotification
} from '../redux/rcaSlice';
import { analyzeIncident } from '../services/api';

const MANDATORY_FIELD_KEYS = [
  'product_name',
  'batch_number',
  'incident_description',
  'expected_specification',
  'actual_observation',
  'manufacturing_stage'
];

export const NewInvestigationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const {
    currentInvestigation,
    activeInputTab,
    pastedText,
    emailContent,
    uploadedFile,
    isAnalyzing,
    analysisError,
    analysisSuccess,
    workflowTrace
  } = useSelector((state) => state.rca);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFileObj, setSelectedFileObj] = useState(null);

  // Sample Scenarios for 1-click loading
  const loadSampleScenario = (scenarioType = 'api001') => {
    if (scenarioType === 'api001') {
      const text = `INVESTIGATION INCIDENT REPORT — PHARMA QUALITY ASSURANCE
Deviation ID: DEV-2026-105
Product: Active Pharmaceutical Ingredient API-001
Batch Number: BATCH-2026-105
Manufacturing Date: 2026-11-02
Incident Date: 2026-11-04
Manufacturing Stage: Chemical Reaction
Department: API Production Facility 2
Deviation Category: Out of Specification (OOS) / Chemical Impurity Excursion
Severity: Critical

Expected Specification:
Related Substances Impurity Level: Maximum 0.5% (Ph. Eur. / USP Monograph 4012).

Actual Observation:
During routine quality control release testing, the impurity level in the manufactured API batch was found to be 1.2%, exceeding the approved specification of 0.5%. 

Incident Description:
During routine quality control testing, the impurity level in the manufactured API batch was found to be 1.2%, exceeding the approved specification of 0.5%. The batch was placed on quality hold, and an investigation was initiated to determine the cause. Shift supervisor logs noted a minor 3.8°C thermal lag in Reactor R-201 temperature indicator (TE-204) during the 4-hour exothermic reaction holding window.

Immediate Actions Taken:
1. The batch BATCH-2026-105 was placed on quality hold in the ERP/MES system.
2. Physical quarantine tags were affixed to all containment drums in Warehouse Bay 4.
3. Charter investigation team comprising Production, QC, QA, and Metrology.

Potential Impact:
Batch cannot be released for commercial distribution or formulation into finished dosage tablets. Risk of elevated toxicological impurity profile if consumed by patients.`;

      dispatch(setInputTab('text'));
      dispatch(setPastedText(text));
    } else if (scenarioType === 'email') {
      const email = `From: dr.elena.vance@pharma-quality.aivoa.com
To: deviation-triage@pharma-quality.aivoa.com
Subject: URGENT: Temperature Excursion in Atorvastatin Calcium Batch ATV-2026-088
Date: 2026-11-05 08:30:00

Quality Committee,

During night shift crystallization of Atorvastatin Calcium Trihydrate Lot ATV-2026-088 in API Suite A, the chilled glycol control valve jammed 100% open. The slurry temperature plunged to 11.4°C against the approved specification of 18.0°C - 22.0°C and persisted for 85 minutes.

Immediate containment:
Manual bypass engaged, slurry slowly reheated to 20°C. Batch is currently quarantined in crystallizer vessel pending particle size distribution (PSD) and polymorphic form XRD analysis.

Regards,
Dr. Elena Vance, QC Lead`;

      dispatch(setInputTab('email'));
      dispatch(setEmailContent(email));
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFileObj(file);
    dispatch(setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type || 'application/pdf'
    }));
  };

  const handleRemoveFile = () => {
    setSelectedFileObj(null);
    dispatch(clearUploadedFile());
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Execute AI Analysis
  const handleAnalyze = async () => {
    try {
      dispatch(startAnalysis());

      let payload = {};
      let isFormData = false;

      if (activeInputTab === 'upload') {
        if (!selectedFileObj) {
          throw new Error('Please select or drag a PDF document to upload.');
        }
        const formData = new FormData();
        formData.append('file', selectedFileObj);
        formData.append('source_type', 'pdf');
        payload = formData;
        isFormData = true;
      } else if (activeInputTab === 'email') {
        if (!emailContent.trim()) {
          throw new Error('Please enter deviation email content to analyze.');
        }
        payload = { email_content: emailContent, source_type: 'email' };
      } else {
        if (!pastedText.trim()) {
          throw new Error('Please paste an incident report or deviation text.');
        }
        payload = { text: pastedText, source_type: 'text' };
      }

      const results = await analyzeIncident(payload, isFormData);
      dispatch(setAnalysisResults(results));
      dispatch(setNotification({
        type: 'success',
        message: 'AI Extraction & Analysis complete! Investigation form has been populated.'
      }));
    } catch (err) {
      dispatch(analysisFailed(err.message));
      dispatch(setNotification({
        type: 'error',
        message: `Analysis failed: ${err.message}`
      }));
    }
  };

  const handleFieldChange = (field, value) => {
    dispatch(updateInvestigationField({ field, value }));
  };

  const isFieldMissing = (fieldKey) => {
    const val = currentInvestigation[fieldKey];
    return !val || String(val).trim() === '';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title & Guidance */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">New Deviation Intake & AI Analysis</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Primary Feature
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provide forensic manufacturing incident notes via PDF, raw text, or email. The LangGraph workflow extracts data and generates causal hypotheses.
          </p>
        </div>

        {/* 1-Click Preloaded Incident Scenarios */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Demo Presets:</span>
          <button
            onClick={() => loadSampleScenario('api001')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-teal-600" />
            API-001 (Impurity Exceedance)
          </button>
          <button
            onClick={() => loadSampleScenario('email')}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
          >
            <Mail className="w-3 h-3 text-slate-500" />
            Email (Temperature Excursion)
          </button>
        </div>
      </div>

      {/* Input Methods Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Method Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70">
          <button
            onClick={() => dispatch(setInputTab('upload'))}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeInputTab === 'upload'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            A. Upload Document (PDF)
          </button>
          <button
            onClick={() => dispatch(setInputTab('text'))}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeInputTab === 'text'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            B. Paste Incident Text
          </button>
          <button
            onClick={() => dispatch(setInputTab('email'))}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeInputTab === 'email'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            C. Incident Email Input
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* Method A: Upload Document */}
          {activeInputTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-teal-500 bg-teal-50/50'
                    : 'border-slate-300 hover:border-teal-400 bg-slate-50/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Drag and drop pharmaceutical incident PDF here, or <span className="text-teal-600 underline">browse</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supports BMR shift logs, SCADA alarm logs, and formal deviation memos (PyMuPDF parser enabled)
                </p>
              </div>

              {/* Uploaded File Pill */}
              {uploadedFile && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-xs font-bold text-teal-900">{uploadedFile.name}</p>
                      <p className="text-[11px] text-teal-700">{uploadedFile.size} • Ready for PyMuPDF text extraction</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-1 hover:bg-teal-200/60 rounded text-teal-700 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Method B: Paste Text */}
          {activeInputTab === 'text' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Manufacturing Incident Log / Deviation Report:
              </label>
              <textarea
                rows={9}
                value={pastedText}
                onChange={(e) => dispatch(setPastedText(e.target.value))}
                placeholder="Paste shift handover log, batch deviation report, or SCADA alarm excerpt..."
                className="w-full text-xs font-mono p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none leading-relaxed text-slate-800 bg-slate-50/30"
              />
              <div className="flex justify-between text-[11px] text-slate-400 px-1">
                <span>Provide as much technical detail as available (temperatures, holding times, batch numbers).</span>
                <span>{pastedText.length} characters</span>
              </div>
            </div>
          )}

          {/* Method C: Email Input */}
          {activeInputTab === 'email' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-700">Email Incident Dispatcher:</span>
                <p className="text-[11px] text-slate-500">
                  Paste raw email notification from production supervisors, QC lab leads, or shift quality managers.
                </p>
              </div>
              <textarea
                rows={8}
                value={emailContent}
                onChange={(e) => dispatch(setEmailContent(e.target.value))}
                placeholder="From: ...&#10;Subject: ...&#10;&#10;Dear Quality Team, we observed an excursion in batch..."
                className="w-full text-xs font-mono p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none leading-relaxed text-slate-800"
              />
            </div>
          )}

          {/* Analyze Prominent Action Button */}
          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 mt-6">
            <div className="text-xs text-slate-500">
              {currentInvestigation.is_ai_extracted ? (
                <span className="text-teal-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  AI Extraction Active (Groq llama-3.3-70b-versatile)
                </span>
              ) : (
                <span>Clicking will process input through the 7-node LangGraph pipeline.</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentInvestigation.is_ai_extracted && (
                <button
                  type="button"
                  onClick={() => dispatch(resetInvestigationForm())}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Form
                </button>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-md flex items-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing with LangGraph & Groq...' : 'Analyze with AI'}
              </button>
            </div>
          </div>

          {/* LangGraph Live Execution Trace (During processing) */}
          {isAnalyzing && (
            <div className="mt-6 p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2 border border-slate-800 animate-pulse">
              <div className="flex items-center gap-2 text-teal-400 font-semibold">
                <Clock className="w-4 h-4" />
                <span>Executing LangGraph Multi-Agent Architecture...</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Traversing: Node 1 (Text Processing) → Node 2 (Extraction) → Node 3 (Validation) → Node 4 (5 Whys / Fishbone) → Node 5 (Evidence) → Node 6 (CAPA) → Node 7 (Review)
              </p>
            </div>
          )}

          {/* Error notice if any */}
          {analysisError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: AI-POPULATED INVESTIGATION FORM */}
      {currentInvestigation.is_ai_extracted && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header of Form */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900">Extracted Investigation Record</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  AI-Extracted
                </span>
                <span className="text-[10px] text-slate-400">
                  Confidence: {Math.round((currentInvestigation.ai_confidence_score || 0.85) * 100)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Review and edit every field before advancing. Missing mandatory fields are flagged in red.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-Analyze Source
              </button>
              <button
                onClick={() => navigate('/rca-workspace')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                Continue to Root Cause Analysis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-6">
            {/* Title & Deviation ID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Investigation Title *
                </label>
                <input
                  type="text"
                  value={currentInvestigation.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Deviation ID</label>
                  <span className="text-[10px] text-slate-400">Auto-assigned if missing</span>
                </div>
                <input
                  type="text"
                  value={currentInvestigation.deviation_id || ''}
                  onChange={(e) => handleFieldChange('deviation_id', e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-slate-50/50"
                />
              </div>
            </div>

            {/* Product & Batch & Dates */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Product Name *</span>
                  {isFieldMissing('product_name') && (
                    <span className="text-[10px] text-rose-600 font-semibold">Missing</span>
                  )}
                </label>
                <input
                  type="text"
                  value={currentInvestigation.product_name || ''}
                  onChange={(e) => handleFieldChange('product_name', e.target.value)}
                  placeholder="e.g. Active Pharmaceutical Ingredient API-001"
                  className={`w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                    isFieldMissing('product_name')
                      ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>API Batch Number *</span>
                  {isFieldMissing('batch_number') && (
                    <span className="text-[10px] text-rose-600 font-semibold">Missing</span>
                  )}
                </label>
                <input
                  type="text"
                  value={currentInvestigation.batch_number || ''}
                  onChange={(e) => handleFieldChange('batch_number', e.target.value)}
                  placeholder="e.g. BATCH-2026-105"
                  className={`w-full text-xs font-mono px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                    isFieldMissing('batch_number')
                      ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Manufacturing Date</label>
                <input
                  type="date"
                  value={currentInvestigation.manufacturing_date || ''}
                  onChange={(e) => handleFieldChange('manufacturing_date', e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Incident Date</label>
                <input
                  type="date"
                  value={currentInvestigation.incident_date || ''}
                  onChange={(e) => handleFieldChange('incident_date', e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            {/* Department, Stage, Category, Severity */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Manufacturing Stage *</label>
                <input
                  type="text"
                  value={currentInvestigation.manufacturing_stage || ''}
                  onChange={(e) => handleFieldChange('manufacturing_stage', e.target.value)}
                  placeholder="e.g. Chemical Reaction / Synthesis"
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Department</label>
                <input
                  type="text"
                  value={currentInvestigation.department || ''}
                  onChange={(e) => handleFieldChange('department', e.target.value)}
                  placeholder="e.g. API Production Suite 2"
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Deviation Category</label>
                <input
                  type="text"
                  value={currentInvestigation.deviation_category || ''}
                  onChange={(e) => handleFieldChange('deviation_category', e.target.value)}
                  placeholder="e.g. Out of Specification (OOS)"
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Severity</label>
                <select
                  value={currentInvestigation.severity || 'Major'}
                  onChange={(e) => handleFieldChange('severity', e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-semibold bg-white"
                >
                  <option value="Critical">Critical (Immediate Patient/Regulatory Risk)</option>
                  <option value="Major">Major (Process Excursion / Potential OOS)</option>
                  <option value="Minor">Minor (Documentation / Non-critical)</option>
                </select>
              </div>
            </div>

            {/* Incident Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Incident Description *</span>
                {isFieldMissing('incident_description') && (
                  <span className="text-[10px] text-rose-600 font-semibold">Missing mandatory detail</span>
                )}
              </label>
              <textarea
                rows={3}
                value={currentInvestigation.incident_description || ''}
                onChange={(e) => handleFieldChange('incident_description', e.target.value)}
                className="w-full text-xs p-3 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none leading-relaxed"
              />
            </div>

            {/* Expected Spec vs Actual Observation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Expected Specification *</span>
                  {isFieldMissing('expected_specification') && (
                    <span className="text-[10px] text-rose-600 font-semibold">Missing</span>
                  )}
                </label>
                <textarea
                  rows={2}
                  value={currentInvestigation.expected_specification || ''}
                  onChange={(e) => handleFieldChange('expected_specification', e.target.value)}
                  placeholder="e.g. Impurity level: Maximum 0.5% (w/w)"
                  className="w-full text-xs p-2 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-rose-50/50 border border-rose-200">
                <label className="block text-xs font-bold text-rose-900 flex items-center justify-between">
                  <span>Actual Observation *</span>
                  {isFieldMissing('actual_observation') && (
                    <span className="text-[10px] text-rose-600 font-semibold">Missing</span>
                  )}
                </label>
                <textarea
                  rows={2}
                  value={currentInvestigation.actual_observation || ''}
                  onChange={(e) => handleFieldChange('actual_observation', e.target.value)}
                  placeholder="e.g. Analytical HPLC test revealed impurity at 1.2% (w/w)"
                  className="w-full text-xs p-2 border rounded-lg border-rose-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white font-semibold text-rose-900"
                />
              </div>
            </div>

            {/* Containment & Potential Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Immediate Actions Taken</label>
                <textarea
                  rows={2}
                  value={currentInvestigation.immediate_actions_taken || ''}
                  onChange={(e) => handleFieldChange('immediate_actions_taken', e.target.value)}
                  placeholder="e.g. Batch quarantined on quality hold in ERP; physical tags applied."
                  className="w-full text-xs p-2.5 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Potential Quality Impact</label>
                <textarea
                  rows={2}
                  value={currentInvestigation.potential_impact || ''}
                  onChange={(e) => handleFieldChange('potential_impact', e.target.value)}
                  placeholder="e.g. Non-conforming API batch cannot proceed to formulation."
                  className="w-full text-xs p-2.5 border rounded-lg border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 italic">
              Changes remain local in state. Investigation is saved to PostgreSQL in the final Review step.
            </span>
            <button
              onClick={() => navigate('/rca-workspace')}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
            >
              Continue to Root Cause Analysis
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewInvestigationPage;
