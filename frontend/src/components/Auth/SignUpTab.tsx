import { useState } from 'react';
import { login, signup } from '../../api';
import { Loader2 } from 'lucide-react';

interface SignUpTabProps {
  onSignUpSuccess: (token: string) => void;
}

export default function SignUpTab({ onSignUpSuccess }: SignUpTabProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signup(name, email, password);
      const loginResponse = await login(email, password);
      onSignUpSuccess(loginResponse.accessToken);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400 || status === 409) {
        setError(e?.response?.data?.message || 'Unable to sign up with these details.');
      } else if (e?.message?.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(e?.response?.data?.message || 'Sign up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Name (Optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-[var(--surface-0)] border border-[var(--border-subtle)] focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition"
          placeholder="John Doe"
        />
      </div>
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-[var(--surface-0)] border border-[var(--border-subtle)] focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition"
          placeholder="your@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-[var(--surface-0)] border border-[var(--border-subtle)] focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition"
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <div className="bg-[var(--error-muted)] text-[var(--error)] p-3 rounded-lg text-sm border border-[var(--error)]/20">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--surface-0)] p-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        Birth Your Agent
      </button>

      <p className="text-center text-[10px] text-[var(--text-muted)]">
        By signing up, you agree to our Terms of Service.
      </p>
    </form>
  );
}
