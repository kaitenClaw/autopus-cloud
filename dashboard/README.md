# Autopus Dashboard

Real-time Agent Network Dashboard for Autopus Station.

## Features

- **Agent Status Cards**: Live status of all 5 agents (KAITEN, FORGE, SIGHT, PULSE, Fion)
- **Communication Flow**: Visualize agent-to-agent communication
- **System Metrics**: CPU, memory, tasks completed, uptime
- **Real-time Updates**: WebSocket connection for live updates

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

```
dashboard/
├── src/
│   ├── components/
│   │   ├── AgentCard.tsx        # Individual agent status card
│   │   └── CommunicationFlow.tsx # Communication visualization
│   ├── pages/
│   ├── utils/
│   │   └── agents.ts            # Agent utilities & API calls
│   ├── types/
│   │   └── index.ts             # TypeScript definitions
│   ├── App.tsx                  # Main dashboard component
│   └── main.tsx                 # Entry point
├── package.json
└── vite.config.ts
```

## API Integration

The dashboard connects to the Autopus backend API:

| Endpoint | Description |
|----------|-------------|
| `GET /api/agents/status` | Get all agent statuses |
| `GET /api/agents/:id/status` | Get specific agent status |
| `POST /api/agents/:id/command` | Execute command on agent |
| `GET /api/agents/coordination/status-board` | Get coordination status |

## Agent Ports

| Agent | Port | Color |
|-------|------|-------|
| KAITEN | 18792 | Indigo |
| FORGE | 18793 | Amber |
| SIGHT | 18795 | Emerald |
| PULSE | 18797 | Red |
| Fion | 18799 | Pink |

## Development

### Adding New Features

1. Create component in `src/components/`
2. Add types to `src/types/index.ts`
3. Update `App.tsx` to include new component

### Environment Variables

```bash
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

## Production Deployment

The dashboard is served from the backend at `/dashboard` route in production.

```bash
# Build dashboard
cd dashboard
npm run build

# Copy to backend public folder
cp -r dist/* ../backend/public/dashboard/
```
