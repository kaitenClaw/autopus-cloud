# Autopus Lite Runtime - Coolify Deploy Guide

## 一鍵部署步驟

### 1. 登入 Coolify
- URL: http://108.160.137.70:8000
- 用現有 admin 賬戶登入

### 2. 創建新 Project
- Project Name: `autopus-agents`

### 3. 添加 Service (Git Repository)
```
Repository: https://github.com/kaitenClaw/autopus-cloud
Branch: main
Root Directory: autopus-lite-runtime
```

### 4. 環境變量設置
```env
AGENT_ID=pulse-cloud
AGENT_ROLE=devops
LITELLM_HOST=http://litellm:4000
LITELLM_API_KEY=sk-...
TELEGRAM_TOKEN=8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw
PORT=3000
```

### 5. 端口配置
- Container Port: `3000`
- Exposed Port: `18797`

### 6. 重複步驟 3-5 部署其他 Agents

| Agent | AGENT_ID | AGENT_ROLE | Port |
|-------|----------|------------|------|
| PULSE | pulse-cloud | devops | 18797 |
| FORGE | forge-cloud | builder | 18793 |
| SIGHT | sight-cloud | researcher | 18795 |

---

## 手動 Docker 部署（備用）

```bash
# 在 VPS 上執行
cd /var/www/autopus
git clone https://github.com/kaitenClaw/autopus-cloud.git
cd autopus-cloud/autopus-lite-runtime

# 部署 PULSE
docker run -d \
  --name pulse-lite \
  --restart unless-stopped \
  -p 18797:3000 \
  -e AGENT_ID=pulse-cloud \
  -e AGENT_ROLE=devops \
  -e LITELLM_HOST=http://localhost:4000 \
  -e TELEGRAM_TOKEN=8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw \
  autopus-lite:latest

# Health check
curl http://localhost:18797/health
```
