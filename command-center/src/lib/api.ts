const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.autopus.cloud/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ocaas_token');
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API ${res.status}`);
  }

  return res.json();
}

// --- Admin endpoints ---

export interface SystemHealth {
  status: string;
  version: string;
  database: string;
  uptime: string;
  agents: { total: number; running: number; stopped: number; error: number };
  timestamp: string;
}

export interface AdminAgent {
  id: string;
  name: string;
  status: string;
  modelPreset: string;
  port: number | null;
  createdAt: string;
  user: { id: string; email: string };
  agentConfig: { model: string } | null;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { agents: number };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const res = await apiFetch<{ data: SystemHealth }>('/admin/system/health');
  return res.data;
}

export async function getAdminAgents(): Promise<AdminAgent[]> {
  const res = await apiFetch<{ data: { agents: AdminAgent[] } }>('/admin/agents');
  return res.data.agents;
}

export async function getAdminUsers(page = 1): Promise<{ users: AdminUser[]; total: number }> {
  const res = await apiFetch<{ data: { users: AdminUser[]; total: number } }>(`/admin/users?page=${page}`);
  return res.data;
}

// --- User-level endpoints (for chat) ---

export interface Agent {
  id: string;
  name: string;
  status: string;
  modelPreset: string;
  port: number | null;
}

export async function getAgents(): Promise<Agent[]> {
  const res = await apiFetch<{ data: { agents: Agent[] } }>('/agents');
  return res.data.agents;
}

export async function sendAgentMessage(
  agentId: string,
  message: string,
  token?: string
): Promise<{ userMessage: unknown; assistantMessage: { content: string } }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/agents/${agentId}/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error(`Chat API ${res.status}`);
  const data = await res.json();
  return data.data;
}
