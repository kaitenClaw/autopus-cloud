import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Trash2, Pause, Play, Download, Zap } from 'lucide-react';
import { getLogs } from '../../api';
import { socketClient } from '../../utils/socket';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
}

export const RealTimeLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch real logs via polling AND listen to socket for real-time updates
  useEffect(() => {
    if (isPaused) return;

    // 1. Initial fetch
    const fetchInitialLogs = async () => {
      try {
        const result = await getLogs(100);
        const logArray = Array.isArray(result) ? result : (result?.logs || []);
        setLogs([...logArray].reverse());
      } catch (error) {
        console.error('Failed to fetch initial logs', error);
      }
    };
    fetchInitialLogs();

    // 2. Setup socket listener for live events
    socketClient.connect();
    const handleNewLog = (newLog: LogEntry) => {
      setLogs(prev => {
        const next = [...prev, newLog];
        return next.slice(-100); // Keep buffer to 100
      });
    };
    socketClient.on('log', handleNewLog);

    // 3. Polling as a fallback (every 5 seconds)
    const interval = setInterval(async () => {
      try {
        const result = await getLogs(20); // Get latest 20 logs
        const newLogs = Array.isArray(result) ? result : (result?.logs || []);
        
        setLogs(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const filteredNew = newLogs.filter((l: LogEntry) => !existingIds.has(l.id));
          
          if (filteredNew.length === 0) return prev;
          
          const combined = [...prev, ...filteredNew.reverse()];
          return combined.slice(-100);
        });
      } catch (error) {
        console.error('Polling logs failed', error);
      }
    }, 5000);

    return () => {
      socketClient.off('log', handleNewLog);
      clearInterval(interval);
    };
  }, [isPaused]);

  // Auto-scroll logic
  useEffect(() => {
    if (isLive && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isLive]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // If user scrolls up significantly, disable auto-scroll (isLive)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsLive(isAtBottom);
  };

  const clearLogs = () => setLogs([]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'warn': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'debug': return 'text-zinc-500';
      default: return 'text-zinc-300';
    }
  };

  const downloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autopus-logs-${new Date().toISOString()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden font-mono text-[11px] sm:text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-300 font-medium">System Logs</span>
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${isLive ? 'bg-emerald-900/30 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
            <Zap className={`w-2.5 h-2.5 ${isLive ? 'animate-pulse' : ''}`} />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded transition-colors ${isPaused ? 'bg-amber-900/20 text-amber-400' : 'hover:bg-zinc-800 text-zinc-400'}`}
            title={isPaused ? "Resume Stream" : "Pause Stream"}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button 
            onClick={clearLogs}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-400 transition-colors"
            title="Clear Buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={downloadLogs}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Download Logs"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Content */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-1 selection:bg-blue-500/30 custom-scrollbar bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,25,1)_0%,rgba(10,10,12,1)_100%)]"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-700 italic">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Initializing real-time stream...</span>
            </div>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={log.id + i} className="flex gap-3 hover:bg-white/5 py-0.5 px-1 rounded transition-colors group">
              <span className="text-zinc-600 shrink-0 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className={`uppercase w-12 shrink-0 font-bold ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
              <span className="text-emerald-500/80 shrink-0 hidden sm:inline-block min-w-[80px] truncate">
                {log.source}
              </span>
              <span className="text-zinc-300 break-all leading-relaxed">
                {log.message}
              </span>
            </div>
          ))
        )}
        {!isLive && logs.length > 0 && (
          <button 
            onClick={() => setIsLive(true)}
            className="sticky bottom-0 left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-full shadow-lg hover:bg-blue-500 transition-all flex items-center gap-1.5"
          >
            <ArrowDown className="w-3 h-3" />
            Resume Auto-scroll
          </button>
        )}
      </div>

      {/* Footer / Stats */}
      <div className="px-4 py-1.5 bg-zinc-900 border-t border-zinc-800 flex justify-between text-[11px] text-zinc-500">
        <div className="flex gap-4">
          <span>Buffer: {logs.length}/100</span>
          {isPaused && <span className="text-amber-500 font-bold uppercase tracking-widest">Paused</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
          OCaaS Internal Node
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
  </svg>
);

const ArrowDown = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
  </svg>
);
