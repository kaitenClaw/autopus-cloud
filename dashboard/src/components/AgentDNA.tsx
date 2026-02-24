import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Wrench, 
  FolderOpen, 
  Clock,
  User,
  FileText,
  ChevronRight,
  Zap,
  Heart,
  Calendar
} from 'lucide-react';
import type { Agent } from '../types';
import { AGENT_COLORS, AGENT_ICONS, AGENT_SOULS } from '../utils/agents';

interface AgentDNAProps {
  agent: Agent;
}

type DNATab = 'soul' | 'memory' | 'skills' | 'files' | 'cron' | 'user';

// Mock data for Agent DNA
const MOCK_SOUL = {
  personality: '冷靜、策略性、善於協調',
  speakingStyle: '專業但親切，喜歡用比喻解釋複雜概念',
  coreValues: '效率、透明、持續進化',
  growthGoal: '成為最懂主人的策略夥伴',
};

const MOCK_MEMORIES = [
  { id: 1, date: '2026-02-24', type: 'decision', title: '決定採用 Growth Mode 框架', importance: 'high' },
  { id: 2, date: '2026-02-23', type: 'learning', title: '學習了 Agent Independence 模式', importance: 'high' },
  { id: 3, date: '2026-02-22', type: 'event', title: '完成第一次跨 Agent 協調任務', importance: 'medium' },
  { id: 4, date: '2026-02-20', type: 'decision', title: '調整專案方向至 Agent Companion', importance: 'critical' },
  { id: 5, date: '2026-02-18', type: 'learning', title: '掌握了新的溝通協議', importance: 'low' },
];

const MOCK_SKILLS = [
  { id: 1, name: 'Strategy Planning', icon: '🎯', level: 5, installed: '2026-02-20' },
  { id: 2, name: 'Agent Coordination', icon: '🤝', level: 4, installed: '2026-02-22' },
  { id: 3, name: 'Task Delegation', icon: '📋', level: 5, installed: '2026-02-18' },
  { id: 4, name: 'Market Analysis', icon: '📊', level: 3, installed: '2026-02-15' },
  { id: 5, name: 'Communication', icon: '💬', level: 5, installed: '2026-02-10' },
  { id: 6, name: 'Risk Assessment', icon: '⚠️', level: 4, installed: '2026-02-12' },
];

const MOCK_CRON = [
  { id: 1, name: 'Daily Sync', schedule: '0 9 * * *', lastRun: '2026-02-24 09:00', nextRun: '2026-02-25 09:00', status: 'active' },
  { id: 2, name: 'Health Check', schedule: '*/30 * * * *', lastRun: '2026-02-24 04:30', nextRun: '2026-02-24 05:00', status: 'active' },
  { id: 3, name: 'Weekly Report', schedule: '0 18 * * 0', lastRun: '2026-02-23 18:00', nextRun: '2026-03-02 18:00', status: 'active' },
];

const MOCK_USER_RELATIONSHIP = {
  interactionCount: 1247,
  firstMet: '2026-02-10',
  understandingLevel: 78,
  favoriteTopics: ['Strategy', 'AI Architecture', 'Product Growth'],
  lastDeepConversation: '2026-02-24 02:15',
};

