import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Brain, Search, Sparkles, AlertOctagon, CheckCircle2, History, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function MemoryPage() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [retainedMemories, setRetainedMemories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMemoryData() {
      try {
        const [anaRes, actRes] = await Promise.all([
          api.getAnalytics(),
          api.getMemoryActivity()
        ]);
        setAnalytics(anaRes || null);
        setActivities(actRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMemoryData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await api.searchMemory(query);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const sampleQueries = [
    "Have we seen suspicious PowerShell followed by outbound traffic before?",
    "Password spraying followed by successful login from unknown IP",
    "OAuth consent phishing and mailbox forwarding rules",
    "LSASS memory access and Mimikatz credential dumping"
  ];

  return (
    <div className="flex-1 min-h-screen bg-[#0B0F17] flex flex-col pb-16">
      <Header title="Hindsight Memory Bank" subtitle="Organizational cybersecurity incident experience & vector retrieval" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-950/80 via-[#131B2A] to-blue-950/80 border border-purple-500/40 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">HINDSIGHT MEMORY ENGINE</h2>
              <p className="text-xs text-purple-200">
                Persistent memory powered by Vectorize Hindsight SDK. Store symptoms, root causes, failed remediation attempts, and proven solutions across incident lifecycles.
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-purple-900/40 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-purple-900/30">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Retained Experiences</span>
              <span className="text-xl font-bold text-purple-300 mt-0.5 block">{analytics?.memories_learned ?? 10}</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-purple-900/30">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Memory Assisted Analyses</span>
              <span className="text-xl font-bold text-blue-300 mt-0.5 block">{analytics?.memory_assisted_analyses ?? 12}</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-purple-900/30">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Hindsight Status</span>
              <span className="text-xl font-bold text-emerald-400 mt-0.5 block uppercase">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Search Memory Bar */}
        <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base">Ask Organizational Memory...</h3>

          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Have we seen suspicious PowerShell followed by outbound traffic before?"
                className="w-full bg-slate-900 border border-purple-500/40 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-purple-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-900/30 transition shrink-0"
            >
              <Brain className="w-4 h-4" />
              {searching ? 'Querying...' : 'RECALL'}
            </button>
          </form>

          {/* Sample Queries */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[10px] uppercase text-slate-500 font-bold">Sample Queries:</span>
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(sq)}
                className="text-[11px] text-purple-300 bg-purple-950/40 border border-purple-800/40 hover:bg-purple-900/60 px-2.5 py-1 rounded-lg transition text-left truncate max-w-xs"
              >
                "{sq}"
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Display */}
        {searchResults && (
          <div className="bg-[#131B2A] border border-purple-500/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Memory Recall Results ({searchResults.count} matching experiences)
              </h3>
              <span className="text-xs text-purple-300 font-mono">Status: {searchResults.status}</span>
            </div>

            {searchResults.memories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.memories.map((mem, i) => (
                  <div key={i} className="p-4 bg-slate-900 border border-purple-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-purple-300">{mem.incident_id}</span>
                      <span className="text-xs font-bold text-slate-100">{mem.title}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <strong className="text-slate-400 block text-[10px] uppercase">Symptoms / Description:</strong>
                        <p className="text-slate-300 mt-1">{mem.symptoms}</p>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <strong className="text-slate-400 block text-[10px] uppercase">Confirmed Root Cause:</strong>
                        <p className="text-slate-300 mt-1">{mem.root_cause}</p>
                      </div>

                      <div className="bg-red-950/40 p-3 rounded-lg border border-red-900/40 text-red-300">
                        <strong className="block text-[10px] uppercase">Failed Approach:</strong>
                        <p className="mt-1">{mem.failed_actions || 'None'}</p>
                      </div>

                      <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/40 text-emerald-300">
                        <strong className="block text-[10px] uppercase">Successful Remediation:</strong>
                        <p className="mt-1">{mem.successful_remediation}</p>
                      </div>
                    </div>

                    <div className="bg-purple-950/40 p-3 rounded-lg border border-purple-800/40 text-xs text-purple-200">
                      <strong>Lesson Learned:</strong> {mem.lessons_learned}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No matching memory experiences found for this query.</p>
            )}
          </div>
        )}

        {/* Retained Memory Activity Log */}
        <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Recent Hindsight Memory Activity Log
          </h3>

          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-3 text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  act.action_type === 'RETAIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  {act.action_type}
                </span>
                <div className="flex-1">
                  <p className="text-slate-200 font-medium">{act.details}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
