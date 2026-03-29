import React, { useState, useEffect } from 'react';
import { ExternalLink, Target, DollarSign, ShieldCheck, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { Program } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function ProgramFeed() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newProgram, setNewProgram] = useState<Partial<Program>>({
    name: '',
    platform: 'HackerOne',
    rewardRange: [0, 0],
    severity: 'Medium',
    category: '',
  });

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/programs');
      if (!response.ok) throw new Error('Failed to fetch programs');
      const data = await response.json();
      setPrograms(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const totalPages = Math.ceil(programs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrograms = programs.slice(startIndex, startIndex + itemsPerPage);

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProgram),
      });

      if (!response.ok) throw new Error('Failed to register target');
      
      const addedProgram = await response.json();
      setPrograms([addedProgram, ...programs]);
      setIsModalOpen(false);
      setCurrentPage(1);
      setNewProgram({
        name: '',
        platform: 'HackerOne',
        rewardRange: [0, 0],
        severity: 'Medium',
        category: '',
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-8 technical-grid h-full overflow-y-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter italic font-mono uppercase">TARGET_FEED</h1>
          <p className="text-neutral-500 text-sm font-mono mt-1">ACTIVE_PROGRAMS // GLOBAL_REGISTRY</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded flex items-center gap-2 font-mono text-xs font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Plus className="w-4 h-4" />
            ADD_TARGET
          </button>
          <div className="bg-neutral-900 border border-neutral-800 rounded px-4 py-2 flex items-center gap-3">
            <Target className="w-4 h-4 text-emerald-500" />
            <div className="text-xs font-mono">
              <span className="text-neutral-500">TOTAL_TARGETS:</span> {programs.length.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-6 gap-4 p-4 bg-neutral-800/50 border-b border-neutral-800 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
          <div className="col-span-2">Program_Identity</div>
          <div>Platform</div>
          <div>Reward_Range</div>
          <div>Max_Severity</div>
          <div className="text-right">Last_Update</div>
        </div>
        
        <div className="divide-y divide-neutral-800 min-h-[400px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Synchronizing_Registry...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500/50" />
              <div className="space-y-1">
                <p className="text-sm font-mono text-red-500 uppercase">Registry_Sync_Failed</p>
                <p className="text-[10px] font-mono text-neutral-500">{error}</p>
              </div>
              <button 
                onClick={fetchPrograms}
                className="px-4 py-2 border border-neutral-800 rounded text-[10px] font-mono text-neutral-400 hover:bg-neutral-800 transition-colors"
              >
                RETRY_SYNC
              </button>
            </div>
          ) : paginatedPrograms.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[10px] font-mono text-neutral-500 uppercase">No_Targets_Found</p>
            </div>
          ) : (
            paginatedPrograms.map((program) => (
              <div key={program.id} className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <ShieldCheck className="w-4 h-4 text-neutral-500 group-hover:text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">{program.name}</div>
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">{program.category}</div>
                  </div>
                </div>
                
                <div className="text-xs font-mono text-neutral-400">
                  {program.platform}
                </div>
                
                <div className="flex items-center gap-1 text-xs font-mono text-emerald-500">
                  <DollarSign className="w-3 h-3" />
                  {program.rewardRange[0].toLocaleString()} - {program.rewardRange[1].toLocaleString()}
                </div>
                
                <div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase border ${
                    program.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    program.severity === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {program.severity}
                  </span>
                </div>
                
                <div className="text-right text-[10px] font-mono text-neutral-500 flex items-center justify-end gap-2">
                  {program.updatedAt}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="p-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-900/30">
            <div className="text-[10px] font-mono text-neutral-500 uppercase">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, programs.length)} of {programs.length}
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 border border-neutral-800 rounded text-[10px] font-mono text-neutral-400 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                PREV
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 py-1 border rounded text-[10px] font-mono transition-colors ${
                    currentPage === i + 1
                      ? 'bg-emerald-500 border-emerald-500 text-black font-bold'
                      : 'border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1 border border-neutral-800 rounded text-[10px] font-mono text-neutral-400 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="bg-neutral-800/50 px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">ADD_NEW_TARGET</h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-neutral-700 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleAddProgram} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2 block">Program_Name</label>
                    <input 
                      required
                      type="text"
                      value={newProgram.name}
                      onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                      className="w-full bg-black/50 border border-neutral-800 rounded px-4 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none transition-colors"
                      placeholder="e.g. Acme Corp VRP"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2 block">Platform</label>
                      <select 
                        value={newProgram.platform}
                        onChange={(e) => setNewProgram({...newProgram, platform: e.target.value as any})}
                        className="w-full bg-black/50 border border-neutral-800 rounded px-4 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none transition-colors appearance-none"
                      >
                        <option value="HackerOne">HackerOne</option>
                        <option value="Bugcrowd">Bugcrowd</option>
                        <option value="Intigriti">Intigriti</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2 block">Max_Severity</label>
                      <select 
                        value={newProgram.severity}
                        onChange={(e) => setNewProgram({...newProgram, severity: e.target.value as any})}
                        className="w-full bg-black/50 border border-neutral-800 rounded px-4 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none transition-colors appearance-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2 block">Min_Reward ($)</label>
                      <input 
                        type="number"
                        value={newProgram.rewardRange?.[0]}
                        onChange={(e) => setNewProgram({...newProgram, rewardRange: [parseInt(e.target.value) || 0, newProgram.rewardRange?.[1] || 0]})}
                        className="w-full bg-black/50 border border-neutral-800 rounded px-4 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2 block">Max_Reward ($)</label>
                      <input 
                        type="number"
                        value={newProgram.rewardRange?.[1]}
                        onChange={(e) => setNewProgram({...newProgram, rewardRange: [newProgram.rewardRange?.[0] || 0, parseInt(e.target.value) || 0]})}
                        className="w-full bg-black/50 border border-neutral-800 rounded px-4 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2 block">Category</label>
                    <input 
                      type="text"
                      value={newProgram.category}
                      onChange={(e) => setNewProgram({...newProgram, category: e.target.value})}
                      className="w-full bg-black/50 border border-neutral-800 rounded px-4 py-2 text-sm font-mono text-white focus:border-emerald-500 outline-none transition-colors"
                      placeholder="e.g. Web / API / Mobile"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-neutral-800 rounded font-mono text-xs text-neutral-500 hover:bg-neutral-800 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    REGISTER_TARGET
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
