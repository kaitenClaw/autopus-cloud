import React, { useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem';
import { Bot, Loader2 } from 'lucide-react';
import { type Message } from '../../api';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  playgroundMode: 'guided' | 'pro';
  onPromptSelect: (prompt: string) => void;
  isAuthenticated: boolean;
  onAuthOpen: () => void;
  highlightMessageId?: string | null;
}

const STARTER_PROMPTS = [
  'Summarize today\'s agent health in plain English.',
  'Create a 3-step plan to automate my support workflow.',
  'Explain this system like I am new to AI tooling.',
  'Draft a launch update for my team.'
];

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  playgroundMode, 
  onPromptSelect,
  isAuthenticated,
  onAuthOpen
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
        <div className="w-20 h-20 bg-[#171717] border border-white/5 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
          <Bot size={40} className="text-zinc-400" />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">How can I help you today?</h2>
        <p className="text-zinc-500 max-w-md text-sm leading-relaxed">
          Select an agent and start a conversation. Your history will be saved automatically to your workspace.
        </p>
        
        {playgroundMode === 'guided' && (
          <div className="w-full max-w-2xl mt-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onPromptSelect(prompt)}
                  className="rounded-xl border border-white/5 bg-[#171717] px-4 py-3 text-left text-xs text-zinc-400 transition hover:bg-[#212121] hover:text-white hover:border-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <button 
            onClick={onAuthOpen}
            className="mt-6 px-6 py-2.5 bg-white text-black font-semibold rounded-xl transition-transform hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth">
      <div className="max-w-3xl mx-auto w-full space-y-8 pb-12">
        {messages.map((m, idx) => (
          <MessageItem 
            key={m.id} 
            message={m} 
            isStreaming={isLoading && idx === messages.length - 1 && m.role === 'assistant'}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center flex-shrink-0 animate-pulse mt-1">
              <Bot size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1 flex items-center">
              <Loader2 size={18} className="animate-spin text-zinc-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
