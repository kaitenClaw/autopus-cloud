# AUTOPUS Design System v4.0
## Based on Official Logo — DeepMind/Notion Minimalist

---

## 🎨 Color Palette (Extracted from Logo)

### Primary Colors
```
Primary:     #2B2D42    /* Dark Navy — Text, Headers, Icons */
Accent:      #F4845F    /* Coral — CTAs, Highlights, Active States */
Background:  #F5F5F0    /* Warm White — Main Background */
Surface:     #FFFFFF    /* Pure White — Cards, Elevated Elements */
Border:      #E8E8E4    /* Light Gray — Dividers, Borders */
```

### Usage Rules
- **60%** Background (#F5F5F0) — Main canvas
- **30%** Surface (#FFFFFF) — Cards, panels
- **10%** Primary (#2B2D42) — Text, icons
- **5%** Accent (#F4845F) — Buttons, active states, highlights

---

## 🔤 Typography

### Font Family
```
Headings:   Montserrat or Inter (Geometric Sans-Serif)
Body:       Inter (Clean, readable)
Code:       JetBrains Mono
```

### Scale
```
H1: 32px / Bold / Letter-spacing: -0.02em / Color: #2B2D42
H2: 24px / SemiBold / Letter-spacing: -0.01em / Color: #2B2D42
H3: 18px / Medium / Color: #2B2D42
Body: 16px / Regular / Line-height: 1.6 / Color: #2B2D42
Caption: 14px / Regular / Color: rgba(43, 45, 66, 0.6)
Label: 12px / Medium / Uppercase / Letter-spacing: 0.05em / Color: rgba(43, 45, 66, 0.5)
```

---

## 🧩 Components

### Cards (Persona Cards)
```css
.persona-card {
  background: #FFFFFF;
  border: 1px solid #E8E8E4;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(43, 45, 66, 0.04);
  transition: all 0.2s ease;
}

.persona-card:hover {
  box-shadow: 0 4px 12px rgba(43, 45, 66, 0.08);
  transform: translateY(-2px);
}
```

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #F4845F;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #E0704A;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #2B2D42;
  border: 1.5px solid #E8E8E4;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
}

.btn-secondary:hover {
  border-color: #2B2D42;
  background: rgba(43, 45, 66, 0.04);
}
```

### Navigation (Bottom Nav — Mobile)
```css
.bottom-nav {
  background: #FFFFFF;
  border-top: 1px solid #E8E8E4;
  box-shadow: 0 -2px 10px rgba(43, 45, 66, 0.04);
}

.nav-item {
  color: rgba(43, 45, 66, 0.5);
}

.nav-item.active {
  color: #F4845F;
}
```

---

## 🎯 Layout Principles

### Spacing Scale
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

### Border Radius
```
Small (buttons, inputs):  8px
Medium (cards):           12px
Large (panels):           16px
XL (modals):              20px
```

### Shadows (Subtle, Not Glassmorphism)
```css
shadow-sm:  0 1px 2px rgba(43, 45, 66, 0.04);
shadow-md:  0 4px 6px rgba(43, 45, 66, 0.04);
shadow-lg:  0 10px 15px rgba(43, 45, 66, 0.06);
```

---

## 🐙 Logo Integration

### Header Logo Display
```css
.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: #2B2D42;
}

.logo-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #2B2D42;
}

.logo-underline {
  width: 24px;
  height: 3px;
  background: #F4845F;
  margin-top: 4px;
}
```

---

## 📱 Responsive Breakpoints

```
Mobile:  0 - 640px
Tablet:  641px - 1024px
Desktop: 1025px+
```

---

## 🌓 Dark Mode (Optional)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1A1A2E;
    --bg-surface: #16213E;
    --text-primary: #F5F5F0;
    --text-secondary: rgba(245, 245, 240, 0.6);
    --border: rgba(245, 245, 240, 0.1);
    --accent: #F4845F;
  }
}
```

---

## ✨ Design Philosophy

1. **Clarity over Decoration** — Remove glassmorphism, use solid colors
2. **Restraint** — Only 2 main colors (Navy + Coral) on white
3. **Generous Whitespace** — Let content breathe
4. **Consistent Radius** — All cards 12-16px, all buttons 12px
5. **Subtle Interactions** — Gentle shadows, slight lift on hover

---

*Based on AUTOPUS Logo by PULSE*
*Design System v4.0 — 2026-02-24*
