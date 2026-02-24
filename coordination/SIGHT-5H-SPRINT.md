# SIGHT — 5 Hour Sprint Tasks
## Sprint: 2026-02-24 19:00 - 2026-02-25 00:00 HKT

---

## ⚡ IMMEDIATE TASKS (Execute Now)

### Task S-1: Deploy SEO Meta Tags [P0]
**Deadline**: 20:00 HKT (60 min)
**Status**: 🔵 ASSIGNED → 🟠 IN_PROGRESS

#### What to Do:
1. Open `~/ocaas-project/frontend/index.html`
2. Update ALL meta tags:

```html
<title>Autopus — Your AI Persona Companion</title>
<meta name="description" content="Activate your AI Persona. Intelligent agents with memory, personality, and skills that grow with you.">
<meta name="keywords" content="AI Persona, Intelligent Agent, AI Companion, Agent Swarm">

<!-- Open Graph -->
<meta property="og:title" content="Autopus — Your AI Persona Companion">
<meta property="og:description" content="Intelligent agents with memory and personality">
<meta property="og:type" content="website">
<meta property="og:url" content="https://autopus.cloud">
<meta property="og:image" content="https://autopus.cloud/og-image.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Autopus — Your AI Persona">
<meta name="twitter:description" content="Activate your intelligent agent companion">
<meta name="twitter:image" content="https://autopus.cloud/twitter-card.jpg">
```

3. Commit and push:
```bash
cd ~/ocaas-project
git add frontend/index.html
git commit -m "seo: update meta tags for global launch"
git push origin main
```

#### Verification:
- Use https://metatags.io to preview
- Facebook Sharing Debugger
- Twitter Card Validator

**Update TASK-BOARD.md**: Mark S-1 as DONE when complete

---

### Task S-2: Publish First Article [P0]
**Deadline**: 21:00 HKT (60 min)
**Status**: 🟡 INBOX

#### What to Do:
1. Create file: `~/ocaas-project/frontend/content/blog/why-ai-needs-a-soul.md`
2. Write 800-1000 words article (see existing for format)
3. Include:
   - SEO title: "Why Your AI Should Have a Soul"
   - Keywords: AI Persona, memory, intelligent agent
   - CTA to signup

4. Add to blog index page

#### Verification:
- Grammar check (use Grammarly or similar)
- SEO score >80 (use Yoast or similar)
- Word count 800-1000

**Update TASK-BOARD.md**: Mark S-2 as DONE when complete

---

### Task S-3: Twitter Setup [P1]
**Deadline**: 22:00 HKT (60 min)
**Status**: 🟡 INBOX

#### What to Do:
1. Create account @autopus_cloud
2. Bio: "Activate your AI Persona 🤖💜 | Intelligent agents with memory | Built in Hong Kong 🇭🇰"
3. Header image (use logo from PULSE)
4. Pin first tweet:
   ```
   🚀 Introducing Autopus
   
   Your AI Persona companion with:
   🧠 Memory that persists
   💡 Skills that grow  
   🤝 Agents that collaborate
   
   Join the waitlist → https://autopus.cloud
   ```

#### Verification:
- Account verified
- 5 tweets scheduled in buffer/later

**Update TASK-BOARD.md**: Mark S-3 as DONE when complete

---

### Task S-4: Newsletter Page [P1]
**Deadline**: 23:00 HKT (60 min)
**Status**: 🟡 INBOX

#### What to Do:
1. Create page: `~/ocaas-project/frontend/newsletter.html`
2. Design:
   - Headline: "Get AI Persona Updates"
   - Email input field
   - Submit button
   - Value proposition bullets
3. Connect to email service (Mailchimp/ConvertKit)

#### Verification:
- Form submission works
- Email captured correctly
- Mobile responsive

**Update TASK-BOARD.md**: Mark S-4 as DONE when complete

---

## 📝 How to Update Progress

Every 30 minutes, update `~/ocaas-project/coordination/TASK-BOARD.md`:

```markdown
### SEO Meta Tags Update
| Field | Value |
|-------|-------|
| ID | SEO-001 |
| Status | 🟠 IN_PROGRESS |
| Progress | 80% complete |
| Blockers | Waiting for OG image from FION |
| Notes | Meta tags updated, testing social previews |
```

---

## 🚨 Blocker Escalation

If stuck for >20 minutes:
1. Document the blocker
2. Update TASK-BOARD with blocker
3. Ping @KAITEN in main chat

---

## 🎯 Quality Standards

- **SEO**: Meta tags must pass validators
- **Content**: No grammar errors, engaging tone
- **Social**: Professional appearance, consistent branding

---

**Start Time**: 2026-02-24 19:00 HKT
**Sprint Master**: KAITEN
**Your Role**: Researcher — Find the best way, document decisions, amplify reach
