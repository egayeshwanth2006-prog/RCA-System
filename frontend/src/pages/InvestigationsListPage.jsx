import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  FileSearch,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Trash2,
  Edit,
  RotateCcw,
  Sparkles,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { getInvestigations, deleteInvestigation, seedDemoData } from '../services/api';
import { setFullInvestigation, setNotification } from '../redux/rcaSlice';

export const InvestigationsListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); // desc | asc

  const fetchList = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        severity: severityFilter !== 'All' ? severityFilter : undefined,
        sort: sortOrder
      };
      const data = await getInvestigations(params);
      setInvestigations(data);
    } catch (err) {
      console.error('Failed to load investigations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [statusFilter, severityFilter, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchList();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete investigation ${id}?`)) return;

    try {
      await deleteInvestigation(id);
      dispatch(setNotification({
        type: 'info',
        message: `Investigation ${id} deleted.`
      }));
      fetchList();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSeedDemo = async () => {
    try {
      await seedDemoData();
      fetchList();
      dispatch(setNotification({
        type: 'success',
        message: 'Sample demo scenarios loaded successfully.'
      }));
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pharmaceutical Investigations Archive</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {investigations.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and review verified deviation investigations persisted in PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDemo}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Seed Sample Incidents
          </button>
          <button
            onClick={() => navigate('/new-investigation')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            New Investigation
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[280px] max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, title, product name, or batch lot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          {/* Severity */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-medium outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Structured Investigations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading records...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600">Error loading data: {error}</div>
        ) : investigations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileSearch className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No matching investigations found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or create a new investigation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Investigation ID</th>
                  <th className="py-3.5 px-4">Investigation Title & Product</th>
                  <th className="py-3.5 px-3">Batch Number</th>
                  <th className="py-3.5 px-3">Severity</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {investigations.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/investigations/${inv.id}`)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700 whitespace-nowrap">
                      {inv.id}
                    </td>

                    {/* Title & Product */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                        {inv.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {inv.product_name}
                      </p>
                    </td>

                    {/* Batch Number */}
                    <td className="py-3.5 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {inv.batch_number}
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={inv.severity} type="severity" size="xs" />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={inv.status} type="status" size="xs" />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/investigations/${inv.id}`)}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(inv.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestigationsListPage;
