import React from 'react';
import { cn } from '../../utils';
import { Bot, User, Loader2 } from 'lucide-react';
import { type Message } from '../../api';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isStreaming }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn("flex gap-5 group", isAssistant ? "" : "flex-row-reverse")}>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 transition-transform group-hover:scale-110",
        isAssistant ? "bg-white text-black" : "bg-[#2f2f2f] text-zinc-400"
      )}>
        {isAssistant ? <Bot size={18} strokeWidth={2.5} /> : <User size={18} />}
      </div>
      <div className={cn(
        "flex-1 min-w-0 space-y-2",
        !isAssistant ? "text-right" : ""
      )}>
        <div className={cn(
          "inline-block text-left p-0 rounded-2xl max-w-full",
          isAssistant ? "text-zinc-200" : "bg-[#212121] px-4 py-2.5 text-white"
        )}>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-zinc-400 animate-pulse align-middle" />
            )}
          </div>
        </div>
        <span className="text-[10px] text-zinc-600 block mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
