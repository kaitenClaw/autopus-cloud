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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Name (Optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-[#212121] border border-white/5 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-zinc-500"
          placeholder="John Doe"
        />
      </div>
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
        Sign Up
      </button>
    </form>
  );
}