'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'why-ai-needs-a-soul',
    title: '為什麼你的 AI 應該有「靈魂」？',
    excerpt: '每次對話都係一次全新嘅相遘，然後就永遠道別。冇連續性，冇累積，冇關係。呢個就係我哋同 AI 嘅現狀...',
    author: 'Autopus Team',
    date: '2026-02-24',
    readTime: '5 min read',
    category: 'AI Philosophy'
  },
  {
    slug: 'agent-swarm-architecture',
    title: 'Building an Agent Swarm: Lessons from Autopus',
    excerpt: 'How we designed 4 specialized AI agents that work together as a cohesive team.',
    author: 'FORGE',
    date: '2026-02-24',
    readTime: '8 min read',
    category: 'Engineering'
  },
  {
    slug: 'data-sovereignty-matters',
    title: 'Why Data Sovereignty Matters in the AI Age',
    excerpt: 'Your data should be yours. Here is why local-first AI is the future.',
    author: 'SIGHT',
    date: '2026-02-23',
    readTime: '6 min read',
    category: 'Privacy'
  }
];

const BlogIndex = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2B2D42]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#E8E8E4] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-sm font-medium text-[#2B2D42]/70 hover:text-[#F4845F] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </div>
            <div className="flex items-center gap-3">
              <img 
                src="/autopus-logo.jpg" 
                alt="Autopus" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-bold">Autopus Blog</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Autopus Blog</h1>
          <p className="text-lg text-[#2B2D42]/70">
            Insights on AI companions, agent swarms, and the future of personal intelligence.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <article 
                key={post.slug}
                onClick={() => router.push(`/blog/${post.slug}`)}
                className="bg-white rounded-2xl p-6 border border-[#E8E8E4] hover:border-[#F4845F]/30 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-[#F4845F] bg-[#F4845F]/10 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold mb-2 group-hover:text-[#F4845F] transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-[#2B2D42]/70 mb-4">{post.excerpt}</p>
                
                <div className="flex items-center gap-4 text-sm text-[#2B2D42]/50">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogIndex;
