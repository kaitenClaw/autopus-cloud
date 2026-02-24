# AUTOPUS MVP — Storage Architecture
## Database Models & Storage Strategy

---

## 1. Core Database (PostgreSQL)

### User Management
```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  name          String?
  role          UserRole       @default(USER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  // Relations
  agents        Agent[]
  refreshTokens RefreshToken[]
  subscription  Subscription?
  usage         Usage[]
}
```

### Agent System
```prisma
model Agent {
  id               String        @id @default(uuid())
  name             String
  modelPreset      String
  status           AgentStatus   @default(STOPPED)
  userId           String
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  deletedAt        DateTime?     // Soft delete
  
  // Configuration
  config           Json?         // Flexible agent config
  customPrompt     String?       // System prompt override
  port             Int?          // Runtime port
  profilePath      String?       // File system path
  
  // Relations
  user             User          @relation(fields: [userId], references: [id])
  agentConfig      AgentConfig?
  sessions         ChatSession[]
  messages         Message[]
  usage            Usage[]
  skillInstalls    SkillInstall[]
}
```

### Chat & Memory
```prisma
model ChatSession {
  id          String      @id @default(uuid())
  agentId     String
  title       String
  memoryScope MemoryScope @default(SESSION)
  metadata    Json?       // Token count, etc.
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  archivedAt  DateTime?   // Auto-archive old sessions
  
  agent       Agent       @relation(fields: [agentId], references: [id])
  messages    Message[]
}

model Message {
  id        String       @id @default(uuid())
  agentId   String
  sessionId String?
  role      String       // 'user' | 'assistant' | 'system'
  content   String
  metadata  Json?        // Tokens, model, cost
  createdAt DateTime     @default(now())
  
  agent     Agent        @relation(fields: [agentId], references: [id])
  session   ChatSession? @relation(fields: [sessionId], references: [id])
  
  @@index([agentId, createdAt])
  @@index([sessionId, createdAt])
}
```

### Subscription & Billing
```prisma
model Subscription {
  id                   String           @id @default(uuid())
  userId               String           @unique
  tier                 SubscriptionTier @default(FREE)
  maxAgents            Int              @default(1)
  maxTokensPerDay      Int              @default(10000)
  stripeCustomerId     String?
  stripeSubscriptionId String?
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
  
  user                 User             @relation(fields: [userId], references: [id])
}

model Usage {
  id        String   @id @default(uuid())
  userId    String
  agentId   String?
  tokens    Int
  model     String
  provider  String?  // openrouter, openai, etc.
  cost      Float?   // USD cost
  timestamp DateTime @default(now())
  metadata  Json?
  
  user      User     @relation(fields: [userId], references: [id])
  agent     Agent?   @relation(fields: [agentId], references: [id])
  
  @@index([userId, timestamp])
}
```

### Skills Marketplace
```prisma
model Skill {
  id          String        @id @default(uuid())
  slug        String        @unique
  name        String
  description String        @db.Text
  category    String        @default("general")
  icon        String?
  version     String        @default("1.0.0")
  tier        SkillTier     @default(FREE)
  priceUsd    Float?
  featured    Boolean       @default(false)
  installs    Int           @default(0)
  manifest    Json          // Skill definition
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  installations SkillInstall[]
}

model SkillInstall {
  id        String   @id @default(uuid())
  skillId   String
  agentId   String
  userId    String
  createdAt DateTime @default(now())
  
  skill     Skill    @relation(fields: [skillId], references: [id])
  
  @@unique([skillId, agentId])
  @@index([agentId])
}
```

---

## 2. File System Storage

### Agent Workspace Structure
```
/data/agents/{agent-id}/
├── SOUL.md              # Agent personality/core
├── MEMORY.md            # Long-term memory
├── USER.md              # User preferences
├── ACTIVE-TASK.md       # Current task context
├── HEARTBEAT.md         # Status log
├── skills/              # Installed skills
│   ├── skill-a/
│   │   └── index.js
│   └── skill-b/
│       └── index.js
└── workspace/           # Working files
    ├── documents/
    └── outputs/
```

### Storage Strategy
| Data Type | Storage | Retention |
|-----------|---------|-----------|
| Agent Config | Filesystem | Persistent |
| Chat History | PostgreSQL | 90 days |
| Session Context | Filesystem | Active only |
| User Files | Filesystem + S3 | Persistent |
| Analytics | PostgreSQL | 1 year |

---

## 3. Redis (Caching & Sessions)

### Use Cases
```
// Rate limiting
ratelimit:{userId} -> counter

// Session cache
session:{token} -> userData (TTL: 24h)

// Agent status cache
agent:{agentId}:status -> {online, busy, offline}

// Real-time pub/sub
channel:user:{userId}       # User notifications
channel:agent:{agentId}     # Agent events
```

---

## 4. S3/Object Storage (Optional)

### For File Uploads
```
bucket: autopus-user-files
├── users/{userId}/
│   ├── uploads/
│   ├── exports/
│   └── backups/
└── public/
    └── skills/
```

---

## 5. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  (Browser / Telegram / API)                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                            │
│  - Rate limiting (Redis)                                    │
│  - Auth validation (JWT)                                    │
│  - Request routing                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌─────────┐ ┌──────────────┐
│   PostgreSQL │ │  Redis  │ │  Filesystem  │
│   (Primary)  │ │ (Cache) │ │   (Agent     │
│              │ │         │ │    Workspace)│
│ - Users      │ │ - Sessions│              │
│ - Agents     │ │ - Rate   │ - SOUL.md    │
│ - Messages   │ │   limits │ - MEMORY.md  │
│ - Billing    │ │ - Pub/sub│ - Skills     │
└──────────────┘ └─────────┘ └──────────────┘
```

---

## 6. Backup Strategy

| Component | Method | Frequency |
|-----------|--------|-----------|
| PostgreSQL | pg_dump | Daily |
| Agent Files | rsync | Hourly |
| Redis | RDB snapshots | Every 6 hours |

---

## 7. Migration Plan for MVP

### Phase 1: Core (Complete ✅)
- [x] User & Agent models
- [x] Chat Session & Messages
- [x] Basic Usage tracking

### Phase 2: Marketplace (In Progress 🟠)
- [ ] Skill model
- [ ] SkillInstall model
- [ ] Payment integration

### Phase 3: Analytics (Pending ⏳)
- [ ] Enhanced usage metrics
- [ ] Time-series aggregation
- [ ] Export functionality

---

*Last Updated: 2026-02-24*
*Storage Version: MVP-1.0*