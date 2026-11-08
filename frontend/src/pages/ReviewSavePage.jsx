import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  FileText,
  GitBranch,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { createInvestigation, updateInvestigation } from '../services/api';
import { setNotification } from '../redux/rcaSlice';

export const ReviewSavePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentInv = useSelector((state) => state.rca.currentInvestigation);
  const fiveWhys = currentInv.five_whys_data || [];
  const fishbone = currentInv.fishbone_data || {};
  const rootCauses = currentInv.potential_root_causes || [];
  const evidenceList = currentInv.missing_evidence_data || [];
  const capaList = currentInv.capa_actions || [];

  const [saving, setSaving] = useState(false);
  const [confirmedRootCause, setConfirmedRootCause] = useState(
    currentInv.final_root_cause || (rootCauses[0]?.cause_title || '')
  );
  const [qpReviewerName, setQpReviewerName] = useState(
    currentInv.confirmed_by || 'Dr. Marcus Vance (QP)'
  );
  const [investigationStatus, setInvestigationStatus] = useState(
    currentInv.status || 'Under Investigation'
  );

  const correctiveActions = capaList.filter(c => c.action_type === 'Corrective');
  const preventiveActions = capaList.filter(c => c.action_type === 'Preventive');

  const handleSaveInvestigation = async () => {
    try {
      setSaving(true);

      const payload = {
        title: currentInv.title || `Investigation for ${currentInv.product_name || 'API'}`,
        deviation_id: currentInv.deviation_id,
        product_name: currentInv.product_name || 'API Substance',
        batch_number: currentInv.batch_number || 'BATCH-TEMP',
        manufacturing_date: currentInv.manufacturing_date,
        incident_date: currentInv.incident_date,
        manufacturing_stage: currentInv.manufacturing_stage,
        department: currentInv.department,
        deviation_category: currentInv.deviation_category,
        severity: currentInv.severity || 'Major',
        incident_description: currentInv.incident_description,
        expected_specification: currentInv.expected_specification,
        actual_observation: currentInv.actual_observation,
        immediate_actions_taken: currentInv.immediate_actions_taken,
        potential_impact: currentInv.potential_impact,
        status: investigationStatus,
        final_root_cause: confirmedRootCause,
        confirmed_by: qpReviewerName,
        five_whys_data: fiveWhys,
        fishbone_data: fishbone,
        missing_evidence_data: evidenceList,
        root_causes: rootCauses,
        capa_actions: capaList,
        document_meta: currentInv.document_meta
      };

      let response;
      if (currentInv.id) {
        response = await updateInvestigation(currentInv.id, payload);
      } else {
        response = await createInvestigation(payload);
      }

      dispatch(setNotification({
        type: 'success',
        message: `Investigation ${response.id} successfully saved to PostgreSQL database!`
      }));

      // Redirect to investigation details page
      navigate(`/investigations/${response.id}`);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Title & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Final Investigation Review & Archive</h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              ICH Q10 Sign-off
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review all extracted parameters, causal analyses, and remediation actions prior to committing to PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/capa-management')}
            className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CAPA
          </button>

          <button
            onClick={handleSaveInvestigation}
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-md flex items-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving to Database...' : 'Save Investigation'}
          </button>
        </div>
      </div>

      {/* 1. Investigation Basic Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            1. Investigation Overview
          </h2>
          <div className="flex items-center gap-2">
            <StatusBadge status={currentInv.severity || 'Major'} type="severity" size="sm" />
            <StatusBadge status={investigationStatus} type="status" size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Product</span>
            <span className="font-semibold text-slate-900">{currentInv.product_name || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Batch Number</span>
            <span className="font-mono font-semibold text-slate-900">{currentInv.batch_number || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Deviation ID</span>
            <span className="font-mono font-semibold text-teal-700">{currentInv.deviation_id || 'TEMP-ID'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Stage & Department</span>
            <span className="text-slate-900">{currentInv.manufacturing_stage} • {currentInv.department}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <span className="text-slate-500 block text-[11px] font-semibold mb-1">Incident Description:</span>
            <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {currentInv.incident_description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Approved Specification:</span>
              <p className="font-medium text-slate-800">{currentInv.expected_specification || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-xs">
              <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Actual Non-Conformance:</span>
              <p className="font-bold text-rose-900">{currentInv.actual_observation || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 5 Whys & Fishbone Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 5 Whys Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              2. 5 Whys Deduction ({fiveWhys.length} Steps)
            </h2>
          </div>
          <div className="space-y-2.5">
            {fiveWhys.map((step, i) => (
              <div key={i} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-teal-800">W{step.step}: {step.why}</span>
                <p className="text-slate-700 leading-snug">{step.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Potential Root Causes Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-teal-600" />
              3. Root Causes Evaluated ({rootCauses.length})
            </h2>
          </div>
          <div className="space-y-2.5">
            {rootCauses.map((rc, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{rc.cause_title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">{rc.category}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <StatusBadge status={rc.evidence_status} type="evidence" size="xs" />
                  <span className="text-slate-400">• Confidence: {rc.confidence_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Missing Evidence Checklist Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            4. Forensic Evidence Status ({evidenceList.filter(e => e.status === 'obtained').length}/{evidenceList.length} Verified)
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {evidenceList.map((e) => (
            <div key={e.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
              <span className="font-medium text-slate-800 truncate">{e.item}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                e.status === 'obtained' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {e.status === 'obtained' ? 'Obtained' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Corrective and Preventive Actions (CAPA) Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            5. Recommended CAPA Matrix ({capaList.length} Actions)
          </h2>
        </div>

        <div className="space-y-3">
          {capaList.map((c, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  c.action_type === 'Corrective' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {c.action_type} Action
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.priority} type="priority" size="xs" />
                  <StatusBadge status={c.status} type="status" size="xs" />
                </div>
              </div>
              <p className="font-semibold text-slate-900">{c.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Owner: <strong>{c.responsible_person}</strong></span>
                <span>Due Date: <strong>{c.target_completion_date}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Qualified Person (QP) Electronic Sign-off Section */}
      <div className="bg-slate-900 rounded-2xl text-white p-6 shadow-md space-y-6 border border-slate-800">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Qualified Person (QP) Final Human Confirmation</h3>
            <p className="text-[11px] text-slate-400">
              Mandatory under ICH Q7 Section 2.5 and EU GMP Annex 16. AI cannot automatically release or close investigations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block text-xs font-semibold text-teal-300 mb-1">
              Confirmed Primary Root Cause (Human Approval) *
            </label>
            <textarea
              rows={3}
              value={confirmedRootCause}
              onChange={(e) => setConfirmedRootCause(e.target.value)}
              placeholder="State the confirmed definitive root cause after reviewing forensic evidence..."
              className="w-full text-xs p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-teal-300 mb-1">
                Qualified Person (QP) / Reviewer Name:
              </label>
              <input
                type="text"
                value={qpReviewerName}
                onChange={(e) => setQpReviewerName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-teal-300 mb-1">
                Investigation Lifecycle Status:
              </label>
              <select
                value={investigationStatus}
                onChange={(e) => setInvestigationStatus(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500 outline-none font-semibold"
              >
                <option value="Draft">Draft (Preliminary Intake)</option>
                <option value="Under Investigation">Under Investigation (Forensic Gathering)</option>
                <option value="Completed">Completed (Pending Final QP Signature)</option>
                <option value="Approved">Approved (QP Confirmed & Archived)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prominent Save Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Clicking Save will persist all records, tables, and audit logs to PostgreSQL.
          </span>

          <button
            onClick={handleSaveInvestigation}
            disabled={saving}
            className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Persisting to PostgreSQL...' : 'Save & Commit Investigation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewSavePage;
