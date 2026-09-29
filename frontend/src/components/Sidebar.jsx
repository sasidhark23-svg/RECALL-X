import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ShieldAlert, 
  Brain, 
  BarChart3, 
  Zap, 
  Shield 
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/new-incident', label: 'New Incident', icon: PlusCircle },
    { path: '/incidents', label: 'Incidents', icon: ShieldAlert },
    { path: '/memory', label: 'Memory', icon: Brain },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/demo-mode', label: 'Demo Mode', icon: Zap, badge: '60s Demo' },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-wider text-white">RECALL-X</h1>
              <p className="text-[11px] text-slate-400 font-medium">SOC Agent with Hindsight</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-1 text-slate-300 font-medium">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>Hindsight Vectorize</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Learns root causes & remediation from resolved incidents.
          </p>
        </div>
      </div>
    </aside>
  );
}
