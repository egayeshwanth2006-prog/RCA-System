import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShieldAlert,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  XCircle,
  Edit2
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import {
  updateRootCause,
  addRootCause,
  removeRootCause
} from '../redux/rcaSlice';

const EVIDENCE_STATUS_OPTIONS = [
  'Supported by evidence',
  'Partially supported',
  'Unverified hypothesis',
  'Ruled out'
];

const CONFIDENCE_LEVEL_OPTIONS = ['High', 'Medium', 'Low'];
const CATEGORY_OPTIONS = ['Man', 'Machine', 'Method', 'Material', 'Measurement', 'Environment'];

export const PotentialRootCausesTable = () => {
  const dispatch = useDispatch();
  const rootCauses = useSelector((state) => state.rca.currentInvestigation.potential_root_causes) || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCause, setNewCause] = useState({
    cause_title: '',
    category: 'Machine',
    supporting_evidence: '',
    evidence_status: 'Unverified hypothesis',
    confidence_level: 'Medium',
    verification_required: ''
  });

  const handleFieldChange = (index, field, value) => {
    dispatch(updateRootCause({ index, field, value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCause.cause_title.trim()) return;

    dispatch(addRootCause({ ...newCause }));
    setNewCause({
      cause_title: '',
      category: 'Machine',
      supporting_evidence: '',
      evidence_status: 'Unverified hypothesis',
      confidence_level: 'Medium',
      verification_required: ''
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Regulatory Warning Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Human Verification Required (ICH Q10 / EU GMP Annex 16):</span>
          <p className="mt-0.5 text-amber-800">
            AI suggestions are candidate hypotheses based on probabilistic reasoning. 
            <strong> Never automatically classify a potential cause as a confirmed root cause without forensic verification and Qualified Person sign-off.</strong>
          </p>
        </div>
      </div>

      {/* Table Header and Add Action */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Evaluated Root Cause Hypotheses ({rootCauses.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Potential Root Cause
        </button>
      </div>

      {/* Structured Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Potential Root Cause</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-4">Supporting Evidence</th>
                <th className="py-3 px-3">Evidence Status</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-4">Verification Required</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rootCauses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No root causes identified yet. Run AI Analysis or add manually.
                  </td>
                </tr>
              ) : (
                rootCauses.map((rc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* Cause Title */}
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      <input
                        type="text"
                        value={rc.cause_title}
                        onChange={(e) => handleFieldChange(idx, 'cause_title', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 outline-none text-xs font-medium"
                      />
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <select
                        value={rc.category}
                        onChange={(e) => handleFieldChange(idx, 'category', e.target.value)}
                        className="bg-transparent text-xs font-medium border border-slate-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-teal-500 outline-none"
                      >
                        {CATEGORY_OPTIONS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>

                    {/* Supporting Evidence */}
                    <td className="py-3 px-4 text-slate-600 max-w-sm">
                      <textarea
                        rows={2}
                        value={rc.supporting_evidence || ''}
                        onChange={(e) => handleFieldChange(idx, 'supporting_evidence', e.target.value)}
                        className="w-full text-xs p-1 rounded border border-transparent hover:border-slate-200 focus:border-teal-500 focus:bg-white bg-transparent outline-none"
                        placeholder="Corroborating data points..."
                      />
                    </td>

                    {/* Evidence Status */}
                    <td className="py-3 px-3">
                      <select
                        value={rc.evidence_status}
                        onChange={(e) => handleFieldChange(idx, 'evidence_status', e.target.value)}
                        className="text-xs rounded border border-slate-200 px-2 py-1 font-medium focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      >
                        {EVIDENCE_STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>

                    {/* Confidence Level */}
                    <td className="py-3 px-3">
                      <select
                        value={rc.confidence_level}
                        onChange={(e) => handleFieldChange(idx, 'confidence_level', e.target.value)}
                        className="text-xs rounded border border-slate-200 px-2 py-1 font-medium focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                      >
                        {CONFIDENCE_LEVEL_OPTIONS.map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </td>

                    {/* Verification Required */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      <textarea
                        rows={2}
                        value={rc.verification_required || ''}
                        onChange={(e) => handleFieldChange(idx, 'verification_required', e.target.value)}
                        className="w-full text-xs p-1 rounded border border-transparent hover:border-slate-200 focus:border-teal-500 focus:bg-white bg-transparent outline-none"
                        placeholder="Forensic checks needed..."
                      />
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => dispatch(removeRootCause(idx))}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete cause"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Add Potential Root Cause</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cause Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Temperature sensor calibration drift during reaction phase"
                  value={newCause.cause_title}
                  onChange={(e) => setNewCause({ ...newCause, cause_title: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCause.category}
                    onChange={(e) => setNewCause({ ...newCause, category: e.target.value })}
                    className="w-full text-xs px-2 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Evidence Status</label>
                  <select
                    value={newCause.evidence_status}
                    onChange={(e) => setNewCause({ ...newCause, evidence_status: e.target.value })}
                    className="w-full text-xs px-2 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    {EVIDENCE_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confidence</label>
                  <select
                    value={newCause.confidence_level}
                    onChange={(e) => setNewCause({ ...newCause, confidence_level: e.target.value })}
                    className="w-full text-xs px-2 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    {CONFIDENCE_LEVEL_OPTIONS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supporting Evidence</label>
                <textarea
                  rows={2}
                  placeholder="Facts, SCADA logs, or observations from report"
                  value={newCause.supporting_evidence}
                  onChange={(e) => setNewCause({ ...newCause, supporting_evidence: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Forensic Verification Required</label>
                <textarea
                  rows={2}
                  placeholder="Records, audits, or tests needed to confirm or rule out"
                  value={newCause.verification_required}
                  onChange={(e) => setNewCause({ ...newCause, verification_required: e.target.value })}
                  className="w-full text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium"
                >
                  Add Cause
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PotentialRootCausesTable;
