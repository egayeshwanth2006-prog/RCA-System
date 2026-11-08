import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Printer,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Edit,
  ExternalLink,
  HelpCircle,
  GitBranch,
  FileQuestion,
  Activity
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { getInvestigation, updateInvestigation, reanalyzeInvestigation } from '../services/api';
import { setFullInvestigation, setNotification } from '../redux/rcaSlice';

export const InvestigationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | rca | capa | audit

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvestigation(id);
      setInv(data);
    } catch (err) {
      console.error('Failed to load investigation details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleReanalyze = async () => {
    if (!window.confirm('Re-run AI LangGraph analysis on this investigation?')) return;
    try {
      setReanalyzing(true);
      await reanalyzeInvestigation(id);
      dispatch(setNotification({
        type: 'success',
        message: 'AI LangGraph Re-Analysis completed successfully.'
      }));
      await fetchDetail();
    } catch (err) {
      alert(`Re-analysis failed: ${err.message}`);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleEditInWorkspace = () => {
    if (!inv) return;
    dispatch(setFullInvestigation(inv));
    navigate('/rca-workspace');
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 max-w-4xl mx-auto">
        Loading investigation details from PostgreSQL...
      </div>
    );
  }

  if (error || !inv) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Investigation Not Found</h3>
        <p className="text-xs text-slate-500">{error || `Could not find record for ID ${id}`}</p>
        <button
          onClick={() => navigate('/investigations')}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Back to Investigations
        </button>
      </div>
    );
  }

  const fiveWhys = inv.five_whys_data || [];
  const fishbone = inv.fishbone_data || {};
  const rootCauses = inv.root_causes || [];
  const capaList = inv.capa_actions || [];
  const historyList = inv.history || [];
  const evidenceList = inv.missing_evidence_data || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Navigation & Status Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/investigations')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Investigations List
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="px-3 py-1.5 border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-teal-600 ${reanalyzing ? 'animate-spin' : ''}`} />
            {reanalyzing ? 'Re-analyzing...' : 'AI Re-Analyze'}
          </button>
          <button
            onClick={handleEditInWorkspace}
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit in Workspace
          </button>
        </div>
      </div>

      {/* Investigation Master Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200">
                {inv.id}
              </span>
              <span className="font-mono text-xs text-slate-500">
                Deviation: {inv.deviation_id}
              </span>
              <StatusBadge status={inv.severity} type="severity" size="sm" />
              <StatusBadge status={inv.status} type="status" size="sm" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{inv.title}</h1>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Created Timestamp</span>
            <span className="font-medium text-slate-700">{new Date(inv.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* 4-Column Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Product Name</span>
            <span className="font-semibold text-slate-900">{inv.product_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">API Batch Number</span>
            <span className="font-mono font-bold text-slate-900">{inv.batch_number}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Stage / Department</span>
            <span className="text-slate-800">{inv.manufacturing_stage} • {inv.department}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">AI Confidence</span>
            <span className="font-bold text-teal-700">{Math.round((inv.ai_confidence_score || 0.85) * 100)}% verified</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-sm px-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Incident Details & Forensic Specs
        </button>

        <button
          onClick={() => setActiveTab('rca')}
          className={`py-3 px-5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'rca'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          5 Whys & Ishikawa Analysis ({fiveWhys.length} Whys)
        </button>

        <button
          onClick={() => setActiveTab('capa')}
          className={`py-3 px-5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'capa'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Remediation Actions ({capaList.length} CAPAs)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Audit Trail ({historyList.length} Events)
        </button>
      </div>

      {/* Tab Panels */}
      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Incident Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Forensic Incident Description
            </h3>
            <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {inv.incident_description || 'No description provided.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Expected Specification:
                </span>
                <p className="font-semibold text-slate-800">{inv.expected_specification || 'N/A'}</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 text-xs">
                <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                  Actual Non-Conformance / Finding:
                </span>
                <p className="font-bold text-rose-900">{inv.actual_observation || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Immediate Containment:</span>
                <p className="text-slate-700">{inv.immediate_actions_taken || 'None documented.'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Potential Patient / Product Impact:</span>
                <p className="text-slate-700">{inv.potential_impact || 'Under evaluation.'}</p>
              </div>
            </div>
          </div>

          {/* Qualified Person Sign-Off Summary */}
          <div className="bg-slate-900 rounded-2xl text-white p-6 shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5 text-teal-400 font-semibold text-xs">
              <UserCheck className="w-5 h-5" />
              <span>Qualified Person (QP) Electronic Sign-off</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Confirmed Final Root Cause</span>
                <p className="font-medium text-teal-200 mt-1">
                  {inv.final_root_cause || 'Pending final Qualified Person determination.'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Signatory</span>
                <p className="font-medium text-white mt-1">
                  {inv.confirmed_by || 'Unsigned'} {inv.confirmed_at && `• ${new Date(inv.confirmed_at).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. RCA */}
      {activeTab === 'rca' && (
        <div className="space-y-6">
          {/* 5 Whys Deduction */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              5 Whys Causal Inquiry Chain
            </h3>
            <div className="space-y-3">
              {fiveWhys.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-teal-800">
                    <span>W{step.step}:</span>
                    <span>{step.why}</span>
                  </div>
                  <p className="text-slate-800 pl-6">{step.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Root Causes Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-teal-600" />
              Potential Root Causes Evaluated
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Cause Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Evidence Status</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Verification Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rootCauses.map((rc, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{rc.cause_title}</td>
                      <td className="py-2.5 px-3 text-slate-600">{rc.category}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={rc.evidence_status} type="evidence" size="xs" />
                      </td>
                      <td className="py-2.5 px-3">{rc.confidence_level}</td>
                      <td className="py-2.5 px-3 text-slate-600">{rc.verification_required}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. CAPA */}
      {activeTab === 'capa' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Corrective & Preventive Action Plan
            </h3>

            <div className="space-y-3">
              {capaList.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.action_type === 'Corrective' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {c.action_type}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.priority} type="priority" size="xs" />
                      <StatusBadge status={c.status} type="status" size="xs" />
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900 text-xs">{c.description}</p>
                  <p className="text-[11px] text-slate-500">Reason: {c.reason_for_recommendation}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <span>Owner: <strong>{c.responsible_person}</strong></span>
                    <span>Due Date: <strong>{c.target_completion_date}</strong></span>
                    <span>Verification: <strong>{c.effectiveness_verification || 'Pending'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. AUDIT */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            21 CFR Part 11 Electronic Audit History
          </h3>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {historyList.map((h) => (
              <div key={h.id} className="relative text-xs">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white"></span>
                <p className="font-bold text-slate-900">{h.action}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{h.details}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span>{h.performed_by}</span>
                  <span>•</span>
                  <span>{new Date(h.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestigationDetailPage;
