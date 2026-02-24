# Autopus Lite Runtime

Lightweight Agent Runtime for Autopus Cloud (~50MB vs ~2GB OpenClaw)

## Features
- Express.js HTTP server
- Socket.io real-time chat
- Telegram Bot integration
- LiteLLM proxy (100+ models)
- Session management
- Health monitoring

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your tokens

# Run
npm start
```

## Docker

```bash
docker build -t autopus-lite .
docker run -p 3000:3000 --env-file .env autopus-lite
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `LITELLM_HOST` | LiteLLM proxy URL |
| `LITELLM_API_KEY` | LiteLLM API key |
| `TELEGRAM_TOKEN` | Telegram bot token |
| `AGENT_ID` | Agent identifier |
| `AGENT_ROLE` | Agent role (devops/builder/etc) |
