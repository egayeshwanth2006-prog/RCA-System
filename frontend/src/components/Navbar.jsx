import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Deviation Review Required',
      desc: 'Batch BATCH-2026-105 OOS impurity exceeds 0.5% limit.',
      time: '12m ago',
      type: 'warning'
    },
    {
      id: 2,
      title: 'CAPA Action Due Soon',
      desc: 'Metrology sensor calibration check due in 3 days.',
      time: '1h ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'AI Causal Synthesis Ready',
      desc: '5 Whys and Ishikawa 6M analysis ready for QP sign-off.',
      time: '3h ago',
      type: 'success'
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/investigations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex-1 max-w-lg">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search deviations by ID, product, batch lot (e.g. BATCH-2026-105)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* AI Model Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[11px] text-teal-800 font-medium">
          <Cpu className="w-3.5 h-3.5 text-teal-600" />
          <span>Groq: llama-3.3-70b-versatile</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] text-teal-600 font-medium">3 unread</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex items-start gap-2">
                      {n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative border-l border-slate-200 pl-4">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 border border-teal-500/30 flex items-center justify-center font-semibold text-xs">
              QP
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                Dr. Marcus Vance
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none">Qualified Person (QP)</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-sm">
                  QP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Dr. Marcus Vance</h4>
                  <p className="text-[11px] text-slate-500">marcus.vance@aivoa.com</p>
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    QP Certified (EU Annex 16)
                  </span>
                </div>
              </div>
              <div className="py-2 text-xs space-y-1 text-slate-600">
                <p className="px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">Department: QA & Release</p>
                <p className="px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">Facility: API Synthesis Plant 2</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-teal-700 font-medium hover:bg-teal-50 rounded transition-colors"
                >
                  System & Groq Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
