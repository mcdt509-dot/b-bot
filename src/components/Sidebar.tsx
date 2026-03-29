import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Target, 
  Shield, 
  Terminal,
  Settings,
  LogOut,
  Activity,
  ChevronRight,
  Cpu,
  Zap,
  Lock,
  Unlock,
  Globe
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SystemLog } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  vpnActive: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, vpnActive }: SidebarProps) {
  const [logs, setLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    const initialLogs: SystemLog[] = [
      { id: '1', timestamp: '21:31:17', message: 'Neural engine initialized', type: 'success' },
      { id: '2', timestamp: '21:35:42', message: 'Stripe gateway connected', type: 'info' },
      { id: '3', timestamp: '21:39:46', message: 'System upgrade v4.0 active', type: 'success' },
      { id: '4', timestamp: '21:42:10', message: 'CVSS engine calibrated', type: 'info' },
    ];
    setLogs(initialLogs);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'recon', label: 'AI_RECON_LAB', icon: Terminal },
    { id: 'discord', label: 'DISCORD_RECON', icon: Globe },
    { id: 'programs', label: 'TARGET_PROGRAMS', icon: Target },
    { id: 'reports', label: 'REPORT_ARCHITECT', icon: FileText },
  ];

  return (
    <div className="w-80 border-r border-neutral-900 h-screen flex flex-col bg-[#050505] relative z-50">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />

      <div className="p-8 flex items-center gap-4 border-b border-neutral-900 bg-black/40">
        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] group cursor-pointer transition-transform hover:scale-105">
          <Shield className="text-black w-7 h-7" />
        </div>
        <div className="space-y-0.5">
          <span className="font-bold tracking-tighter text-2xl italic uppercase block leading-none glow-text">BountyBot</span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-[0.3em]">v4.0.2_STABLE</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.4em] mb-6 px-4 flex items-center gap-3">
          <ChevronRight className="w-3 h-3 text-emerald-500" /> Navigation_Matrix
        </div>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden border",
              activeTab === item.id 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                : "text-neutral-500 border-transparent hover:text-white hover:bg-neutral-900/50 hover:border-neutral-800"
            )}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            )}
            <item.icon className={cn(
              "w-5 h-5 transition-all duration-300 group-hover:scale-110", 
              activeTab === item.id ? "text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "text-neutral-600 group-hover:text-emerald-400"
            )} />
            <span className="text-xs font-bold tracking-[0.1em] font-mono">{item.label}</span>
            
            {activeTab === item.id && (
              <div className="ml-auto">
                <Zap className="w-3 h-3 fill-emerald-500 animate-pulse" />
              </div>
            )}
          </button>
        ))}

        <div className="mt-12 space-y-6">
          <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-[0.4em] px-4 flex items-center gap-3">
            <Activity className="w-3 h-3 text-emerald-500" /> System_Live_Log
          </div>
          <div className="space-y-4 px-4 py-4 bg-black/40 border border-neutral-900 rounded-xl">
            {logs.map((log) => (
              <div key={log.id} className="font-mono text-[9px] leading-relaxed group cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-neutral-800">[{log.timestamp}]</span>
                  <div className={cn(
                    "w-1 h-1 rounded-full",
                    log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' :
                    log.type === 'error' ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' :
                    'bg-blue-500 shadow-[0_0_5px_#3b82f6]'
                  )} />
                </div>
                <span className={cn(
                  "block transition-colors",
                  log.type === 'success' ? 'text-emerald-500/60 group-hover:text-emerald-400' :
                  log.type === 'error' ? 'text-red-500/60 group-hover:text-red-400' :
                  'text-blue-500/60 group-hover:text-blue-400'
                )}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-6 border-t border-neutral-900 space-y-3 bg-black/60">
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all group border",
            activeTab === 'settings' 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
              : "text-neutral-500 border-transparent hover:text-white hover:bg-neutral-900/50"
          )}
        >
          <Settings className={cn("w-4 h-4 transition-transform group-hover:rotate-90", activeTab === 'settings' ? "text-emerald-500" : "text-neutral-600")} />
          <span className="text-xs font-bold font-mono tracking-widest">SETTINGS</span>
        </button>
        <button className="w-full flex items-center gap-4 px-5 py-3 text-neutral-600 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group">
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-bold font-mono tracking-widest">TERMINATE_SESSION</span>
        </button>

        {/* VPN Status Widget */}
        <div className={cn(
          "mt-4 p-4 rounded-xl border transition-all duration-500",
          vpnActive 
            ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
            : "bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {vpnActive ? (
                <Lock className="w-3 h-3 text-emerald-500" />
              ) : (
                <Unlock className="w-3 h-3 text-red-500" />
              )}
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase">
                Neural_Tunnel
              </span>
            </div>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              vpnActive ? "bg-emerald-500 shadow-[0_0_5px_#10b981]" : "bg-red-500 shadow-[0_0_5px_#ef4444]"
            )} />
          </div>
          <div className="flex items-center gap-3">
            <Globe className={cn(
              "w-4 h-4",
              vpnActive ? "text-emerald-500 animate-spin-slow" : "text-neutral-700"
            )} />
            <div className="flex flex-col">
              <span className={cn(
                "text-[10px] font-bold font-mono tracking-tighter",
                vpnActive ? "text-emerald-400" : "text-red-400"
              )}>
                {vpnActive ? "SECURE_CONNECTION" : "UNPROTECTED_NODE"}
              </span>
              <span className="text-[8px] font-mono text-neutral-600 uppercase">
                {vpnActive ? "Node: Zurich_01" : "IP: EXPOSED"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
