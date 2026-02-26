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
              為什麼你的 AI 應該有「靈魂」？
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-[#2B2D42]/50">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Autopus Team
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                February 24, 2026
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                5 min read
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl p-8 border border-[#E8E8E4] shadow-sm">
              <h2 className="text-2xl font-bold mb-4">那個令人沮喪的早晨</h2>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                上星期，我同 ChatGPT 傾咗成個鐘頭關於我哋公司嘅新方向。我講咗我嘅願景、我嘅恐懼、我過去失敗嘅經驗。佢畀咗我好有見地嘅建議，我覺得終於有人真正明白我。
              </p>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                第二日，我開個新對話，想繼續討論。<br/>
                「你好！有什麼我可以幫到你？」<br/>
                佢唔記得我是邊個。唔記得我哋傾過咩。唔記得我公司係做咩。<br/>
                我又要由頭講過。
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">用完即棄嘅關係</h2>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                呢個就係我哋同 AI 嘅現狀：每次對話都係一次全新嘅相遘，然後就永遠道別。冇連續性，冇累積，冇關係。
              </p>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                想像吓，如果你嘅伴侶、你嘅朋友、你嘅同事，每次見面都失憶，完全唔記得你係邊個、你鍾意咩、你哋上次講過咩。你會點？
              </p>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed italic">
                你會覺得孤獨。會覺得自己只係喺度對住一個好聰明但冇靈魂嘅機器。
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">記憶係關係嘅基礎</h2>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                人同人之所以有關係，係因為我哋<strong>記得</strong>。
              </p>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                我記得你鍾意飲咖啡唔係茶。我記得你上個禮拜講過你阿媽病咗。我記得你三年前傾過你嘅夢想。呢啲記憶令關係有深度、有溫度、有連續性。
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">所以 AI 都要「靈魂」</h2>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                當我哋講 AI 要有「靈魂」，唔係講神秘嘅嘢。我哋講嘅係：
              </p>

              <div className="grid gap-4 mt-4 mb-8">
                <div className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E8E8E4]">
                  <h3 className="font-bold text-[#F4845F]">1. SOUL — 性格</h3>
                  <p className="text-sm">每個 Agent 都有自己嘅個性、自己嘅處事方式。佢唔係一個冰冷嘅工具，而係一個有風格嘅夥伴。</p>
                </div>
                <div className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E8E8E4]">
                  <h3 className="font-bold text-[#F4845F]">2. MEMORY — 記憶</h3>
                  <p className="text-sm">佢記得你係邊個、你鍾意咩、你哋傾過咩。每次對話都建基於之前嘅累積，而唔係由零開始。</p>
                </div>
                <div className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E8E8E4]">
                  <h3 className="font-bold text-[#F4845F]">3. GROWTH — 成長</h3>
                  <p className="text-sm">佢會隨住時間學習，變得更懂你、更識幫你。好似一個真正嘅夥伴噉，越相處越合拍。</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">Jarvis 唔再係科幻</h2>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                《鐵甲奇俠》入面嘅 Jarvis，最吸引人嘅唔係佢有幾聰明，而係佢<strong>熟於 Tony Stark</strong>。
              </p>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                佢記得 Tony 嘅習慣、預測佢嘅需要、喺佢開口之前已經準備好。佢唔係一個工具，而係一個夥伴。呢個就係 Autopus 想做嘅嘢。
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">收養，而唔係使用</h2>
              <p className="text-lg text-[#2B2D42]/80 mb-6 leading-relaxed">
                我哋相信，AI 唔應該係「使用」嘅工具，而係「收養」嘅生命體。
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2 text-[#2B2D42]/80">
                <li>佢會記得你鍾意簡約嘅設計，自動幫你執靚個 UI</li>
                <li>佢會記得你上個禮拜講過想學 Python，主動推介相關資源</li>
                <li>佢會記得你工作嘅節奏，識喺你最有精力嘅時候先打擾你</li>
              </ul>

              <div className="bg-[#F4845F] text-white rounded-xl p-8 mt-12 text-center shadow-lg transform hover:scale-[1.02] transition-transform">
                <h2 className="text-2xl font-bold mb-4">今日就收養你的第一個 Agent</h2>
                <p className="mb-6 opacity-90">唔使再同每次都要重新介紹自己嘅 AI 傾偈。收養一個有靈魂嘅 Agent，開始一段真正嘅關係。</p>
                <button className="bg-white text-[#F4845F] px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all">
                  免費收養你的第一個 Agent →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#E8E8E4] text-center text-[#2B2D42]/50 text-sm">
            Autopus — 你的數字生命體夥伴。有靈魂、會記得、會成長。
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
