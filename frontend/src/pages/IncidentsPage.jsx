import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { SeverityBadge, StatusBadge } from '../components/SeverityBadge';
import { ShieldAlert, Search, Filter, Brain, ArrowUpRight } from 'lucide-react';
import { api } from '../api';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIncidents() {
      setLoading(true);
      try {
        const data = await api.getIncidents(statusFilter, severityFilter);
        setIncidents(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchIncidents();
  }, [statusFilter, severityFilter]);

  const filtered = incidents.filter((inc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.id.toLowerCase().includes(q) ||
      inc.title.toLowerCase().includes(q) ||
      inc.incident_type.toLowerCase().includes(q) ||
      inc.affected_system.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 min-h-screen bg-[#0B0F17] flex flex-col pb-12">
      <Header title="Incident History" subtitle="Full database of operational incident records" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Filter Controls */}
        <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by ID, title, type, host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              <span className="text-[10px] text-slate-500 font-bold px-2 uppercase">Status:</span>
              {['All', 'Active', 'Resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
              <span className="text-[10px] text-slate-500 font-bold px-2 uppercase">Severity:</span>
              {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    severityFilter === sev
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold">
                  <th className="pb-3 px-3">Incident ID</th>
                  <th className="pb-3 px-3">Title</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Affected System</th>
                  <th className="pb-3 px-3">Severity</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Memory Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3 font-mono text-blue-400 font-bold">
                      <Link to={`/incidents/${inc.id}`} className="hover:underline flex items-center gap-1">
                        {inc.id}
                        <ArrowUpRight className="w-3 h-3 text-slate-500" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-100 max-w-xs truncate">
                      <Link to={`/incidents/${inc.id}`} className="hover:text-blue-300">
                        {inc.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-medium">{inc.incident_type}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-400 text-[11px]">{inc.affected_system}</td>
                    <td className="py-3.5 px-3">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(inc.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        inc.memory_used
                          ? 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        <Brain className="w-3 h-3 text-purple-400" />
                        {inc.memory_used ? 'ON' : 'OFF'}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500 italic">
                      No matching incidents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
