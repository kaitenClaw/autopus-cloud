import { useState } from 'react';
import { X } from 'lucide-react';
import LoginTab from './LoginTab';
import SignUpTab from './SignUpTab';
import { cn } from '../../utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
  onSignUpSuccess: (token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, onSignUpSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#171717] rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Authentication</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-white/5">
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium transition",
              activeTab === 'login' ? "text-white border-b-2 border-indigo-500" : "text-zinc-400 hover:text-zinc-200"
            )}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium transition",
              activeTab === 'signup' ? "text-white border-b-2 border-indigo-500" : "text-zinc-400 hover:text-zinc-200"
            )}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="p-5 flex-1">
          {activeTab === 'login' && <LoginTab onLoginSuccess={onLoginSuccess} />}
          {activeTab === 'signup' && <SignUpTab onSignUpSuccess={onSignUpSuccess} />}
        </div>
      </div>
    </div>
  );
}