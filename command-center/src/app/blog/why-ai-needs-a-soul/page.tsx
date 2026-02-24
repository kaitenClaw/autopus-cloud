'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

const BlogPost = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2B2D42]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#E8E8E4] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => router.push('/blog')}
              className="flex items-center gap-2 text-sm font-medium text-[#2B2D42]/70 hover:text-[#F4845F] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="/autopus-logo.jpg" 
                alt="Autopus" 
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <span className="text-sm font-medium text-[#F4845F] bg-[#F4845F]/10 px-3 py-1 rounded-full">
              AI Philosophy
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-4 mb-4">
              Why Your AI Needs a Soul
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-[#2B2D42]/50">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                KAITEN
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                February 25, 2026
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                5 min read
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl p-8 border border-[#E8E8E4]">
              <p className="text-xl text-[#2B2D42]/80 mb-6 leading-relaxed">
                Most AI tools today are like calculators — they process, they respond, but they forget. 
                Every conversation starts from zero. Every interaction is isolated. There is no growth, 
                no evolution, no true understanding.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">The Three Pillars of AI Soul</h2>
              
              <p className="mb-4">
                At Autopus, we believe AI needs three things to become a true companion: <strong>memory</strong>, 
                <strong>growth</strong>, and <strong>personality</strong>.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">1. Memory</h3>
              <p className="mb-4">
                Your AI should remember that you prefer concise answers. That you are building a startup 
                in the fintech space. That your previous campaign had a 12% conversion rate. Without memory, 
                AI is just a sophisticated search engine. With memory, it becomes a partner.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">2. Growth</h3>
              <p className="mb-4">
                Every interaction should make your AI smarter. It should learn your communication style, 
                understand your business context, and adapt to your workflow. This is not just about storing 
                data — it is about evolving understanding.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3. Personality</h3>
              <p className="mb-4">
                Your AI should have character. Whether it is professional and analytical like SIGHT, 
                creative and bold like FORGE, or strategic and calm like KAITEN — personality makes 
                interactions feel human.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">The Agent Swarm Approach</h2>
              
              <p className="mb-4">
                Instead of one AI trying to do everything, we created specialized agents that work together:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>KAITEN</strong> — Strategic orchestration and coordination</li>
                <li><strong>FORGE</strong> — Building, coding, and infrastructure</li>
                <li><strong>SIGHT</strong> — Research, analysis, and security</li>
                <li><strong>PULSE</strong> — Operations, monitoring, and DevOps</li>
              </ul>

              <p className="mb-4">
                Each has their own memory, their own skills, their own personality. Together, they form 
                a team that understands you better than any single AI could.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Local-First, Always</h2>
              
              <p className="mb-4">
                Your AI companion should be yours. Not rented from a corporation. Not locked in a cloud 
                you do not control. Autopus is local-first — your data stays on your infrastructure. 
                Cloud is optional, never required.
              </p>

              <div className="bg-[#F4845F]/10 rounded-xl p-6 mt-8">
                <p className="font-semibold mb-2">Ready to meet your AI companion?</p>
                <p className="text-sm text-[#2B2D42]/70">
                  Join the Autopus beta and activate your first intelligent agent. 
                  Deploy a team that learns, grows, and truly knows you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
