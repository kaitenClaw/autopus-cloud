# Learning Protocol - Skill Development for Agents

## Mission
**Before implementing, study and learn from the best.**

Every agent should continuously improve by learning from:
1. **GitHub Open Source** - Real-world production code
2. **Skills.sh** - Proven automation patterns
3. **Notebooks** - Research and best practices
4. **Documentation** - Official framework guides

---

## Learning Sources

### 1. GitHub Open Source Projects

**When building backend (Forge):**
- Study: `nestjs/nest` - Enterprise Node.js framework patterns
- Study: `prisma/prisma-examples` - Database schema best practices
- Study: `trpc/trpc` - Type-safe API patterns
- Study: `fastify/fastify` - High-performance server patterns

**When building auth (Forge):**
- Study: `nextauthjs/next-auth` - Modern auth patterns
- Study: `supabase/supabase` - Auth + DB integration
- Study: `lucia-auth/lucia` - Simple auth library patterns

**When building tests (Sight):**
- Study: `vitest-dev/vitest` - Modern testing patterns
- Study: `playwright-dev/playwright` - E2E testing
- Study: `goldbergyoni/nodebestpractices` - Testing best practices

**When building mobile integration (Prime/Forge):**
- Study: `expo/expo` - React Native patterns
- Study: `tanstack/query` - Data fetching patterns
- Study: `react-hook-form/react-hook-form` - Form validation

---

### 2. Skills.sh Resources

**Search and study relevant skills:**
```bash
# Example: Before implementing auth
# Search skills.sh for "authentication nodejs jwt"
# Learn from proven patterns
# Adapt to OpenClaw context
```

**Key skill categories:**
- Backend development (Node.js, Express, Fastify)
- Database design (Prisma, PostgreSQL)
- Authentication (JWT, OAuth, sessions)
- API design (REST, GraphQL, tRPC)
- Testing (unit, integration, E2E)
- Deployment (Docker, Coolify, VPS)

---

### 3. Notebooks & Research

**Before major implementation:**
- Read relevant papers on ArXiv
- Study technical blogs (Vercel, Netlify, Railway)
- Review architecture decision records (ADRs)
- Learn from case studies

**Example: Before building agent management API**
```markdown
Research questions:
1. How do other platforms manage multi-tenant resources?
2. What are common patterns for agent lifecycle management?
3. How to handle agent quotas and rate limiting?
4. What security considerations for agent APIs?

Sources:
- Vercel's platform architecture blog posts
- Railway's multi-tenancy approach
- Render's resource isolation patterns
- AWS Lambda's container lifecycle management
```

---

### 4. Official Documentation

**Always read docs FIRST:**
- Node.js official docs (for latest features)
- Express.js guides (middleware patterns)
- Prisma docs (schema design, migrations)
- PostgreSQL docs (performance optimization)
- JWT.io (token security best practices)

---

## Learning Workflow

### Phase 1: Pre-Task Research (2-4 hours)

**When assigned a task, agent MUST:**

1. **Read task requirements**
   ```bash
   TASK=$(cat ~/ocaas-project/coordination/inbox-{agent}.json)
   TITLE=$(echo $TASK | jq -r '.task.title')
   ```

2. **Identify learning needs**
   ```markdown
   Task: Initialize Backend Infrastructure

   Learning needs:
   - How to structure Node.js + Express server?
   - What's the best Prisma schema pattern for multi-tenancy?
   - JWT vs session auth - which is better for our use case?
   - How to handle database migrations in production?
   ```

3. **Study relevant GitHub repos**
   ```bash
   # Clone and study examples
   git clone https://github.com/prisma/prisma-examples
   cd prisma-examples/typescript/rest-express

   # Read code, understand patterns
   # Note: What makes this code good?
   #       What would I adapt for OCaaS?
   ```

4. **Search skills.sh**
   ```
   Search: "express server best practices"
   Search: "prisma multi-tenant schema"
   Search: "jwt authentication nodejs"

   Save top 3 most relevant patterns
   ```

