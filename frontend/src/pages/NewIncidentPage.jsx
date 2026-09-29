import React, { useState } from 'react';
import Header from '../components/Header';
import MemoryToggle from '../components/MemoryToggle';
import { SeverityBadge } from '../components/SeverityBadge';
import ResolveModal from '../components/ResolveModal';
import { 
  Sparkles, 
  Brain, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';
import { api } from '../api';

const INCIDENT_TYPES = [
  "Suspicious Login",
  "Credential Compromise",
  "Phishing",
  "Malware",
  "Suspicious PowerShell",
  "Privilege Escalation",
  "Data Exfiltration",
  "Abnormal Network Traffic",
  "Other"
];

export default function NewIncidentPage() {
  const [formData, setFormData] = useState({
    title: '',
    incident_type: 'Credential Compromise',
    description: '',
    affected_system: '',
    observed_indicators: '',
    severity: 'High',
    memory_enabled: true
  });

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState(null);
  const [createdIncident, setCreatedIncident] = useState(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveSuccessMsg, setResolveSuccessMsg] = useState('');

  const stages = [
    "Analyzing incident indicators...",
    "Searching Hindsight organizational memory...",
    "Comparing previous root causes & failed remediations...",
    "Generating AI assessment & recommendations..."
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStage(0);
    setResult(null);

    // Simulate animated loading stages
    const timer1 = setTimeout(() => setLoadingStage(1), 600);
    const timer2 = setTimeout(() => setLoadingStage(2), 1200);
    const timer3 = setTimeout(() => setLoadingStage(3), 1800);

    try {
      const res = await api.createIncident(formData);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setCreatedIncident(res.incident);
      setResult(res.analysis);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze incident. Please check server logs.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefillDemo = () => {
    setFormData({
      title: "500 failed login attempts followed by successful login from unknown IP",
      incident_type: "Credential Compromise",
      description: "Security logs show 500 authentication failures on employee account 'jdoe', followed by a successful login from external IP 198.51.100.45 (ASN Unassigned). Within 3 minutes, outbound TLS traffic on port 8443 to suspicious domain target-c2.net was initiated.",
      affected_system: "Auth Service / Employee Workstation WS-8942",
      observed_indicators: "IP: 198.51.100.45, Account: jdoe, Domain: target-c2.net, Port: 8443, 500 Failed Auth Events",
      severity: "High",
      memory_enabled: true
    });
  };

  return (
    <div className="flex-1 min-h-screen bg-[#0B0F17] flex flex-col pb-16">
      <Header title="New Incident Analysis" subtitle="Submit threat details to RECALL-X reasoning pipeline" />

      <main className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Form Card */}
        <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-white text-lg">Submit Security Incident</h2>
              <p className="text-xs text-slate-400">Provide observed indicators and symptoms for AI incident assessment.</p>
            </div>
            <button
              type="button"
              onClick={handlePrefillDemo}
              className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Fill Demo Incident
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Prominent Memory Toggle */}
            <MemoryToggle
              enabled={formData.memory_enabled}
              onChange={(val) => setFormData({ ...formData, memory_enabled: val })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Incident Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 500 failed login attempts followed by successful login"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Incident Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.incident_type}
                  onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Affected System <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.affected_system}
                  onChange={(e) => setFormData({ ...formData, affected_system: e.target.value })}
                  placeholder="e.g. Active Directory / Auth Service / WS-8942"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Severity (AI will reassess)
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description & Symptoms <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what occurred, timeline, user actions, or security alerts triggered..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observed Indicators (IPs, Hashes, Domains, Accounts) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.observed_indicators}
                onChange={(e) => setFormData({ ...formData, observed_indicators: e.target.value })}
                placeholder="e.g. IP: 198.51.100.45, User: jdoe, Domain: target-c2.net"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-bold text-xs text-white transition flex items-center gap-2 shadow-xl ${
                  formData.memory_enabled
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/30'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
                }`}
              >
                {formData.memory_enabled ? <Brain className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                ANALYZE INCIDENT {formData.memory_enabled ? '(WITH HINDSIGHT MEMORY)' : '(MEMORY OFF)'}
              </button>
            </div>
          </form>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-8 text-center shadow-xl space-y-4">
            <div className="inline-flex p-4 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 animate-spin">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Processing RECALL-X Reasoning Pipeline</h3>
              <p className="text-xs text-purple-300 mt-1 font-mono">{stages[loadingStage]}</p>
            </div>
            <div className="w-full max-w-md mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-500"
                style={{ width: `${((loadingStage + 1) / stages.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Resolution Toast */}
        {resolveSuccessMsg && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{resolveSuccessMsg}</span>
            </div>
            <button onClick={() => setResolveSuccessMsg('')} className="text-emerald-400 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Analysis Result Display */}
        {result && (
          <div className="space-y-6">
            {/* Resolution Banner */}
            {createdIncident && createdIncident.status !== 'Resolved' && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Incident Created: <strong className="font-mono text-blue-400">{createdIncident.id}</strong></span>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Ready to resolve and retain this experience?</p>
                </div>
                <button
                  onClick={() => setResolveOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  MARK AS RESOLVED & TEACH RECALL-X
                </button>
              </div>
            )}

            {/* A. Incident Assessment */}
            <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-blue-400" />
                  <h3 className="font-bold text-white text-base">A. Incident Assessment</h3>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={result.severity} />
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {result.category}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{result.summary}</p>
                <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/40 border border-purple-800/40 p-2.5 rounded-lg">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Confidence: <strong>{result.confidence}</strong></span>
                </div>
              </div>
            </div>

            {/* B. Hindsight Memory Section */}
            <div className={`border rounded-2xl p-6 shadow-xl space-y-4 ${
              result.memory_used
                ? 'bg-gradient-to-br from-[#131B2A] to-purple-950/30 border-purple-500/40'
                : 'bg-[#131B2A] border-slate-800'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <Brain className={`w-6 h-6 ${result.memory_used ? 'text-purple-400' : 'text-slate-500'}`} />
                  <div>
                    <h3 className="font-bold text-white text-base">B. Hindsight Memory Recall</h3>
                    <p className="text-xs text-slate-400">
                      {result.memory_used
                        ? 'Relevant organizational incident experience retrieved from Hindsight'
                        : 'Memory disabled for this analysis'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${
                  result.memory_used
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {result.memory_used ? 'MEMORY ON' : 'MEMORY OFF'}
                </span>
              </div>

              {result.memory_used && result.recalled_incidents.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-purple-300">
                    Relevant Past Experience Recalled ({result.recalled_incidents.length} matching incident):
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {result.recalled_incidents.map((mem, idx) => (
                      <div key={idx} className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-purple-300">{mem.incident_id}</span>
                          <span className="text-xs font-bold text-slate-200">{mem.incident_title}</span>
                        </div>
                        <p className="text-xs text-slate-400 italic">{mem.relevance_explanation}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                          <div className="bg-red-950/40 border border-red-900/40 p-2 rounded text-red-300">
                            <strong>Previous Unsuccessful Action:</strong>
                            <p className="mt-0.5 text-[11px]">{mem.failed_actions || 'None'}</p>
                          </div>
                          <div className="bg-emerald-950/40 border border-emerald-900/40 p-2 rounded text-emerald-300">
                            <strong>Previous Successful Remediation:</strong>
                            <p className="mt-0.5 text-[11px]">{mem.successful_remediation}</p>
                          </div>
                        </div>

                        <div className="bg-purple-950/30 border border-purple-800/30 p-2 rounded text-xs text-purple-200">
                          <strong>Lesson Learned:</strong> {mem.lessons_learned}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/60 rounded-xl text-xs text-slate-400 italic">
                  {result.memory_used
                    ? 'No sufficiently relevant organizational memory was found.'
                    : 'Memory disabled for this analysis.'}
                </div>
              )}
            </div>

            {/* C. Recommended Response */}
            <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">
                C. Recommended Response Playbook
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-red-400 uppercase text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Immediate Containment
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {result.immediate_containment.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-blue-400 uppercase text-[11px] flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Investigation Steps
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {result.investigation_steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Remediation Actions
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {result.remediation_steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-purple-400 uppercase text-[11px] flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" /> Recovery & Follow-Up
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {result.recovery_steps.concat(result.follow_up).map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* D. Memory-Influenced Reasoning */}
            <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                D. Memory-Influenced Reasoning
              </h3>

              <div className="p-4 bg-slate-900/90 rounded-xl border border-purple-500/30 text-xs text-slate-200 leading-relaxed font-medium">
                {result.memory_influence}
              </div>
            </div>
          </div>
        )}

        {/* Modal for resolution */}
        {resolveOpen && (
          <ResolveModal
            incident={createdIncident}
            isOpen={resolveOpen}
            onClose={() => setResolveOpen(false)}
            onSuccess={(res) => {
              setResolveSuccessMsg(res.message);
              if (createdIncident) {
                setCreatedIncident({ ...createdIncident, status: 'Resolved' });
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
