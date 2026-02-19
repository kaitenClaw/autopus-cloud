import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  ShieldCheck,
  Zap,
  BrainCircuit,
  Github,
  Globe,
  MessageSquare,
  ArrowRight,
  Check,
  Send,
  Bot,
  Activity,
  Layers,
} from 'lucide-react';
import { AutopusLogo, AutopusWordmark } from './AutopusLogo';
import AuthModal from './Auth/AuthModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('ocaas_token', token);
    setShowAuth(false);
    navigate('/dashboard');
  };

  const handleEmailCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-0)] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

      {/* ─── Header ─────────────────────────────── */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5"
        >
          <AutopusLogo size={32} />
          <AutopusWordmark className="text-base" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => setShowAuth(true)}
            className="text-sm font-medium text-[var(--text-muted)] transition hover:text-white"
          >
            Log In
          </button>
          <button
            onClick={() => setShowAuth(true)}
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-all hover:shadow-[0_0_24px_rgba(255,255,255,0.25)] active:scale-95"
          >
            Get Started
          </button>
        </motion.div>
      </header>

      {/* ─── Hero ───────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20 pt-16 text-center md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Status badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-1)] px-3.5 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Platform Live
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tighter md:text-7xl">
            <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
              Your Personal AI Team.
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              One Click Away.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-secondary)] md:text-xl">
            Skip the infrastructure complexity. Launch and manage your AI team from one
            dashboard, orchestrate tasks from chat, and track everything in real time.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-8 py-4 text-lg font-bold text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 hover:bg-[var(--accent-hover)] active:scale-95"
            >
              <Rocket size={20} />
              Launch Console
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] px-8 py-4 text-lg font-bold transition-all hover:bg-[var(--surface-2)]"
            >
              Explore Dashboard
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── How It Works ───────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-label mb-3 text-[var(--accent-hover)]">How It Works</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            From Zero to AI Team in 3 Steps
          </h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: '01',
              icon: Bot,
              title: 'Create Your Agent',
              desc: 'Pick a model, set personality and skills. Your agent gets its own Docker runtime with isolated memory.',
            },
            {
              step: '02',
              icon: Send,
              title: 'Connect via Telegram',
              desc: 'Link your Telegram bot. Send messages to control your agent, assign tasks, and get real-time updates.',
            },
            {
              step: '03',
              icon: Activity,
              title: 'Scale Your Swarm',
              desc: 'Add more agents. They coordinate autonomously — shared memory, task handoffs, fallback routing.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-6 transition-all hover:border-[var(--border-default)] hover:shadow-elev-1"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)]">
                  <item.icon size={20} className="text-[var(--accent-hover)]" />
                </div>
                <span className="text-xs font-bold text-[var(--text-muted)]">STEP {item.step}</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-label mb-3 text-emerald-400">Platform Features</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need to Run AI Agents
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Zap, title: 'One-Click Deploy', desc: 'Docker-isolated runtimes. Your agent is live in seconds.', color: 'text-amber-400' },
            { icon: ShieldCheck, title: 'Enterprise Security', desc: 'Tenant isolation, JWT auth, role-based access, audit logs.', color: 'text-emerald-400' },
            { icon: Globe, title: 'Multi-Model Routing', desc: 'Auto-fallback across Gemini, Claude, GPT. Smart cost optimization.', color: 'text-blue-400' },
            { icon: MessageSquare, title: 'Telegram Control', desc: 'Manage agents from chat. Send tasks, get updates, approve actions.', color: 'text-violet-400' },
            { icon: Layers, title: 'Persistent Memory', desc: 'Session, workspace, and global memory scopes. Agents learn and remember.', color: 'text-rose-400' },
            { icon: BrainCircuit, title: 'Agent Coordination', desc: 'KAITEN-style task handoffs. Agents collaborate autonomously.', color: 'text-cyan-400' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-6 transition-all hover:bg-[var(--surface-2)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-transform group-hover:scale-110">
                <item.icon size={20} className={item.color} />
              </div>
              <h3 className="mb-2 font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-label mb-3 text-violet-400">Pricing</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Start Free. Scale When Ready.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              desc: 'Try the platform. One agent, basic features.',
              features: ['1 agent', '10K tokens/day', 'Telegram integration', 'Session memory', 'Community support'],
              cta: 'Get Started',
              accent: false,
            },
            {
              name: 'Launch',
              price: '$29',
              period: '/month',
              desc: 'For builders shipping AI-powered products.',
              features: ['3 agents', '100K tokens/day', 'Priority models', 'Workspace memory', 'Multi-model fallback', 'Email support'],
              cta: 'Start Building',
              accent: true,
            },
            {
              name: 'Pro',
              price: '$99',
              period: '/month',
              desc: 'For teams running autonomous agent swarms.',
              features: ['10 agents', 'Unlimited tokens', 'Custom skills', 'Global memory', 'KAITEN coordination', 'Admin audit log', 'Priority support'],
              cta: 'Go Pro',
              accent: false,
            },
          ].map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`rounded-2xl border p-6 transition-all ${
                tier.accent
                  ? 'border-[var(--accent)]/40 bg-[var(--accent-muted)] shadow-[0_0_40px_-12px_rgba(99,102,241,0.3)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-1)]'
              }`}
            >
              <p className="text-sm font-bold text-[var(--text-muted)]">{tier.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                <span className="text-sm text-[var(--text-muted)]">{tier.period}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{tier.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Check size={14} className={tier.accent ? 'text-[var(--accent-hover)]' : 'text-emerald-500'} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowAuth(true)}
                className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                  tier.accent
                    ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-white'
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Email Capture (CTA) ────────────────── */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-1)] to-[var(--accent-muted)] p-10 text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Ready to orchestrate your AI swarm?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[var(--text-secondary)]">
            Join the waitlist for early access. Be the first to deploy agents on Autopus Cloud.
          </p>

          {emailSubmitted ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400">
              <Check size={16} />
              You're on the list. We'll be in touch.
            </div>
          ) : (
            <form onSubmit={handleEmailCapture} className="mx-auto mt-6 flex max-w-md gap-3">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] active:scale-95"
              >
                <Send size={14} />
                Join
              </button>
            </form>
          )}
        </motion.div>
      </section>

      {/* ─── Footer ─────────────────────────────── */}
      <footer className="relative z-10 border-t border-[var(--border-subtle)] bg-[var(--surface-0)] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <AutopusLogo size={24} />
            <span className="text-sm font-semibold text-[var(--text-muted)]">Autopus Cloud</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            &copy; 2026 Autopus Cloud. Built on OpenClaw. All systems operational.
          </p>
          <div className="flex gap-6 text-xs text-[var(--text-muted)]">
            <a href="https://github.com/autopus/ocaas" className="flex items-center gap-1 transition hover:text-white">
              <Github size={14} /> GitHub
            </a>
            <button onClick={() => navigate('/dashboard')} className="transition hover:text-white">
              Dashboard
            </button>
            <button onClick={() => navigate('/hub')} className="transition hover:text-white">
              Hub
            </button>
          </div>
        </div>
      </footer>

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLoginSuccess={handleLoginSuccess}
        onSignUpSuccess={handleLoginSuccess}
      />
    </div>
  );
}
