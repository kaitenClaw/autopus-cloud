'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Terminal, 
  ShieldCheck, 
  Activity,
  Zap,
  Box,
  Cpu,
  Send
} from 'lucide-react';

interface Message {
  sender: 'user' | 'agent' | 'system';
  text: string;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      
      setMessages((prev) => [...prev, { 
        sender: 'agent', 
        text: data.response || data.error || 'No response from agent.' 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { sender: 'system', text: 'Connection error. Check console.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <h2 className="font-semibold text-sm text-white">Live Agent Chat</h2>
        </div>
        {isLoading && <span className="text-[10px] text-zinc-500 animate-pulse">Agent is thinking...</span>}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-950/50">
        {messages.length === 0 && (
          <p className="text-zinc-600 text-center text-xs mt-10 italic">No messages yet. Start a conversation with the KAITEN squad.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : msg.sender === 'system'
                  ? 'bg-red-900/20 text-red-400 border border-red-900/50'
                  : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-zinc-800 bg-zinc-950">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Command the squad..."
            disabled={isLoading}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 p-2 rounded-lg transition-colors text-white"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">KAITEN Command Center</h1>
          <p className="text-zinc-400">Monitoring and commanding the agent squad from the VPS.</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-500/20">
            Base: VPS Online
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Cards */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-blue-500/20 p-3 rounded-lg">
            <Activity className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Agents</p>
            <p className="text-2xl font-bold text-white">4</p>
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-green-500/20 p-3 rounded-lg">
            <Zap className="text-green-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">API Status</p>
            <p className="text-2xl font-bold text-white">Healthy</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-purple-500/20 p-3 rounded-lg">
            <Cpu className="text-purple-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">VPS Load</p>
            <p className="text-2xl font-bold text-white">29%</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-orange-500/20 p-3 rounded-lg">
            <Box className="text-orange-500 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Containers</p>
            <p className="text-2xl font-bold text-white">12</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Roster */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
            <h2 className="font-semibold flex items-center gap-2 text-white"><ShieldCheck className="w-4 h-4 text-zinc-400" /> Agent Roster</h2>
          </div>
          <div className="divide-y divide-zinc-800 flex-1">
            {[
              { name: 'KAITEN Prime', role: 'Orchestrator', status: 'Standby', model: 'Gemini 3 Flash' },
              { name: 'KAITEN Forge', role: 'Builder', status: 'Working', model: 'Gemini 3 Pro' },
              { name: 'KAITEN Sight', role: 'Diagnostics', status: 'Auditing', model: 'Gemini 3 Pro' },
              { name: 'KAITEN Pulse', role: 'Coordinator', status: 'Monitoring', model: 'Gemini 3 Flash' },
            ].map((agent, i) => (
              <div key={i} className="px-4 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300">
                    {agent.name.charAt(7)}
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-200">{agent.name}</h3>
                    <p className="text-xs text-zinc-500">{agent.role} • {agent.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`w-2 h-2 rounded-full ${agent.status === 'Working' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-sm font-medium text-zinc-300">{agent.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Station Logs */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[200px]">
            <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-950 flex items-center gap-2">
              <Terminal className="w-3 h-3 text-zinc-400" />
              <h2 className="font-semibold text-xs text-white">Station Logs</h2>
            </div>
            <div className="flex-1 p-3 font-mono text-[10px] overflow-y-auto space-y-1 text-zinc-400">
              <p><span className="text-green-500">[SYSTEM]</span> Base migration to Vultr successful.</p>
              <p><span className="text-blue-500">[FORGE]</span> Built SpawnerService v1.0.</p>
              <p><span className="text-blue-500">[FORGE]</span> MessageProxy endpoint live at /api/chat.</p>
              <p className="animate-pulse">_</p>
            </div>
          </div>

          {/* Chat Window */}
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
