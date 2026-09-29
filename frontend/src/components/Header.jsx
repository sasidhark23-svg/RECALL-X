import React, { useEffect, useState } from 'react';
import { Brain, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../api';

export default function Header({ title, subtitle }) {
  const [memoryStatus, setMemoryStatus] = useState('ACTIVE');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await api.getHealth();
        setMemoryStatus(data.hindsight_memory_status || 'ACTIVE');
        if (data.groq_model) setGroqModel(data.groq_model);
      } catch (err) {
        setMemoryStatus('UNAVAILABLE');
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0B0F17]/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Groq Model Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>Model: <span className="font-mono text-blue-300">{groqModel}</span></span>
        </div>

        {/* Hindsight Status Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          memoryStatus === 'ACTIVE' 
            ? 'bg-purple-950/60 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-900/20'
            : memoryStatus === 'DISABLED'
            ? 'bg-slate-800 text-slate-400 border-slate-700'
            : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
        }`}>
          <Brain className={`w-3.5 h-3.5 ${memoryStatus === 'ACTIVE' ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
          <span>Hindsight Memory: <strong className="uppercase">{memoryStatus}</strong></span>
        </div>
      </div>
    </header>
  );
}
