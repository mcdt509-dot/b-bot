import React, { useState } from 'react';
import { Shield, Globe, Server, Lock, AlertTriangle, ExternalLink, Info, Search, Loader2, Send, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeDiscordServer } from '../services/gemini';
import { AnalysisResult } from '../types';

export default function DiscordRecon() {
  const [serverId, setServerId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResults, setScanResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const domains = [
    'discord.com', 'discordapp.com', 'discord.gg', 'discord.media',
    'discordapp.net', 'discord.status', 'discord.gift', 'discord.dev',
    'discord.new', 'discord.careers', 'discord.blog', 'discord.support'
  ];

  const handleScanServer = async () => {
    if (!serverId.trim()) return;
    setIsScanning(true);
    setError(null);
    setScanStep(1);

    const steps = [
      "Resolving Server ID...",
      "Fetching Guild Metadata...",
      "Analyzing Permission Matrix...",
      "Checking Webhook Security...",
      "Auditing Bot Integrations...",
      "Generating Security Report..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setScanStep(i + 1);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      // Simulated server configuration for analysis
      const mockConfig = `
        Guild ID: ${serverId}
        Verification Level: Low
        Default Message Notifications: All Messages
        Explicit Content Filter: Disabled
        Roles:
          - @everyone: [READ_MESSAGES, SEND_MESSAGES, CONNECT]
          - Moderator: [MANAGE_MESSAGES, KICK_MEMBERS, BAN_MEMBERS]
          - Admin: [ADMINISTRATOR]
        Webhooks:
          - GitHub: https://discord.com/api/webhooks/... (Exposed in public channel)
        Integrations:
          - Custom Bot: Permissions [ADMINISTRATOR]
      `;

      const analysis = await analyzeDiscordServer(serverId, mockConfig);
      setScanResults(analysis);
    } catch (err: any) {
      setError("Neural Engine Error: Failed to complete server audit.");
    } finally {
      setIsScanning(false);
      setScanStep(0);
    }
  };

  const attackVectors = [
    {
      title: 'WebSocket Security',
      description: 'Discord uses WebSockets for real-time communication. Look for logic flaws in gateway events, message handling, and rate limiting.',
      severity: 'High'
    },
    {
      title: 'OAuth2 Implementation',
      description: 'Test the OAuth2 flow for redirect URI bypasses, state token validation, and scope escalation.',
      severity: 'Critical'
    },
    {
      title: 'API Rate Limiting',
      description: 'Discord has strict rate limits. Look for ways to bypass them using multiple IPs or header manipulation.',
      severity: 'Medium'
    },
    {
      title: 'Server-Side Request Forgery (SSRF)',
      description: 'Test features that fetch external content, such as link previews or webhooks, for potential SSRF vulnerabilities.',
      severity: 'Critical'
    },
    {
      title: 'Cross-Site Scripting (XSS)',
      description: 'Check for XSS in message rendering, profile fields, and integration settings.',
      severity: 'High'
    }
  ];

  return (
    <div className="p-8 space-y-8 technical-grid h-full overflow-y-auto">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em] mb-2">
            <Shield className="w-3 h-3" /> Target_Recon: Discord
          </div>
          <h1 className="text-3xl font-bold tracking-tighter italic font-mono uppercase">DISCORD_RECON_INTEL</h1>
          <p className="text-neutral-500 text-sm font-mono mt-1">INFRASTRUCTURE_MAPPING // ATTACK_SURFACE_ANALYSIS</p>
        </div>
        <a 
          href="https://hackerone.com/discord" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded flex items-center gap-2 font-mono text-xs font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <ExternalLink className="w-4 h-4" />
          H1_PROGRAM_PAGE
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Domain Scope */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">DOMAIN_SCOPE</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {domains.map((domain, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-black/40 border border-neutral-800 rounded hover:border-emerald-500/30 transition-colors group">
                  <span className="text-xs font-mono text-neutral-400 group-hover:text-white transition-colors">{domain}</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-50" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">RECON_TIPS</h2>
            </div>
            <ul className="space-y-3 text-[10px] font-mono text-neutral-500 leading-relaxed uppercase">
              <li className="flex gap-2">
                <span className="text-blue-500">»</span> Use subfinder or amass for deep subdomain discovery.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">»</span> Monitor Discord's engineering blog for tech stack updates.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">»</span> Analyze the desktop client's local files for API keys or endpoints.
              </li>
            </ul>
          </div>
        </div>

        {/* Attack Vectors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Server Scanner Section */}
          <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-emerald-500" />
                <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">SERVER_VULN_SCANNER</h2>
              </div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase">Target_ID: {serverId || 'NULL'}</div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest ml-1">Discord Server ID</label>
                <div className="flex gap-4">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input 
                      type="text"
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      placeholder="ENTER_SERVER_ID_OR_INVITE_CODE..."
                      className="w-full bg-black/40 border border-neutral-800 rounded-lg py-3 pl-12 pr-4 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleScanServer}
                    disabled={isScanning || !serverId.trim()}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        SCANNING...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        INITIATE_SCAN
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isScanning && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-emerald-500">Scanning_In_Progress...</span>
                    <span className="text-neutral-500">Step_{scanStep}_of_6</span>
                  </div>
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(scanStep / 6) * 100}%` }}
                    />
                  </div>
                  <div className="text-[9px] font-mono text-neutral-600 italic">
                    {scanStep === 1 && "» RESOLVING_SERVER_ID..."}
                    {scanStep === 2 && "» FETCHING_GUILD_METADATA..."}
                    {scanStep === 3 && "» ANALYZING_PERMISSION_MATRIX..."}
                    {scanStep === 4 && "» CHECKING_WEBHOOK_SECURITY..."}
                    {scanStep === 5 && "» AUDITING_BOT_INTEGRATIONS..."}
                    {scanStep === 6 && "» GENERATING_SECURITY_REPORT..."}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-3 text-xs font-mono text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <AnimatePresence>
                {scanResults.length > 0 && !isScanning && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4 border-t border-neutral-800"
                  >
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-4">Scan_Results: {scanResults.length}_Vulnerabilities_Detected</div>
                    <div className="grid grid-cols-1 gap-4">
                      {scanResults.map((result, idx) => (
                        <div key={idx} className="bg-black/40 border border-neutral-800 p-4 rounded-lg space-y-3 hover:border-emerald-500/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-white tracking-tight">{result.vulnerability}</div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase border ${
                                  result.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  result.severity === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                }`}>
                                  {result.severity}
                                </span>
                                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">CVSS: {result.cvss.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                            {result.description}
                          </p>
                          <div className="pt-3 border-t border-neutral-800">
                            <div className="text-[9px] font-mono text-neutral-600 uppercase mb-1 tracking-widest">Remediation:</div>
                            <p className="text-[11px] text-emerald-500/80 font-mono italic">
                              {result.remediation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">CRITICAL_ATTACK_VECTORS</h2>
            </div>
            <div className="space-y-4">
              {attackVectors.map((vector, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-black/40 border border-neutral-800 rounded-lg hover:border-emerald-500/30 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">{vector.title}</h3>
                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase border ${
                      vector.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      vector.severity === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                      {vector.severity}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-mono leading-relaxed">
                    {vector.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <Server className="w-5 h-5 text-purple-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">INFRA_INTEL</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 border border-neutral-800 rounded-lg">
                <div className="text-[10px] font-mono text-neutral-600 uppercase mb-2">Primary_Stack</div>
                <div className="text-xs font-mono text-white">Elixir / Rust / Python / React</div>
              </div>
              <div className="p-4 bg-black/40 border border-neutral-800 rounded-lg">
                <div className="text-[10px] font-mono text-neutral-600 uppercase mb-2">Cloud_Provider</div>
                <div className="text-xs font-mono text-white">Google Cloud Platform (GCP)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
