import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { BarChart3, PieChart as PieChartIcon, Brain, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { api } from '../api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex-1 bg-[#0B0F17] flex items-center justify-center min-h-screen text-slate-400">
        Loading SOC Analytics...
      </div>
    );
  }

  const typeData = Object.entries(analytics.incidents_by_type || {}).map(([type, count]) => ({
    name: type,
    count: count
  }));

  const freqData = Object.entries(analytics.frequently_recalled_categories || {}).map(([cat, count]) => ({
    name: cat,
    count: count
  }));

  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];

  return (
    <div className="flex-1 min-h-screen bg-[#0B0F17] flex flex-col pb-16">
      <Header title="SOC Analytics" subtitle="Quantitative breakdown of security operations & memory utilization" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#131B2A] border border-slate-800 p-5 rounded-2xl shadow-lg">
            <p className="text-xs font-semibold text-slate-400">Total Incidents Analyzed</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{analytics.total_incidents}</h3>
          </div>

          <div className="bg-[#131B2A] border border-slate-800 p-5 rounded-2xl shadow-lg">
            <p className="text-xs font-semibold text-slate-400">Resolved vs Active</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
              {analytics.resolved_incidents} <span className="text-xs text-slate-500 font-normal">/ {analytics.active_incidents} active</span>
            </h3>
          </div>

          <div className="bg-[#131B2A] border border-slate-800 p-5 rounded-2xl shadow-lg">
            <p className="text-xs font-semibold text-slate-400">Memory Assisted Analyses</p>
            <h3 className="text-2xl font-extrabold text-purple-400 mt-1">{analytics.memory_assisted_analyses}</h3>
          </div>

          <div className="bg-[#131B2A] border border-slate-800 p-5 rounded-2xl shadow-lg">
            <p className="text-xs font-semibold text-slate-400">Memories Learned</p>
            <h3 className="text-2xl font-extrabold text-blue-400 mt-1">{analytics.memories_learned}</h3>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incidents by Type Bar Chart */}
          <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Incidents by Type
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <XAxis type="number" stroke="#64748B" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Frequently Recalled Categories */}
          <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Most Frequently Recalled Incident Categories
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={freqData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} angle={-25} textAnchor="end" />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
