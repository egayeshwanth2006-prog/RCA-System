import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  GitBranch,
  HelpCircle,
  Layers,
  ShieldAlert,
  FileQuestion,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { FiveWhysAnalysis } from '../components/FiveWhysAnalysis';
import { FishboneDiagram } from '../components/FishboneDiagram';
import { PotentialRootCausesTable } from '../components/PotentialRootCausesTable';
import { MissingEvidenceSection } from '../components/MissingEvidenceSection';
import { StatusBadge } from '../components/StatusBadge';

export const RcaWorkspacePage = () => {
  const navigate = useNavigate();
  const currentInv = useSelector((state) => state.rca.currentInvestigation);

  const [activeTab, setActiveTab] = useState('five_whys'); // five_whys | fishbone | root_causes | missing_evidence

  // If no investigation is currently loaded, display friendly guidance
  const hasData = Boolean(currentInv.title || currentInv.product_name);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Investigation Ribbon Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {currentInv.deviation_id || 'DEV-DRAFT'}
              </span>
              <StatusBadge status={currentInv.severity || 'Major'} type="severity" size="xs" />
              <StatusBadge status={currentInv.status || 'Draft'} type="status" size="xs" />
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {currentInv.title || 'Root Cause Analysis Workspace (No active investigation loaded)'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/new-investigation')}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Intake
            </button>
            <button
              onClick={() => navigate('/capa-management')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              Proceed to CAPA Actions
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick parameters summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Product Name</span>
            <span className="font-semibold text-slate-800">{currentInv.product_name || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">API Batch Lot</span>
            <span className="font-mono font-semibold text-slate-800">{currentInv.batch_number || 'Pending'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Manufacturing Stage</span>
            <span className="text-slate-800">{currentInv.manufacturing_stage || 'Chemical Reaction'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">AI Confidence</span>
            <span className="font-semibold text-teal-700">
              {Math.round((currentInv.ai_confidence_score || 0.85) * 100)}% (Multi-step verification)
            </span>
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">No Active Investigation Loaded in Workspace</h4>
            <p className="mt-1 text-amber-800">
              You can explore the RCA tools below, but to run full LangGraph analysis on your actual incident report, 
              please visit the <span className="font-bold underline cursor-pointer" onClick={() => navigate('/new-investigation')}>New Investigation</span> tab.
            </p>
          </div>
        </div>
      )}

      {/* RCA Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-sm px-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('five_whys')}
          className={`py-3 px-5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'five_whys'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          A. 5 Whys Analysis ({currentInv.five_whys_data?.length || 0} Steps)
        </button>

        <button
          onClick={() => setActiveTab('fishbone')}
          className={`py-3 px-5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'fishbone'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          B. Ishikawa 6M Fishbone Analysis
        </button>

        <button
          onClick={() => setActiveTab('root_causes')}
          className={`py-3 px-5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'root_causes'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          C. Potential Root Causes ({currentInv.potential_root_causes?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('missing_evidence')}
          className={`py-3 px-5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'missing_evidence'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          D. Missing Evidence Checklist ({currentInv.missing_evidence_data?.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="transition-all duration-200">
        {activeTab === 'five_whys' && <FiveWhysAnalysis />}
        {activeTab === 'fishbone' && <FishboneDiagram />}
        {activeTab === 'root_causes' && <PotentialRootCausesTable />}
        {activeTab === 'missing_evidence' && <MissingEvidenceSection />}
      </div>

      {/* Workspace Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={() => navigate('/new-investigation')}
          className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Intake Form
        </button>

        <button
          onClick={() => navigate('/capa-management')}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
        >
          Proceed to CAPA Recommendations
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RcaWorkspacePage;
