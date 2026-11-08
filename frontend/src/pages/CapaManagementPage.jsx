import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import {
  updateCapaItem,
  addCapaItem,
  removeCapaItem
} from '../redux/rcaSlice';

const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low'];
const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed', 'Overdue'];
const ACTION_TYPE_OPTIONS = ['Corrective', 'Preventive'];

export const CapaManagementPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentInv = useSelector((state) => state.rca.currentInvestigation);
  const capaList = currentInv.capa_actions || [];

  const [activeFilter, setActiveFilter] = useState('All'); // All | Corrective | Preventive
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCapa, setNewCapa] = useState({
    action_type: 'Corrective',
    description: '',
    reason_for_recommendation: '',
    related_root_cause: currentInv.potential_root_causes?.[0]?.cause_title || 'Elevated impurity level',
    priority: 'High',
    responsible_person: 'Quality Assurance Lead',
    target_completion_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'Pending',
    effectiveness_verification: 'Verify zero deviations across next 10 consecutive batches.'
  });

  const handleFieldChange = (index, field, value) => {
    dispatch(updateCapaItem({ index, field, value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCapa.description.trim()) return;

    dispatch(addCapaItem({ ...newCapa }));
    setNewCapa({
      action_type: 'Preventive',
      description: '',
      reason_for_recommendation: '',
      related_root_cause: '',
      priority: 'Medium',
      responsible_person: 'Production Manager',
      target_completion_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
      effectiveness_verification: ''
    });
    setShowAddModal(false);
  };

  const filteredCapa = activeFilter === 'All'
    ? capaList
    : capaList.filter(c => c.action_type === activeFilter);

  const correctiveCount = capaList.filter(c => c.action_type === 'Corrective').length;
  const preventiveCount = capaList.filter(c => c.action_type === 'Preventive').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              CAPA Management (ICH Q10 Quality Governance)
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {capaList.length} Total Recommendations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formulate targeted Corrective Actions (immediate containment) and Preventive Actions (systemic recurrence elimination).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Custom Action
          </button>
          <button
            onClick={() => navigate('/review-save')}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
          >
            Review & Save Investigation
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveFilter('All')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'All'
              ? 'bg-teal-50/60 border-teal-400 ring-2 ring-teal-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">All Recommended Actions</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">{capaList.length}</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{capaList.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Full remediation matrix</span>
        </div>

        <div
          onClick={() => setActiveFilter('Corrective')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'Corrective'
              ? 'bg-teal-50/60 border-teal-400 ring-2 ring-teal-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">A. Corrective Actions</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{correctiveCount}</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{correctiveCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Containment & direct failure remedy</span>
        </div>

        <div
          onClick={() => setActiveFilter('Preventive')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'Preventive'
              ? 'bg-teal-50/60 border-teal-400 ring-2 ring-teal-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-800">B. Preventive Actions</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">{preventiveCount}</span>
          </div>
          <p className="text-2xl font-bold text-teal-900 mt-2">{preventiveCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Systemic recurrence prevention</span>
        </div>
      </div>

      {/* Effectiveness Verification Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <FileCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">ICH Q10 Effectiveness Verification Governance:</span>
          <p className="text-[11px] text-blue-800 mt-0.5">
            Do not automatically claim that a CAPA is effective upon completion. Each action specifies an objective
            effectiveness verification protocol evaluated after a defined commercial batch interval.
          </p>
        </div>
      </div>

      {/* CAPA Actions List */}
      <div className="space-y-4">
        {filteredCapa.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 italic">
            No CAPA actions found under filter '{activeFilter}'.
          </div>
        ) : (
          filteredCapa.map((item, idx) => {
            const actualIndex = capaList.indexOf(item);

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header row: Action Type, Priority, Status, Delete */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.action_type === 'Corrective'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {item.action_type} Action
                    </span>

                    <select
                      value={item.priority || 'Medium'}
                      onChange={(e) => handleFieldChange(actualIndex, 'priority', e.target.value)}
                      className="text-xs px-2 py-0.5 rounded border border-slate-200 font-semibold outline-none bg-white"
                    >
                      {PRIORITY_OPTIONS.map(p => (
                        <option key={p} value={p}>Priority: {p}</option>
                      ))}
                    </select>

                    <select
                      value={item.status || 'Pending'}
                      onChange={(e) => handleFieldChange(actualIndex, 'status', e.target.value)}
                      className="text-xs px-2 py-0.5 rounded border border-slate-200 font-semibold outline-none bg-white"
                    >
                      {STATUS_OPTIONS.map(st => (
                        <option key={st} value={st}>Status: {st}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => dispatch(removeCapaItem(actualIndex))}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors text-xs flex items-center gap-1"
                    title="Delete action"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-1">
                    Action Description:
                  </label>
                  <textarea
                    rows={2}
                    value={item.description || ''}
                    onChange={(e) => handleFieldChange(actualIndex, 'description', e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-teal-500 outline-none text-slate-900 leading-relaxed"
                  />
                </div>

                {/* Reason & Related Root Cause */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Reason for Recommendation:
                    </label>
                    <input
                      type="text"
                      value={item.reason_for_recommendation || ''}
                      onChange={(e) => handleFieldChange(actualIndex, 'reason_for_recommendation', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 outline-none text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Related Root Cause:
                    </label>
                    <input
                      type="text"
                      value={item.related_root_cause || ''}
                      onChange={(e) => handleFieldChange(actualIndex, 'related_root_cause', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 outline-none text-slate-700 font-medium"
                    />
                  </div>
                </div>

                {/* Owner, Target Date & Effectiveness Check */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Responsible Person:
                    </label>
                    <input
                      type="text"
                      value={item.responsible_person || ''}
                      onChange={(e) => handleFieldChange(actualIndex, 'responsible_person', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Target Completion Date:
                    </label>
                    <input
                      type="date"
                      value={item.target_completion_date || ''}
                      onChange={(e) => handleFieldChange(actualIndex, 'target_completion_date', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                      Effectiveness Verification Criteria:
                    </label>
                    <input
                      type="text"
                      value={item.effectiveness_verification || ''}
                      onChange={(e) => handleFieldChange(actualIndex, 'effectiveness_verification', e.target.value)}
                      placeholder="Protocol to verify success post-closure..."
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add CAPA Recommendation</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the procedural, engineering, or containment action..."
                  value={newCapa.description}
                  onChange={(e) => setNewCapa({ ...newCapa, description: e.target.value })}
                  className="w-full text-xs p-2.5 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Action Type</label>
                  <select
                    value={newCapa.action_type}
                    onChange={(e) => setNewCapa({ ...newCapa, action_type: e.target.value })}
                    className="w-full text-xs p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    {ACTION_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newCapa.priority}
                    onChange={(e) => setNewCapa({ ...newCapa, priority: e.target.value })}
                    className="w-full text-xs p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newCapa.target_completion_date}
                    onChange={(e) => setNewCapa({ ...newCapa, target_completion_date: e.target.value })}
                    className="w-full text-xs p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responsible Person</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Validation Specialist"
                  value={newCapa.responsible_person}
                  onChange={(e) => setNewCapa({ ...newCapa, responsible_person: e.target.value })}
                  className="w-full text-xs p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Action</label>
                <input
                  type="text"
                  placeholder="Why is this remediation essential?"
                  value={newCapa.reason_for_recommendation}
                  onChange={(e) => setNewCapa({ ...newCapa, reason_for_recommendation: e.target.value })}
                  className="w-full text-xs p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Effectiveness Verification Method</label>
                <input
                  type="text"
                  placeholder="How will QA assess long-term effectiveness?"
                  value={newCapa.effectiveness_verification}
                  onChange={(e) => setNewCapa({ ...newCapa, effectiveness_verification: e.target.value })}
                  className="w-full text-xs p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
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
                  Add Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={() => navigate('/rca-workspace')}
          className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RCA Workspace
        </button>

        <button
          onClick={() => navigate('/review-save')}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.01]"
        >
          Review & Save Investigation
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CapaManagementPage;
