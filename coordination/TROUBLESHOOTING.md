# OCaaS Troubleshooting Guide & Agent Handling Triggers

This document outlines known error states and their specific handling triggers for autonomous agents (System Log Analysis, Self-Healing, etc.).

## 1. Gateway Zombie Process (Restart Loop)

**Trigger Pattern (Logs):**
- `Gateway failed to start: gateway already running (pid <PID>)`
- `lock timeout after 5000ms`
- `Port 18789 is already in use`

**Diagnosis:**
The gateway process from a previous session did not exit cleanly and is holding the port/lock, preventing new instances from starting.

**Handling Procedure:**
1.  **Identify PID**: Extract `<PID>` from the error message.
2.  **Verify**: Run `ps -p <PID>` to confirm it is an `openclaw-gateway` process.
3.  **Terminate**: Execute `kill -9 <PID>` to force-kill the zombie process.
4.  **Restart**: Run `openclaw gateway restart`.

---

## 2. API Quota Exhaustion (429 Errors)

**Trigger Pattern (Logs):**
- `429 Quota Exhaustion`
- `Resource has been exhausted (e.g. check quota)`

**Diagnosis:**
The configured `primary` model (usually a free-tier or preview model like `gemini-3-flash`) has hit its rate limit.

**Handling Procedure:**
1.  **Switch Model**: Edit `~/.openclaw/openclaw.json`.
2.  **Action**: Change `agents.defaults.model.primary` to a known backup (e.g., `google/gemini-2.0-flash`).
3.  **Reload**: The gateway auto-reloads config; verify logs for `config change applied`.
4.  **Wait**: Schedule a revert to the preferred model after 1 hour (standard quota reset time).

---

## 3. Location Not Supported (Geo-Blocking / IPv6 Leak)

**Trigger Pattern (Logs):**
- `400 FAILED_PRECONDITION`
- `User location is not supported`
- `[gateway] agent model: ...` followed immediately by failure.

**Diagnosis:**
The user is in a restricted region (e.g., HK/CN). While a VPN is active, **IPv6 traffic** is bypassing the VPN tunnel, revealing the true location to Google/OpenAI.

**Handling Procedure:**
1.  **Check Config**: Ensure `gateway.bind` was NOT set to `127.0.0.1` (as this causes validation errors).
2.  **User Notification**: Request the user to **DISABLE IPv6** on their network adapter.
    *   *Path*: System Settings -> Network -> Wi-Fi/Ethernet -> Details -> TCP/IP -> Configure IPv6: **Link-local only** or **Off**.
3.  **Verify**: Retry the request.

---

## 4. Invalid or Deprecated Models (Codex)

**Trigger Pattern (Logs):**
- `Error: Unknown model: <model-name>`
- `The '<model-name>' model is not supported`

**Diagnosis:**
The user's `openclaw.json` references a model/alias that no longer exists or has hit End-of-Life (e.g., `gpt-5.3-codex-spark`).

**Handling Procedure:**
1.  **Identify**: Note the specific invalid model name from logs.
2.  **Update Config**: Edit `~/.openclaw/openclaw.json`.
3.  **Action**: Remove the invalid entry or map it to a valid model (e.g., `gpt-5.2-codex`).
4.  **Reference**: Check User's UI/Screenshot for currently valid model IDs.
