import React, { useState } from 'react';
import { FileText, Copy, Check, Loader2, Sparkles, Send, Layout, Shield, Cpu, AlertTriangle, X, ChevronRight } from 'lucide-react';
import { draftReport } from '../services/gemini';
import { AnalysisResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const PLATFORMS = [
  { id: 'h1', name: 'HackerOne', icon: Shield },
  { id: 'bc', name: 'Bugcrowd', icon: Layout },
  { id: 'int', name: 'Intigriti', icon: Cpu },
  { id: 'std', name: 'Standard', icon: FileText }
];

interface ReportArchitectProps {
  initialAnalysis?: AnalysisResult | null;
  onSaveReport?: (report: any) => void;
  history?: any[];
}

export default function ReportArchitect({ initialAnalysis, onSaveReport, history = [] }: ReportArchitectProps) {
  const [programName, setProgramName] = useState('');
  const [vulnerability, setVulnerability] = useState(initialAnalysis?.vulnerability || '');
  const [severity, setSeverity] = useState(initialAnalysis?.severity || 'Medium');
  const [description, setDescription] = useState(initialAnalysis?.description || '');
  const [remediation, setRemediation] = useState(initialAnalysis?.remediation || '');
  const [platform, setPlatform] = useState('h1');
  const [isDrafting, setIsDrafting] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  React.useEffect(() => {
    if (initialAnalysis) {
      setVulnerability(initialAnalysis.vulnerability);
      setSeverity(initialAnalysis.severity);
      setDescription(initialAnalysis.description);
      setRemediation(initialAnalysis.remediation);
    }
  }, [initialAnalysis]);

  const handleDraft = async () => {
    setIsDrafting(true);
    setError(null);
    try {
      const analysis: AnalysisResult = {
        vulnerability,
        severity: severity as any,
        description,
        remediation,
        confidence: 1,
        cvss: severity === 'Critical' ? 9.8 : severity === 'High' ? 8.5 : severity === 'Medium' ? 5.5 : 3.0
      };
      const platformName = PLATFORMS.find(p => p.id === platform)?.name || 'Standard';
      const draftedReport = await draftReport(analysis, programName, platformName);
      setReport(draftedReport);
    } catch (err: any) {
      const errorStr = typeof err === 'string' ? err : JSON.stringify(err);
      const errorMessage = err.message || '';
      const errorCode = err.code || err.status || (err.error && err.error.code);
      
      if (
        errorCode === 429 || 
        errorMessage.includes('429') || 
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorStr.includes('429') ||
        errorStr.includes('RESOURCE_EXHAUSTED')
      ) {
        setError("AI Drafting Engine Rate Limit Exceeded. Please wait a moment before retrying.");
      } else {
        setError("An unexpected error occurred during report generation.");
      }
    } finally {
      setIsDrafting(false);
    }
  };

  const handleFinalize = () => {
    if (!report) return;
    onSaveReport?.({
      id: Date.now(),
      programName,
      vulnerability,
      severity,
      report,
      date: new Date().toISOString()
    });
    setReport('');
    setVulnerability('');
    setDescription('');
    setRemediation('');
    setProgramName('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6 technical-grid overflow-hidden relative">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em]">
            <FileText className="w-3 h-3" /> System_Module: Report_Architect_v4.0
          </div>
          <h1 className="text-4xl font-bold tracking-tighter italic font-mono uppercase glow-text">REPORT_ARCHITECT</h1>
          <p className="text-neutral-500 text-sm font-mono mt-1">AI_DRAFTING_ENGINE // MULTI_PLATFORM_TEMPLATES</p>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 border border-neutral-800 hover:border-emerald-500/50 text-neutral-400 hover:text-emerald-500 font-mono text-[10px] uppercase tracking-widest transition-all rounded-lg flex items-center gap-2"
        >
          <Layout className="w-4 h-4" />
          History ({history.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 space-y-6 overflow-y-auto backdrop-blur-sm custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-3 block">Target_Platform</label>
              <div className="grid grid-cols-4 gap-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-2 ${
                      platform === p.id 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                        : 'bg-black/40 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                    }`}
                  >
                    <p.icon className="w-5 h-5" />
                    <span className="text-[9px] font-mono uppercase tracking-tighter">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Program_Identity</label>
                <input
                  type="text"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g. Google VRP"
                  className="w-full bg-black/60 border border-neutral-800 rounded-lg px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Severity_Rating</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-black/60 border border-neutral-800 rounded-lg px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Vulnerability_Type</label>
              <input
                type="text"
                value={vulnerability}
                onChange={(e) => setVulnerability(e.target.value)}
                placeholder="e.g. Stored XSS in Profile Comments"
                className="w-full bg-black/60 border border-neutral-800 rounded-lg px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Technical_Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of the flaw..."
                className="w-full bg-black/60 border border-neutral-800 rounded-lg px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 outline-none transition-all h-32 resize-none placeholder:text-neutral-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mb-2 block">Remediation_Protocol</label>
              <textarea
                value={remediation}
                onChange={(e) => setRemediation(e.target.value)}
                placeholder="Recommended fix actions..."
                className="w-full bg-black/60 border border-neutral-800 rounded-lg px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 outline-none transition-all h-24 resize-none placeholder:text-neutral-800"
              />
            </div>

            <button
              onClick={handleDraft}
              disabled={isDrafting || !vulnerability || !programName}
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-900 disabled:text-neutral-700 text-black font-bold font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.01] active:scale-[0.99]"
            >
              {isDrafting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Compiling_Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate_Professional_Draft
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm">
          <div className="bg-neutral-800/30 px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-3">
              <FileText className="w-4 h-4 text-emerald-500" /> Draft_Output
            </span>
            {report && (
              <button
                onClick={copyToClipboard}
                className="text-neutral-500 hover:text-white transition-colors flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy_to_Clipboard'}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-black/20 custom-scrollbar">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-mono text-xs flex items-center gap-3 mb-6"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              {!report && !isDrafting && !error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-6"
                >
                  <div className="w-20 h-20 border-2 border-dashed border-neutral-800 rounded-full flex items-center justify-center animate-[spin_15s_linear_infinite]">
                    <FileText className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.4em]">Awaiting generation parameters...</p>
                </motion.div>
              )}

              {isDrafting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="h-8 bg-neutral-800/30 animate-pulse rounded-lg w-3/4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-neutral-800/30 animate-pulse rounded-lg w-full" />
                    <div className="h-4 bg-neutral-800/30 animate-pulse rounded-lg w-5/6" />
                    <div className="h-4 bg-neutral-800/30 animate-pulse rounded-lg w-full" />
                  </div>
                  <div className="h-48 bg-neutral-800/30 animate-pulse rounded-lg w-full" />
                  <div className="space-y-3">
                    <div className="h-4 bg-neutral-800/30 animate-pulse rounded-lg w-2/3" />
                    <div className="h-4 bg-neutral-800/30 animate-pulse rounded-lg w-1/2" />
                  </div>
                </motion.div>
              )}

              {report && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-invert prose-sm max-w-none font-mono text-neutral-400 whitespace-pre-wrap leading-relaxed"
                >
                  {report}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {report && (
            <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 flex justify-end">
              <button 
                onClick={handleFinalize}
                className="px-8 py-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-500/10 transition-all rounded-lg flex items-center gap-3 group"
              >
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                Finalize_and_Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-neutral-800 z-[70] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tighter italic font-mono uppercase text-white">Report_History</h2>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Archived_Drafts</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-4">
                    <FileText className="w-12 h-12 opacity-10" />
                    <p className="font-mono text-[10px] uppercase tracking-widest">No_History_Found</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-3 group hover:border-emerald-500/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setReport(item.report);
                        setProgramName(item.programName);
                        setVulnerability(item.vulnerability);
                        setSeverity(item.severity);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white tracking-tight">{item.vulnerability}</p>
                          <p className="text-[10px] font-mono text-neutral-500 uppercase">{item.programName}</p>
                        </div>
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${
                          item.severity === 'Critical' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                          item.severity === 'High' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' :
                          'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                        }`}>
                          {item.severity}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono text-neutral-600 uppercase">
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span className="group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                          Load_Draft <ChevronRight className="w-2 h-2" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
