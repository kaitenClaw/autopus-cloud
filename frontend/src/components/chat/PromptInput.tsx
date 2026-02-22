import React, { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface PromptInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ input, setInput, onSend, isLoading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative p-4 bg-[#0b0b0b] border-t border-white/5">
      <div className="max-w-3xl mx-auto relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your partner..."
          className="w-full bg-[#171717] border border-white/5 hover:border-white/10 focus:border-white/20 rounded-2xl p-4 pr-14 focus:outline-none focus:ring-0 resize-none min-h-[56px] text-[15px] transition-all shadow-sm"
          rows={1}
        />
        <button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className="absolute right-3 bottom-3 p-2 bg-white text-black rounded-xl disabled:opacity-20 disabled:bg-zinc-700 transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={2.5} />}
        </button>
      </div>
      <p className="text-[10px] text-zinc-600 text-center mt-3 tracking-tight">
        OCaaS mirrors your OpenClaw runtime. Verify critical output before deployment.
      </p>
    </div>
  );
};
