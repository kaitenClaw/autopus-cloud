# 🎨 AUTOPUS UI/UX 重塑方案 v3.0
## 目標：從「卡通」到「專業級 AI 平台」

---

## 🎯 核心洞察

**問題**：現有 UI 過於卡通化 (cartoon)，不符 OpenAI/Anthropic 等頂級 AI 平台的專業形象

**解決方案**：
1. 轉向 **Light Mode 為主** 設計（更具親和力）
2. 採用 **極簡主義 (Minimalist)** 美學
3. 建立專業術語系統（取代「數字夥伴」）
4. 移除 Fion（獨立 client 不應出現在 Autopus Cloud）

---

## 🏷️ 新術語系統（取代「數字夥伴」）

| ❌ 舊術語 | ✅ 新術語 | 語境 |
|---------|---------|------|
| 數字夥伴 / Digital Companion | **AI Persona** | 用戶擁有嘅 AI 身份 |
| 收養 Agent | **Activate** / **Deploy** | 啟動 AI |
| Agent 展示廳 | **Persona Hub** | AI 管理界面 |
| 你的策略大腦 | **Core Intelligence** | KAITEN 描述 |
| 你的建造者 | **Build Engine** | FORGE 描述 |
| DNA | **Persona Core** | 核心設定頁面 |
| 數字生命體 | **Intelligent Agent** | 通用描述 |

---

## 🎨 新設計系統：「Lumina」

### 色彩方案

**主色調** (Light Mode 優先):
```
Primary:    #0A0A0A    (Near Black - 文字)
Secondary:  #666666    (Medium Gray - 次要文字)
Tertiary:   #E5E5E5    (Light Gray - 分隔線)

Background: #FFFFFF    (Pure White)
Surface:    #F5F5F5    (Off White - Cards)
Elevated:   #FFFFFF    (White - 彈出層)

Accent:     #0066FF    (Electric Blue - CTA)
Accent Hover:#0052CC   (Darker Blue)

Success:    #00C853    (Green)
Warning:    #FFB300    (Amber)
Error:      #FF3D00    (Red)
```

**Dark Mode 備選**:
```
Background: #0A0A0A
Surface:    #141414
Elevated:   #1A1A1A
Text:       #FFFFFF
```

### 字體系統

```
Headings:   Inter (or SF Pro Display)
Body:       Inter (or SF Pro Text)
Code:       JetBrains Mono

Scale:
- H1: 32px / Bold / -0.02em
- H2: 24px / Semibold / -0.01em
- H3: 18px / Medium
- Body: 16px / Regular / 1.5
- Caption: 14px / Regular / 1.4
- Label: 12px / Medium / Uppercase
```

### 組件風格

**Cards**:
- Background: #F5F5F5 (Light) / #141414 (Dark)
- Border: 1px solid #E5E5E5
- Border Radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.08)
- Hover: translateY(-2px) + shadow 加深

**Buttons**:
- Primary: #0066FF background, white text
- Secondary: Transparent, #0066FF border
- Ghost: Transparent, gray text

- Border Radius: 8px
- Height: 44px (touch-friendly)
- Font: 14px Medium

**Inputs**:
- Background: #FFFFFF
- Border: 1px solid #E5E5E5
- Border Radius: 8px
- Focus: #0066FF border

---

## 📱 佈局重設計

### 主頁結構

```
┌─────────────────────────────────────────────────────┐
│  🐙 AUTOPUS                                    👤  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Welcome back, Alton                                │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │ 3 Active    │  │ 12 Tasks    │  │ System     │  │
│  │ Personas    │  │ Completed   │  │ Healthy    │  │
│  └─────────────┘  └─────────────┘  └────────────┘  │
│                                                     │
│  Your Personas                                      │
│  ┌─────────────────────────────────────────────────┐│
│  │ 🧠 KAITEN         │ Status: Active             ││
│  │ Core Intelligence │ Tasks: 5 pending           ││
│  │                   │ Last active: 2m ago        ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │ ⚡ PULSE          │ Status: Active             ││
│  │ Operations        │ Monitoring: 3 systems      ││
│  │                   │ Last active: Now           ││
│  └─────────────────────────────────────────────────┘│
│                                                     │
│              [ + Activate New Persona ]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 底部導航 (Mobile)

```
├─────────────────────────────────────────────────────┤
│  🏠        💬        ⚙️         🛒        👤       │
│  Hub      Chat    Personas   Skills     Profile    │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 技術實現任務

### 立即執行 (P0)

1. **移除 Fion 引用**
   - `App.tsx`: 移除 fion mock data
   - `utils/agents.ts`: 移除 fion from AGENT_PORTS/COLORS/ICONS/SOULS
   - 確保所有 component 唔會渲染 fion

2. **術語更新**
   - 「我的數字夥伴」→ 「Persona Hub」
   - 「收養 Agent」→ 「Activate Persona」
   - 「Agent 展示廳」→ 「Your Personas」
   - 「DNA」→ 「Core」

3. **CSS 變量更新**
   - 建立 light/dark mode CSS variables
   - 更新 Tailwind config

### 短期 (P1)

4. **組件重構**
   - LifeAgentCard → PersonaCard (新設計)
   - AgentDNA → PersonaCore (新設計)
   - Navigation → 新 tab 結構

5. **動畫精簡**
   - 移除「呼吸燈」等卡通效果
   - 改為 subtle hover states
   - 使用 CSS transitions 而非 framer-motion 複雜動畫

---

## 📝 檔案清單

| 檔案 | 任務 |
|------|------|
| `App.tsx` | 移除 Fion, 更新術語, 簡化佈局 |
| `utils/agents.ts` | 移除 Fion 配置 |
| `components/LifeAgentCard.tsx` | 重構為 PersonaCard |
| `components/AgentDNA.tsx` | 重構為 PersonaCore |
| `components/Navigation.tsx` | 更新 tab labels |
| `index.css` | 更新 CSS 變數 |
| `tailwind.config.js` | 更新色彩配置 |

---

## 🎯 成功指標

- ✅ 無 Fion 引用
- ✅ 使用新術語系統
- ✅ Light mode 為預設
- ✅ 專業極簡風格
- ✅ 與 OpenAI/Anthropic 設計語言一致

---

*設計系統: Lumina v3.0*
*創建: KAITEN @ 2026-02-24*
*目標: 全球市場專業形象*
