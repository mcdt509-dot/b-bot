import React, { useState } from 'react';
import { Terminal, ShieldAlert, Zap, Loader2, Send, ChevronRight, AlertTriangle, Target } from 'lucide-react';
import { analyzeVulnerability } from '../services/gemini';
import { AnalysisResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReconLabProps {
  vpnActive: boolean;
  onSendToReport?: (analysis: AnalysisResult) => void;
}

export default function ReconLab({ vpnActive, onSendToReport }: ReconLabProps) {
  const [code, setCode] = useState('');
  const [context, setContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setScanStep(1);
    
    // Simulate multi-stage scanning for "juice"
    const steps = [
      "Initializing Neural Engine...",
      "Parsing Abstract Syntax Tree...",
      "Mapping Data Flow Paths...",
      "Executing Pattern Matching...",
      "Finalizing Vulnerability Report..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setScanStep(i + 1);
      await new Promise(r => setTimeout(r, 800));
    }

    try {
      const analysis = await analyzeVulnerability(code, context);
      setResults(analysis);
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
        setError("Neural Engine Rate Limit Exceeded. Please wait a moment before retrying.");
      } else {
        setError("An unexpected error occurred during analysis.");
      }
    } finally {
      setIsAnalyzing(false);
      setScanStep(0);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6 technical-grid overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em]">
            <Target className="w-3 h-3" /> Target_Analysis_Mode: Active
          </div>
          <h1 className="text-4xl font-bold tracking-tighter italic font-mono uppercase glow-text">AI_RECON_LAB_v4.0</h1>
          <p className="text-neutral-500 text-sm font-mono mt-1">NEURAL_VULN_SCANNER // DEEP_LEARNING_CORE</p>
        </div>
        <div className="flex gap-3">
          {!vpnActive && (
            <div className="px-4 py-2 bg-red-500/5 border border-red-500/20 rounded-lg text-[10px] font-mono text-red-500 uppercase tracking-widest flex items-center gap-3 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              Security_Risk: IP_Exposed
            </div>
          )}
          <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-[10px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            Engine_Online
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        <div className="flex flex-col space-y-6 min-h-0">
          <div className="flex-1 bg-neutral-900/30 border border-neutral-800 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm group">
            <div className="bg-neutral-800/30 px-5 py-3 border-b border-neutral-800 flex justify-between items-center">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-3">
                <Terminal className="w-4 h-4 text-emerald-500" /> Input_Source_Code
              </span>
              <span className="text-[10px] font-mono text-neutral-600 uppercase">TS / JS / PY / GO</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste code snippet or HTTP request here..."
              className="flex-1 bg-transparent p-6 font-mono text-sm text-emerald-400 focus:outline-none resize-none placeholder:text-neutral-800 selection:bg-emerald-500/20"
            />
          </div>

          <div className="h-40 bg-neutral-900/30 border border-neutral-800 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm">
            <div className="bg-neutral-800/30 px-5 py-3 border-b border-neutral-800">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-3">
                <ChevronRight className="w-4 h-4 text-blue-500" /> Context_Metadata
              </span>
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Additional context (e.g. 'This is an endpoint for user profile updates')"
              className="flex-1 bg-transparent p-6 font-mono text-xs text-neutral-400 focus:outline-none resize-none placeholder:text-neutral-800"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-900 disabled:text-neutral-700 text-black font-bold font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.01] active:scale-[0.99]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Executing_Neural_Scan...
              </>
            ) : (
              <>
                <Zap className="w-6 h-6 fill-current" />
                Initialize_Deep_Scan
              </>
            )}
          </button>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl flex flex-col overflow-hidden backdrop-blur-sm">
          <div className="bg-neutral-800/30 px-5 py-3 border-b border-neutral-800 flex justify-between items-center">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Analysis_Output
            </span>
            {results.length > 0 && (
              <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">
                {results.length} Vulnerabilities Found
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-mono text-xs flex items-center gap-3"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              {results.length === 0 && !isAnalyzing && !error && (
                <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-6">
                  <div className="w-20 h-20 border-2 border-dashed border-neutral-800 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <ShieldAlert className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.3em]">Awaiting input for scanning...</p>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="space-y-6 h-full flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-emerald-500 mb-2">
                      <span>Scanning_Progress</span>
                      <span>{scanStep * 20}%</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${scanStep * 20}%` }}
                        className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                      />
                    </div>
                    <div className="text-center font-mono text-[10px] text-neutral-500 uppercase tracking-widest animate-pulse">
                      {scanStep === 1 && "Initializing Neural Engine..."}
                      {scanStep === 2 && "Parsing Abstract Syntax Tree..."}
                      {scanStep === 3 && "Mapping Data Flow Paths..."}
                      {scanStep === 4 && "Executing Pattern Matching..."}
                      {scanStep === 5 && "Finalizing Vulnerability Report..."}
                    </div>
                  </div>
                </div>
              )}

              {results.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-black/40 border border-neutral-800 p-6 rounded-xl space-y-4 relative group hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="text-base font-bold text-white tracking-tight">{result.vulnerability}</div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono px-3 py-1 rounded-full uppercase border ${
                          result.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          result.severity === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          result.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {result.severity}
                        </span>
                        <div className="h-4 w-px bg-neutral-800" />
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">CVSS: <span className="text-white">{result.cvss.toFixed(1)}</span></span>
                        <div className="h-4 w-px bg-neutral-800" />
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">CONF: {(result.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div 
                      onClick={() => onSendToReport?.(result)}
                      className="p-2 bg-neutral-800/50 rounded-lg text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-emerald-500/10"
                    >
                      <Send className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                    {result.description}
                  </p>
                  <div className="pt-4 border-t border-neutral-800 flex gap-4">
                    <div className="flex-1">
                      <div className="text-[9px] font-mono text-neutral-600 uppercase mb-2 tracking-widest flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" /> Remediation_Protocol
                      </div>
                      <p className="text-xs text-emerald-500/80 font-mono italic leading-relaxed">
                        {result.remediation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
