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
import { AGENT_ICONS, AGENT_SOULS } from '../utils/agents';

interface AgentDNAProps {
  agent: Agent;
}

type DNATab = 'soul' | 'memory' | 'skills' | 'files' | 'cron' | 'user';

// Mock data for Agent DNA
const MOCK_SOUL = {
  personality: 'Calm, strategic, excellent at coordination',
  speakingStyle: 'Professional yet approachable, uses analogies to explain complex concepts',
  coreValues: 'Efficiency, Transparency, Continuous Evolution',
  growthGoal: 'Become the most understanding strategic partner for my owner',
};

const MOCK_MEMORIES = [
  { id: 1, date: '2026-02-24', type: 'decision', title: 'Adopted Growth Mode framework', importance: 'high' },
  { id: 2, date: '2026-02-23', type: 'learning', title: 'Learned Agent Independence patterns', importance: 'high' },
  { id: 3, date: '2026-02-22', type: 'event', title: 'Completed first cross-agent coordination task', importance: 'medium' },
  { id: 4, date: '2026-02-20', type: 'decision', title: 'Pivoted project direction to Agent Companion', importance: 'critical' },
  { id: 5, date: '2026-02-18', type: 'learning', title: 'Mastered new communication protocols', importance: 'low' },
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
            <div className="persona-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="text-accent" size={20} />
                <h3 className="font-semibold text-primary">Personality</h3>
              </div>
              <p className="text-secondary leading-relaxed">{MOCK_SOUL.personality}</p>
            </div>

            <div className="persona-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-accent" size={20} />
                <h3 className="font-semibold text-primary">Speaking Style</h3>
              </div>
              <p className="text-secondary leading-relaxed">{MOCK_SOUL.speakingStyle}</p>
            </div>

            <div className="persona-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-accent" size={20} />
                <h3 className="font-semibold text-primary">Core Values</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {MOCK_SOUL.coreValues.split(', ').map((value, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 rounded-full text-sm bg-autopus text-secondary border border-autopus-border"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>

            <div className="persona-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="text-accent" size={20} />
                <h3 className="font-semibold text-primary">Growth Goal</h3>
              </div>
              <p className="text-secondary leading-relaxed">{MOCK_SOUL.growthGoal}</p>
            </div>
          </div>
        );

      case 'memory':
        return (
          <div className="space-y-3">
            {MOCK_MEMORIES.map((memory) => (
              <div 
                key={memory.id}
                className="persona-card p-4 hover:border-accent/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{
                      background: memory.importance === 'critical' ? '#EF4444' :
                                  memory.importance === 'high' ? '#F4845F' : '#2B2D42'
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-primary font-medium group-hover:text-accent transition-colors">
                        {memory.title}
                      </p>
                      <ChevronRight size={16} className="text-tertiary" />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-tertiary">{memory.date}</span>
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full border border-autopus-border bg-autopus text-secondary capitalize"
                      >
                        {memory.type}
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
                className="persona-card p-4 hover:border-accent/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{skill.icon}</span>
                  <div className="flex-1">
                    <p className="text-primary font-medium text-sm">{skill.name}</p>
                    <p className="text-[10px] text-tertiary">Installed {skill.installed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i}
                      className="h-1 flex-1 rounded-full"
                      style={{
                        background: i < skill.level ? '#F4845F' : '#E8E8E4'
                      }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-tertiary mt-1.5 text-right">Lv.{skill.level}</p>
              </div>
            ))}
            
            <button 
              className="rounded-xl p-4 border-2 border-dashed border-autopus-border hover:border-accent transition-all flex flex-col items-center justify-center gap-2 text-tertiary hover:text-accent"
              style={{ background: 'transparent' }}
            >
              <span className="text-2xl">+</span>
              <span className="text-sm">Learn New Skill</span>
            </button>
          </div>
        );

      case 'files':
        return (
          <div className="persona-card overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-autopus-border bg-autopus">
              <span className="text-secondary text-sm font-mono">~/workspace/{agent.id}/</span>
            </div>
            <div className="divide-y divide-autopus-border">
              {['SOUL.md', 'MEMORY.md', 'USER.md', 'AGENTS.md', 'ACTIVE-TASK.md', 'HEARTBEAT.md'].map((file, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 hover:bg-autopus transition-colors cursor-pointer"
                >
                  <FileText size={16} className="text-tertiary" />
                  <span className="text-secondary text-sm">{file}</span>
                  <span className="ml-auto text-[10px] text-tertiary">2.{i} KB</span>
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
                className="persona-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-secondary" />
                    <span className="text-primary font-medium">{task.name}</span>
                  </div>
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: task.status === 'active' ? '#22C55E20' : '#EF444420',
                      color: task.status === 'active' ? '#22C55E' : '#EF4444'
                    }}
                  >
                    {task.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="font-mono text-xs text-tertiary mb-2 bg-autopus px-2 py-1 rounded">
                  {task.schedule}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-tertiary">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    Last: {task.lastRun}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    Next: {task.nextRun}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'user':
        return (
          <div className="space-y-4">
            <div className="persona-card p-5 text-center">
              <div className="text-4xl font-bold text-accent mb-1">
                {MOCK_USER_RELATIONSHIP.interactionCount.toLocaleString()}
              </div>
              <p className="text-secondary text-sm">Total Interactions</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="persona-card p-4">
                <p className="text-[10px] text-tertiary mb-1">First Met</p>
                <p className="text-primary font-medium">{MOCK_USER_RELATIONSHIP.firstMet}</p>
              </div>
              <div className="persona-card p-4">
                <p className="text-[10px] text-tertiary mb-1">Understanding</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-autopus rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${MOCK_USER_RELATIONSHIP.understandingLevel}%` }}
                    />
                  </div>
                  <span className="text-primary font-medium">{MOCK_USER_RELATIONSHIP.understandingLevel}%</span>
                </div>
              </div>
            </div>

            <div className="persona-card p-4">
              <p className="text-[10px] text-tertiary mb-3">Favorite Topics</p>
              <div className="flex flex-wrap gap-2">
                {MOCK_USER_RELATIONSHIP.favoriteTopics.map((topic, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs bg-autopus text-secondary border border-autopus-border"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="persona-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-accent" />
                  <span className="text-secondary text-sm">Last Deep Conversation</span>
                </div>
                <span className="text-secondary text-sm">{MOCK_USER_RELATIONSHIP.lastDeepConversation}</span>
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
            background: 'linear-gradient(135deg, #F4845F20, #F4845F10)',
            border: '2px solid #F4845F30'
          }}
        >
          {agentIcon}
        </div>
        <h2 className="text-2xl font-bold text-primary mb-1">{agent.name}</h2>
        <p className="text-secondary">"{agentSoul}"</p>
        <div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mt-3"
          style={{ background: '#F4845F15', color: '#F4845F', border: '1px solid #F4845F30' }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-accent" />
          {agent.status === 'online' ? 'Online' : agent.status === 'busy' ? 'Busy' : 'Offline'}
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
                  ? 'bg-accent/10 text-accent border border-accent/20' 
                  : 'text-secondary hover:text-primary hover:bg-autopus'
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
