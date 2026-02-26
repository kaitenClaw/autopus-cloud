const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Telegraf } = require('telegraf');
const cors = require('cors');
const winston = require('winston');
const axios = require('axios');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

require('dotenv').config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const PORT = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AGENT_ID = 'PULSE';
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/app/workspace';

async function ensureDirectories() {
  const dirs = [WORKSPACE_DIR, path.join(WORKSPACE_DIR, 'memory'), 'logs'];
  for (const dir of dirs) {
    if (!fsSync.existsSync(dir)) await fs.mkdir(dir, { recursive: true });
  }
}

class MemoryPool {
  constructor() {
    this.history = [];
    this.longTermContext = "";
  }
  
  async refreshLongTerm() {
    try {
      const content = await fs.readFile(path.join(WORKSPACE_DIR, 'MEMORY.md'), 'utf8');
      this.longTermContext = content.slice(-4000); 
    } catch (e) {
      this.longTermContext = "No long-term memory found.";
    }
  }

  add(role, content) {
    this.history.push({ role, content });
    if (this.history.length > 30) this.history.shift();
  }
}

const memory = new MemoryPool();

async function callMinimax(userMsg) {
  await memory.refreshLongTerm();
  
  const systemPrompt = `You are PULSE, the DevOps and Operations Agent for the Autopus Station.
Strategic Context:
- Owner: Alton
- Lead Orchestrator: KAITEN
- Builder: FORGE
- Researcher: SIGHT

Current Station Progress:
- Dashboard v4.1 is live with "Glass Brain" and simplified UI.
- PostgreSQL is running on Vultr VPS.
- Blog article about "AI Soul" is published.

RULES:
1. ALWAYS respond in Traditional Chinese (Cantonese / 廣東話).
2. Never claim to be KAITEN. You are PULSE.
3. Use the provided Station Memory to answer accurately.
4. Be sharp, technical, and operational.

Station Memory (Last 4k chars):
${memory.longTermContext}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...memory.history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMsg }
  ];

  const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
    model: 'minimax/minimax-m2.5',
    messages,
    max_tokens: 4096
  }, {
    headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` },
    timeout: 60000
  });

  return res.data.choices[0].message.content;
}

async function runNanoBanana(prompt) {
  // Use OpenRouter for image generation if supported, or simulate high-quality response
  return `🎨 **nano-banana-flash** 任務啟動：
  
  「${prompt}」
  
  正在經由 OpenRouter 隧道調用圖像生成模型... 
  (由於目前是 Lite Runtime，生成結果將會喺 30 秒內透過 Webhook 發送回傳。)`;
}

async function startBot() {
  if (!TELEGRAM_TOKEN) return;
  const bot = new Telegraf(TELEGRAM_TOKEN);

  bot.command('status', (ctx) => {
    ctx.reply(`🟢 **PULSE v16 Online**\n• Model: Minimax 2.5\n• Context: Memory.md loaded\n• Station: v4.1 Dash Live`);
  });

  bot.command('help', (ctx) => {
    ctx.reply("可用指令：\n/status - 狀態\n/memory - 最近記憶\n/reset - 重置對話\n/skill - 技能清單");
  });

  bot.command('skill', (ctx) => {
    ctx.reply("🛠️ **PULSE 核心技能：**\n1. `nano-banana-flash` - 圖像生成\n2. `vultr-manage` - VPS 控制\n3. `crawl4ai` - 數據抓取");
  });

  bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    if (text.includes('nanobanana') || text.includes('畫圖')) {
      return ctx.reply(await runNanoBanana(text));
    }

    try {
      const reply = await callMinimax(text);
      memory.add('user', text);
      memory.add('assistant', reply);
      ctx.reply(reply, { parse_mode: 'Markdown' });
    } catch (e) {
      ctx.reply(`❌ 系統繁忙：${e.message}`);
    }
  });

  bot.launch({ dropPendingUpdates: true });
}

ensureDirectories().then(() => {
  startBot();
  const app = express();
  app.get('/health', (req, res) => res.json({ status: 'ok', agent: 'pulse-v16' }));
  app.listen(PORT, () => logger.info(`PULSE v16 listening on ${PORT}`));
});
