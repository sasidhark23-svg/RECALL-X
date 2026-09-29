import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { SeverityBadge, StatusBadge } from '../components/SeverityBadge';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Brain, 
  PlusCircle, 
  ArrowRight, 
  Activity,
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { api } from '../api';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [memoryActivities, setMemoryActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [incRes, anaRes, memRes] = await Promise.all([
          api.getIncidents(),
          api.getAnalytics(),
          api.getMemoryActivity()
        ]);
        setIncidents(incRes || []);
        setAnalytics(anaRes || null);
        setMemoryActivities(memRes || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const chartData = analytics ? [
    { name: 'Critical', value: analytics.incidents_by_severity['Critical'] || 0, color: '#EF4444' },
    { name: 'High', value: analytics.incidents_by_severity['High'] || 0, color: '#F59E0B' },
    { name: 'Medium', value: analytics.incidents_by_severity['Medium'] || 0, color: '#EAB308' },
    { name: 'Low', value: analytics.incidents_by_severity['Low'] || 0, color: '#3B82F6' },
  ] : [];

  return (
    <div className="flex-1 min-h-screen bg-[#0B0F17] flex flex-col pb-12">
      <Header title="SOC Dashboard" subtitle="Real-time incident intelligence & organizational memory overview" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner with Quick Action */}
        <div className="bg-gradient-to-r from-blue-950/60 via-[#131B2A] to-purple-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                Persistent Memory Engine Active
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">RECALL-X Incident Intelligence</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Unlike traditional SOC tools, RECALL-X retains root causes, failed actions, and successful remediation steps from every resolved incident into Hindsight memory.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/demo-mode"
              className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs rounded-xl border border-purple-500/40 flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4 text-purple-400" />
              60s Demo Mode
            </Link>
            <Link
              to="/new-incident"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Incident
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#131B2A] border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-semibold text-slate-400">Active Incidents</p>
              <h3 className="text-2xl font-bold text-white mt-1">{analytics?.active_incidents ?? 0}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#131B2A] border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-semibold text-slate-400">Resolved Incidents</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{analytics?.resolved_incidents ?? 0}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#131B2A] border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-semibold text-slate-400">High / Critical</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{analytics?.high_critical_incidents ?? 0}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#131B2A] border border-slate-800 p-5 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs font-semibold text-slate-400">Memories Learned</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{analytics?.memories_learned ?? 0}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Brain className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Incidents Table */}
          <div className="lg:col-span-2 bg-[#131B2A] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">Recent Incidents</h3>
                <Link to="/incidents" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold">
                  View All Incidents <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800/80 uppercase text-[10px] font-bold">
                      <th className="pb-3 px-2">ID</th>
                      <th className="pb-3 px-2">Title</th>
                      <th className="pb-3 px-2">Type</th>
                      <th className="pb-3 px-2">Severity</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Memory Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {incidents.slice(0, 6).map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-2 font-mono text-blue-400 font-bold">
                          <Link to={`/incidents/${inc.id}`} className="hover:underline">
                            {inc.id}
                          </Link>
                        </td>
                        <td className="py-3 px-2 font-medium text-slate-200 max-w-[220px] truncate">
                          <Link to={`/incidents/${inc.id}`} className="hover:text-blue-300">
                            {inc.title}
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-slate-400">{inc.incident_type}</td>
                        <td className="py-3 px-2">
                          <SeverityBadge severity={inc.severity} />
                        </td>
                        <td className="py-3 px-2">
                          <StatusBadge status={inc.status} />
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            inc.memory_used
                              ? 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            <Brain className="w-3 h-3" />
                            {inc.memory_used ? 'ON' : 'OFF'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Incident Severity Distribution Chart */}
          <div className="bg-[#131B2A] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 mb-4">
                Incidents by Severity
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#F8FAFC' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Memory Activity Timeline */}
        <div className="bg-[#131B2A] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-800">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">Recent Memory Activity (Hindsight Engine)</h3>
          </div>

          <div className="space-y-3">
            {memoryActivities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <div className={`p-1.5 rounded-md mt-0.5 text-xs font-bold ${
                  act.action_type === 'RETAIN' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                    : act.action_type === 'RECALL'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {act.action_type}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-200 font-medium">{act.details}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Target: <span className="font-mono text-slate-400">{act.incident_id}</span> • {new Date(act.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
