// Seed skills for Autopus Marketplace Launch
// Run this to populate initial skills: npx ts-node scripts/seed-skills.ts

import { prisma } from '../src/config/prisma';

const LAUNCH_SKILLS = [
  {
    slug: 'email-ninja',
    name: 'Email Ninja',
    description: 'Automatically summarize, prioritize, and draft emails. Works with Gmail, Outlook, and any IMAP inbox. Learns your writing style over time.',
    category: 'productivity',
    icon: '📧',
    version: '1.0.0',
    tier: 'FREE' as const,
    featured: true,
    installs: 0,
    manifest: {
      triggers: ['email', 'inbox', 'message', 'draft'],
      actions: ['summarize', 'prioritize', 'draft', 'schedule-send'],
      permissions: ['email.read', 'email.send'],
      config: {
        summaryLength: 'medium',
        autoDraft: false,
        workingHours: { start: 9, end: 18 }
      }
    }
  },
  {
    slug: 'calendar-sage',
    name: 'Calendar Sage',
    description: 'Smart scheduling that finds the best meeting times, prepares agendas, and sends reminders. Integrates with Google Calendar, Calendly, and Outlook.',
    category: 'productivity',
    icon: '📅',
    version: '1.0.0',
    tier: 'FREE' as const,
    featured: true,
    installs: 0,
    manifest: {
      triggers: ['meeting', 'schedule', 'calendar', 'appointment'],
      actions: ['find-slots', 'book', 'remind', 'prepare-agenda'],
      permissions: ['calendar.read', 'calendar.write'],
      config: {
        bufferMinutes: 15,
        preferredTimes: ['09:00', '14:00'],
        autoDecline: false
      }
    }
  },
  {
    slug: 'task-master',
    name: 'Task Master',
    description: 'Intelligent task management that captures todos from conversations, sets priorities, and tracks completion. Syncs with Todoist, Notion, and Asana.',
    category: 'productivity',
    icon: '✅',
    version: '1.0.0',
    tier: 'FREE' as const,
    featured: false,
    installs: 0,
    manifest: {
      triggers: ['todo', 'task', 'remind me', 'don\'t forget'],
      actions: ['capture', 'prioritize', 'schedule', 'follow-up'],
      permissions: ['tasks.read', 'tasks.write'],
      config: {
        defaultPriority: 'medium',
        autoSchedule: true,
        reminderPolicy: 'smart'
      }
    }
  },
  {
    slug: 'lead-hunter',
    name: 'Lead Hunter',
    description: 'Find and enrich prospect information from LinkedIn, Apollo, and Hunter. Automatically builds lead lists and tracks outreach.',
    category: 'business',
    icon: '🎯',
    version: '1.0.0',
    tier: 'PREMIUM' as const,
    priceUsd: 9,
    featured: true,
    installs: 0,
    manifest: {
      triggers: ['lead', 'prospect', 'contact', 'outreach'],
      actions: ['search', 'enrich', 'verify', 'track'],
      permissions: ['api.apollo', 'api.hunter', 'api.linkedin'],
      config: {
        dailyLimit: 100,
        enrichmentLevel: 'full',
        autoVerify: true
      }
    }
  },
  {
    slug: 'meeting-scribe',
    name: 'Meeting Scribe',
    description: 'Joins your Zoom/Meet calls, transcribes conversations, extracts action items, and generates summaries. Never take notes again.',
    category: 'business',
    icon: '📝',
    version: '1.0.0',
    tier: 'PREMIUM' as const,
    priceUsd: 12,
    featured: true,
    installs: 0,
    manifest: {
      triggers: ['meeting', 'call', 'zoom', 'transcribe'],
      actions: ['join', 'record', 'transcribe', 'summarize', 'extract-actions'],
      permissions: ['calendar.read', 'meetings.join'],
      config: {
        autoJoin: true,
        summaryStyle: 'detailed',
        extractDecisions: true
      }
    }
  },
  {
    slug: 'tweet-stormer',
    name: 'Tweet Stormer',
    description: 'Creates engaging Twitter threads from your ideas. Analyzes your best-performing content to match your voice and optimize engagement.',
    category: 'creative',
    icon: '🐦',
    version: '1.0.0',
    tier: 'FREE' as const,
    featured: false,
    installs: 0,
    manifest: {
      triggers: ['twitter', 'thread', 'tweet', 'social'],
      actions: ['draft', 'optimize', 'schedule', 'analyze'],
      permissions: ['twitter.read', 'twitter.write'],
      config: {
        tone: 'professional',
        threadLength: 'medium',
        autoSchedule: false
      }
    }
  },
  {
    slug: 'content-calendar',
    name: 'Content Calendar',
    description: 'Plans, schedules, and publishes content across platforms. Maintains consistent posting schedules and tracks performance.',
    category: 'creative',
    icon: '📆',
    version: '1.0.0',
    tier: 'PREMIUM' as const,
    priceUsd: 7,
    featured: false,
    installs: 0,
    manifest: {
      triggers: ['content', 'post', 'schedule', 'publish'],
      actions: ['plan', 'draft', 'schedule', 'publish', 'analyze'],
      permissions: ['buffer', 'instagram', 'linkedin', 'twitter'],
      config: {
        platforms: ['twitter', 'linkedin'],
        postingTimes: ['09:00', '14:00', '18:00'],
        autoHashtag: true
      }
    }
  },
  {
    slug: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Analyzes pull requests for bugs, security issues, and style violations. Learns your team\'s coding standards over time.',
    category: 'development',
    icon: '💻',
    version: '1.0.0',
    tier: 'FREE' as const,
    featured: true,
    installs: 0,
    manifest: {
      triggers: ['PR', 'pull request', 'review', 'code'],
      actions: ['analyze', 'comment', 'suggest', 'approve'],
      permissions: ['github.read', 'github.write'],
      config: {
        checkSecurity: true,
        checkPerformance: true,
        styleGuide: 'standard'
      }
    }
  },
  {
    slug: 'vps-guardian',
    name: 'VPS Guardian',
    description: 'Monitors server health, alerts on anomalies, and suggests optimizations. Works with any VPS provider via SSH.',
    category: 'development',
    icon: '🖥️',
    version: '1.0.0',
    tier: 'PREMIUM' as const,
    priceUsd: 5,
    featured: true,
    installs: 0,
    manifest: {
      triggers: ['server', 'vps', 'health', 'monitor'],
      actions: ['monitor', 'alert', 'optimize', 'report'],
      permissions: ['ssh.read', 'system.metrics'],
      config: {
        checkInterval: 60,
        alertThreshold: { cpu: 80, memory: 85, disk: 90 },
        autoOptimize: false
      }
    }
  },
  {
    slug: 'web-search-pro',
    name: 'Web Search Pro',
    description: 'Deep web research with source verification, summary generation, and fact-checking. Cites sources in every answer.',
    category: 'research',
    icon: '🔍',
    version: '1.0.0',
    tier: 'FREE' as const,
    featured: true,
    installs: 0,
    manifest: {
      triggers: ['search', 'research', 'find', 'look up'],
      actions: ['search', 'verify', 'summarize', 'cite'],
      permissions: ['search.api', 'web.read'],
      config: {
        resultCount: 10,
        recency: 'month',
        verifyFacts: true,
        citeSources: true
      }
    }
  },
  {
    slug: 'finance-tracker',
    name: 'Finance Tracker',
    description: 'Tracks expenses, monitors budgets, and generates financial reports. Connects to bank accounts and crypto wallets.',
    category: 'business',
    icon: '💰',
    version: '1.0.0',
    tier: 'PREMIUM' as const,
    priceUsd: 8,
    featured: false,
    installs: 0,
    manifest: {
      triggers: ['expense', 'budget', 'finance', 'money'],
      actions: ['track', 'categorize', 'report', 'alert'],
      permissions: ['bank.read', 'crypto.read'],
      config: {
        budgetAlerts: true,
        reportFrequency: 'weekly',
        currency: 'USD'
      }
    }
  },
  {
    slug: 'memory-boost',
    name: 'Memory Boost',
    description: 'Enhanced memory system that automatically organizes information, creates connections, and surfaces relevant context.',
    category: 'productivity',
    icon: '🧠',
    version: '1.0.0',
    tier: 'FREE' as const,
    featured: true,
    installs: 0,
    manifest: {
      triggers: ['remember', 'recall', 'what did', 'when did'],
      actions: ['store', 'organize', 'connect', 'recall'],
      permissions: ['memory.read', 'memory.write'],
      config: {
        autoOrganize: true,
        connectionDepth: 3,
        contextWindow: 'unlimited'
      }
    }
  }
];

async function seedSkills() {
  console.log('🌱 Seeding marketplace skills...\n');

  for (const skill of LAUNCH_SKILLS) {
    try {
      await prisma.skill.upsert({
        where: { slug: skill.slug },
        update: {
          ...skill,
          updatedAt: new Date()
        },
        create: {
          ...skill,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`✅ ${skill.name} (${skill.tier})`);
    } catch (error) {
      console.error(`❌ Failed to seed ${skill.name}:`, error);
    }
  }

  console.log('\n✨ Seeding complete!');
  console.log(`📊 Total: ${LAUNCH_SKILLS.length} skills`);
  console.log(`🆓 Free: ${LAUNCH_SKILLS.filter(s => s.tier === 'FREE').length}`);
  console.log(`💎 Premium: ${LAUNCH_SKILLS.filter(s => s.tier === 'PREMIUM').length}`);
  
  await prisma.$disconnect();
}

seedSkills().catch(console.error);
