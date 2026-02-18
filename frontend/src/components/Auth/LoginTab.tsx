import { useState } from 'react';
import { login } from '../../api';
import { Loader2 } from 'lucide-react';

interface LoginTabProps {
  onLoginSuccess: (token: string) => void;
}

export default function LoginTab({ onLoginSuccess }: LoginTabProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await login(email, password);
      onLoginSuccess(response.accessToken);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setError('Invalid email or password. Please try again.');
      } else if (e?.message?.includes('Network Error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(e?.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-[#212121] border border-white/5 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-zinc-500"
          placeholder="your@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-[#212121] border border-white/5 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-zinc-500"
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        Sign In to OCaaS
      </button>
    </form>
  );
}