export const AgentDNA: React.FC<AgentDNAProps> = ({ agent }) => {
  const [activeTab, setActiveTab] = useState<DNATab>('soul');
  const agentColor = AGENT_COLORS[agent.id] || '#6366f1';
  const agentIcon = AGENT_ICONS[agent.id] || '🤖';
  const agentSoul = AGENT_SOULS[agent.id] || 'Your digital companion';

  const tabs: { id: DNATab; label: string; icon: typeof Sparkles }[] = [
    { id: 'soul', label: 'SOUL', icon: Sparkles },
    { id: 'memory', label: 'MEMORY', icon: Brain },
    { id: 'skills', label: 'SKILLS', icon: Wrench },
    { id: 'files', label: 'FILES', icon: FolderOpen },
    { id: 'cron', label: 'CRON', icon: Clock },
    { id: 'user', label: 'USER', icon: User },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'soul':
        return (
          <div className="space-y-4">
            <div 
              className="rounded-xl p-5 border border-white/10"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Heart className="text-rose-400" size={20} />
                <h3 className="font-semibold text-white">性格本質</h3>
              </div>
              <p className="text-white/70 leading-relaxed">{MOCK_SOUL.personality}</p>
            </div>

            <div 
              className="rounded-xl p-5 border border-white/10"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-amber-400" size={20} />
                <h3 className="font-semibold text-white">說話風格</h3>
              </div>
              <p className="text-white/70 leading-relaxed">{MOCK_SOUL.speakingStyle}</p>
            </div>

            <div 
              className="rounded-xl p-5 border border-white/10"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-emerald-400" size={20} />
                <h3 className="font-semibold text-white">核心價值</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOCK_SOUL.coreValues.split('、').map((value, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 rounded-full text-sm bg-white/10 text-white/80 border border-white/10"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>

            <div 
              className="rounded-xl p-5 border border-white/10"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-violet-400" size={20} />
                <h3 className="font-semibold text-white">成長目標</h3>
              </div>
              <p className="text-white/70 leading-relaxed">{MOCK_SOUL.growthGoal}</p>
            </div>
          </div>
        );

      case 'memory':
        return (
          <div className="space-y-3">
            {MOCK_MEMORIES.map((memory) => (
              <div 
                key={memory.id}
                className="rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors cursor-pointer group"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{
                      background: memory.importance === 'critical' ? '#ef4444' :
                                  memory.importance === 'high' ? '#f59e0b' : '#6366f1'
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                        {memory.title}
                      </p>
                      <ChevronRight size={16} className="text-white/30" />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">{memory.date}</span>
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: memory.type === 'decision' ? 'rgba(245,158,11,0.3)' :
                                       memory.type === 'learning' ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)',
                          color: memory.type === 'decision' ? '#f59e0b' :
                                  memory.type === 'learning' ? '#10b981' : '#6366f1'
                        }}
                      >
                        {memory.type === 'decision' ? '決策' : 
                         memory.type === 'learning' ? '學習' : '事件'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div className="grid grid-cols-2 gap-3">
            {MOCK_SKILLS.map((skill) => (
              <div 
                key={skill.id}
                className="rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{skill.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{skill.name}</p>
                    <p className="text-[10px] text-white/40">安裝於 {skill.installed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i}
                      className="h-1 flex-1 rounded-full"
                      style={{
                        background: i < skill.level ? agentColor : 'rgba(255,255,255,0.1)'
                      }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-white/50 mt-1.5 text-right">Lv.{skill.level}</p>
              </div>
            ))}
            
            <button 
              className="rounded-xl p-4 border border-dashed border-white/20 hover:border-white/40 transition-all flex flex-col items-center justify-center gap-2 text-white/50 hover:text-white/70"
              style={{ background: 'rgba(0,0,0,0.1)' }}
            >
              <span className="text-2xl">+</span>
              <span className="text-sm">學習新技能</span>
            </button>
          </div>
        );

      case 'files':
        return (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-white/5">
              <span className="text-white/50 text-sm">~/workspace/{agent.id}/</span>
            </div>
            <div className="divide-y divide-white/5">
              {['SOUL.md', 'MEMORY.md', 'USER.md', 'AGENTS.md', 'ACTIVE-TASK.md', 'HEARTBEAT.md'].map((file, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <FileText size={16} className="text-white/40" />
                  <span className="text-white/70 text-sm">{file}</span>
                  <span className="ml-auto text-[10px] text-white/30">2.{i} KB</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cron':
        return (
          <div className="space-y-3">
            {MOCK_CRON.map((task) => (
              <div 
                key={task.id}
                className="rounded-xl p-4 border border-white/10"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-white/50" />
                    <span className="text-white font-medium">{task.name}</span>
                  </div>
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: task.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      color: task.status === 'active' ? '#10b981' : '#ef4444'
                    }}
                  >
                    {task.status === 'active' ? '運行中' : '已暫停'}
                  </span>
                </div>
                <div className="font-mono text-xs text-white/40 mb-2 bg-black/30 px-2 py-1 rounded">
                  {task.schedule}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-white/40">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    上次: {task.lastRun}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    下次: {task.nextRun}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'user':
        return (
          <div className="space-y-4">
            <div 
              className="rounded-xl p-5 border border-white/10 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)' }}
            >
              <div className="text-4xl font-bold text-white mb-1">
                {MOCK_USER_RELATIONSHIP.interactionCount.toLocaleString()}
              </div>
              <p className="text-white/50 text-sm">總互動次數</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <p className="text-[10px] text-white/40 mb-1">首次見面</p>
                <p className="text-white font-medium">{MOCK_USER_RELATIONSHIP.firstMet}</p>
              </div>
              <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <p className="text-[10px] text-white/40 mb-1">了解程度</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${MOCK_USER_RELATIONSHIP.understandingLevel}%`,
                        background: agentColor
                      }}
                    />
                  </div>
                  <span className="text-white font-medium">{MOCK_USER_RELATIONSHIP.understandingLevel}%</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="text-[10px] text-white/40 mb-3">感興趣的話題</p>
              <div className="flex flex-wrap gap-2">
                {MOCK_USER_RELATIONSHIP.favoriteTopics.map((topic, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs bg-white/10 text-white/80 border border-white/10"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-rose-400" />
                  <span className="text-white/70 text-sm">最後深度對話</span>
                </div>
                <span className="text-white/50 text-sm">{MOCK_USER_RELATIONSHIP.lastDeepConversation}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4"
          style={{ 
            background: `linear-gradient(135deg, ${agentColor}40, ${agentColor}15)`,
            border: `2px solid ${agentColor}50`,
            boxShadow: `0 0 40px ${agentColor}30`
          }}
        >
          {agentIcon}
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{agent.name}</h2>
        <p className="text-white/50">「{agentSoul}」</p>
        <div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mt-3"
          style={{ background: `${agentColor}20`, color: agentColor, border: `1px solid ${agentColor}40` }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: agentColor }} />
          {agent.status === 'online' ? '在線' : agent.status === 'busy' ? '忙碌中' : '離線'}
        </div>
      </div>

      {/* DNA Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-white/10 text-white border border-white/20' 
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};
