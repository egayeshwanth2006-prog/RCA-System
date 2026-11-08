import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  PlusCircle,
  GitBranch,
  ShieldCheck,
  Settings,
  Sparkles,
  Activity,
  Layers,
  FlaskConical
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Investigations', path: '/investigations', icon: FileSearch },
    { name: 'New Investigation', path: '/new-investigation', icon: PlusCircle, highlight: true },
    { name: 'RCA Workspace', path: '/rca-workspace', icon: GitBranch },
    { name: 'CAPA Management', path: '/capa-management', icon: ShieldCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <FlaskConical className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">AIVOA<span className="text-teal-400">.AI</span></span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50">v1.0</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">Pharma Quality RCA Engine</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'
                }`} />
                <span>{item.name}</span>
              </div>
              {item.highlight && !isActive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Quick Links / Pharma Compliance Card */}
        <div className="pt-6 px-2">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-teal-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ICH Guidelines Enforced</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ICH Q7 (APIs), ICH Q9 (Risk Management) & ICH Q10 (Quality Systems) compliant governance.
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300">ICH Q7</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300">ICH Q9</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300">ICH Q10</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300">Annex 16</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-xs bg-slate-950/30">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-[11px]">LangGraph Multi-Step</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">7 Nodes</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
