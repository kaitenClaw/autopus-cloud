import { RefreshCw, XCircle } from 'lucide-react';
import { useSystemStatus } from '../../hooks/useSystemStatus';
import { cn } from '../../utils';

export const SidebarSystemStatus = () => {
    const { local, cloud, isAuthenticated, lastRefresh, refresh } = useSystemStatus();

    const isCloudConfigured = !!import.meta.env.VITE_CLOUD_HEALTH_URL;
    const localOnline = local?.online;
    const cloudOnline = cloud?.online;

    let statusColor = "text-zinc-500";
    let statusText = "Checking...";

    if (!isAuthenticated) {
        statusColor = "text-orange-400";
        statusText = "Auth Required";
    } else if (localOnline) {
        statusColor = "text-emerald-400";
        statusText = "System Online";
    } else {
        statusColor = "text-red-400";
        statusText = "System Offline";
    }

    return (
        <div className="px-4 py-3 border-t border-white/5 bg-[#1a1a1a]/30">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">System Status</span>
                    <span className={cn("text-[10px] font-medium", statusColor)}>{statusText}</span>
                </div>
                <button onClick={refresh} className="text-zinc-500 hover:text-zinc-300 transition-colors" title="Refresh Status">
                    <RefreshCw size={12} />
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        {localOnline ?
                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> :
                            <XCircle size={10} className="text-red-400" />
                        }
                        <span className="text-zinc-300">Local Runtime</span>
                    </div>
                    {localOnline && <span className="text-[10px] text-zinc-500">{local.latency}ms</span>}
                </div>

                {isCloudConfigured && (
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            {cloudOnline ?
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> :
                                <XCircle size={10} className="text-red-400" />
                            }
                            <span className="text-zinc-300">Cloud Link</span>
                        </div>
                        {cloudOnline && <span className="text-[10px] text-zinc-500">{cloud.latency}ms</span>}
                    </div>
                )}

                <div className="text-[10px] text-zinc-600 flex justify-between pt-1">
                    <span className="truncate max-w-[100px]" title={local.host || ''}>{local.host || 'Unknown Host'}</span>
                    <span>{lastRefresh}</span>
                </div>
            </div>
        </div>
    );
};
