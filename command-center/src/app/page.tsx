'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  Zap, 
  Shield, 
  Sparkles,
  ArrowRight,
  MessageSquare,
  Cpu,
  Lock,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  const router = useRouter();

  const features = [
    {
      icon: Brain,
      title: 'Memory & Growth',
      description: 'Your AI Persona remembers every interaction, learns your preferences, and evolves with you over time.'
    },
    {
      icon: Zap,
      title: 'Agent Swarm',
      description: 'Deploy multiple specialized agents — Builder, Researcher, DevOps — working together as your personal team.'
    },
    {
      icon: Shield,
      title: 'Data Sovereignty',
      description: 'Local-first architecture. Your data stays on your infrastructure. Cloud optional, never required.'
    },
    {
      icon: Sparkles,
      title: 'Skill Marketplace',
      description: 'Expand your agent\'s capabilities. Install new skills to handle specific tasks and workflows.'
    }
  ];

  const agents = [
    { name: 'KAITEN', role: 'Orchestrator', icon: '🧠', desc: 'Strategic coordination' },
    { name: 'FORGE', role: 'Builder', icon: '⚡', desc: 'Code & infrastructure' },
    { name: 'SIGHT', role: 'Researcher', icon: '🔍', desc: 'Analysis & security' },
    { name: 'PULSE', role: 'DevOps', icon: '◉', desc: 'Operations & monitoring' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2B2D42]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#E8E8E4] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/autopus-logo.jpg" 
                alt="Autopus" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="font-bold text-xl">Autopus</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-[#2B2D42]/70 hover:text-[#F4845F] transition-colors">Features</a>
              <a href="#agents" className="text-sm font-medium text-[#2B2D42]/70 hover:text-[#F4845F] transition-colors">Agents</a>
              <a href="#pricing" className="text-sm font-medium text-[#2B2D42]/70 hover:text-[#F4845F] transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/login')}
                className="text-sm font-medium text-[#2B2D42]/70 hover:text-[#2B2D42] transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="bg-[#F4845F] hover:bg-[#E0704A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4845F]/10 rounded-full">
                <span className="w-2 h-2 bg-[#F4845F] rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-[#F4845F]">Now in Public Beta</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Your AI<br/>
                <span className="text-[#F4845F]">Persona</span>
              </h1>
              
              <p className="text-lg text-[#2B2D42]/70 max-w-lg">
                Activate intelligent agents with memory, skills, and growth. 
                Deploy your personal AI team — Local or Cloud, your data stays yours.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => router.push('/login')}
                  className="bg-[#F4845F] hover:bg-[#E0704A] text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                  Activate Your First Agent
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-[#2B2D42]/20 hover:border-[#2B2D42]/40 text-[#2B2D42] px-8 py-4 rounded-xl font-semibold transition-all">
                  View Demo
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {['🧠', '⚡', '🔍', '◉'].map((icon, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-[#F5F5F0] flex items-center justify-center text-lg shadow-sm">
                      {icon}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#2B2D42]/60">
                  <span className="font-semibold text-[#2B2D42]">4 AI Personas</span> ready to deploy
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl shadow-[#2B2D42]/10 p-6 border border-[#E8E8E4]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[#F4845F]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#2B2D42]/20"></div>
                  <div className="w-3 h-3 rounded-full bg-[#2B2D42]/20"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F4845F]/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-[#F4845F]" />
                    </div>
                    <div className="bg-[#F5F5F0] rounded-2xl rounded-tl-none px-4 py-3 flex-1">
                      <p className="text-sm">I need to analyze our Q4 marketing performance and create a strategy for Q1.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-10 h-10 rounded-xl bg-[#2B2D42] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">🧠</span>
                    </div>
                    <div className="bg-white border border-[#E8E8E4] rounded-2xl rounded-tr-none px-4 py-3 flex-1">
                      <p className="text-sm">I'll analyze your Q4 data and draft a comprehensive Q1 strategy. I see from your previous campaigns that...</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-[#2B2D42]/50 pt-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    KAITEN is analyzing your data...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Growth</h2>
            <p className="text-lg text-[#2B2D42]/70 max-w-2xl mx-auto">
              Every interaction makes your AI Persona smarter. Deploy agents that truly understand you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-[#F5F5F0] hover:bg-white hover:shadow-xl hover:shadow-[#2B2D42]/5 transition-all border border-transparent hover:border-[#E8E8E4]">
                <div className="w-12 h-12 rounded-xl bg-[#F4845F]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[#F4845F]" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-[#2B2D42]/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet Your AI Team</h2>
            <p className="text-lg text-[#2B2D42]/70 max-w-2xl mx-auto">
              Deploy specialized agents that work together. Each with unique skills and memory.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#E8E8E4] hover:border-[#F4845F]/30 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-[#F4845F]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="font-bold">{agent.name}</h3>
                    <span className="text-xs font-medium text-[#F4845F] bg-[#F4845F]/10 px-2 py-1 rounded-full">{agent.role}</span>
                  </div>
                </div>
                <p className="text-sm text-[#2B2D42]/70">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#2B2D42] rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to meet your AI Persona?</h2>
              <p className="text-lg text-white/70 mb-8">
                Join the beta and activate your first intelligent agent today.
              </p>
              <button 
                onClick={() => router.push('/login')}
                className="bg-[#F4845F] hover:bg-[#E0704A] text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 transition-all"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4845F]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F4845F]/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E8E4] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/autopus-logo.jpg" 
                alt="Autopus" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-bold">Autopus</span>
            </div>
            
            <p className="text-sm text-[#2B2D42]/50">
              © 2026 Autopus. Your AI Persona Companion.
            </p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-[#2B2D42]/50 hover:text-[#F4845F] transition-colors">Privacy</a>
              <a href="#" className="text-sm text-[#2B2D42]/50 hover:text-[#F4845F] transition-colors">Terms</a>
              <a href="#" className="text-sm text-[#2B2D42]/50 hover:text-[#F4845F] transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;