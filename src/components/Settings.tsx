import React, { useState } from 'react';
import { Shield, Key, Save, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Cpu, Globe, Lock, Power, Zap, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SettingsProps {
  vpnActive: boolean;
  setVpnActive: (active: boolean) => void;
}

export default function Settings({ vpnActive, setVpnActive }: SettingsProps) {
  const [stripeKey, setStripeKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [proxyUrl, setProxyUrl] = useState('socks5://proxy.neural-tunnel.io:9050');

  const validateStripeKey = (key: string) => {
    if (!key) return { valid: true, msg: '' };
    const isTest = key.startsWith('sk_test_');
    const isLive = key.startsWith('sk_live_');
    
    if (!isTest && !isLive) {
      return { valid: false, msg: 'Key must start with sk_test_ or sk_live_' };
    }
    
    if (key.length < 20) {
      return { valid: false, msg: 'Key is too short (min 20 chars)' };
    }

    const keyBody = key.replace(/^(sk_test_|sk_live_)/, '');
    if (!/^[a-zA-Z0-9]+$/.test(keyBody)) {
      return { valid: false, msg: 'Invalid characters in key body' };
    }

    return { valid: true, msg: '' };
  };

  const validation = validateStripeKey(stripeKey);

  const handleSave = async () => {
    if (!stripeKey.trim() || !validation.valid) return;
    
    setStatus('saving');
    try {
      const response = await fetch('/api/settings/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeKey })
      });

      const result = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to save settings');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error occurred');
    }
  };

  return (
    <div className="p-8 h-full space-y-8 technical-grid overflow-y-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em]">
            <Cpu className="w-3 h-3" /> Core_Configuration: v4.0.2
          </div>
          <h1 className="text-4xl font-bold tracking-tighter italic font-mono uppercase glow-text">SYSTEM_SETTINGS</h1>
          <p className="text-neutral-500 text-sm font-mono mt-1">CONFIGURATION_MODULE // KERNEL_LEVEL_ACCESS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="px-8 py-4 border-b border-neutral-800 bg-neutral-800/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-white">API_Authentication_Vault</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Secure_Link: Active</span>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em]">Stripe_Secret_Key</label>
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-2 transition-colors group"
                    >
                      {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span className="group-hover:underline">{showKey ? 'Mask_Key' : 'Reveal_Key'}</span>
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors">
                      <Key className="w-5 h-5" />
                    </div>
                    <input 
                      type={showKey ? "text" : "password"}
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      placeholder="sk_test_..."
                      className={cn(
                        "w-full bg-black/60 border rounded-xl pl-12 pr-4 py-4 font-mono text-sm outline-none transition-all placeholder:text-neutral-800 selection:bg-emerald-500/20",
                        stripeKey && !validation.valid ? "border-red-500/50 text-red-500" : "border-neutral-800 text-emerald-500 focus:border-emerald-500"
                      )}
                    />
                  </div>
                  <AnimatePresence>
                    {stripeKey && !validation.valid && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2 text-[9px] font-mono text-red-500 uppercase tracking-wider"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {validation.msg}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-start gap-2 mt-3">
                    <Lock className="w-3 h-3 text-neutral-700 mt-0.5" />
                    <p className="text-[10px] font-mono text-neutral-600 leading-relaxed uppercase tracking-tight">
                      Keys are encrypted at rest and injected into the environment during runtime.
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {status !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`overflow-hidden`}
                    >
                      <div className={`p-5 rounded-xl border flex items-start gap-4 ${
                        status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                        status === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-500' :
                        'bg-blue-500/5 border-blue-500/20 text-blue-500'
                      }`}>
                        {status === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : 
                         status === 'error' ? <AlertCircle className="w-5 h-5 mt-0.5" /> :
                         <Loader2 className="w-5 h-5 mt-0.5 animate-spin" />}
                        <div className="text-xs font-mono uppercase tracking-widest leading-relaxed">
                          {message || (status === 'saving' ? 'Writing to .env file...' : '')}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={handleSave}
                  disabled={status === 'saving' || !stripeKey.trim() || !validation.valid}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-900 disabled:text-neutral-700 text-black font-bold font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.01] active:scale-[0.99]"
                >
                  {status === 'saving' ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Saving_Configuration...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      Commit_to_Environment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-3 text-neutral-400">
                <Globe className="w-4 h-4" />
                <h3 className="text-[10px] font-mono uppercase tracking-widest">Network_Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-neutral-600 uppercase">Gateway</span>
                  <span className="text-emerald-500 uppercase">Connected</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-neutral-600 uppercase">Latency</span>
                  <span className="text-emerald-500 uppercase">12ms</span>
                </div>
              </div>
            </div>
            <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-3 text-neutral-400">
                <Cpu className="w-4 h-4" />
                <h3 className="text-[10px] font-mono uppercase tracking-widest">System_Resources</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-neutral-600 uppercase">CPU_Load</span>
                  <span className="text-emerald-500 uppercase">4.2%</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-neutral-600 uppercase">Mem_Usage</span>
                  <span className="text-emerald-500 uppercase">256MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={cn(
            "bg-neutral-900/30 border rounded-xl p-8 backdrop-blur-sm space-y-8 transition-all duration-500 relative overflow-hidden group",
            vpnActive ? "border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]" : "border-neutral-800 shadow-none"
          )}>
            {/* Background Glow */}
            <AnimatePresence>
              {vpnActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3 text-emerald-500">
                <Globe className={cn("w-5 h-5 transition-transform duration-1000", vpnActive && "rotate-[360deg]")} />
                <h3 className="text-xs font-mono uppercase tracking-[0.2em]">Neural_Tunnel_VPN</h3>
              </div>
              <div className={cn(
                "px-2 py-1 rounded text-[8px] font-mono uppercase tracking-widest border",
                vpnActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-neutral-800 text-neutral-600 border-neutral-700"
              )}>
                {vpnActive ? "Active" : "Standby"}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-6 space-y-6 relative z-10">
              <button 
                onClick={() => setVpnActive(!vpnActive)}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border-2 group/btn relative",
                  vpnActive 
                    ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]" 
                    : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                )}
              >
                <Power className={cn(
                  "w-10 h-10 transition-all duration-500",
                  vpnActive ? "text-emerald-500 scale-110" : "text-neutral-700 group-hover/btn:text-neutral-500"
                )} />
                
                {/* Pulsing ring when active */}
                {vpnActive && (
                  <div className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-20" />
                )}
              </button>
              
              <div className="text-center space-y-1">
                <p className={cn(
                  "text-[10px] font-mono uppercase tracking-[0.3em] font-bold",
                  vpnActive ? "text-emerald-500" : "text-neutral-600"
                )}>
                  {vpnActive ? "ENCRYPTION_ACTIVE" : "ENCRYPTION_OFFLINE"}
                </p>
                <p className="text-[9px] font-mono text-neutral-700 uppercase">
                  {vpnActive ? "Secure_Tunnel_Established" : "Direct_Link_Exposed"}
                </p>
              </div>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-black/40 border border-neutral-800 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-neutral-600 uppercase">Status</span>
                  <span className={vpnActive ? "text-emerald-500 font-mono text-[10px]" : "text-red-500 font-mono text-[10px]"}>
                    {vpnActive ? "ENCRYPTED" : "UNPROTECTED"}
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-700 uppercase">Proxy_Endpoint</label>
                  <div className="flex items-center gap-2 border-b border-neutral-800 py-1">
                    <Zap className={cn("w-3 h-3", vpnActive ? "text-emerald-500" : "text-neutral-800")} />
                    <input 
                      type="text"
                      value={proxyUrl}
                      onChange={(e) => setProxyUrl(e.target.value)}
                      className="w-full bg-transparent font-mono text-[10px] text-neutral-400 outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                <Activity className={cn("w-4 h-4", vpnActive ? "text-emerald-500 animate-pulse" : "text-neutral-800")} />
                <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={false}
                    animate={{ width: vpnActive ? '100%' : '0%' }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                  />
                </div>
              </div>

              <p className="text-[10px] text-neutral-600 leading-relaxed font-mono uppercase text-center italic">
                {vpnActive 
                  ? "Neural Tunnel active. Your identity is masked across all target networks."
                  : "Warning: Operator identity protection is offline. Target servers may log your source IP."}
              </p>
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-sm space-y-6">
            <div className="flex items-center gap-3 text-emerald-500">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-xs font-mono uppercase tracking-[0.2em]">Security_Protocol</h3>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-neutral-400 leading-relaxed font-mono">
                BountyBot uses server-side environment variables to protect your sensitive API keys. 
              </p>
              <div className="p-4 bg-black/40 border border-neutral-800 rounded-lg">
                <p className="text-[10px] text-neutral-500 leading-relaxed font-mono uppercase">
                  When you save a key, it is written directly to the server's filesystem. 
                  A manual restart is required for the kernel to re-index the environment.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600 uppercase">
                  <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
                  Encryption: AES-256
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600 uppercase mt-2">
                  <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
                  Access: Root_Only
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
