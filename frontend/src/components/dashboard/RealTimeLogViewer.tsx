import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { 
  Terminal, 
  Trash2, 
  Pause, 
  Play, 
  Download, 
  Zap, 
  Loader2, 
  ArrowDown, 
  Search,
  Filter,
  X,
  Settings2,
  Clock
} from 'lucide-react';
import { getLogs } from '../../api';
import { socketClient } from '../../utils/socket';
import { cn } from '../../utils';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
  metadata?: Record<string, any>;
}

interface RealTimeLogViewerProps {
  maxBufferSize?: number;
  pollIntervalMs?: number;
  showFilters?: boolean;
  height?: string;
  sources?: string[];
}

const LOG_LEVELS: { level: LogLevel; label: string; color: string; bg: string }[] = [
  { level: 'info', label: 'INFO', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { level: 'warn', label: 'WARN', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { level: 'error', label: 'ERROR', color: 'text-red-400', bg: 'bg-red-500/10' },
  { level: 'debug', label: 'DEBUG', color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
];

export const RealTimeLogViewer: React.FC<RealTimeLogViewerProps> = ({
  maxBufferSize = 100,
  pollIntervalMs = 5000,
  showFilters = true,
  height = '400px',
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<Set<LogLevel>>(new Set(['info', 'warn', 'error']));
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Extract unique sources from logs
  const availableSources = useMemo(() => {
    const sourceSet = new Set(logs.map(l => l.source));
    return Array.from(sourceSet).sort();
  }, [logs]);

  // Filter logs based on search, levels, and source
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Level filter
      if (!selectedLevels.has(log.level)) return false;
      
      // Source filter
      if (selectedSource !== 'all' && log.source !== selectedSource) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.message.toLowerCase().includes(query) ||
          log.source.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [logs, selectedLevels, selectedSource, searchQuery]);

  // Fetch real logs via polling AND listen to socket for real-time updates
  useEffect(() => {
    if (isPaused) return;

    setIsConnecting(true);

    // 1. Initial fetch
    const fetchInitialLogs = async () => {
      try {
        const result = await getLogs(maxBufferSize);
        const logArray = Array.isArray(result) ? result : (result?.logs || []);
        setLogs([...logArray].reverse());
      } catch (error) {
        console.error('[RealTimeLogViewer] Failed to fetch initial logs:', error);
      } finally {
        setIsConnecting(false);
      }
    };
    fetchInitialLogs();

    // 2. Setup socket listener for live events
    try {
      socketClient.connect();
      const handleNewLog = (newLog: LogEntry) => {
        if (isPaused) return;
        
        setLogs(prev => {
          const next = [...prev, newLog];
          return next.slice(-maxBufferSize);
        });
      };
      socketClient.on('log', handleNewLog);
      socketClient.on('connect', () => {
        setIsConnecting(false);
      });
    } catch (error) {
      console.warn('[RealTimeLogViewer] Socket connection failed, falling back to polling:', error);
    }

    // 3. Polling as a fallback (every 5 seconds)
    const interval = setInterval(async () => {
      if (isPaused) return;
      
      try {
        const result = await getLogs(20);
        const newLogs = Array.isArray(result) ? result : (result?.logs || []);
        
        setLogs(prev => {
          const existingIds = new Set(prev.map(l => l.id));
          const filteredNew = newLogs.filter((l: LogEntry) => !existingIds.has(l.id));
          
          if (filteredNew.length === 0) return prev;
          
          const combined = [...prev, ...filteredNew.reverse()];
          return combined.slice(-maxBufferSize);
        });
      } catch (error) {
        console.error('[RealTimeLogViewer] Polling logs failed:', error);
      }
    }, pollIntervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [isPaused, maxBufferSize, pollIntervalMs]);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScrollEnabled && isLive && scrollRef.current && filteredLogs.length > 0) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, isLive, autoScrollEnabled]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsLive(isAtBottom);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleLevel = useCallback((level: LogLevel) => {
    setSelectedLevels(prev => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  }, []);

  const downloadLogs = useCallback(() => {
    const text = filteredLogs.map(l => 
      `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`
    ).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autopus-logs-${new Date().toISOString().split('T')[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

  const getLevelStyle = (level: LogLevel) => {
    switch (level) {
      case 'info': return 'text-blue-400 bg-blue-500/10';
      case 'warn': return 'text-yellow-400 bg-yellow-500/10';
      case 'error': return 'text-red-400 bg-red-500/10';
      case 'debug': return 'text-zinc-500 bg-zinc-500/10';
      default: return 'text-zinc-300 bg-zinc-500/10';
    }
  };

  const getConnectionStatus = () => {
    if (isConnecting) return { label: 'Connecting...', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (isPaused) return { label: 'Paused', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (isLive) return { label: 'Live', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    return { label: 'Buffering', color: 'text-zinc-400', bg: 'bg-zinc-500/10' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div 
      className="flex flex-col bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden font-mono text-[11px] sm:text-xs"
      style={{ height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-300 font-medium">System Logs</span>
          <span className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold',
            connectionStatus.bg, connectionStatus.color
          )}>
            <Zap className={cn('w-2.5 h-2.5', isLive && !isPaused && 'animate-pulse')} />
            {connectionStatus.label}
          </span>
          
          {/* Stats */}
          <span className="text-[10px] text-zinc-500 hidden sm:inline">
            {filteredLogs.length} / {logs.length}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Search */}
          {showFilters && (
            <div className="relative hidden sm:block mr-2">
              <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-40 bg-zinc-800 border border-zinc-700 rounded-md pl-7 pr-2 py-1 text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Settings Toggle */}
          {showFilters && (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'p-1.5 rounded transition-colors',
                showSettings ? 'bg-zinc-700 text-zinc-200' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300'
              )}
              title="Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}

          {/* Pause/Resume */}
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              'p-1.5 rounded transition-colors',
              isPaused ? 'bg-amber-900/20 text-amber-400' : 'hover:bg-zinc-800 text-zinc-400'
            )}
            title={isPaused ? "Resume Stream" : "Pause Stream"}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Clear */}
          <button 
            onClick={clearLogs}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-400 transition-colors"
            title="Clear Buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Download */}
          <button 
            onClick={downloadLogs}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Download Logs"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showFilters && showSettings && (
        <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 space-y-3 animate-in slide-in-from-top-2">
          {/* Level Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px] text-zinc-500 mr-1">Levels:</span>
            {LOG_LEVELS.map(({ level, label, color, bg }) => (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-medium transition-all',
                  selectedLevels.has(level) ? cn(bg, color) : 'bg-zinc-800 text-zinc-600'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          {availableSources.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500">Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-[11px] text-zinc-300 focus:outline-none focus:border-blue-500/50"
              >
                <option value="all">All Sources</option>
                {availableSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          )}

          {/* Auto-scroll Toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScrollEnabled}
                onChange={(e) => setAutoScrollEnabled(e.target.checked)}
                className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-0"
              />
              <span className="text-[11px] text-zinc-400">Auto-scroll</span>
            </label>
          </div>
        </div>
      )}

      {/* Log Content */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-1 selection:bg-blue-500/30 custom-scrollbar bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,25,1)_0%,rgba(10,10,12,1)_100%)]"
      >
        {isConnecting && logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-700 italic">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Initializing real-time stream...</span>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-600 italic">
            {searchQuery || selectedLevels.size < 3 ? (
              <span>No logs match your filters</span>
            ) : (
              <span>No logs yet. Waiting for events...</span>
            )}
          </div>
        ) : (
          <>
            {filteredLogs.map((log, i) => (
              <div 
                key={log.id + i} 
                className="flex gap-3 hover:bg-white/5 py-0.5 px-1 rounded transition-colors group"
              >
                <span className="text-zinc-600 shrink-0 whitespace-nowrap tabular-nums">
                  <Clock className="w-3 h-3 inline mr-1 opacity-50" />
                  {new Date(log.timestamp).toLocaleTimeString([], { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </span>
                <span className={cn(
                  'uppercase w-12 shrink-0 font-bold px-1.5 py-0 rounded text-[10px] flex items-center justify-center',
                  getLevelStyle(log.level)
                )}>
                  {log.level}
                </span>
                <span className="text-emerald-500/80 shrink-0 hidden sm:inline-block min-w-[80px] truncate">
                  {log.source}
                </span>
                <span className="text-zinc-300 break-all leading-relaxed">
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        )}
        
        {!isLive && filteredLogs.length > 0 && (
          <button 
            onClick={() => setIsLive(true)}
            className="sticky bottom-0 left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-full shadow-lg transition-all flex items-center gap-1.5 animate-in fade-in zoom-in"
          >
            <ArrowDown className="w-3 h-3" />
            Resume Auto-scroll
          </button>
        )}
      </div>

      {/* Footer / Stats */}
      <div className="px-4 py-1.5 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center text-[11px] text-zinc-500 shrink-0">
        <div className="flex gap-4">
          <span>Buffer: {logs.length}/{maxBufferSize}</span>
          <span className="text-zinc-600">|</span>
          <span>Showing: {filteredLogs.length}</span>
          {isPaused && <span className="text-amber-500 font-bold uppercase tracking-widest">Paused</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            isPaused ? 'bg-amber-500' : isLive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'
          )} />
          OCaaS Internal Node
        </div>
      </div>
    </div>
  );
};

export default RealTimeLogViewer;
