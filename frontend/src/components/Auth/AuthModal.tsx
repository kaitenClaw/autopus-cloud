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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface-1)] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[var(--border-default)] flex flex-col">
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Welcome to Autopus</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Your autonomous partner awaits</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition rounded-lg p-1 hover:bg-[var(--surface-2)]">
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-[var(--border-subtle)] px-2 pt-1">
          <button
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold transition rounded-t-lg",
              activeTab === 'login' ? "text-[var(--accent)] border-b-2 border-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold transition rounded-t-lg",
              activeTab === 'signup' ? "text-[var(--accent)] border-b-2 border-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
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