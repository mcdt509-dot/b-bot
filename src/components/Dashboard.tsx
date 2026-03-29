import React, { useState } from 'react';
import { 
  TrendingUp, 
  Shield, 
  Target, 
  Zap, 
  AlertTriangle, 
  ChevronRight, 
  ExternalLink,
  DollarSign,
  ArrowUpRight,
  PieChart as PieChartIcon,
  Activity,
  Loader2,
  CheckCircle2,
  X,
  Globe,
  Wallet,
  ArrowRight,
  FileText,
  Download
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SecurityInsights from './SecurityInsights';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const data = [
  { name: 'Mon', earnings: 400 },
  { name: 'Tue', earnings: 300 },
  { name: 'Wed', earnings: 900 },
  { name: 'Thu', earnings: 600 },
  { name: 'Fri', earnings: 1200 },
  { name: 'Sat', earnings: 1500 },
  { name: 'Sun', earnings: 2100 },
];

const vulnDistribution = [
  { name: 'XSS', value: 40, color: '#10b981' },
  { name: 'SQLi', value: 25, color: '#3b82f6' },
  { name: 'IDOR', value: 20, color: '#f59e0b' },
  { name: 'RCE', value: 15, color: '#ef4444' },
];

interface DashboardProps {
  vpnActive: boolean;
}

export default function Dashboard({ vpnActive }: DashboardProps) {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('0');
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [realBalance, setRealBalance] = useState<{ available: number, pending: number } | null>(null);
  const [payouts, setPayouts] = useState<any[]>([]);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/stripe/balance');
      if (response.ok) {
        const data = await response.json();
        const available = data.available.reduce((acc: number, b: any) => acc + b.amount, 0) / 100;
        const pending = data.pending.reduce((acc: number, b: any) => acc + b.amount, 0) / 100;
        setRealBalance({ available, pending });
        setWithdrawAmount(available.toString());
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const fetchPayouts = async () => {
    try {
      const response = await fetch('/api/stripe/payouts');
      if (response.ok) {
        const data = await response.json();
        setPayouts(data);
      }
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
    }
  };

  React.useEffect(() => {
    fetchBalance();
    fetchPayouts();
  }, []);

  const exportToCSV = () => {
    const headers = ['Day', 'Earnings'];
    const rows = data.map(item => [item.name, item.earnings]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bountybot_earnings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWithdraw = async () => {
    setWithdrawStatus('loading');
    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount) })
      });
      
      const result = await response.json();
      if (response.ok) {
        setWithdrawStatus('success');
        fetchBalance();
        fetchPayouts();
        setTimeout(() => {
          setIsWithdrawModalOpen(false);
          setWithdrawStatus('idle');
        }, 2000);
      } else {
        setWithdrawStatus('error');
        setErrorMessage(result.error || 'Withdrawal failed');
      }
    } catch (error) {
      setWithdrawStatus('error');
      setErrorMessage('Network error occurred');
    }
  };

  return (
    <div className="p-8 h-full space-y-8 technical-grid overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em]">
            <Globe className="w-3 h-3 animate-pulse" /> Global_Threat_Level: Elevated
          </div>
          <h1 className="text-5xl font-bold tracking-tighter italic font-mono uppercase glow-text">COMMAND_CENTER_v4.0</h1>
          <p className="text-neutral-500 text-sm font-mono mt-1 uppercase">OPERATIONAL_OVERVIEW // SYSTEM_STATUS: <span className="text-emerald-500">OPTIMAL</span></p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={exportToCSV}
            className="px-6 py-4 border border-neutral-800 hover:border-emerald-500/50 text-neutral-400 hover:text-emerald-500 font-bold font-mono text-xs uppercase tracking-[0.2em] transition-all rounded-xl flex items-center gap-3 group"
          >
            <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            Export_CSV
          </button>
          <button 
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs uppercase tracking-[0.2em] transition-all rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center gap-3 group"
          >
            <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Withdraw_Earnings
          </button>
          <div className="text-right border-l border-neutral-800 pl-6 hidden xl:block">
            <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Last Sync</div>
            <div className="font-mono text-xs text-neutral-400">2026-03-17 21:31:17 UTC</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL_EARNINGS', value: realBalance ? `$${realBalance.available.toLocaleString()}` : '$2,100.00', icon: DollarSign, trend: '+12.5%', color: 'emerald', action: () => setIsWithdrawModalOpen(true) },
          { label: 'ACTIVE_BOUNTIES', value: '14', icon: Target, trend: '+2', color: 'blue' },
          { label: 'VULNS_FOUND', value: '38', icon: Shield, trend: '+5', color: 'orange' },
          { label: 'RANKING', value: '#142', icon: TrendingUp, trend: '↑ 12', color: 'purple' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-neutral-900/30 border border-neutral-800 p-6 rounded-xl backdrop-blur-md group hover:border-emerald-500/30 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-16 h-16" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-neutral-800/50 rounded-lg">
                <stat.icon className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold tracking-tight text-white">{stat.value}</h3>
                {stat.action && (
                  <button 
                    onClick={stat.action}
                    className="text-[10px] font-mono text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    Withdraw <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Earnings_Trajectory</h2>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                {['1W', '1M', '3M', 'ALL'].map((t) => (
                  <button key={t} className="px-3 py-1 text-[10px] font-mono text-neutral-500 hover:text-white transition-colors">
                    {t}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-neutral-800" />
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-1 text-[10px] font-mono text-emerald-500 hover:text-emerald-400 transition-colors group"
              >
                <Download className="w-3 h-3 transition-transform group-hover:-translate-y-0.5" />
                EXPORT_CSV
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#4b5563', fontFamily: 'monospace' }}
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#4b5563', fontFamily: 'monospace' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3">
            <PieChartIcon className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Vulnerability_Mix</h2>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vulnDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {vulnDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    border: '1px solid #1f2937',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {vulnDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{item.name}</span>
                <span className="text-[10px] font-mono text-white ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Live_Attack_Map</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Active_Scans: 4</span>
          </div>
        </div>
        
        <div className="relative h-[240px] w-full bg-black/40 rounded-lg border border-neutral-800 overflow-hidden group">
          {/* Simple SVG World Map Placeholder */}
          <svg viewBox="0 0 800 400" className="w-full h-full opacity-20 stroke-neutral-700 fill-none">
            <path d="M150,100 Q200,50 250,100 T350,100 T450,150 T550,100 T650,150 T750,100" strokeWidth="1" />
            <path d="M100,200 Q150,150 200,200 T300,200 T400,250 T500,200 T600,250 T700,200" strokeWidth="1" />
            <path d="M200,300 Q250,250 300,300 T400,300 T500,350 T600,300 T700,350" strokeWidth="1" />
          </svg>

          {/* Pulsing Attack Points */}
          {[
            { x: '20%', y: '30%', label: 'US_EAST_1' },
            { x: '50%', y: '40%', label: 'EU_WEST_2' },
            { x: '75%', y: '60%', label: 'AP_SOUTH_1' },
            { x: '30%', y: '70%', label: 'SA_EAST_1' },
          ].map((point, i) => (
            <div 
              key={i}
              className="absolute"
              style={{ left: point.x, top: point.y }}
            >
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-50" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] font-mono text-emerald-500 bg-black/80 px-1 rounded border border-emerald-500/20">
                    {point.label}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Attack Lines (Simulated) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.path
              d="M 160 120 Q 300 100 400 160"
              stroke="#10b981"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            />
            <motion.path
              d="M 400 160 Q 500 200 600 240"
              stroke="#10b981"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          </svg>

          <div className="absolute bottom-4 left-4 space-y-1">
            <p className="text-[8px] font-mono text-neutral-600 uppercase">Incoming_Traffic: 1.2 GB/s</p>
            <p className="text-[8px] font-mono text-emerald-500 uppercase">Neural_Link: Optimized</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Target_Nodes', value: '1,242' },
            { label: 'Active_Proxies', value: '18' },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-black/40 border border-neutral-800 rounded-lg">
              <p className="text-[8px] font-mono text-neutral-600 uppercase mb-1">{item.label}</p>
              <p className="text-xs font-bold font-mono text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Recent_Activity</h2>
            </div>
            <button className="text-[10px] font-mono text-neutral-500 hover:text-white flex items-center gap-2">
              View_All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {payouts.length > 0 ? (
              payouts.map((payout, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-black/40 border border-neutral-800 rounded-lg group hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">Withdrawal to External Account</p>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase">Withdraw // {new Date(payout.created * 1000).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-red-500">
                      -${(payout.amount / 100).toLocaleString()}
                    </p>
                    <span className="text-[8px] font-mono text-neutral-600 uppercase">{payout.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed border-neutral-800 rounded-lg">
                <p className="text-[10px] font-mono text-neutral-600 uppercase">No_Recent_Withdrawals</p>
              </div>
            )}
            
            <div className="pt-4 border-t border-neutral-900">
              <p className="text-[10px] font-mono text-neutral-600 uppercase mb-4">Mock_Activity</p>
              {[
                { type: 'Bounty', title: 'Critical RCE found in Google Cloud', amount: '$1,200', time: '2h ago' },
                { type: 'Report', title: 'Drafted XSS report for Shopify', amount: 'Pending', time: '5h ago' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-black/40 border border-neutral-800 rounded-lg group hover:border-emerald-500/20 transition-colors mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      activity.type === 'Bounty' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-blue-500/10 text-blue-500'
                    )}>
                      {activity.type === 'Bounty' ? <Shield className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">{activity.title}</p>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase">{activity.type} // {activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-bold font-mono",
                      activity.amount.startsWith('-') ? 'text-red-500' : 'text-emerald-500'
                    )}>
                      {activity.amount}
                    </p>
                    <ExternalLink className="w-3 h-3 text-neutral-700 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <SecurityInsights />
          <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Neural_Activity_Feed</h2>
            </div>
            <div className="space-y-4 font-mono text-[10px] leading-relaxed">
              {[
                { time: '21:42:10', msg: 'CVSS engine calibrated for v4.0.2', type: 'info' },
                { time: '21:39:46', msg: 'System upgrade v4.0 active', type: 'success' },
                { time: '21:35:42', msg: 'Stripe gateway connected', type: 'info' },
                { time: '21:31:17', msg: 'Neural engine initialized', type: 'success' },
                { time: '21:28:05', msg: 'Scanning subsystem online', type: 'info' },
              ].map((log, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <span className="text-neutral-700 shrink-0">[{log.time}]</span>
                  <span className={cn(
                    "transition-colors",
                    log.type === 'success' ? 'text-emerald-500/60' :
                    log.type === 'error' ? 'text-red-500/60' :
                    'text-blue-500/60',
                    "group-hover:text-white"
                  )}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-8 border-b border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tighter italic font-mono uppercase text-white">Withdrawal_Gateway</h2>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Secure_Transaction_Protocol</p>
                </div>
                <button onClick={() => setIsWithdrawModalOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    <span>Available_Balance</span>
                    <span className="text-emerald-500">{realBalance ? `$${realBalance.available.toLocaleString()}` : '$2,100.00'}</span>
                  </div>
                  {realBalance && realBalance.pending > 0 && (
                    <div className="flex justify-between text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                      <span>Pending_Balance</span>
                      <span>${realBalance.pending.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <input 
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl pl-12 pr-4 py-5 font-mono text-2xl text-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-600 uppercase">
                    <span>Transaction_Fee (0.5%)</span>
                    <span>${(parseFloat(withdrawAmount || '0') * 0.005).toFixed(2)}</span>
                  </div>
                </div>

                {withdrawStatus !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-5 rounded-xl border flex items-center gap-4",
                      withdrawStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      withdrawStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-500'
                    )}
                  >
                    {withdrawStatus === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {withdrawStatus === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {withdrawStatus === 'error' && <AlertTriangle className="w-5 h-5" />}
                    <span className="text-xs font-mono uppercase tracking-widest">
                      {withdrawStatus === 'loading' && 'Initiating_Transfer...'}
                      {withdrawStatus === 'success' && 'Transfer_Complete_Check_Stripe'}
                      {withdrawStatus === 'error' && (errorMessage || 'Transfer_Failed_Check_API_Key')}
                    </span>
                  </motion.div>
                )}

                <button 
                  onClick={handleWithdraw}
                  disabled={withdrawStatus === 'loading' || !withdrawAmount}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-900 disabled:text-neutral-700 text-black font-bold font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  {withdrawStatus === 'loading' ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 fill-current" />
                      Confirm_Withdrawal
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
