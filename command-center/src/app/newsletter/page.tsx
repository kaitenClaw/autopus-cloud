'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, Mail } from 'lucide-react';

const NewsletterPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // In a real app, this would call an API
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2B2D42] flex flex-col items-center justify-center px-4">
      <button 
        onClick={() => router.push('/')}
        className="fixed top-8 left-8 flex items-center gap-2 text-sm font-medium text-[#2B2D42]/70 hover:text-[#F4845F] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8E8E4] shadow-xl text-center">
        <div className="w-16 h-16 bg-[#F4845F]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-[#F4845F]" />
        </div>

        {!submitted ? (
          <>
            <h1 className="text-3xl font-bold mb-2">The Autopus Pulse</h1>
            <p className="text-[#2B2D42]/70 mb-8">
              Stay ahead of the curve. Get weekly insights on agentic workflows, digital companions, and the future of AI.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="email" 
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-4 bg-[#F5F5F0] border border-[#E8E8E4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F4845F]/50 transition-all"
              />
              <button 
                type="submit"
                className="w-full py-4 bg-[#2B2D42] text-white font-bold rounded-2xl hover:bg-[#F4845F] transition-all flex items-center justify-center gap-2"
              >
                Subscribe Now
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-6 text-xs text-[#2B2D42]/40">
              Join 500+ builders. No spam, just pure intelligence.
            </p>
          </>
        ) : (
          <div className="py-12 animate-in fade-in zoom-in duration-500">
            <CheckCircle className="w-16 h-16 text-[#4CAF50] mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">You're in!</h2>
            <p className="text-[#2B2D42]/70 mb-8">
              Check your inbox soon for the first edition of The Autopus Pulse.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="text-[#F4845F] font-semibold hover:underline"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterPage;
