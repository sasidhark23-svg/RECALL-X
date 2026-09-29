import React from 'react';
import { Brain, Zap, ShieldOff, Sparkles } from 'lucide-react';

export default function MemoryToggle({ enabled, onChange, size = 'md' }) {
  return (
    <div className="bg-[#131B2A] border border-slate-800 p-4 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${
            enabled 
              ? 'bg-purple-600/20 border-purple-500/40 text-purple-400' 
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            {enabled ? <Brain className="w-6 h-6 animate-pulse" /> : <ShieldOff className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">Hindsight Persistent Memory</h3>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                enabled 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {enabled ? 'MEMORY ON' : 'MEMORY OFF'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {enabled
                ? 'Recalls previous incident symptoms, failed actions & proven remedies from Hindsight memory bank.'
                : 'Standard baseline analysis using only LLM + current incident indicators without historical memory.'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
            enabled ? 'bg-purple-600' : 'bg-slate-700'
          }`}
        >
          <span className="sr-only">Toggle Hindsight Memory</span>
          <span
            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
              enabled ? 'translate-x-8 text-purple-600' : 'translate-x-0 text-slate-500'
            }`}
          >
            {enabled ? <Sparkles className="w-4 h-4" /> : <ShieldOff className="w-3.5 h-3.5" />}
          </span>
        </button>
      </div>
    </div>
  );
}
