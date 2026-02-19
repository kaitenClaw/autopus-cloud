import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const CLOUD_HEALTH_URL = import.meta.env.VITE_CLOUD_HEALTH_URL;

interface RuntimeStatusData {
    runtimeHost: string;
    runtimeMode: 'local' | 'cloud' | 'hybrid';
    timestamp: string;
}

export interface SystemStatus {
    local: { online: boolean; latency: number | null; host: string | null; mode: string | null };
    cloud: { online: boolean; latency: number | null };
    isAuthenticated: boolean;
    lastRefresh: string | null;
    refresh: () => void;
}

export function useSystemStatus(): SystemStatus {
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
        }
    }, []);

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
    }, []);

    const refreshStatus = useCallback(() => {
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
    }, [fetchLocalStatus, fetchCloudStatus]);

    useEffect(() => {
        const handleAuthChanged = () => refreshStatus();

        refreshStatus();
        const interval = setInterval(refreshStatus, 30000);
        window.addEventListener('ocaas-auth-changed', handleAuthChanged);

        return () => {
            clearInterval(interval);
            window.removeEventListener('ocaas-auth-changed', handleAuthChanged);
        };
    }, [refreshStatus]);

    return {
        local: localStatus || { online: false, latency: null, host: null, mode: null },
        cloud: cloudStatus || { online: false, latency: null },
        isAuthenticated,
        lastRefresh,
        refresh: refreshStatus
    };
}
