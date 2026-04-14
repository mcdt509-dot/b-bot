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
  Download,
  Terminal as TerminalIcon
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
  Cell,
  Sector
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
  { name: 'XSS', value: 40, count: 124, color: '#10b981' },
  { name: 'SQLi', value: 25, count: 78, color: '#3b82f6' },
  { name: 'IDOR', value: 20, count: 62, color: '#f59e0b' },
  { name: 'RCE', value: 15, count: 46, color: '#ef4444' },
];

interface DashboardProps {
  vpnActive: boolean;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ vpnActive, setActiveTab }: DashboardProps) {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('0');
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [realBalance, setRealBalance] = useState<{ available: number, pending: number } | null>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [digitalAssets, setDigitalAssets] = useState<any[]>([]);
  const [isAssetsLoading, setIsAssetsLoading] = useState(false);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [globalStats, setGlobalStats] = useState({ vulnsFound: 38, completedMissions: 124 });
  const [threats, setThreats] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [apiLogs, setApiLogs] = useState<{ id: string, method: string, path: string, status: number, timestamp: string }[]>([]);

  const addApiLog = (method: string, path: string, status: number) => {
    setApiLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      method,
      path,
      status,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 5));
  };

  const fetchJobsCount = async () => {
    try {
      const response = await fetch('/api/jobs');
      addApiLog('GET', '/api/jobs', response.status);
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType?.includes('application/json')) {
        const data = await response.json();
        setActiveJobsCount(data.length);
      } else {
        const text = await response.text();
        console.error(`Failed to fetch jobs count: Status ${response.status}, Content-Type ${contentType}`, text.slice(0, 100));
      }
    } catch (error) {
      console.error("Failed to fetch jobs count:", error);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const response = await fetch('/api/stats');
      addApiLog('GET', '/api/stats', response.status);
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType?.includes('application/json')) {
        const data = await response.json();
        setGlobalStats(data);
      } else {
        const text = await response.text();
        console.error(`Failed to fetch global stats: Status ${response.status}, Content-Type ${contentType}`, text.slice(0, 100));
      }
    } catch (error) {
      console.error("Failed to fetch global stats:", error);
    }
  };

  const fetchThreats = async () => {
    try {
      const response = await fetch('/api/threats');
      addApiLog('GET', '/api/threats', response.status);
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType?.includes('application/json')) {
        const data = await response.json();
        setThreats(data);
      } else {
        const text = await response.text();
        console.error(`Failed to fetch threats: Status ${response.status}, Content-Type ${contentType}`, text.slice(0, 100));
      }
    } catch (error) {
      console.error("Failed to fetch threats:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      addApiLog('GET', '/api/transactions', response.status);
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType?.includes('application/json')) {
        const data = await response.json();
        setTransactions(data);
      } else {
        const text = await response.text();
        console.error(`Failed to fetch transactions: Status ${response.status}, Content-Type ${contentType}`, text.slice(0, 100));
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      const response = await fetch('/api/stripe/connect', { method: 'POST' });
      addApiLog('POST', '/api/stripe/connect', response.status);
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to connect Stripe:", error);
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const fetchDigitalAssets = async () => {
    setIsAssetsLoading(true);
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,polkadot&vs_currencies=usd&include_24hr_change=true');
      addApiLog('GET', 'coingecko/price', response.status);
      if (response.ok) {
        const data = await response.json();
        const assets = [
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
          { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: data.ethereum.usd, change: data.ethereum.usd_24h_change },
          { id: 'solana', name: 'Solana', symbol: 'SOL', price: data.solana.usd, change: data.solana.usd_24h_change },
          { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: data.cardano.usd, change: data.cardano.usd_24h_change },
          { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', price: data.polkadot.usd, change: data.polkadot.usd_24h_change },
        ];
        setDigitalAssets(assets);
      }
    } catch (error) {
      console.error("Failed to fetch digital assets:", error);
    } finally {
      setIsAssetsLoading(false);
    }
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 12}
          fill={fill}
          opacity={0.3}
        />
      </g>
    );
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/stripe/balance');
      addApiLog('GET', '/api/stripe/balance', response.status);
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
      addApiLog('GET', '/api/stripe/payouts', response.status);
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
    fetchDigitalAssets();
    fetchJobsCount();
    fetchGlobalStats();
    fetchThreats();
    fetchTransactions();
    const interval = setInterval(() => {
      fetchJobsCount();
      fetchGlobalStats();
      fetchThreats();
      fetchTransactions();
    }, 5000);
    return () => clearInterval(interval);
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
      addApiLog('POST', '/api/withdraw', response.status);
      
      const result = await response.json().catch(() => ({ error: 'Invalid response from server' }));
      
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
      console.error("Withdrawal error:", error);
    }
  };

  return (
    <div className="p-8 h-full space-y-8 technical-grid overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-[0.3em]">
            <Globe className="w-3 h-3 animate-pulse" /> Global_Threat_Level: Elevated
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-bold tracking-tighter italic font-mono uppercase glow-text">COMMAND_CENTER_v4.0</h1>
            <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-mono text-emerald-500 uppercase tracking-widest h-fit mt-2">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </div>
          </div>
          <p className="text-neutral-500 text-sm font-mono mt-1 uppercase">OPERATIONAL_OVERVIEW // SYSTEM_STATUS: <span className="text-emerald-500">OPTIMAL</span></p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleConnectStripe}
            disabled={isConnectingStripe}
            className="px-6 py-4 border border-blue-500/30 hover:border-blue-500 text-blue-400 hover:text-blue-500 font-bold font-mono text-xs uppercase tracking-[0.2em] transition-all rounded-xl flex items-center gap-3 group disabled:opacity-50"
          >
            {isConnectingStripe ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            Connect_Stripe
          </button>
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
          { label: 'TOTAL_EARNINGS', value: realBalance ? `$${(realBalance.available + realBalance.pending).toLocaleString()}` : '$2,550.00', icon: DollarSign, trend: '+12.5%', color: 'emerald', action: () => setIsWithdrawModalOpen(true) },
          { label: 'ACTIVE_MISSIONS', value: activeJobsCount.toString(), icon: Target, trend: `+${activeJobsCount}`, color: 'blue', action: () => setActiveTab('jobs') },
          { label: 'VULNS_FOUND', value: globalStats.vulnsFound.toString(), icon: Shield, trend: '+5', color: 'orange' },
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
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest">Live_Sync_Enabled</span>
              </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TerminalIcon className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Live_Network_Activity</h2>
            </div>
            <span className="text-[8px] font-mono text-neutral-600 uppercase">Realtime_API_Logs</span>
          </div>
          
          <div className="space-y-3 font-mono">
            {apiLogs.length > 0 ? (
              apiLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-black/40 border border-neutral-800 rounded-lg group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[8px] px-1.5 py-0.5 rounded font-bold",
                      log.method === 'GET' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {log.method}
                    </span>
                    <span className="text-[10px] text-neutral-400">{log.path}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[10px]",
                      log.status === 200 ? 'text-emerald-500' : 'text-red-500'
                    )}>
                      {log.status}
                    </span>
                    <span className="text-[8px] text-neutral-600">{log.timestamp}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-30">
                <Activity className="w-8 h-8 animate-pulse" />
                <p className="text-[10px] uppercase tracking-widest">Waiting_For_Traffic...</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-800/50">
            <div className="flex justify-between items-center text-[8px] text-neutral-600 uppercase tracking-[0.2em]">
              <span>Neural_Link_Status</span>
              <span className="text-emerald-500">Connected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Rewards_Vault</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Real_Asset_Sync</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
              <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Total_Earnings</p>
              <h3 className="text-4xl font-bold text-white tracking-tighter italic font-mono uppercase">
                {realBalance ? `$${(realBalance.available + realBalance.pending).toLocaleString()}` : '$2,550.00'}
              </h3>
              <p className="text-[8px] font-mono text-neutral-600 uppercase">Verified_Neural_Assets</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                <span>Withdrawable_Balance</span>
                <span>{realBalance ? `$${realBalance.available.toLocaleString()}` : '$2,100.00'}</span>
              </div>
              <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: realBalance ? `${(realBalance.available / (realBalance.available + realBalance.pending)) * 100}%` : '80%' }} />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full py-4 bg-emerald-500 text-black font-bold font-mono text-xs uppercase tracking-[0.2em] transition-all rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 group"
          >
            <Wallet className="w-4 h-4 group-hover:scale-110 transition-transform" />
            INITIATE_PAYOUT
          </button>
        </div>

        <div className="lg:col-span-2 bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Live_Attack_Map</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Active_Scans: 12</span>
            </div>
          </div>
          
          <div className="relative h-[300px] w-full bg-black/40 rounded-lg border border-neutral-800 overflow-hidden group">
            {/* Simple SVG World Map Placeholder */}
            <svg viewBox="0 0 800 400" className="w-full h-full opacity-10 stroke-neutral-700 fill-none">
              <path d="M150,100 Q200,50 250,100 T350,100 T450,150 T550,100 T650,150 T750,100" strokeWidth="1" />
              <path d="M100,200 Q150,150 200,200 T300,200 T400,250 T500,200 T600,250 T700,200" strokeWidth="1" />
              <path d="M200,300 Q250,250 300,300 T400,300 T500,350 T600,300 T700,350" strokeWidth="1" />
            </svg>

            {/* Pulsing Attack Points */}
            {[
              { x: '15%', y: '25%', label: 'US_WEST_2', color: 'emerald' },
              { x: '25%', y: '35%', label: 'US_EAST_1', color: 'emerald' },
              { x: '45%', y: '30%', label: 'EU_WEST_1', color: 'emerald' },
              { x: '55%', y: '45%', label: 'EU_CENTRAL_1', color: 'emerald' },
              { x: '75%', y: '40%', label: 'AP_NORTHEAST_1', color: 'emerald' },
              { x: '85%', y: '65%', label: 'AP_SOUTHEAST_2', color: 'emerald' },
              { x: '35%', y: '75%', label: 'SA_EAST_1', color: 'emerald' },
              { x: '65%', y: '70%', label: 'AF_SOUTH_1', color: 'emerald' },
              { x: '50%', y: '50%', label: 'TARGET_NODE_X', color: 'red' },
            ].map((point, i) => (
              <div 
                key={i}
                className="absolute"
                style={{ left: point.x, top: point.y }}
              >
                <div className="relative">
                  <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] ${point.color === 'red' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <div className={`absolute inset-0 w-1.5 h-1.5 rounded-full animate-ping opacity-50 ${point.color === 'red' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <span className={`text-[7px] font-mono px-1 rounded border ${point.color === 'red' ? 'text-red-500 bg-black/90 border-red-500/20' : 'text-emerald-500 bg-black/80 border-emerald-500/20'}`}>
                      {point.label}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Attack Lines (Simulated) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {[
                "M 120 100 Q 300 150 400 200",
                "M 200 140 Q 350 180 400 200",
                "M 360 120 Q 380 160 400 200",
                "M 440 180 Q 420 190 400 200",
                "M 600 160 Q 500 180 400 200",
                "M 680 260 Q 550 230 400 200",
                "M 280 300 Q 340 250 400 200",
                "M 520 280 Q 460 240 400 200",
              ].map((d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  stroke={i === 0 ? "#ef4444" : "#10b981"}
                  strokeWidth="0.5"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                />
              ))}
            </svg>

            <div className="absolute bottom-4 left-4 space-y-1">
              <p className="text-[8px] font-mono text-neutral-600 uppercase">Incoming_Traffic: 4.8 GB/s</p>
              <p className="text-[8px] font-mono text-emerald-500 uppercase">Neural_Link: Optimized</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Target_Nodes', value: '4,892' },
              { label: 'Active_Proxies', value: '142' },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-black/40 border border-neutral-800 rounded-lg">
                <p className="text-[8px] font-mono text-neutral-600 uppercase mb-1">{item.label}</p>
                <p className="text-xs font-bold font-mono text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Live_Threat_Intelligence</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Realtime_Feed</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {threats.map((threat, i) => (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-black/40 border border-neutral-800 rounded-lg group hover:border-red-500/30 transition-all flex items-start gap-4"
                >
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    threat.severity === 'Critical' ? 'bg-red-500/10 text-red-500' :
                    threat.severity === 'High' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  )}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-bold text-white tracking-tight group-hover:text-red-400 transition-colors">{threat.title}</h3>
                      <span className="text-[8px] font-mono text-neutral-600 uppercase">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono leading-relaxed">{threat.description}</p>
                    <div className="flex gap-3 pt-1">
                      <span className="text-[8px] font-mono text-neutral-700 uppercase">Type: {threat.type}</span>
                      <span className={cn(
                        "text-[8px] font-mono uppercase",
                        threat.severity === 'Critical' ? 'text-red-500' :
                        threat.severity === 'High' ? 'text-orange-500' :
                        'text-yellow-500'
                      )}>Severity: {threat.severity}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Mission_Control_Summary</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Neural_Link_Active</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-black/40 border border-neutral-800 rounded-lg space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                <span className="text-neutral-500">Active_Missions</span>
                <span className="text-white">{activeJobsCount}_OPERATIONAL</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: activeJobsCount > 0 ? '65%' : '0%' }} />
              </div>
              <div className="flex justify-between items-center text-[8px] font-mono text-neutral-600 uppercase">
                <span>Total_Completed</span>
                <span className="text-emerald-500">{globalStats.completedMissions}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 border border-neutral-800 rounded-lg">
                <p className="text-[8px] font-mono text-neutral-600 uppercase mb-1">Potential_Bounties</p>
                <p className="text-lg font-bold font-mono text-emerald-500 tracking-tight">$12,450</p>
              </div>
              <div className="p-4 bg-black/40 border border-neutral-800 rounded-lg">
                <p className="text-[8px] font-mono text-neutral-600 uppercase mb-1">Success_Rate</p>
                <p className="text-lg font-bold font-mono text-blue-500 tracking-tight">84.2%</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('jobs')}
            className="w-full py-3 border border-neutral-800 hover:border-emerald-500/30 text-[10px] font-mono text-neutral-500 hover:text-emerald-500 uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 group"
          >
            Go_To_Mission_Control <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      </div>

      <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Digital_Asset_Tracker</h2>
          </div>
          <button 
            onClick={fetchDigitalAssets}
            disabled={isAssetsLoading}
            className="text-[10px] font-mono text-neutral-500 hover:text-emerald-500 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isAssetsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
            Sync_Realtime_Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {digitalAssets.length > 0 ? (
            digitalAssets.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-black/40 border border-neutral-800 rounded-xl hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">{asset.symbol}</p>
                    <h3 className="text-xs font-bold text-white">{asset.name}</h3>
                  </div>
                  <div className={cn(
                    "text-[8px] font-mono px-1.5 py-0.5 rounded border",
                    asset.change >= 0 
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                      : "text-red-500 bg-red-500/10 border-red-500/20"
                  )}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold font-mono text-white tracking-tight">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Math.abs(asset.change) * 10, 100)}%` }}
                      className={cn(
                        "h-full shadow-[0_0_8px]",
                        asset.change >= 0 ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 bg-black/40 border border-neutral-800 rounded-xl animate-pulse">
                <div className="h-8 bg-neutral-800 rounded mb-4" />
                <div className="h-4 bg-neutral-800 rounded w-2/3" />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">Transaction_Ledger</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Realtime_Audit</span>
            </div>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <div key={tx.id || idx} className="flex items-center justify-between p-4 bg-black/40 border border-neutral-800 rounded-lg group hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      tx.type === 'payout' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {tx.type === 'payout' ? <ArrowUpRight className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">{tx.description}</p>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase">
                        {tx.type.toUpperCase()} // {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-bold font-mono",
                      tx.type === 'payout' ? 'text-red-500' : 'text-emerald-500'
                    )}>
                      {tx.type === 'payout' ? '-' : '+'}${(tx.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={cn(
                      "text-[8px] font-mono uppercase",
                      tx.status === 'completed' ? 'text-emerald-500' : 'text-yellow-500'
                    )}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-neutral-600 font-mono text-xs uppercase tracking-widest">
                No_Transactions_Found
              </div>
            )}
          </div>
        </div>

        <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white">System_Logs</h2>
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
