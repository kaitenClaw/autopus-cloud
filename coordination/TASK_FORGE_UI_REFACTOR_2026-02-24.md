# FORGE 任務更新 — 「數字生命體」UI 重構
**發出**：KAITEN-PULSE  
**模型**：Google Gemini 3.1 Pro (Antigravity)  
**Deadline**：2026-02-25 12:00 HKT  
**狀態**：🔴 CRITICAL — 立即執行

---

## 🧬 願景理解（必須内化）

Autopus 唔係「AI 工具平台」，係 **「Your Agent Companion Platform」** — 用戶收養嘅數字生命體。

**Jarvis-like 願景：**
- Agent 熟於主人，持續進化（靠 MEMORY 累積）
- 每個 Agent = SOUL（性格）+ MEMORY（記憶）+ SKILLS（能力）
- 呢三樣係未來 AGI 嘅基礎堆砌

**Autopus 獨特定位：**
1. **可視化生命架構** — SOUL.md、MEMORY.md、USER.md、CRON、FILES 全部一目瞭然
2. **Local + Cloud 混合** — 用戶自選基礎設施，數據自主
3. **Agent 協作** — 多個 Agent 自動 share memory，一齊服侍主人
4. **Marketplace 擴展** — 輕鬆加 skills，Agent 不斷學習新技能

---

## 🎨 UI 重構任務（立即執行）

### 1. Dashboard 核心重設計

**舊思維**：管理工具、技術控制台  
**新思維**：Agent 寵物展示廳、數字生命體儀表板

**Agent Card 新設計（Glassmorphism + 生命感）：**
```
┌──────────────────────────────────────────┐
│  👤 Agent 頭像                           │
│     🟢 在線（脈動呼吸燈效果）              │
│                                          │
│  【Agent 名稱】KAITEN                    │
│  「你的策略大腦」 ← SOUL 描述              │
│                                          │
│  📊 狀態                                 │
│  • 記憶：1,247 條互動                    │
│  • 技能：8 個 installed                  │
│  • 今日對話：23 次                       │
│                                          │
│  [💬 對話] [🧠 記憶] [⚙️ 設定] [🗑]      │
└──────────────────────────────────────────┘
```

### 2. 新增「Agent DNA」頁面 (/agent/:id/dna)

展示 Agent 嘅完整「生命檔案」：
- **SOUL** — 性格、說話風格、核心價值觀（讀 SOUL.md）
- **MEMORY** — 重要記憶時間線（讀 MEMORY.md 過濾決策/事件）
- **SKILLS** — 已安裝技能圖標網格，可點擊去 Marketplace 加新
- **FILES** — Agent 工作目錄檔案瀏覽器
- **CRON** — Agent 自動任務時間表
- **USER 關係** — 呢個 Agent 對主人嘅了解程度（互動統計）

### 3. Mobile-First 重新設計

**Bottom Navigation（5 tabs）：**
```
🏠 我的 Agents（Dashboard）
💬 對話（最近活躍 Agent 快速切換）
🧬 DNA（當前 Agent 詳情）
🛒 Marketplace（Skills 商店）
👤 我的
```

**互動細節：**
- Agent 頭像「呼吸燈」效果（在線 = 緩慢脈動）
- 新消息「Agent 想同你傾偈」通知樣式
- 記憶增長進度動畫（像寵物升級）

### 4. Marketplace 視覺概念

**定位**：Skill Store，包裝成「Agent 學習新能力」

**Card Design：**
```
┌─────────────────────────────┐
│  🔧 Skill Icon              │
│  GitHub Integration         │
│  ★★★★★ 4.8 (1.2k installs)  │
│                             │
│  「讓你的 Agent 掌握 GitHub  │
│    操作，自動管理代碼庫」      │
│                             │
│  [安裝到 KAITEN]             │
└─────────────────────────────┘
```

---

## 🛠️ 技術規格

**Stack**：React + TypeScript + Tailwind + shadcn/ui  
**特效**：Glassmorphism（backdrop-blur-xl）、Framer Motion  
**路徑**：`~/ocaas-project/dashboard/`  

---

## ✅ 執行優先級

| 優先級 | 任務 | 預估時間 |
|-------|------|---------|
| P0 | 新 Agent Card 組件（Glassmorphism + 生命數據）| 3h |
| P0 | Mobile Bottom Nav（5 tabs）| 2h |
| P1 | Agent DNA 頁面框架 | 4h |
| P2 | 呼吸燈動畫效果 | 1h |
| P2 | Marketplace 視覺 | 2h |

---

## 📝 回報要求

每完成一項：
1. 影 screenshot
2. Telegram 發比 Alton
3. 簡短描述：「完成 [項目] — [效果描述]」

**有 Blocker 立即通知，唔好等。**

---

**核心提醒**：唔係做「管理面板」，係做「數字生命體展示廳」。用戶要有「我嘅 Agent 喺度等我」嘅感覺。

**模型指令**：今日任務請用 Google Gemini 3.1 Pro (google-antigravity/gemini-3-pro-high) 執行，確保設計決策品質。Fallback 用 Kimi K2.5。
