import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Info, 
  RefreshCw, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeSystemLogs, SecurityInsight } from '../services/gemini';

const mockLogs = [
  { timestamp: '2026-03-17 21:42:10', message: 'CVSS engine calibrated for v4.0.2', type: 'info' },
  { timestamp: '2026-03-17 21:39:46', message: 'System upgrade v4.0 active', type: 'success' },
  { timestamp: '2026-03-17 21:35:42', message: 'Stripe gateway connected', type: 'info' },
  { timestamp: '2026-03-17 21:31:17', message: 'Neural engine initialized', type: 'success' },
  { timestamp: '2026-03-17 21:28:05', message: 'Scanning subsystem online', type: 'info' },
  { timestamp: '2026-03-17 21:15:22', message: 'Multiple failed login attempts from IP 192.168.1.42', type: 'warning' },
  { timestamp: '2026-03-17 21:10:05', message: 'Unauthorized access attempt to /etc/passwd detected', type: 'critical' },
  { timestamp: '2026-03-17 20:55:12', message: 'New SSH key added for user "operator"', type: 'info' },
  { timestamp: '2026-03-17 20:42:33', message: 'Outbound connection to unknown C2 server blocked', type: 'critical' },
];

export default function SecurityInsights() {
  const [insights, setInsights] = useState<SecurityInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await analyzeSystemLogs(mockLogs);
      setInsights(results);
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
        setError("Security Analysis Rate Limit Exceeded. Please wait a moment before retrying.");
      } else {
        setError("An unexpected error occurred during log analysis.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'threat': return <ShieldAlert className="w-4 h-4" />;
      case 'anomaly': return <Zap className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">AI_Security_Insights</h2>
        </div>
        <button 
          onClick={runAnalysis}
          disabled={isLoading}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4 text-neutral-500", isLoading && "animate-spin")} />
        </button>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 font-mono text-[10px] flex items-center gap-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Analyzing_System_Logs...</p>
          </div>
        ) : insights.length > 0 ? (
          insights.map((insight) => (
            <div 
              key={insight.id}
              className="border border-neutral-800 rounded-lg overflow-hidden bg-black/40"
            >
              <button 
                onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg", getSeverityColor(insight.severity))}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white tracking-tight">{insight.title}</p>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase">{insight.type} // {insight.severity}</p>
                  </div>
                </div>
                {expandedId === insight.id ? <ChevronUp className="w-4 h-4 text-neutral-600" /> : <ChevronDown className="w-4 h-4 text-neutral-600" />}
              </button>
              
              <AnimatePresence>
                {expandedId === insight.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-4 border-t border-neutral-800/50 mt-2">
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {insight.description}
                      </p>
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Recommendation</span>
                        </div>
                        <p className="text-[10px] text-emerald-500/80 leading-relaxed">
                          {insight.recommendation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-[10px] font-mono text-neutral-600 uppercase">No_Threats_Detected</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