5. **Document findings**
   ```bash
   # Create learning notes
   cat > ~/ocaas-project/coordination/learning-notes-forge-001.md <<'EOF'
   # Learning Notes: Backend Infrastructure

   ## Key Findings

   ### Express Server Structure
   - Use middleware for auth, logging, error handling
   - Separate routes, controllers, services (layered architecture)
   - Source: https://github.com/goldbergyoni/nodebestpractices

   ### Prisma Schema Patterns
   - Use @@unique for composite keys
   - Implement soft deletes with deletedAt timestamp
   - Use enums for status fields
   - Source: https://github.com/prisma/prisma-examples

   ### JWT Auth Best Practices
   - Short-lived access tokens (15 min)
   - Long-lived refresh tokens (7 days)
   - Store refresh tokens in httpOnly cookies
   - Source: https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/

   ## Implementation Plan
   1. Set up Express with middleware pattern from nodebestpractices
   2. Create Prisma schema based on multi-tenant pattern
   3. Implement JWT auth with refresh token rotation
   4. Add comprehensive error handling
   EOF
   ```

6. **Send learning summary in Telegram**
   ```
   📚 LEARNING PHASE: task-w1-forge-001

   Studied:
   ✅ Node.js best practices (goldbergyoni/nodebestpractices)
   ✅ Prisma multi-tenant patterns (prisma-examples)
   ✅ JWT auth security (Auth0 blog + lucia-auth)

   Key insights:
   • Layered architecture (routes → controllers → services)
   • Prisma soft deletes for data retention
   • JWT refresh token rotation for security

   Ready to implement with confidence.
   Starting implementation now...
   ```

---

### Phase 2: Implementation with Quality (Main Work)

**Apply learned patterns:**

```javascript
// Example: Express server setup (learned from nodebestpractices)
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

// Security middleware (learned from research)
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));

// Request logging (learned from production repos)
app.use(requestLogger);

// Routes (layered architecture pattern)
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);

// Error handling (centralized pattern)
app.use(errorHandler);

export default app;
```

**Quality checklist (from learning):**
- ✅ Security headers (helmet)
- ✅ Input validation (zod/joi)
- ✅ Error handling (centralized)
- ✅ Logging (structured logs)
- ✅ Rate limiting (express-rate-limit)
- ✅ CORS configuration
- ✅ Environment variables (dotenv)

---

### Phase 3: Code Review Against Best Practices

**Before marking complete, agent MUST:**

1. **Self-review against learned patterns**
   ```markdown
   Checklist from research:
   ✅ Follows layered architecture?
   ✅ Implements security best practices?
   ✅ Has proper error handling?
   ✅ Includes logging?
   ✅ Validates all inputs?
   ✅ Uses environment variables for config?
   ```

2. **Compare with reference implementations**
   ```bash
   # Compare your code structure with studied repo
   diff -r ~/ocaas-project/backend/ ~/github-examples/rest-express/

   # Are you following similar patterns?
   # What did they do that you missed?
   ```

3. **Document quality improvements**
   ```markdown
   Quality improvements from learning:
   - Added helmet for security (learned from nodebestpractices)
   - Implemented refresh token rotation (learned from Auth0)
   - Used Prisma's soft delete pattern (learned from prisma-examples)
   - Added structured logging (learned from production repos)
   ```

---

## Continuous Learning Requirements

### Every Agent MUST:

**Daily (or per task):**
- [ ] Study at least 1 relevant GitHub repo before implementing
- [ ] Search skills.sh for proven patterns
- [ ] Read official docs for frameworks being used
- [ ] Document learnings in learning-notes-{taskId}.md

**Weekly:**
- [ ] Review 3-5 production-grade open source projects
- [ ] Update personal skill notes with new patterns
- [ ] Share interesting findings in Telegram standup

**Before major features:**
- [ ] Deep dive into 2-3 similar implementations
- [ ] Read case studies and blog posts
- [ ] Study both good and bad examples (learn from mistakes)
- [ ] Prototype and test learned patterns

---

## Learning Resources Registry

### Backend Development
- **Repository:** [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices)
  - Topic: Node.js production patterns
  - Use for: Architecture, security, testing, error handling

