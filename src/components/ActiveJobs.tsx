import React, { useState, useEffect } from 'react';
import { Play, Square, Loader2, AlertCircle, CheckCircle2, Trash2, Zap, Terminal, Activity, ChevronRight, FileText, DollarSign, X } from 'lucide-react';
import { ActiveJob } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function ActiveJobs() {
  const [jobs, setJobs] = useState<ActiveJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch active jobs: Status ${response.status}, Content-Type ${contentType}`);
      }
      
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Invalid response from server: Expected JSON, got ${contentType}`);
      }
      
      const data = await response.json();
      setJobs(data);
      setError(null);
    } catch (err: any) {
      console.error("fetchJobs error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStopJob = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to stop job');
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleClaimReward = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}/claim`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to claim reward');
      const data = await response.json();
      alert(`Reward Claimed: $${data.amount}`);
      fetchJobs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openClaimModal = (id: string) => {
    setSelectedJobId(id);
    setIsClaimModalOpen(true);
  };

  const getPayoutRange = (severity: string) => {
    switch (severity) {
      case 'Critical': return '$5,000 - $50,000';
      case 'High': return '$1,000 - $10,000';
      case 'Medium': return '$500 - $3,000';
      case 'Low': return '$100 - $1,000';
      default: return '$0 - $0';
    }
  };

  return (
    <div className="p-8 space-y-8 technical-grid h-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em]">
            <Activity className="w-3 h-3 animate-pulse" /> System_Status: Active_Operations
          </div>
          <h1 className="text-4xl font-bold tracking-tighter italic font-mono uppercase glow-text">MISSION_CONTROL</h1>
          <p className="text-neutral-500 text-sm font-mono mt-1">RECON_JOBS // NEURAL_ANALYSIS_IN_PROGRESS</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded px-4 py-2 flex items-center gap-3">
          <Zap className="w-4 h-4 text-emerald-500" />
          <div className="text-xs font-mono">
            <span className="text-neutral-500">ACTIVE_MISSIONS:</span> {jobs.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && jobs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-neutral-900/30 border border-neutral-800 rounded-xl">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Synchronizing_Mission_Data...</p>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
            <div className="w-16 h-16 border-2 border-dashed border-neutral-800 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-neutral-800" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">No_Active_Missions</p>
              <p className="text-xs text-neutral-700 max-w-xs">Initialize a new recon mission from the Target_Feed to begin neural analysis.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 backdrop-blur-md group hover:border-emerald-500/30 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">ID: {job.id}</span>
                          <h3 className="text-lg font-bold text-white tracking-tight">{job.programName}</h3>
                        </div>
                        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                          <Terminal className="w-3 h-3" /> Status: <span className={job.status === 'Completed' ? 'text-emerald-500' : 'text-blue-500'}>{job.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-neutral-600 uppercase">Started_At</p>
                        <p className="text-xs font-mono text-neutral-400">{new Date(job.startedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                        <span className="text-neutral-500">Neural_Progress</span>
                        <span className="text-emerald-500">{job.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${job.progress}%` }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        />
                      </div>
                    </div>

                    {job.status === 'Completed' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <div>
                              <p className="text-xs font-bold text-white">Vulnerability_Detected: {job.vulnerabilityFound}</p>
                              <p className="text-[10px] font-mono text-emerald-500/70 uppercase">Severity: {job.severity} // Reward: ${job.rewardAmount || 0}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-neutral-800 text-neutral-400 font-mono text-[10px] font-bold uppercase rounded hover:bg-neutral-700 transition-all flex items-center gap-2">
                              <FileText className="w-3 h-3" /> Draft_Report
                            </button>
                            {!job.claimed ? (
                              <button 
                                onClick={() => openClaimModal(job.id)}
                                className="px-4 py-2 bg-emerald-500 text-black font-mono text-[10px] font-bold uppercase rounded hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                              >
                                <DollarSign className="w-3 h-3" /> Claim_Reward
                              </button>
                            ) : (
                              <div className="px-4 py-2 bg-emerald-500/20 text-emerald-500 font-mono text-[10px] font-bold uppercase rounded flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" /> Claimed
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bounty Scoring Matrix */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/40 border border-neutral-800 rounded-lg">
                          <div className="space-y-1">
                            <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Severity_Score</p>
                            <p className={`text-xs font-bold ${
                              job.severity === 'Critical' ? 'text-red-500' : 
                              job.severity === 'High' ? 'text-orange-500' : 
                              job.severity === 'Medium' ? 'text-yellow-500' : 'text-blue-500'
                            }`}>{job.severity}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">CVSS_Vector</p>
                            <p className="text-xs font-bold text-white">{job.cvss || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Market_Range</p>
                            <p className="text-xs font-bold text-neutral-400">{getPayoutRange(job.severity || '')}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] font-mono text-emerald-500/70 uppercase tracking-widest">Suggested_Bounty</p>
                            <p className="text-xs font-bold text-emerald-500">${job.rewardAmount}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex md:flex-col gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleStopJob(job.id)}
                      className="flex-1 md:w-12 h-12 flex items-center justify-center border border-neutral-800 rounded-lg text-neutral-500 hover:text-red-500 hover:border-red-500/50 transition-all group"
                      title="Abort Mission"
                    >
                      <Square className="w-5 h-5 group-hover:scale-90 transition-transform" />
                    </button>
                    <button className="flex-1 md:w-12 h-12 flex items-center justify-center border border-neutral-800 rounded-lg text-neutral-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all group" title="View Logs">
                      <Terminal className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Global_Mission_Logs</h2>
        </div>
        <div className="bg-black/40 rounded-lg border border-neutral-800 p-6 font-mono text-[10px] space-y-3 h-48 overflow-y-auto custom-scrollbar">
          <div className="flex gap-4 text-neutral-500">
            <span className="shrink-0">[00:36:25]</span>
            <span className="text-emerald-500">SYSTEM: Mission_Control_v4.0 Online</span>
          </div>
          <div className="flex gap-4 text-neutral-500">
            <span className="shrink-0">[00:36:20]</span>
            <span className="text-blue-500">INFO: Neural_Link_Established with Global_Registry</span>
          </div>
          {jobs.map((job, i) => (
            <div key={i} className="flex gap-4 text-neutral-500">
              <span className="shrink-0">[{new Date(job.startedAt).toLocaleTimeString()}]</span>
              <span className="text-emerald-500">MISSION_START: {job.programName} (ID: {job.id})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isClaimModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClaimModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold tracking-tighter italic font-mono uppercase text-white">REWARD_CONFIRMATION</h2>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Neural_Asset_Transfer</p>
                </div>
                <button onClick={() => setIsClaimModalOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Initialize Asset Claim?</p>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase">
                      This action will finalize the bounty for mission ID: {selectedJobId}
                      {selectedJobId && jobs.find(j => j.id === selectedJobId)?.rewardAmount && (
                        <span className="block text-emerald-500 mt-1">Reward_Amount: ${jobs.find(j => j.id === selectedJobId)?.rewardAmount}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsClaimModalOpen(false)}
                    className="flex-1 py-3 border border-neutral-800 hover:border-neutral-700 text-neutral-500 font-bold font-mono text-[10px] uppercase tracking-widest transition-all rounded-xl"
                  >
                    Abort_Transfer
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedJobId) handleClaimReward(selectedJobId);
                      setIsClaimModalOpen(false);
                    }}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-[10px] uppercase tracking-widest transition-all rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    Confirm_Claim
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
