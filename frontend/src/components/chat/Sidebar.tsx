import React from 'react';
import { cn } from '../../utils';
import { Menu, Plus, Bot, MessageSquare, LogOut, LogIn } from 'lucide-react';
import { type Agent, type Session } from '../../api';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  page: 'status' | 'chat';
  setPage: (page: 'status' | 'chat') => void;
  agents: Agent[];
  selectedAgent: Agent | null;
  setSelectedAgent: (a: Agent) => void;
  sessions: Session[];
  selectedSession: Session | null;
  setSelectedSession: (s: Session) => void;
  onCreateSession: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onAuthOpen: () => void;
  user: { name: string; plan: string };
}

import { SidebarSystemStatus } from './SidebarSystemStatus';

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen, toggle, page, setPage, agents, selectedAgent, setSelectedAgent,
  sessions, selectedSession, setSelectedSession, onCreateSession,
  isAuthenticated, onLogout, onAuthOpen, user
}) => {
  return (
    <aside className={cn(
      "bg-[#171717] border-r border-white/5 transition-all duration-300 flex flex-col z-30 shadow-xl",
      isOpen ? "w-64 max-md:w-full max-md:absolute max-md:h-full" : "w-0 overflow-hidden"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <div className="w-3.5 h-3.5 bg-black rounded-full" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">OCaaS</h1>
        </div>
        <button onClick={toggle} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 hover:bg-white/5 rounded-lg">
          <Menu size={18} />
        </button>
      </div>

      <div className="p-3">
        <div className="mb-2 grid grid-cols-2 gap-1 rounded-xl border border-white/5 bg-[#141414] p-1">
          <button
            onClick={() => setPage('status')}
            className={cn(
              'rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all',
              page === 'status' ? 'bg-white text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
            )}
          >
            Status
          </button>
          <button
            onClick={() => setPage('chat')}
            className={cn(
              'rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all',
              page === 'chat' ? 'bg-white text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
            )}
          >
            Chatroom
          </button>
        </div>
        <button
          onClick={onCreateSession}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-[#212121] hover:bg-[#2f2f2f] border border-white/5 rounded-xl transition-all text-sm font-semibold text-zinc-100 shadow-sm active:scale-[0.98]"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-6 py-2 scrollbar-thin scrollbar-thumb-white/5">
        <div>
          <label className="px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">Agents</label>
          <div className="mt-2 space-y-1">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all text-sm group",
                  selectedAgent?.id === agent.id ? "bg-[#212121] text-white shadow-sm" : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  selectedAgent?.id === agent.id ? "bg-white/10" : "bg-transparent group-hover:bg-white/5"
                )}>
                  <Bot size={14} className={selectedAgent?.id === agent.id ? "text-white" : "text-zinc-500"} />
                </div>
                <span className="truncate font-medium">{agent.name}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedAgent && (
          <div>
            <label className="px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">History</label>
            <div className="mt-2 space-y-1">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all text-sm group",
                    selectedSession?.id === session.id ? "bg-[#212121] text-white shadow-sm" : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
                  )}
                >
                  <MessageSquare size={14} className={selectedSession?.id === session.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"} />
                  <span className="truncate">{session.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <SidebarSystemStatus />

      <div className="p-4 border-t border-white/5 bg-[#1a1a1a]/50">
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">{user.name}</p>
            <p className="text-[10px] text-zinc-500 font-medium">{user.plan}</p>
          </div>
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg transition-colors text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          ) : (
            <button
              onClick={onAuthOpen}
              className="p-2 rounded-lg transition-colors text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10"
              title="Login"
            >
              <LogIn size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
