import React, { useEffect, useState } from 'react';
import {
  Settings,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Key,
  Layers,
  ShieldAlert,
  Server
} from 'lucide-react';
import { getSettings, updateSettings, testGroqKey, seedDemoData } from '../services/api';

export const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      if (data.active_model) setSelectedModel(data.active_model);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      if (groqKeyInput.trim()) fd.append('groq_api_key', groqKeyInput.trim());
      fd.append('groq_model', selectedModel);

      await updateSettings(fd);
      setSuccessMessage('Groq AI settings saved successfully!');
      setGroqKeyInput('');
      await fetchSettings();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestGroq = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await testGroqKey(groqKeyInput.trim());
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await seedDemoData();
      alert(`Successfully seeded: ${res.message}`);
    } catch (err) {
      alert(`Seed failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b pb-3 border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & LLM Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure runtime Groq API keys, model selection, database connection, and ICH regulatory compliance settings.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Groq API Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Groq LLM Engine Configuration</h2>
              <p className="text-[11px] text-slate-500">
                Ultra-low latency inference for multi-step LangGraph root cause analysis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              settings?.groq_configured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {settings?.groq_configured ? 'Active (Key Set)' : 'Fallback Simulation Mode'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          {/* Key Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              Groq API Key (gsk_...):
            </label>
            <input
              type="password"
              placeholder={settings?.groq_configured ? `Active Key: ${settings?.groq_key_preview} (Enter new to override)` : "Enter Groq API Key..."}
              value={groqKeyInput}
              onChange={(e) => setGroqKeyInput(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Never exposed to the frontend. Sent securely to the backend session or configured via <code>backend/.env</code>.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Active Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full text-xs px-3 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-medium bg-white"
            >
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended - 128k context, high reasoning)</option>
              <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
            </select>
          </div>

          {/* Test & Save buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestGroq}
              disabled={testing}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing API...' : 'Test Groq Connectivity'}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              {saving ? 'Saving...' : 'Update Configuration'}
            </button>
          </div>

          {/* Connectivity Result */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{testResult.message}</p>
                {testResult.response && (
                  <pre className="text-[10px] mt-1 p-2 bg-black/5 rounded">
                    {JSON.stringify(testResult.response, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Database Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">PostgreSQL Database Connection</h2>
            <p className="text-[11px] text-slate-500">SQLAlchemy ORM with schema initialization and audit retention.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Engine Type</span>
            <span className="font-bold text-slate-900">{settings?.database?.type || 'SQLAlchemy Engine'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Connection State</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {settings?.database?.status === 'connected' ? 'Connected & Operational' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">Seed sample pharmaceutical incidents for demo testing:</span>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-3.5 py-2 border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            {seeding ? 'Seeding...' : 'Seed Sample Scenarios (API-001)'}
          </button>
        </div>
      </div>

      {/* Regulatory & Safety Disclaimers */}
      <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-5 space-y-3 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>ICH Guidelines & Regulatory Governance Disclaimer</span>
        </div>
        <p className="leading-relaxed text-amber-800">
          This software is engineered to assist quality assurance professionals in pharmaceutical manufacturing deviations
          in accordance with ICH Q7 (GMP for Active Pharmaceutical Ingredients), ICH Q9 (Quality Risk Management), and
          ICH Q10 (Pharmaceutical Quality Systems).
        </p>
        <p className="leading-relaxed text-amber-800">
          <strong>Notice:</strong> This application is a demonstration module and is not a validated pharmaceutical quality
          system. It does not replace Qualified Person (QP) review or formal regulatory filing compliance. All AI outputs
          represent illustrative hypotheses requiring empirical verification.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
