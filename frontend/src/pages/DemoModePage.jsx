import React, { useState } from 'react';
import Header from '../components/Header';
import { 
  Zap, 
  Brain, 
  ShieldOff, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Shield,
  RotateCcw
} from 'lucide-react';
import { api } from '../api';

export default function DemoModePage() {
  const [running, setRunning] = useState(false);
  const [demoData, setDemoData] = useState(null);

  const handleRunDemo = async () => {
    setRunning(true);
    setDemoData(null);
    try {
      const res = await api.runDemo("Suspicious authentication activity");
      setDemoData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#0B0F17] flex flex-col pb-16">
      <Header title="60-Second Demo Mode" subtitle="Side-by-side comparison demonstrating the power of Hindsight persistent memory" />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Intro Card */}
        <div className="bg-gradient-to-r from-purple-950/80 via-[#131B2A] to-blue-950/80 border border-purple-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                  Interactive Hackathon Demo Scenario
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">Scenario: Suspicious Authentication Activity</h2>
              <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
                500 failed login attempts followed by a successful login from an unknown IP, then unusual outbound TLS traffic to target-c2.net.
              </p>
            </div>

            <button
              onClick={handleRunDemo}
              disabled={running}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-sm rounded-xl flex items-center gap-2.5 shadow-xl shadow-purple-950/50 transition shrink-0"
            >
              {running ? (
                <>
                  <Brain className="w-5 h-5 animate-spin text-purple-300" />
                  Running Reasoning Engine...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  RUN 60s DEMO COMPARISON
                </>
              )}
            </button>
          </div>
        </div>

        {/* Demo Execution Output */}
        {demoData && (
          <div className="space-y-6">
            {/* Highlights Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stage 1: WITHOUT MEMORY */}
              <div className="bg-[#131B2A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldOff className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-white text-base">WITHOUT MEMORY (MEMORY OFF)</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Baseline LLM
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                    <strong className="text-slate-400 block mb-1">Approach:</strong>
                    {demoData.comparison_highlights.without_memory.approach}
                  </div>

                  <div className="p-3 bg-red-950/40 rounded-xl border border-red-900/40 text-red-300">
                    <strong className="block mb-1 font-bold flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-400" /> Flaw / Pitfall:
                    </strong>
                    {demoData.comparison_highlights.without_memory.flaw}
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-blue-400 block">Recommended Containment:</strong>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {demoData.memory_off.immediate_containment.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 italic">
                    {demoData.memory_off.memory_influence}
                  </div>
                </div>
              </div>

              {/* Stage 2: WITH HINDSIGHT MEMORY */}
              <div className="bg-gradient-to-br from-[#131B2A] to-purple-950/40 border border-purple-500/50 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                    <h3 className="font-bold text-white text-base">WITH HINDSIGHT MEMORY (MEMORY ON)</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Experience Informed
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/40 text-purple-200">
                    <strong className="text-purple-300 block mb-1">Approach:</strong>
                    {demoData.comparison_highlights.with_hindsight.approach}
                  </div>

                  <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-900/40 text-emerald-300">
                    <strong className="block mb-1 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Advantage:
                    </strong>
                    {demoData.comparison_highlights.with_hindsight.advantage}
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-purple-500/30 space-y-1">
                    <strong className="text-purple-300 block">Recalled Past Experience (INC-003):</strong>
                    <p className="text-slate-300">
                      <strong>Failed previously:</strong> Blocking IP failed because attackers rotated egress proxies.
                    </p>
                    <p className="text-emerald-300 mt-1">
                      <strong>Worked previously:</strong> Account disablement + OAuth session revocation + forced MFA.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-purple-200 leading-relaxed">
                    <strong>Reasoning Shift:</strong> {demoData.memory_on.memory_influence}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Banner */}
            <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Key Takeaway for Cybersecurity SOCs
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Without memory, every security analyst and AI assistant starts from zero—potentially repeating failed containment steps. With <strong>Hindsight</strong> persistent memory, RECALL-X retains lessons from previous incidents, immediately avoiding past mistakes and applying proven remediation strategies.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
