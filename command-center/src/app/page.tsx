'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Terminal, 
  ShieldCheck, 
  Activity,
  Zap,
  Box,
  Cpu,
  Send,
  LogOut,
  ChevronRight,
  Circle
} from 'lucide-react';

interface Message {
  sender: 'user' | 'agent' | 'system';
  text: string;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input, agentId: 'forge' }),
      });
      const data = await response.json();
      
      setMessages((prev) => [...prev, { 
        sender: 'agent', 
        text: data.response || data.data?.assistantMessage?.content || data.message || 'No response from agent.' 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { sender: 'system', text: 'Connection error. Agent might be offline.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
          <h2 className="font-semibold text-sm text-white">Live Command</h2>
        </div>
        {isLoading && <span className="text-[10px] text-zinc-500 italic">Processing...</span>}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-20">
            <MessageSquare className="w-8 h-8" />
            <p className="text-xs italic">Awaiting commands...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : msg.sender === 'system'
                  ? 'bg-red-900/20 text-red-400 border border-red-900/50'
                  : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50 placeholder:text-zinc-600"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-700 p-2 rounded-lg transition-colors text-white shadow-lg shadow-blue-900/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user, logout, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ agents: [], kaiten: [], system: {} });

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [token, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const [runtimeRes, kaitenRes, agentsRes] = await Promise.all([
            fetch('/api/system/runtime', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/system/kaiten/agents', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/agents', { headers: { 'Authorization': `Bearer ${token}` } }),
          ]);

          const runtime = await runtimeRes.json();
          const kaiten = await kaitenRes.json();
          const agents = await agentsRes.json();

          setStats({
            system: runtime.data || {},
            kaiten: kaiten.data?.agents || [],
            agents: agents.data?.agents || []
          });
        }
      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
      }
    };

    fetchData();
  }, [token]);

  if (authLoading || !token) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">Base</div>
              <h1 className="text-2xl font-bold tracking-tight">KAITEN Hub</h1>
            </div>
            <p className="text-zinc-500 text-sm">Welcome back, <span className="text-zinc-300 font-medium">{user?.email}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-green-500 uppercase tracking-widest">Network Online</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Live Agents</p>
            <p className="text-3xl font-bold mt-1">4</p>
          </div>
          
          <div className="group bg-zinc-900/50 border border-zinc-800 hover:border-green-500/50 rounded-2xl p-5 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-500/10 p-2.5 rounded-xl text-green-500 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">API Health</p>
            <p className="text-3xl font-bold mt-1">99.9%</p>
          </div>

          <div className="group bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-5 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">VPS Load</p>
            <p className="text-3xl font-bold mt-1">12%</p>
          </div>

          <div className="group bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/50 rounded-2xl p-5 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-orange-500/10 p-2.5 rounded-xl text-orange-500 group-hover:scale-110 transition-transform">
                <Box className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Quota Used</p>
            <p className="text-3xl font-bold mt-1">2.4k</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <h2 className="font-bold text-lg">Active Personnel</h2>
                </div>
                <button className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors group">
                  Refresh Roster <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {(stats.kaiten.length > 0 ? stats.kaiten : [
                  { name: 'KAITEN Prime', role: 'Orchestrator', status: 'Standby', model: 'Gemini 3 Flash', color: 'zinc' },
                  { name: 'KAITEN Forge', role: 'Builder', status: 'Working', model: 'Gemini 3 Pro', color: 'blue' },
                  { name: 'KAITEN Sight', role: 'Diagnostics', status: 'Auditing', model: 'Gemini 3 Pro', color: 'purple' },
                  { name: 'KAITEN Pulse', role: 'Coordinator', status: 'Monitoring', model: 'Gemini 3 Flash', color: 'green' },
                ]).map((agent: any, i: number) => (
                  <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-zinc-800/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-black text-lg text-zinc-500 group-hover:text-blue-500 group-hover:border-blue-500/50 transition-all`}>
                        {agent.name.includes(' ') ? agent.name.split(' ')[1].charAt(0) : agent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-100 group-hover:text-white transition-colors">{agent.name}</h3>
                        <p className="text-xs text-zinc-500 font-medium">{agent.role || 'Personnel'} • {agent.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        agent.status === 'RUNNING' || agent.status === 'Working' ? 'bg-blue-500/10 text-blue-500' : 
                        agent.status === 'Auditing' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-zinc-800 text-zinc-500'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          agent.status === 'RUNNING' || agent.status === 'Working' ? 'bg-blue-500 animate-pulse' : 
                          agent.status === 'Auditing' ? 'bg-purple-500' :
                          'bg-zinc-500'
                        }`} />
                        {agent.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-5 h-5 text-zinc-500" />
                <h2 className="font-bold text-sm uppercase tracking-widest text-zinc-400">Station Logs</h2>
              </div>
              <div className="font-mono text-[11px] space-y-2 text-zinc-500 overflow-hidden">
                <p><span className="text-zinc-600">[12:42:01]</span> <span className="text-green-500/80">SUCCESS:</span> Base migration to Vultr Cloud complete.</p>
                <p><span className="text-zinc-600">[13:15:33]</span> <span className="text-blue-500/80">INFO:</span> SpawnerService v1.0 initiated on port range 19000-19999.</p>
                <p><span className="text-zinc-600">[14:02:19]</span> <span className="text-blue-500/80">INFO:</span> MessageProxy endpoint established at /api/chat.</p>
                <p><span className="text-zinc-600">[17:52:05]</span> <span className="text-purple-500/80">AUDIT:</span> Rate limiting applied to authentication endpoints.</p>
                <div className="flex gap-1 animate-pulse">
                  <span className="w-1 h-3 bg-blue-500/50" />
                  <span className="text-blue-500/50 italic">Listening for events...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 shadow-xl shadow-blue-900/20 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black italic tracking-tighter">SPRINT: OCaaS MVP</h3>
                <p className="text-blue-100 text-xs font-medium leading-relaxed">
                  We are accelerating. Backend foundation is 100% complete. Transitioning to full frontend integration and automated personnel management.
                </p>
                <div className="pt-2">
                  <div className="w-full bg-blue-900/50 rounded-full h-1.5">
                    <div className="bg-white rounded-full h-1.5 w-[75%]" />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-blue-200">
                    <span>PROGRESS</span>
                    <span>75%</span>
                  </div>
                </div>
              </div>
              <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-400/20 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </div>
      {/* Hour 2: Live Chat Integration */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
        <ChatWindow />
      </div>
    </div>
  );
};

export default DashboardPage;