import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, ChevronRight, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Terminal({ isOpen, onClose }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'BountyBot Kernel v4.0.2 [Build 2026.03.29]',
    'Initializing secure neural tunnel...',
    'Loading AI Recon modules...',
    'System ready. Type "help" for a list of commands.',
    ''
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `> ${input}`];

    switch (cmd) {
      case 'help':
        newHistory.push(
          'Available commands:',
          '  help      - Show this help message',
          '  clear     - Clear terminal history',
          '  scan      - Run a quick system scan',
          '  status    - Check system status',
          '  whoami    - Display current user info',
          '  exit      - Close terminal'
        );
        break;
      case 'clear':
        setHistory(['Terminal cleared.', '']);
        setInput('');
        return;
      case 'scan':
        newHistory.push(
          'Scanning local network...',
          '[OK] 127.0.0.1 (localhost)',
          '[OK] 192.168.1.1 (gateway)',
          '[WARN] 192.168.1.45 (unrecognized_device)',
          'Scan complete. 0 vulnerabilities found.'
        );
        break;
      case 'status':
        newHistory.push(
          'System Status:',
          '  CPU: 4.2% [NORMAL]',
          '  MEM: 256MB [NORMAL]',
          '  VPN: ACTIVE [SECURE]',
          '  AI_CORE: ONLINE [READY]'
        );
        break;
      case 'whoami':
        newHistory.push('User: mcdt509@gmail.com', 'Role: Lead_Security_Researcher', 'Access_Level: Root');
        break;
      case 'exit':
        onClose();
        break;
      default:
        newHistory.push(`Command not found: ${cmd}`);
    }

    newHistory.push('');
    setHistory(newHistory);
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-2 bg-neutral-800/50 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">BOUNTYBOT_TERMINAL_v4.0.2</span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-neutral-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Content */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 font-mono text-xs text-emerald-500/90 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent"
            >
              {history.map((line, i) => (
                <div key={i} className={line.startsWith('>') ? 'text-white' : ''}>
                  {line}
                </div>
              ))}
              <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2">
                <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white caret-emerald-500"
                  spellCheck={false}
                />
              </form>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[9px] font-mono text-neutral-600">
                  <Command className="w-3 h-3" />
                  <span>CTRL+` TO TOGGLE</span>
                </div>
              </div>
              <div className="text-[9px] font-mono text-neutral-600 uppercase">
                Kernel_Status: OK
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
