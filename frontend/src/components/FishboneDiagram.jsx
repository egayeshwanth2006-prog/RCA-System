import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  Wrench,
  FileText,
  Boxes,
  Gauge,
  CloudSun,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import {
  addFishboneFactor,
  removeFishboneFactor,
  toggleFishboneFactorContributing
} from '../redux/rcaSlice';

const CATEGORIES = [
  { key: 'man', label: 'Man (Personnel & Training)', icon: Users, color: 'border-blue-400 bg-blue-50/40 text-blue-800' },
  { key: 'machine', label: 'Machine (Equipment & Sensors)', icon: Wrench, color: 'border-amber-400 bg-amber-50/40 text-amber-800' },
  { key: 'method', label: 'Method (SOPs & Procedures)', icon: FileText, color: 'border-indigo-400 bg-indigo-50/40 text-indigo-800' },
  { key: 'material', label: 'Material (Reagents & Lots)', icon: Boxes, color: 'border-emerald-400 bg-emerald-50/40 text-emerald-800' },
  { key: 'measurement', label: 'Measurement (QC Testing)', icon: Gauge, color: 'border-purple-400 bg-purple-50/40 text-purple-800' },
  { key: 'environment', label: 'Environment (Cleanroom & BMS)', icon: CloudSun, color: 'border-teal-400 bg-teal-50/40 text-teal-800' },
];

