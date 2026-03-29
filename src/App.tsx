import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ReconLab from './components/ReconLab';
import ProgramFeed from './components/ProgramFeed';
import ReportArchitect from './components/ReportArchitect';
import Settings from './components/Settings';
import DiscordRecon from './components/DiscordRecon';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vpnActive, setVpnActive] = useState(false);
  const [sharedAnalysis, setSharedAnalysis] = useState<any>(null);
  const [reportHistory, setReportHistory] = useState<any[]>([]);

  const handleSendToReport = (analysis: any) => {
    setSharedAnalysis(analysis);
    setActiveTab('reports');
  };

  const handleSaveReport = (report: any) => {
    setReportHistory(prev => [report, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard vpnActive={vpnActive} />;
      case 'recon':
        return <ReconLab vpnActive={vpnActive} onSendToReport={handleSendToReport} />;
      case 'discord':
        return <DiscordRecon />;
      case 'programs':
        return <ProgramFeed />;
      case 'reports':
        return (
          <ReportArchitect 
            initialAnalysis={sharedAnalysis} 
            onSaveReport={handleSaveReport}
            history={reportHistory}
          />
        );
      case 'settings':
        return <Settings vpnActive={vpnActive} setVpnActive={setVpnActive} />;
      default:
        return <Dashboard vpnActive={vpnActive} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} vpnActive={vpnActive} />
      
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* v4.0 Badge */}
        <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
          <div className="px-3 py-1 bg-black/60 border border-neutral-800 rounded-full backdrop-blur-md flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">BountyBot_OS_v4.0.2</span>
          </div>
        </div>

        {/* Scanlines Overlay for technical feel */}
        <div className="pointer-events-none absolute inset-0 z-50 opacity-[0.03] overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
      </main>
    </div>
  );
}
