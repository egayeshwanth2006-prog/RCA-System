import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { getDashboardStats, seedDemoData } from '../services/api';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      await seedDemoData();
      await fetchStats();
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const kpis = [
    {
      label: 'Total Investigations',
      value: stats?.total_investigations ?? 0,
      icon: Layers,
      color: 'text-slate-900 bg-slate-100 border-slate-200'
    },
    {
      label: 'Open (Drafts)',
      value: stats?.open_investigations ?? 0,
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      label: 'Under Investigation',
      value: stats?.under_investigation ?? 0,
      icon: Activity,
      color: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    {
      label: 'Completed / Approved',
      value: stats?.completed_investigations ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      label: 'Pending CAPA Actions',
      value: stats?.pending_capa_actions ?? 0,
      icon: ShieldCheck,
      color: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quality Operations Dashboard</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              API Manufacturing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pharmaceutical Root Cause Analysis and CAPA Governance under ICH Q7, Q9 & Q10.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/new-investigation')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Investigation
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow transition-shadow space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? <span className="animate-pulse">--</span> : kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Investigations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Investigations Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Recent Manufacturing Investigations
            </h2>
            <button
              onClick={() => navigate('/investigations')}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              View all investigations
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading records...</div>
            ) : !stats?.recent_investigations || stats.recent_investigations.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">No Investigations Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Get started by creating your first deviation investigation or loading realistic sample data.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleSeedDemo}
                    disabled={seeding}
                    className="px-3 py-1.5 border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {seeding ? 'Seeding...' : 'Load Demo Scenarios (API-001)'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Investigation ID</th>
                      <th className="py-3 px-4">Title & Product</th>
                      <th className="py-3 px-3">Batch Lot</th>
                      <th className="py-3 px-3">Severity</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">CAPAs</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recent_investigations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-teal-700">
                          {inv.id}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">{inv.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{inv.product_name}</p>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {inv.batch_number}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={inv.severity} type="severity" size="xs" />
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={inv.status} type="status" size="xs" />
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {inv.capa_count} Actions
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => navigate(`/investigations/${inv.id}`)}
                            className="text-teal-600 hover:text-teal-700 font-medium p-1 hover:bg-teal-50 rounded"
                            title="Open investigation"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Audit Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Audit Trail & Activity
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
            {!stats?.recent_activity || stats.recent_activity.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No recent activity recorded.
              </p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {stats.recent_activity.slice(0, 6).map((act, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white"></span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{act.action}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{act.details || act.action}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span>{act.performed_by}</span>
                        <span>•</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Guidance Box */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>ICH Q10 Quality Governance</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Ensure forensic data items are gathered before convening the investigation committee.
              All AI outputs require verification by a Qualified Person.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
