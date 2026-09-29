import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { SeverityBadge, StatusBadge } from '../components/SeverityBadge';
import ResolveModal from '../components/ResolveModal';
import MemoryToggle from '../components/MemoryToggle';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Brain, 
  ArrowLeft, 
  RefreshCw, 
  Sparkles,
  Calendar,
  Server,
  FileText
} from 'lucide-react';
import { api } from '../api';

export default function IncidentDetailsPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [memoryToggle, setMemoryToggle] = useState(true);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const data = await api.getIncidentById(id);
        setIncident(data);
        setMemoryToggle(data.memory_used ?? true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  const handleReanalyze = async (memoryVal) => {
    setReanalyzing(true);
    try {
      const res = await api.reanalyzeIncident(id, memoryVal);
      setIncident(res.incident);
    } catch (err) {
      console.error(err);
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#0B0F17] flex items-center justify-center min-h-screen text-slate-400">
        Loading incident details...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex-1 bg-[#0B0F17] p-6 text-center text-slate-400 min-h-screen">
        Incident not found.
      </div>
    );
  }

  const analysis = incident.latest_analysis || {};

  return (
    <div className="flex-1 min-h-screen bg-[#0B0F17] flex flex-col pb-16">
      <Header title={`Incident Detail: ${incident.id}`} subtitle={incident.title} />

      <main className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Back navigation */}
        <Link to="/incidents" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
        </Link>

        {/* Top Header Card */}
        <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-blue-400">{incident.id}</span>
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
              <h2 className="text-xl font-bold text-white">{incident.title}</h2>
            </div>

            {incident.status !== 'Resolved' && (
              <button
                onClick={() => setResolveOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                MARK AS RESOLVED & TEACH RECALL-X
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
              <span className="text-slate-200 font-semibold">{incident.incident_type}</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Affected Host</span>
              <span className="text-slate-200 font-mono font-semibold">{incident.affected_system}</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Created Date</span>
              <span className="text-slate-200 font-mono">{new Date(incident.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div>
              <h4 className="text-xs font-bold text-slate-300">Description</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{incident.description}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-300">Observed Indicators</h4>
              <p className="text-xs font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-blue-300 mt-1">
                {incident.observed_indicators}
              </p>
            </div>
          </div>
        </div>

        {/* Resolved Experience Banner if Resolved */}
        {incident.status === 'Resolved' && (
          <div className="bg-gradient-to-r from-emerald-950/70 via-[#131B2A] to-purple-950/70 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Retained Organizational Experience</h3>
                <p className="text-xs text-emerald-300">This incident experience is retained in Hindsight memory bank.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <strong className="text-slate-300">Confirmed Root Cause:</strong>
                <p className="text-slate-400 mt-1">{incident.confirmed_root_cause}</p>
              </div>

              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-900/40 text-amber-200">
                <strong>Failed Actions:</strong>
                <p className="mt-1">{incident.actions_failed || 'None'}</p>
              </div>

              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/40 text-emerald-200">
                <strong>Successful Remediation:</strong>
                <p className="mt-1">{incident.successful_remediation}</p>
              </div>

              <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-900/40 text-purple-200">
                <strong>Lessons Learned:</strong>
                <p className="mt-1">{incident.lessons_learned}</p>
              </div>
            </div>
          </div>
        )}

        {/* Re-Analyze Control */}
        <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-bold text-white text-base">Re-Run AI Reasoning Engine</h3>
            <div className="flex items-center gap-3">
              <MemoryToggle
                enabled={memoryToggle}
                onChange={(val) => {
                  setMemoryToggle(val);
                  handleReanalyze(val);
                }}
              />
            </div>
          </div>

          {reanalyzing && (
            <div className="p-4 bg-purple-950/50 border border-purple-500/30 rounded-xl text-center text-xs text-purple-300 animate-pulse flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              Re-analyzing incident with Hindsight memory state...
            </div>
          )}
        </div>

        {/* AI Analysis Display */}
        {analysis.summary && (
          <div className="space-y-6">
            {/* Assessment */}
            <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">AI Assessment</h3>
                <span className="text-xs text-purple-300 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">
                  Confidence: {analysis.confidence}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Memory Recalled */}
            {analysis.memory_used && (
              <div className="bg-gradient-to-br from-[#131B2A] to-purple-950/30 border border-purple-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-base">Recalled Organizational Memories</h3>
                </div>

                <div className="space-y-3">
                  {analysis.recalled_incidents?.map((mem, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-purple-300 font-mono">{mem.incident_id}</span>
                        <span className="text-slate-200">{mem.incident_title}</span>
                      </div>
                      <p className="text-slate-400 italic">{mem.relevance_explanation}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                        <div className="bg-red-950/40 p-2 rounded text-red-300">
                          <strong>Failed:</strong> {mem.failed_actions || 'None'}
                        </div>
                        <div className="bg-emerald-950/40 p-2 rounded text-emerald-300">
                          <strong>Worked:</strong> {mem.successful_remediation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Memory Influence Explanation */}
            <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Memory Influence Explanation
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                {analysis.memory_influence}
              </p>
            </div>
          </div>
        )}

        {toastMsg && (
          <div className="p-4 bg-emerald-950 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
            {toastMsg}
          </div>
        )}

        {/* Modal */}
        {resolveOpen && (
          <ResolveModal
            incident={incident}
            isOpen={resolveOpen}
            onClose={() => setResolveOpen(false)}
            onSuccess={(res) => {
              setToastMsg(res.message);
              setIncident({ ...incident, status: 'Resolved' });
            }}
          />
        )}
      </main>
    </div>
  );
}