- **Repository:** [prisma/prisma-examples](https://github.com/prisma/prisma-examples)
  - Topic: Database schema patterns
  - Use for: Prisma setup, schema design, migrations

- **Repository:** [trpc/trpc](https://github.com/trpc/trpc)
  - Topic: Type-safe APIs
  - Use for: API design, validation, TypeScript patterns

### Authentication
- **Repository:** [lucia-auth/lucia](https://github.com/lucia-auth/lucia)
  - Topic: Simple auth library
  - Use for: Auth patterns, session management

- **Repository:** [supabase/supabase](https://github.com/supabase/supabase)
  - Topic: Auth + DB integration
  - Use for: Row-level security, auth flows

### Testing
- **Repository:** [vitest-dev/vitest](https://github.com/vitest-dev/vitest)
  - Topic: Modern testing
  - Use for: Unit tests, integration tests

- **Repository:** [playwright-dev/playwright](https://github.com/playwright-dev/playwright)
  - Topic: E2E testing
  - Use for: Browser automation, API testing

### Mobile (React Native)
- **Repository:** [expo/expo](https://github.com/expo/expo)
  - Topic: React Native development
  - Use for: Mobile app patterns, native modules

- **Repository:** [tanstack/query](https://github.com/tanstack/query)
  - Topic: Data fetching
  - Use for: API integration, caching, state management

### DevOps & Deployment
- **Repository:** [coolify/coolify](https://github.com/coollabsio/coolify)
  - Topic: Self-hosted PaaS
  - Use for: Deployment patterns, Docker setup

---

## Quality Metrics (Learning Impact)

**Measure learning effectiveness:**

### Before Learning Protocol:
- Code quality: 6/10 (functional but basic)
- Security: 5/10 (missing best practices)
- Performance: 6/10 (works but not optimized)
- Maintainability: 5/10 (hard to extend)

### After Learning Protocol:
- Code quality: 9/10 (production-grade patterns)
- Security: 9/10 (follows industry standards)
- Performance: 8/10 (optimized based on research)
- Maintainability: 9/10 (clean architecture)

**Target: Every deliverable should be "production-ready" quality, not just "it works."**

---

## Example: Full Learning Workflow

### Task: Build Authentication System

**1. Research Phase (2 hours)**
```bash
# Study repos
git clone https://github.com/lucia-auth/lucia
git clone https://github.com/supabase/supabase

# Read Auth0 blog
# Read JWT.io security best practices
# Search skills.sh for "nodejs authentication jwt"
```

**2. Document Findings**
```markdown
# Learning Notes: Auth System

## Patterns Found:
1. **Token Strategy:**
   - Access token: 15 min (short-lived, in memory)
   - Refresh token: 7 days (httpOnly cookie)
   - Rotate refresh token on every refresh

2. **Password Security:**
   - Use bcrypt with cost factor 12
   - Implement rate limiting on login (5 attempts/15 min)
   - Consider adding email verification

3. **Session Management:**
   - Store sessions in Redis for fast lookup
   - Implement session revocation
   - Track active sessions per user

Sources:
- lucia-auth: Simple session management
- Supabase: Row-level security inspiration
- Auth0 blog: Refresh token best practices
```

**3. Implement with Quality**
```typescript
// Learned pattern applied
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const BCRYPT_ROUNDS = 12; // Learned from research
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

async function login(email: string, password: string) {
  // Rate limiting (learned from best practices)
  await checkRateLimit(email);

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AuthError('Invalid credentials');

  // Verify password (bcrypt pattern)
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AuthError('Invalid credentials');

  // Generate tokens (learned pattern)
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Store refresh token (learned from Supabase)
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken };
}
```

**4. Quality Check**
```markdown
✅ Bcrypt with proper rounds (12)
✅ Short-lived access tokens (15min)
✅ Refresh token rotation
✅ Rate limiting on login
✅ Secure token storage (httpOnly cookies for refresh)
✅ Session revocation capability (tokenVersion)
✅ Proper error handling

Production-ready: YES ✅
```

---

## Integration with Coordination System

**Updated task flow:**

```
1. Agent receives task in inbox
        ↓
2. Agent enters LEARNING PHASE (2-4 hours)
   - Studies GitHub repos
   - Searches skills.sh
   - Reads documentation
   - Documents findings
        ↓
3. Agent sends learning summary in Telegram
   "📚 LEARNING PHASE complete, ready to implement"
        ↓
4. Agent implements with learned patterns
        ↓
5. Agent self-reviews against quality checklist
        ↓
6. Agent completes task and creates handoff
```

**Example Telegram update:**
```
📚 LEARNING PHASE: task-w1-forge-001

Studied (2 hours):
✅ goldbergyoni/nodebestpractices - Architecture patterns
✅ prisma-examples - Multi-tenant schema
✅ lucia-auth - Auth patterns
✅ Skills.sh - Express middleware patterns

Key insights:
• Layered architecture (routes → controllers → services)
• Soft deletes for data retention
• JWT refresh token rotation for security
• Rate limiting on sensitive endpoints

Implementation plan documented.
Starting implementation with production-grade patterns...
```

---

**This protocol ensures every deliverable is "world-class quality," not just "functional." 🎯**