export const FishboneDiagram = () => {
  const dispatch = useDispatch();
  const fishbone = useSelector((state) => state.rca.currentInvestigation.fishbone_data) || {};
  const problemStatement = useSelector((state) => state.rca.currentInvestigation.actual_observation) || 
    'Impurity level exceeded permitted specification';

  const [activeCategory, setActiveCategory] = useState('all');
  const [newFactorText, setNewFactorText] = useState('');
  const [selectedCategoryForAdd, setSelectedCategoryForAdd] = useState('machine');

  const handleAddFactor = (e) => {
    e.preventDefault();
    if (!newFactorText.trim()) return;

    dispatch(addFishboneFactor({
      category: selectedCategoryForAdd,
      factor: {
        factor: newFactorText.trim(),
        sub_factors: [],
        is_contributing: true,
        notes: 'User added factor during RCA session'
      }
    }));
    setNewFactorText('');
  };

  return (
    <div className="space-y-6">
      {/* Visual Spine Diagram View */}
      <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-sm overflow-x-auto border border-slate-800">
        <div className="min-w-[760px]">
          {/* Top Categories (Man, Machine, Method) */}
          <div className="grid grid-cols-3 gap-6 mb-4">
            {['man', 'machine', 'method'].map((catKey) => {
              const catDef = CATEGORIES.find(c => c.key === catKey);
              const factors = fishbone[catKey] || [];
              const Icon = catDef.icon;

              return (
                <div key={catKey} className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 relative">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700 text-teal-300 font-medium text-xs">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{catDef.label.split('(')[0]}</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                      {factors.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 min-h-[70px]">
                    {factors.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No factors recorded</p>
                    ) : (
                      factors.slice(0, 3).map((f, i) => (
                        <div
                          key={i}
                          className={`text-[11px] px-2 py-1 rounded flex items-center justify-between gap-2 ${
                            f.is_contributing 
                              ? 'bg-teal-950/60 text-teal-200 border border-teal-700/50' 
                              : 'bg-slate-700/40 text-slate-400 line-through'
                          }`}
                        >
                          <span className="truncate">{f.factor}</span>
                          <span className="text-[9px] uppercase px-1 rounded bg-black/40 flex-shrink-0">
                            {f.is_contributing ? 'Contrib' : 'Ruled Out'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Bone stem pointing down */}
                  <div className="w-0.5 h-4 bg-teal-500/40 mx-auto mt-2"></div>
                </div>
              );
            })}
          </div>

          {/* Central Fishbone Spine */}
          <div className="relative py-2 flex items-center my-1">
            <div className="w-full h-1 bg-gradient-to-r from-teal-500/40 via-teal-400 to-teal-300 rounded-full"></div>
            {/* Deviation Outcome Head */}
            <div className="flex-shrink-0 ml-3 px-4 py-2 bg-rose-900/90 border border-rose-500/80 text-rose-100 rounded-xl max-w-xs shadow-lg text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-300">Problem Deviation</span>
              <p className="text-xs font-semibold truncate mt-0.5">{problemStatement}</p>
            </div>
          </div>

          {/* Bottom Categories (Material, Measurement, Environment) */}
          <div className="grid grid-cols-3 gap-6 mt-4">
            {['material', 'measurement', 'environment'].map((catKey) => {
              const catDef = CATEGORIES.find(c => c.key === catKey);
              const factors = fishbone[catKey] || [];
              const Icon = catDef.icon;

              return (
                <div key={catKey} className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 relative">
                  {/* Bone stem pointing up */}
                  <div className="w-0.5 h-4 bg-teal-500/40 mx-auto mb-2"></div>
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700 text-teal-300 font-medium text-xs">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{catDef.label.split('(')[0]}</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                      {factors.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 min-h-[70px]">
                    {factors.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No factors recorded</p>
                    ) : (
                      factors.slice(0, 3).map((f, i) => (
                        <div
                          key={i}
                          className={`text-[11px] px-2 py-1 rounded flex items-center justify-between gap-2 ${
                            f.is_contributing 
                              ? 'bg-teal-950/60 text-teal-200 border border-teal-700/50' 
                              : 'bg-slate-700/40 text-slate-400 line-through'
                          }`}
                        >
                          <span className="truncate">{f.factor}</span>
                          <span className="text-[9px] uppercase px-1 rounded bg-black/40 flex-shrink-0">
                            {f.is_contributing ? 'Contrib' : 'Ruled Out'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add New Factor Control */}
      <form onSubmit={handleAddFactor} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-semibold text-slate-700">Add Contributing Factor:</span>
        <select
          value={selectedCategoryForAdd}
          onChange={(e) => setSelectedCategoryForAdd(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium focus:ring-1 focus:ring-teal-500 outline-none"
        >
          {CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Describe hypothesis or observation..."
          value={newFactorText}
          onChange={(e) => setNewFactorText(e.target.value)}
          className="flex-1 min-w-[240px] text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 outline-none"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Factor
        </button>
      </form>

      {/* Category Cards (Editable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => {
          const factors = fishbone[cat.key] || [];
          const Icon = cat.icon;

          return (
            <div key={cat.key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-white border border-slate-200 text-teal-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-none">{cat.label.split('(')[0]}</h4>
                    <span className="text-[10px] text-slate-500">{cat.label.includes('(') ? `(${cat.label.split('(')[1]}` : ''}</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 rounded-full bg-slate-200/70">
                  {factors.length}
                </span>
              </div>

              <div className="p-3 divide-y divide-slate-100 flex-1 space-y-2">
                {factors.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No factors evaluated yet.</p>
                ) : (
                  factors.map((factorItem, idx) => (
                    <div key={idx} className="pt-2 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-xs font-medium leading-snug ${
                            factorItem.is_contributing ? 'text-slate-800' : 'text-slate-400 line-through'
                          }`}>
                            {factorItem.factor}
                          </p>
                          {factorItem.notes && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{factorItem.notes}</p>
                          )}
                          {factorItem.sub_factors?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {factorItem.sub_factors.map((sub, sIdx) => (
                                <span key={sIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => dispatch(toggleFishboneFactorContributing({ category: cat.key, index: idx }))}
                            className={`p-1 rounded text-xs transition-colors ${
                              factorItem.is_contributing 
                                ? 'text-teal-600 hover:bg-teal-50' 
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={factorItem.is_contributing ? "Mark as Ruled Out" : "Mark as Contributing"}
                          >
                            {factorItem.is_contributing ? (
                              <CheckCircle className="w-4 h-4 text-teal-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <button
                            onClick={() => dispatch(removeFishboneFactor({ category: cat.key, index: idx }))}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove factor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FishboneDiagram;
