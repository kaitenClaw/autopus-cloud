const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Telegraf } = require('telegraf');
const cors = require('cors');
const winston = require('winston');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
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
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Config
const PORT = process.env.PORT || 3000;
const LITELLM_HOST = process.env.LITELLM_HOST || 'http://localhost:4000';
const LITELLM_API_KEY = process.env.LITELLM_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const AGENT_ID = process.env.AGENT_ID || 'pulse-cloud';
const AGENT_ROLE = process.env.AGENT_ROLE || 'devops';

// Express + Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// State
const sessions = new Map();
const telegramSessions = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: AGENT_ID,
    role: AGENT_ROLE,
    uptime: process.uptime(),
    sessions: sessions.size,
    telegram: telegramBot ? 'connected' : 'disconnected'
  });
});

// Chat history
app.get('/api/chat/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  res.json(session?.messages || []);
});

// LiteLLM Proxy
async function callLLM(messages, model = 'kimi-coding/k2p5') {
  try {
    const response = await axios.post(`${LITELLM_HOST}/v1/chat/completions`, {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4000
    }, {
      headers: {
        'Authorization': `Bearer ${LITELLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    });
    return response.data.choices[0].message;
  } catch (error) {
    logger.error('LLM call failed:', error.message);
    throw error;
  }
}

// Socket.io handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  const sessionId = uuidv4();
  sessions.set(sessionId, {
    id: sessionId,
    socketId: socket.id,
    messages: [],
    createdAt: new Date()
  });
  
  socket.emit('session', { sessionId });

  socket.on('message', async (data) => {
    const session = sessions.get(sessionId);
    if (!session) return;

    // Add user message
    session.messages.push({
      role: 'user',
      content: data.text,
      timestamp: new Date()
    });

    // Broadcast typing
    socket.emit('typing', { agent: AGENT_ID });

    try {
      // Call LLM
      const response = await callLLM([
        { role: 'system', content: `You are ${AGENT_ID}, a ${AGENT_ROLE} agent in the Autopus ecosystem.` },
        ...session.messages.slice(-10)
      ]);

      // Add assistant message
      session.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      });

      socket.emit('message', {
        role: 'assistant',
        content: response.content,
        agent: AGENT_ID
      });

    } catch (error) {
      socket.emit('error', { message: 'Failed to get response' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    // Keep session for 24h
    setTimeout(() => sessions.delete(sessionId), 24 * 60 * 60 * 1000);
  });
});

// Telegram Bot
let telegramBot = null;
if (TELEGRAM_TOKEN) {
  telegramBot = new Telegraf(TELEGRAM_TOKEN);
  
  telegramBot.start((ctx) => {
    ctx.reply(`🤖 Hello! I'm ${AGENT_ID} (${AGENT_ROLE} agent) from Autopus Cloud.\n\nHow can I help you today?`);
  });

  telegramBot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    let session = telegramSessions.get(userId);
    
    if (!session) {
      session = { messages: [] };
      telegramSessions.set(userId, session);
    }

    session.messages.push({ role: 'user', content: ctx.message.text });

    try {
      const response = await callLLM([
        { role: 'system', content: `You are ${AGENT_ID}, a ${AGENT_ROLE} agent.` },
        ...session.messages.slice(-10)
      ]);

      session.messages.push({ role: 'assistant', content: response.content });
      ctx.reply(response.content);

    } catch (error) {
      ctx.reply('❌ Sorry, I encountered an error. Please try again.');
    }
  });

  telegramBot.launch().then(() => {
    logger.info('Telegram bot connected');
  }).catch(err => {
    logger.error('Telegram bot failed:', err.message);
  });

  // Graceful shutdown
  process.once('SIGINT', () => telegramBot.stop('SIGINT'));
  process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));
}

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Autopus Lite Runtime started`);
  logger.info(`Agent: ${AGENT_ID} (${AGENT_ROLE})`);
  logger.info(`Port: ${PORT}`);
  logger.info(`LiteLLM: ${LITELLM_HOST}`);
  logger.info(`Telegram: ${TELEGRAM_TOKEN ? 'enabled' : 'disabled'}`);
});
