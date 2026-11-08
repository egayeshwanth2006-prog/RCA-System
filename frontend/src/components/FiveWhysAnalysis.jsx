import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  HelpCircle,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowDown
} from 'lucide-react';
import {
  updateFiveWhyStep,
  addFiveWhyStep,
  removeFiveWhyStep
} from '../redux/rcaSlice';

export const FiveWhysAnalysis = () => {
  const dispatch = useDispatch();
  const fiveWhys = useSelector((state) => state.rca.currentInvestigation.five_whys_data) || [];
  const observation = useSelector((state) => state.rca.currentInvestigation.actual_observation) || 
    'Impurity level exceeded permitted specification (1.2% vs <= 0.5%)';
  const product = useSelector((state) => state.rca.currentInvestigation.product_name) || 'API Drug Substance';

  const handleStepChange = (index, field, value) => {
    dispatch(updateFiveWhyStep({ index, field, value }));
  };

  const handleRegenerateStep = (index) => {
    // Regenerate individual answer hypothesis
    const sampleAlternatives = [
      'Reactor jacket thermal sensor calibration was overdue by 14 days during high-risk holding step.',
      'Reaction kinetics altered due to cooling valve delay causing localized thermal excursion.',
      'SOP holding time parameter window exceeded by 45 minutes during operator shift change.',
      'CMMS calibration tracking system lacked automated execution lockout on batch release.',
      'Solvent reagent purity degradation occurred during storage prior to charging vessel.'
    ];
    const picked = sampleAlternatives[index % sampleAlternatives.length];
    dispatch(updateFiveWhyStep({ index, field: 'answer', value: picked }));
    dispatch(updateFiveWhyStep({ index, field: 'is_hypothesis', value: true }));
    dispatch(updateFiveWhyStep({ index, field: 'is_unsupported', value: true }));
  };

  return (
    <div className="space-y-6">
      {/* Problem Definition Card */}
      <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-600 text-white flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">Starting Problem Observation</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-200/70 text-teal-900 font-medium">{product}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 mt-1">{observation}</p>
          <p className="text-[11px] text-teal-800 mt-1">
            The 5 Whys methodology investigates systemic failure modes from observation down to organizational governance.
            Hypotheses must be corroborated against physical evidence.
          </p>
        </div>
      </div>

      {/* 5 Whys Chain */}
      <div className="space-y-4">
        {fiveWhys.map((stepItem, idx) => (
          <div key={idx} className="relative">
            {/* Step Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-teal-300 font-bold text-xs flex items-center justify-center">
                    W{stepItem.step}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Why Step {stepItem.step}
                  </span>
                  {stepItem.is_hypothesis && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                      Hypothesis
                    </span>
                  )}
                  {stepItem.is_unsupported && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Unsupported Assumption
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRegenerateStep(idx)}
                    className="text-xs text-teal-700 hover:text-teal-800 px-2 py-1 rounded bg-teal-50 hover:bg-teal-100/80 transition-colors flex items-center gap-1 font-medium"
                    title="Regenerate this hypothesis with AI"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Regenerate
                  </button>
                  {fiveWhys.length > 2 && (
                    <button
                      onClick={() => dispatch(removeFiveWhyStep(idx))}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Why Question:
                </label>
                <input
                  type="text"
                  value={stepItem.why || ''}
                  onChange={(e) => handleStepChange(idx, 'why', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 outline-none text-slate-800 font-medium"
                />
              </div>

              {/* Answer Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Deductive Answer / Causal Factor:
                </label>
                <textarea
                  rows={2}
                  value={stepItem.answer || ''}
                  onChange={(e) => handleStepChange(idx, 'answer', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 outline-none text-slate-800"
                  placeholder="Enter evidence-based answer..."
                />
              </div>

              {/* Flags toggle */}
              <div className="flex items-center gap-4 pt-1 border-t border-slate-100 text-xs text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(stepItem.is_hypothesis)}
                    onChange={(e) => handleStepChange(idx, 'is_hypothesis', e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Mark as illustrative hypothesis</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(stepItem.is_unsupported)}
                    onChange={(e) => handleStepChange(idx, 'is_unsupported', e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Flag as unsupported assumption (requires verification)</span>
                </label>
              </div>
            </div>

            {/* Connecting Arrow */}
            {idx < fiveWhys.length - 1 && (
              <div className="flex justify-center my-2">
                <div className="p-1 rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Step Button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => dispatch(addFiveWhyStep())}
          className="px-4 py-2 border border-dashed border-teal-400 bg-teal-50/50 hover:bg-teal-50 text-teal-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4 text-teal-600" />
          Add Step (Why {fiveWhys.length + 1})
        </button>

        <span className="text-xs text-slate-500">
          Total steps: {fiveWhys.length} | Systematic Root Cause deduced at W5
        </span>
      </div>
    </div>
  );
};

export default FiveWhysAnalysis;
