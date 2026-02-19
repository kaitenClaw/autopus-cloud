import { useState } from 'react';
import { login, googleLogin } from '../../api';
import { Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

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

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        // Using the access_token from the implicit flow
        const response = await googleLogin(tokenResponse.access_token);
        onLoginSuccess(response.accessToken);
      } catch (e) {
        setError('Google Login Failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google Login Failed'),
  });

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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#171717] text-zinc-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => googleLoginHandler()}
        className="w-full bg-white text-black p-2.5 rounded-lg font-bold transition hover:bg-zinc-200 flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    </form>
  );
}