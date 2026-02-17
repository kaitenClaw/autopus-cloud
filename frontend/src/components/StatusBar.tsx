import { useState, useEffect, useCallback } from 'react';
import { Wifi, Cloud, RefreshCw, XCircle, CloudOff } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Assuming cn utility is available or I'll create one in a utils folder
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RuntimeStatusData {
  runtimeHost: string;
  runtimeMode: 'local' | 'cloud' | 'hybrid';
  timestamp: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const CLOUD_HEALTH_URL = import.meta.env.VITE_CLOUD_HEALTH_URL;

export default function StatusBar() {
  const [localStatus, setLocalStatus] = useState<{ online: boolean; latency: number | null; host: string | null; mode: string | null; } | null>(null);
  const [cloudStatus, setCloudStatus] = useState<{ online: boolean; latency: number | null; } | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('ocaas_token'));

  const fetchLocalStatus = useCallback(async () => {
    const start = Date.now();
    try {
      const token = localStorage.getItem('ocaas_token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE_URL}/system/runtime`, { headers });
      if (!response.ok) {
        // If not authenticated, the backend might return 401/403
        if (response.status === 401 || response.status === 403) {
          setIsAuthenticated(false);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: { status: string; data: RuntimeStatusData } = await response.json();
      const latency = Date.now() - start;
      setLocalStatus({ online: true, latency, host: data.data.runtimeHost, mode: data.data.runtimeMode });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch local runtime status:', error);
      setLocalStatus({ online: false, latency: null, host: null, mode: null });
      // Do not set isAuthenticated to false here, it's handled by specific 401/403 check above
    }
  }, [API_BASE_URL]);

  const fetchCloudStatus = useCallback(async () => {
    if (!CLOUD_HEALTH_URL) {
      setCloudStatus(null);
      return;
    }
    const start = Date.now();
    try {
      const response = await fetch(CLOUD_HEALTH_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const latency = Date.now() - start;
      setCloudStatus({ online: true, latency });
    } catch (error) {
      console.error('Failed to fetch cloud health status:', error);
      setCloudStatus({ online: false, latency: null });
    }
  }, [CLOUD_HEALTH_URL]);

  useEffect(() => {
    const refreshStatus = () => {
      const currentAuthStatus = !!localStorage.getItem('ocaas_token');
      setIsAuthenticated(currentAuthStatus);

      if (currentAuthStatus) {
        fetchLocalStatus();
        fetchCloudStatus();
      } else {
        setLocalStatus({ online: false, latency: null, host: null, mode: null });
        setCloudStatus(CLOUD_HEALTH_URL ? { online: false, latency: null } : null);
      }
      setLastRefresh(new Date().toLocaleTimeString());
    };

    const handleAuthChanged = () => refreshStatus();

    refreshStatus();
    const interval = setInterval(refreshStatus, 30000);
    window.addEventListener('ocaas-auth-changed', handleAuthChanged);

    return () => {
      clearInterval(interval);
      window.removeEventListener('ocaas-auth-changed', handleAuthChanged);
    };
  }, [fetchLocalStatus, fetchCloudStatus]);

  const isCloudConfigured = !!CLOUD_HEALTH_URL;
  const localOnline = localStatus?.online;
  const cloudOnline = cloudStatus?.online;

  let syncIndicator: string;
  let syncColor: string;
  if (!isAuthenticated) {
    syncIndicator = "Authentication Required";
    syncColor = "text-orange-400";
  } else if (isCloudConfigured) {
    if (localOnline && cloudOnline) {
      syncIndicator = "In Sync";
      syncColor = "text-emerald-400";
    } else if (localOnline) {
      syncIndicator = "Single Source (Local)";
      syncColor = "text-yellow-400";
    } else if (cloudOnline) { // This case should ideally not happen for primary admin hub if local is expected
      syncIndicator = "Single Source (Cloud)";
      syncColor = "text-yellow-400";
    } else {
      syncIndicator = "Degraded";
      syncColor = "text-red-400";
    }
  } else {
    syncIndicator = "Single Source (Local)";
    syncColor = "text-zinc-500";
  }

  return (
    <div className="bg-[#171717] border-b border-white/5 p-3 flex flex-wrap items-center justify-between text-xs font-medium sticky top-0 z-10">
      <div className="flex items-center gap-4 max-md:w-full max-md:justify-center max-md:mb-2">
        <span className="text-zinc-400 uppercase tracking-wider">Runtime Status</span>
        <span className={cn("px-2 py-0.5 rounded-full", 
            isAuthenticated ? (isCloudConfigured ? (localOnline && cloudOnline ? "bg-emerald-500/20" : "bg-yellow-500/20") : "bg-zinc-600/20") : "bg-orange-500/20",
            syncColor
        )}>{syncIndicator}</span>
      </div>

      <div className="flex gap-3 items-center max-md:w-full max-md:justify-center max-md:my-2">
        {/* Local Status */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#212121] border border-white/5">
          {localOnline ? <Wifi size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
          <span className={localOnline ? "text-emerald-400" : "text-red-400"}>Local ({localStatus?.host || 'Unknown'})</span>
          {localStatus?.latency !== null && (localOnline ?
            <span className="text-[10px] text-emerald-400 opacity-75">{localStatus?.latency}ms</span> : null
          )}
        </div>

        {/* Cloud Status */}
        {isCloudConfigured ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#212121] border border-white/5">
            {cloudOnline ? <Cloud size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
            <span className={cloudOnline ? "text-emerald-400" : "text-red-400"}>Cloud (VPS)</span>
            {cloudStatus?.latency !== null && (cloudOnline ?
              <span className="text-[10px] text-emerald-400 opacity-75">{cloudStatus?.latency}ms</span> : null
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#212121] border border-white/5 text-zinc-400">
            <CloudOff size={14} />
            <span>Cloud (Not Configured)</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-zinc-500 max-md:w-full max-md:justify-center max-md:mt-2">
        <RefreshCw size={12} />
        <span>Last Refresh: {lastRefresh || 'N/A'}</span>
      </div>
    </div>
  );
}
