import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  Plus,
  MessageSquare,
  FileQuestion,
  Search,
  Filter
} from 'lucide-react';
import {
  updateMissingEvidenceStatus,
  updateMissingEvidenceNotes,
  addMissingEvidenceItem
} from '../redux/rcaSlice';

export const MissingEvidenceSection = () => {
  const dispatch = useDispatch();
  const evidenceList = useSelector((state) => state.rca.currentInvestigation.missing_evidence_data) || [];

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Production / BMR');

  const pendingCount = evidenceList.filter(e => e.status !== 'obtained').length;
  const obtainedCount = evidenceList.filter(e => e.status === 'obtained').length;

  const handleToggleStatus = (id, currentStatus) => {
    const next = currentStatus === 'obtained' ? 'pending' : 'obtained';
    dispatch(updateMissingEvidenceStatus({ id, status: next }));
  };

  const handleNotesChange = (id, notes) => {
    dispatch(updateMissingEvidenceNotes({ id, notes }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    dispatch(addMissingEvidenceItem({
      id: `EVID-CUSTOM-${Date.now()}`,
      item: newItemTitle.trim(),
      category: newItemCategory,
      status: 'pending',
      notes: 'Investigator requested evidence item'
    }));
    setNewItemTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Forensic Evidence Validation Checklist
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validate physical documents before confirming root causes or releasing batches.
          </p>
        </div>

        {/* Progress meter */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{obtainedCount} Obtained</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending Verification</span>
          </div>
        </div>
      </div>

      {/* Add Custom Item Form */}
      <form onSubmit={handleAddItem} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Add required record or forensic verification item (e.g. Cleanroom BMS differential pressure trend)..."
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          className="flex-1 min-w-[260px] text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none bg-white"
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value)}
          className="text-xs px-3 py-2 border rounded-lg focus:ring-1 focus:ring-teal-500 outline-none bg-white"
        >
          <option value="Machine / Metrology">Machine / Metrology</option>
          <option value="Method / Production">Method / Production</option>
          <option value="Material / QC">Material / QC</option>
          <option value="Environment / Facilities">Environment / Facilities</option>
          <option value="Man / QA Training">Man / QA Training</option>
          <option value="Measurement / QC Lab">Measurement / QC Lab</option>
        </select>
        <button
          type="submit"
          className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Record Item
        </button>
      </form>

      {/* Checklist Grid */}
      <div className="space-y-3">
        {evidenceList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic bg-white rounded-xl border border-slate-200">
            No missing evidence items identified. Run AI Analysis or add manually.
          </div>
        ) : (
          evidenceList.map((item) => {
            const isObtained = item.status === 'obtained';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isObtained
                    ? 'bg-emerald-50/20 border-emerald-200/80'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                      isObtained
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 hover:border-teal-500 text-transparent'
                    }`}
                    title={isObtained ? "Mark as Pending" : "Mark as Obtained"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  {/* Item Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isObtained ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                          {item.item}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {item.category}
                        </span>
                      </div>

                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        isObtained
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isObtained ? 'Obtained & Verified' : 'Pending Verification'}
                      </span>
                    </div>

                    {/* Forensic Notes */}
                    <div className="flex items-center gap-2 pt-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Add verification notes, document reference number, or finding..."
                        value={item.notes || ''}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        className="flex-1 text-xs bg-transparent border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-teal-500 outline-none text-slate-700 py-0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MissingEvidenceSection;
