const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Telegraf } = require('telegraf');
const cors = require('cors');
const winston = require('winston');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

require('dotenv').config();

// Logger
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

// Config
const PORT = process.env.PORT || 3000;
const LITELLM_HOST = process.env.LITELLM_HOST || 'http://localhost:4000';
const LITELLM_API_KEY = process.env.LITELLM_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const AGENT_ID = process.env.AGENT_ID || 'pulse-cloud';
const AGENT_ROLE = process.env.AGENT_ROLE || 'devops';
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/app/workspace';
const SKILLS_DIR = process.env.SKILLS_DIR || '/app/skills';

// Ensure directories exist
async function ensureDirectories() {
  const dirs = [
    WORKSPACE_DIR,
    path.join(WORKSPACE_DIR, 'memory'),
    path.join(WORKSPACE_DIR, 'skills'),
    SKILLS_DIR,
    'logs'
  ];
  for (const dir of dirs) {
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

// Express + Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use('/workspace', express.static(WORKSPACE_DIR));

// ============================================
// SOUL & MEMORY MANAGEMENT
// ============================================

class AgentMemory {
  constructor(agentId, workspaceDir) {
    this.agentId = agentId;
    this.workspaceDir = workspaceDir;
    this.soulPath = path.join(workspaceDir, 'SOUL.md');
    this.memoryDir = path.join(workspaceDir, 'memory');
  }

  async loadSoul() {
    try {
      const content = await fs.readFile(this.soulPath, 'utf8');
      return this.parseSoul(content);
    } catch (error) {
      logger.warn(`SOUL.md not found for ${this.agentId}, using default`);
      return this.getDefaultSoul();
    }
  }

  parseSoul(content) {
    const soul = {
      name: '',
      role: '',
      personality: '',
      communicationStyle: '',
      coreValues: [],
      raw: content
    };
    
    // Parse basic fields
    const nameMatch = content.match(/Name:\s*(.+)/i);
    if (nameMatch) soul.name = nameMatch[1].trim();
    
    const roleMatch = content.match(/Role:\s*(.+)/i);
    if (roleMatch) soul.role = roleMatch[1].trim();
    
    return soul;
  }

  getDefaultSoul() {
    return {
      name: this.agentId,
      role: AGENT_ROLE,
      personality: 'Professional, efficient, and proactive',
      communicationStyle: 'Concise and action-oriented',
      coreValues: ['Reliability', 'Efficiency', 'Transparency'],
      raw: `# ${this.agentId}\n\nDefault SOUL configuration.`
    };
  }

  async saveMemory(content, type = 'general') {
    const date = new Date().toISOString().split('T')[0];
    const memoryPath = path.join(this.memoryDir, `${date}.md`);
    
    const entry = `\n## ${new Date().toISOString()}\n**Type:** ${type}\n\n${content}\n`;
    
    try {
      await fs.appendFile(memoryPath, entry);
      return { success: true, path: memoryPath };
    } catch (error) {
      logger.error('Failed to save memory:', error);
      return { success: false, error: error.message };
    }
  }

  async loadMemory(date) {
    const memoryPath = path.join(this.memoryDir, `${date}.md`);
    try {
      const content = await fs.readFile(memoryPath, 'utf8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: 'Memory not found' };
    }
  }

  async listMemories() {
    try {
      const files = await fs.readdir(this.memoryDir);
      return files.filter(f => f.endsWith('.md')).sort().reverse();
    } catch (error) {
      return [];
    }
  }
}

// ============================================
// CRON MANAGEMENT
// ============================================

class CronManager {
  constructor() {
    this.tasks = new Map();
  }

  add(name, schedule, callback) {
    if (this.tasks.has(name)) {
      this.tasks.get(name).stop();
    }
    
    const task = cron.schedule(schedule, callback, {
      scheduled: true,
      timezone: process.env.TZ || 'UTC'
    });
    
    this.tasks.set(name, task);
    logger.info(`Cron job '${name}' scheduled: ${schedule}`);
    return { success: true, name, schedule };
  }

  remove(name) {
    if (this.tasks.has(name)) {
      this.tasks.get(name).stop();
      this.tasks.delete(name);
      return { success: true, message: `Job '${name}' stopped` };
    }
    return { success: false, error: 'Job not found' };
  }

  list() {
    return Array.from(this.tasks.keys()).map(name => ({
      name,
      running: true
    }));
  }

  async loadFromConfig(configPath) {
    try {
      const content = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(content);
      
      for (const [name, job] of Object.entries(config.cron || {})) {
        this.add(name, job.schedule, async () => {
          logger.info(`Executing cron job: ${name}`);
          // Execute job action
          if (job.action === 'healthcheck') {
            await this.runHealthcheck();
          } else if (job.action === 'memory-sync') {
            await this.runMemorySync();
          }
        });
      }
      return { success: true, jobs: config.cron };
    } catch (error) {
      logger.warn('No cron config found, using defaults');
      // Add default cron jobs
      this.add('daily-healthcheck', '0 9 * * *', () => this.runHealthcheck());
      return { success: true, jobs: { 'daily-healthcheck': '0 9 * * *' } };
    }
  }

  async runHealthcheck() {
    logger.info('Running scheduled healthcheck...');
    // Implementation here
  }

  async runMemorySync() {
    logger.info('Running memory sync...');
    // Implementation here
  }
}

// ============================================
// SKILLS MANAGEMENT
// ============================================

class SkillsManager {
  constructor(skillsDir) {
    this.skillsDir = skillsDir;
  }

  async list() {
    try {
      const { stdout } = await execAsync('clawhub list');
      return { success: true, skills: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async install(skillName) {
    try {
      const { stdout } = await execAsync(`clawhub install ${skillName} --dir ${this.skillsDir}`);
      return { success: true, output: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(skillName) {
    try {
      const { stdout } = await execAsync(`clawhub update ${skillName} --dir ${this.skillsDir}`);
      return { success: true, output: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loadSkill(skillName) {
    const skillPath = path.join(this.skillsDir, skillName, 'SKILL.md');
    try {
      const content = await fs.readFile(skillPath, 'utf8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: 'Skill not found' };
    }
  }
}

// ============================================
// CLI CONTROL API
// ============================================

class CLIController {
  constructor() {
    this.sessions = new Map();
  }

  async execute(command, sessionId = 'default') {
    const allowedCommands = [
      'clawhub',
      'git',
      'ls',
      'cat',
      'pwd',
      'mkdir',
      'cp',
      'mv',
      'rm'
    ];
    
    const cmdBase = command.split(' ')[0];
    if (!allowedCommands.includes(cmdBase)) {
      return { success: false, error: 'Command not allowed' };
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: WORKSPACE_DIR,
        timeout: 30000
      });
      return { success: true, stdout, stderr };
    } catch (error) {
      return { success: false, error: error.message, stderr: error.stderr };
    }
  }
}

// ============================================
// INITIALIZE
// ============================================

let memoryManager, cronManager, skillsManager, cliController;

async function initialize() {
  await ensureDirectories();
  
  memoryManager = new AgentMemory(AGENT_ID, WORKSPACE_DIR);
  cronManager = new CronManager();
  skillsManager = new SkillsManager(SKILLS_DIR);
  cliController = new CLIController();
  
  // Load SOUL
  const soul = await memoryManager.loadSoul();
  logger.info(`Agent ${AGENT_ID} loaded with SOUL:`, soul.name);
  
  // Load CRON config
  const cronConfigPath = path.join(WORKSPACE_DIR, 'cron.json');
  await cronManager.loadFromConfig(cronConfigPath);
  
  logger.info('Enhanced Runtime initialized');
}

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/health', async (req, res) => {
  const soul = await memoryManager.loadSoul();
  res.json({
    status: 'ok',
    agent: AGENT_ID,
    role: AGENT_ROLE,
    uptime: process.uptime(),
    soul: soul.name,
    cron: cronManager.list(),
    telegram: telegramBot ? 'connected' : 'disconnected'
  });
});

// SOUL API
app.get('/api/soul', async (req, res) => {
  const soul = await memoryManager.loadSoul();
  res.json(soul);
});

app.post('/api/soul', async (req, res) => {
  const { content } = req.body;
  try {
    await fs.writeFile(path.join(WORKSPACE_DIR, 'SOUL.md'), content);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// MEMORY API
app.get('/api/memory', async (req, res) => {
  const { date } = req.query;
  if (date) {
    const result = await memoryManager.loadMemory(date);
    res.json(result);
  } else {
    const memories = await memoryManager.listMemories();
    res.json({ success: true, memories });
  }
});

app.post('/api/memory', async (req, res) => {
  const { content, type } = req.body;
  const result = await memoryManager.saveMemory(content, type);
  res.json(result);
});

// CRON API
app.get('/api/cron', (req, res) => {
  res.json({ success: true, jobs: cronManager.list() });
});

app.post('/api/cron', (req, res) => {
  const { name, schedule, action } = req.body;
  const result = cronManager.add(name, schedule, async () => {
    logger.info(`Cron action: ${action}`);
  });
  res.json(result);
});

app.delete('/api/cron/:name', (req, res) => {
  const result = cronManager.remove(req.params.name);
  res.json(result);
});

// SKILLS API
app.get('/api/skills', async (req, res) => {
  const result = await skillsManager.list();
  res.json(result);
});

app.post('/api/skills/install', async (req, res) => {
  const { name } = req.body;
  const result = await skillsManager.install(name);
  res.json(result);
});

app.get('/api/skills/:name', async (req, res) => {
  const result = await skillsManager.loadSkill(req.params.name);
  res.json(result);
});

// CLI API
app.post('/api/cli', async (req, res) => {
  const { command, sessionId } = req.body;
  const result = await cliController.execute(command, sessionId);
  res.json(result);
});

// Chat API (with memory)
app.post('/api/chat', async (req, res) => {
  const { message, sessionId = 'default' } = req.body;
  
  // Load SOUL for context
  const soul = await memoryManager.loadSoul();
  
  // Save user message to memory
  await memoryManager.saveMemory(`User: ${message}`, 'chat');
  
  // Call LLM with SOUL context
  try {
    const response = await axios.post(`${LITELLM_HOST}/v1/chat/completions`, {
      model: 'kimi-coding/k2p5',
      messages: [
        { role: 'system', content: `You are ${soul.name}. ${soul.personality}` },
        { role: 'user', content: message }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${LITELLM_API_KEY}` },
      timeout: 120000
    });
    
    const reply = response.data.choices[0].message.content;
    
    // Save assistant response to memory
    await memoryManager.saveMemory(`Assistant: ${reply}`, 'chat');
    
    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TELEGRAM BOT
// ============================================

let telegramBot = null;

if (TELEGRAM_TOKEN) {
  telegramBot = new Telegraf(TELEGRAM_TOKEN);
  
  telegramBot.start((ctx) => {
    ctx.reply(`🤖 Hello! I'm ${AGENT_ID} (${AGENT_ROLE})\n\nEnhanced Runtime with SOUL, MEMORY, CRON, and Skills support.`);
  });

  telegramBot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const message = ctx.message.text;
    
    // Load SOUL
    const soul = await memoryManager.loadSoul();
    
    try {
      const response = await axios.post(`${LITELLM_HOST}/v1/chat/completions`, {
        model: 'kimi-coding/k2p5',
        messages: [
          { role: 'system', content: `You are ${soul.name}. ${soul.personality}` },
          { role: 'user', content: message }
        ]
      }, {
        headers: { 'Authorization': `Bearer ${LITELLM_API_KEY}` },
        timeout: 120000
      });
      
      const reply = response.data.choices[0].message.content;
      
      // Save to memory
      await memoryManager.saveMemory(`Telegram ${userId}: ${message}\nReply: ${reply}`, 'telegram');
      
      ctx.reply(reply);
    } catch (error) {
      ctx.reply('❌ Error processing request');
      logger.error('Telegram chat error:', error);
    }
  });

  telegramBot.launch().then(() => {
    logger.info('Telegram bot connected');
  }).catch(err => {
    logger.error('Telegram bot failed:', err.message);
  });
}

// ============================================
// START SERVER
// ============================================

initialize().then(() => {
  server.listen(PORT, () => {
    logger.info(`🚀 Enhanced Runtime started`);
    logger.info(`Agent: ${AGENT_ID} (${AGENT_ROLE})`);
    logger.info(`Port: ${PORT}`);
    logger.info(`LiteLLM: ${LITELLM_HOST}`);
    logger.info(`Telegram: ${TELEGRAM_TOKEN ? 'enabled' : 'disabled'}`);
    logger.info(`Features: SOUL ✅ MEMORY ✅ CRON ✅ SKILLS ✅ CLI ✅`);
  });
});
