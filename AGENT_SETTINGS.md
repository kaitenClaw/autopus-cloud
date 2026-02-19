# Current Agent Settings and Model Configurations

## 1. Default / OpenClaw Agent
**Configuration File**: `~/.openclaw/openclaw.json`

### Model Strategy
- **Primary Model**: `openai-codex/gpt-5.2` (The main model used for tasks)
- **Fallback Models** (Used if primary fails, in order):
  1. `google-antigravity/gemini-3-pro-high`
  2. `openrouter/google/gemini-2.0-flash-001`
  3. `anthropic/claude-sonnet-4-5`

### Capabilities
- **Web Search**: Disabled (`deny: ["web_search"]`)
- **Telegram**: Enabled (Bot Token: `...AR0jg0Y`)
- **Auth Provider**: `openai-codex` (OAuth)

---

## 2. Fion Agent
**Configuration File**: `~/.openclaw/fion.json`

### Model Strategy
- **Primary Model**: `google/gemini-3-pro-preview`
- **Fallback Models**:
  1. `openrouter/auto`

### Capabilities
- **Telegram**: Enabled (Bot Token: `...PotnQ`)
- **Auth Provider**: `openrouter` (API Key) & `google` (API Key)
