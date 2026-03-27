# RecoverAI — Design System
**Hackathon:** Nakshatra | APSIT | HC-01
**Owner:** Bishnupriya (Frontend Dev) | Reviewed by: Siddhesh
**Version:** 1.0

---

## Design Philosophy — "Bedside Manner"

RecoverAI has two faces serving two completely different emotional states.

**The Patient face** speaks to someone who is scared, in pain, and possibly elderly. It says: *"You are being taken care of. You don't need to understand medicine — just talk to us."* Warm. Large. Reassuring. Never clinical.

**The Nurse face** speaks to someone managing 20 patients between rounds. It says: *"Here's who needs you right now. One glance. No wasted time."* Scannable. Dense. Color-driven. Zero ambiguity.

Same product. Same color tokens. Two completely different personalities layered on top. The design system makes both work.

**The one thing someone remembers:** The StatusOrb on the patient home screen — a softly pulsing, breathing circle that the patient reads in half a second. Green means rest. Red means act. No reading required.

---

## Color Tokens

> All colors as CSS variables in `src/index.css`. Tailwind config maps to these.

```css
:root {
  /* ── Brand ──────────────────────────────────────────────── */
  --color-brand-primary:     #2D9B8A;   /* Warm teal — trust + health */
  --color-brand-secondary:   #1A7A6B;   /* Deeper teal — hover states */
  --color-brand-accent:      #F4845F;   /* Warm coral — CTAs, milestones */
  --color-brand-accent-soft: #FDE8E0;   /* Coral tint — milestone card bg */

  /* ── Patient surfaces (warm, never pure white) ──────────── */
  --color-surface-base:      #FAFAF8;   /* Warm off-white — page bg */
  --color-surface-card:      #FFFFFF;   /* Card surface */
  --color-surface-muted:     #F4F3F0;   /* Input bg, dividers */
  --color-surface-warm:      #FEF9F5;   /* Milestone + plan card bg */

  /* ── Nurse surfaces (crisper, higher contrast) ─────────── */
  --color-nurse-bg:          #F7F8FA;   /* Slightly cooler base */
  --color-nurse-card:        #FFFFFF;
  --color-nurse-border:      #E4E6EA;   /* Stronger border than patient */
  --color-nurse-header:      #1C2333;   /* Dark header bar */

  /* ── Risk system (4 levels — non-negotiable) ────────────── */
  --color-risk-low:          #22C55E;   /* Green */
  --color-risk-low-soft:     #DCFCE7;
  --color-risk-low-text:     #15803D;

  --color-risk-moderate:     #F59E0B;   /* Amber */
  --color-risk-moderate-soft:#FEF3C7;
  --color-risk-moderate-text:#B45309;

  --color-risk-high:         #EF4444;   /* Red */
  --color-risk-high-soft:    #FEE2E2;
  --color-risk-high-text:    #B91C1C;

  --color-risk-critical:     #7C3AED;   /* Purple — more alarming than red */
  --color-risk-critical-soft:#EDE9FE;
  --color-risk-critical-text:#5B21B6;

  /* ── Text ───────────────────────────────────────────────── */
  --color-text-primary:      #1A1A1A;
  --color-text-secondary:    #6B7280;
  --color-text-muted:        #9CA3AF;
  --color-text-inverse:      #FFFFFF;

  /* ── Medication adherence heatmap ───────────────────────── */
  --color-adhered:           #22C55E;
  --color-missed:            #EF4444;
  --color-missed-critical:   #7C3AED;   /* Critical med missed */
  --color-pending:           #E5E7EB;   /* Today, not yet confirmed */

  /* ── Trend arrows ───────────────────────────────────────── */
  --color-trend-up:          #EF4444;   /* Pain going up = bad */
  --color-trend-down:        #22C55E;   /* Pain going down = good */
  --color-trend-flat:        #9CA3AF;
}
```

**Tailwind config extension:**
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        primary:   'var(--color-brand-primary)',
        secondary: 'var(--color-brand-secondary)',
        accent:    'var(--color-brand-accent)',
        'accent-soft': 'var(--color-brand-accent-soft)',
      },
      surface: {
        base:  'var(--color-surface-base)',
        card:  'var(--color-surface-card)',
        muted: 'var(--color-surface-muted)',
        warm:  'var(--color-surface-warm)',
      },
      risk: {
        low:      'var(--color-risk-low)',
        'low-soft': 'var(--color-risk-low-soft)',
        moderate: 'var(--color-risk-moderate)',
        high:     'var(--color-risk-high)',
        critical: 'var(--color-risk-critical)',
      },
    },
  }
}
```

---

## Typography

**The dual-font system:**

| Role | Font | Where |
|------|------|--------|
| Patient display / headings | **Fraunces** (serif, warm) | Patient home hero text, milestone cards, "Good morning" |
| UI labels / body | **Plus Jakarta Sans** | All UI text, buttons, cards, descriptions |
| Clinical numbers / data | **IBM Plex Mono** | Risk scores, recovery day numbers, adherence %, timestamps |
| Nurse dashboard labels | **Plus Jakarta Sans Medium** | Table headers, status badges |

**Why Fraunces for patient headings:** It's a humanist serif — warm, slightly literary, not sterile. When "Good morning, Ramesh" is set in Fraunces, it reads like a letter from a friend. When "Day 4 of 14" is in IBM Plex Mono next to it, the contrast tells you: the words are human, the data is precise.

**Import (in `index.html`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**CSS base:**
```css
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: var(--color-surface-base);
  color: var(--color-text-primary);
}

.font-display { font-family: 'Fraunces', serif; }
.font-mono    { font-family: 'IBM Plex Mono', monospace; }
```

**Type scale:**
```
Patient greeting:   Fraunces 28px / font-semibold / text-gray-900
Section heading:    Plus Jakarta Sans 18px / font-semibold
Card label:         Plus Jakarta Sans 12px / font-medium / uppercase / tracking-wide / text-muted
Body text:          Plus Jakarta Sans 14px / font-normal
Recovery day:       IBM Plex Mono 32px / font-medium (the number)
Risk score:         IBM Plex Mono 24px / font-medium
Timestamp:          IBM Plex Mono 11px / font-normal / text-muted
```

---

## Motion & Animation

**Patient side — breathing, living, never jarring:**

```css
/* StatusOrb pulse — the heartbeat of the app */
@keyframes orb-pulse-stable {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50%       { box-shadow: 0 0 0 16px rgba(34, 197, 94, 0); }
}

@keyframes orb-pulse-monitor {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  50%       { box-shadow: 0 0 0 16px rgba(245, 158, 11, 0); }
}

@keyframes orb-pulse-high {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  40%       { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
}
/* High risk pulses faster: animation-duration: 1.2s vs 2.4s for stable */

/* Mic recording pulse ring */
@keyframes mic-ring {
  0%   { transform: scale(1);   opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* Result card slide up */
@keyframes slide-up {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* Milestone card bounce in */
@keyframes milestone-in {
  0%   { transform: scale(0.92); opacity: 0; }
  60%  { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); }
}

/* Transcript text stream */
@keyframes text-appear {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Processing step fade */
@keyframes step-fade {
  0%   { opacity: 0.3; }
  50%  { opacity: 1; }
  100% { opacity: 0.3; }
}
```

**Tailwind animation extensions:**
```js
keyframes: {
  'orb-stable':    { '0%,100%': { boxShadow: '0 0 0 0 rgba(34,197,94,0.4)' }, '50%': { boxShadow: '0 0 0 16px rgba(34,197,94,0)' }},
  'orb-high':      { '0%,100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.5)' }, '40%': { boxShadow: '0 0 0 20px rgba(239,68,68,0)' }},
  'slide-up':      { from: { transform: 'translateY(24px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' }},
  'milestone-in':  { '0%': { transform: 'scale(0.92)', opacity: '0' }, '60%': { transform: 'scale(1.02)', opacity: '1' }, '100%': { transform: 'scale(1)' }},
},
animation: {
  'orb-stable':   'orb-stable 2.4s ease-in-out infinite',
  'orb-monitor':  'orb-stable 1.8s ease-in-out infinite',
  'orb-high':     'orb-high 1.2s ease-in-out infinite',
  'slide-up':     'slide-up 0.35s ease-out forwards',
  'milestone-in': 'milestone-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
},
```

**Nurse side — no animation except one:**
On the triage table, when a new HIGH/CRITICAL patient row appears → single `slide-up` entrance. Everything else is static. Nurses need stability, not motion.

---

## Component Specifications

### StatusOrb
The visual centerpiece of the patient home screen. A filled circle, 96×96px, center-aligned, with a breathing pulse ring behind it.

```jsx
// Size: w-24 h-24 (96px)
// Inner: solid colored circle
// Behind: pulse ring (::after or animated div)
// Label: risk text below, Plus Jakarta Sans 14px font-semibold uppercase tracking-widest

const orbConfig = {
  LOW:      { bg: 'bg-risk-low',      pulse: 'animate-orb-stable',  label: 'STABLE',    textColor: 'text-risk-low' },
  MODERATE: { bg: 'bg-risk-moderate', pulse: 'animate-orb-monitor', label: 'MONITOR',   textColor: 'text-risk-moderate' },
  HIGH:     { bg: 'bg-risk-high',     pulse: 'animate-orb-high',    label: 'HIGH RISK', textColor: 'text-risk-high' },
  CRITICAL: { bg: 'bg-risk-critical', pulse: 'animate-orb-high',    label: 'CRITICAL',  textColor: 'text-risk-critical' },
}
```

---

### RecoveryDayBadge
A circular progress ring (SVG) showing days completed / total days.

```
Ring: stroke = brand.primary (completed) / surface.muted (remaining)
Center: IBM Plex Mono — large day number / small "of 14" below
Size: 80×80px (patient home), 40×40px (nurse table)
stroke-width: 6px
```

---

### RiskBadge (Nurse Dashboard)
```
Shape: pill — rounded-full px-3 py-1
Font: IBM Plex Mono 11px font-medium uppercase
Background: risk-X-soft color
Text: risk-X-text color
Border: 1px solid risk-X color at 30% opacity

LOW:      bg-risk-low-soft      text-risk-low-text
MODERATE: bg-risk-moderate-soft text-risk-moderate-text
HIGH:     bg-risk-high-soft     text-risk-high-text
CRITICAL: bg-risk-critical-soft text-risk-critical-text
```

**Critical rule:** CRITICAL badge adds a subtle left border: `border-l-4 border-risk-critical`. This makes it visually heavier than HIGH without screaming.

---

### RiskResultCard
Post check-in. Slides up from bottom. 

```
Container: bg-white rounded-2xl shadow-lg border border-gray-100
            animate-slide-up

Top section: risk level color band
  - Full-width colored strip (risk-X-soft bg)
  - Risk level text: Fraunces 24px centered
  - Risk icon: Lucide ShieldCheck (low) / ShieldAlert (moderate/high) / Siren (critical)

Body:
  - plain_language_summary: Plus Jakarta Sans 15px text-gray-700 leading-relaxed
  - hospital_directive card (stay_home → soft green; go_today → amber; call_emergency → red with border)
  - Wound status one-liner (if present)
  - Separator
  - WhatsApp status: small teal chip "✓ Caregiver notified"
  - Tomorrow's plan preview: collapsible, coral accent
```

---

### TrajectoryChart
Recharts `LineChart` with two Y-axes and a reference area.

```js
// Pain line: stroke="#EF4444" strokeWidth=2
// Expected pain: stroke="#EF4444" strokeDasharray="4 4" strokeOpacity=0.4
// Mobility line: stroke="#2D9B8A" strokeWidth=2
// Expected mobility: stroke="#2D9B8A" strokeDasharray="4 4" strokeOpacity=0.4

// Today's dot: larger dot (r=6) with white center — highlighted
// ReferenceArea for fever_risk_days: fill="#FEF3C7" fillOpacity=0.4

// No grid lines on patient home (compact view)
// Subtle grid lines on nurse detail panel (full view)

// Tooltip: rounded-xl bg-white shadow-md border-0 p-3
//   Shows: Day N | Pain: X/10 | Expected: Y/10
```

---

### AdherenceHeatmap
7-column grid (one week per row). Each cell = one day.

```
Cell size: 28×28px with 4px gap
Shape: rounded-md
Colors:
  Taken:    bg-adhered (green)
  Missed:   bg-missed (red)
  Critical missed: bg-missed-critical (purple) — draws the eye
  Pending (today): bg-pending (light gray) with subtle border
  Future:   bg-transparent border border-dashed border-gray-200

Label row: medication name left, adherence % right (IBM Plex Mono 11px)
One row per medication.
```

---

### MilestoneCard
Slides in via `animate-milestone-in`. Only appears when triggered.

```
Container: bg-surface-warm border border-brand-accent/20 rounded-2xl p-4
            shadow-sm

Left: coral accent bar (4px wide, full height, rounded)
Icon: Star or CheckCircle2 (Lucide) in brand-accent color
Title: Plus Jakarta Sans 14px font-semibold
Description: Plus Jakarta Sans 13px text-gray-600

Dismiss: small × button top-right, fades card out
```

---

### AdaptivePlanCard
```
Container: bg-surface-warm rounded-2xl p-4 border border-gray-100
Header: "Today's Recovery Plan" — Plus Jakarta Sans 13px font-semibold
        text-muted uppercase tracking-wide
Title: Plan title — Plus Jakarta Sans 15px font-semibold text-gray-900
Instructions: numbered list, 14px, leading-relaxed, text-gray-700
  Each numbered marker: small circle bg-brand-primary/10 text-brand-primary
Warning signs: separate section below divider
  Each item: AlertTriangle icon (amber) + text

Collapsed state: shows only title + instruction count
Expanded: full list (tap to toggle)
```

---

### TriageTable (Nurse)
```
Table container: bg-white rounded-2xl border border-nurse-border shadow-sm overflow-hidden

Header row: bg-nurse-header text-white
  Font: Plus Jakarta Sans 11px font-medium uppercase tracking-wider
  Height: 48px

Data rows:
  Height: 64px (generous — scannable without squinting)
  Alternating: white / gray-50
  Hover: bg-brand-primary/5 cursor-pointer transition-colors

Priority column (leftmost, 48px wide):
  CRITICAL: solid purple-600 left border 4px
  HIGH:     solid red-500 left border 4px
  MODERATE: solid amber-500 left border 2px
  LOW:      no border, dot only

AI Insight column:
  Italic, text-gray-600, max-w-[200px] truncate
  Full text on hover (Tailwind group/peer tooltip)

Readmission score:
  IBM Plex Mono + colored background pill
  0–30%: green, 31–60%: amber, 61–80%: red, 81%+: purple

Trend column:
  ↑ red  (pain up, bad)
  ↓ green (pain down, good)
  → gray  (flat)
  Uses Lucide TrendingUp / TrendingDown / Minus

Action column:
  Phone icon button (tel: link) — rounded, teal, 36px
```

---

### VoiceRecorder (Check-in Page)
```
Idle state:
  Centered mic button — 80px circle
  bg-brand-primary hover:bg-brand-secondary
  Mic icon (Lucide) white, 32px
  Label below: "Tap to speak" — text-muted 13px

Recording state:
  Pulse ring: two concentric animated rings behind the button
  Button color stays brand-primary
  Inner icon changes to Square (stop)
  Ring animation: mic-ring keyframe, 1.5s, infinite, staggered delay

Transcript preview area (below mic):
  Appears as words are returned
  Each word fades in via text-appear keyframe
  bg-surface-muted rounded-xl p-3
  Font: Plus Jakarta Sans 14px italic text-gray-700
  Min height: 80px — doesn't jump layout
```

---

### ProcessingState (Check-in → AI)
Full-screen overlay while Claude/Gemini are running.

```
Background: bg-surface-base (not a modal — replace page content)

Center: vertical stack
  RecoverAI logo / wordmark (small)
  
  Three step indicators:
    Step 1: "Analysing symptoms"  
    Step 2: "Reviewing wound photo"  (only if image submitted)
    Step 3: "Generating tomorrow's plan"
  
  Each step: icon + label
  Active step: text-brand-primary, icon animated (animate-spin or pulsing dot)
  Completed step: text-gray-400, CheckCircle2 icon
  Pending step: text-gray-300
  
  Duration: steps advance on a 1.5s timer regardless of API speed
  (Ensures loading state is visible — never flashes under 500ms)
```

---

## Spacing & Layout

```
Page padding:    px-4 (mobile) / px-6 (sm:) — never full bleed
Section gap:     space-y-5 between major sections on patient home
Card padding:    p-4 (compact) / p-5 (standard) / p-6 (featured)
Card radius:     rounded-2xl for featured cards, rounded-xl for standard
Border:          border border-gray-100 (patient) / border border-nurse-border (nurse)
Shadow:          shadow-sm (default) / shadow-md (elevated / RiskResultCard)
                 No shadow-lg except RiskResultCard slide-up
```

---

## Iconography

Lucide React only. No other icon library.

| Element | Icon | Color |
|---------|------|-------|
| Voice mic | `Mic` / `MicOff` | white on brand-primary |
| Stop recording | `Square` | white |
| LOW risk | `ShieldCheck` | risk-low |
| MODERATE risk | `ShieldAlert` | risk-moderate |
| HIGH risk | `ShieldX` | risk-high |
| CRITICAL | `Siren` | risk-critical |
| Milestone | `Star` | brand-accent |
| Plan | `ClipboardList` | brand-primary |
| Wound | `ScanLine` | gray-500 |
| WhatsApp sent | `CheckCheck` | brand-primary |
| Trend up | `TrendingUp` | risk-high |
| Trend down | `TrendingDown` | risk-low |
| Trend flat | `Minus` | gray-400 |
| Call patient | `Phone` | white on brand-primary |
| Medication | `Pill` | brand-primary |
| Recovery day | `CalendarDays` | brand-primary |

Icon sizes: 16px (inline/label), 20px (standard), 24px (feature), 32px (hero mic)

---

## Two-Mode Implementation Pattern

Bishnupriya: The patient view and nurse view use the **same Tailwind tokens** but different surface classes. When building any component that appears in both views, accept a `mode` prop:

```jsx
// Example: RiskBadge appears on both patient RiskResultCard and nurse TriageTable
// Patient version: larger, more padding, with icon
// Nurse version: compact pill, IBM Plex Mono

<RiskBadge level="HIGH" mode="patient" />  // px-4 py-2 text-sm with icon
<RiskBadge level="HIGH" mode="nurse" />    // px-2 py-0.5 text-xs IBM Plex Mono
```

The nurse dashboard page uses `bg-nurse-bg` as page background instead of `bg-surface-base`. Everything else inherits from the same token system.

---

## What Makes This Visually Unforgettable at the Hackathon

**The StatusOrb:** No other team will have a breathing, pulsing visual that communicates risk in half a second. Judges projecting the demo on a screen will see it from the back of the room.

**The Fraunces heading:** "Good morning, Ramesh" in a warm serif feels like a letter, not a dashboard. Against every other app at the hackathon set in Inter or Roboto, it will stand out immediately.

**The trajectory chart:** Two lines — dotted expected, solid actual. When the actual line crosses above the expected, the judge understands the patient is behind without reading anything.

**The CRITICAL badge:** Purple. Not red like HIGH. Judges will notice the distinction and ask about it. Your answer: "Purple is further from 'stop' than red — it signals a different kind of urgency. Nurses learn the visual grammar in one shift."

**The processing screen:** Three steps advancing while Claude runs. Feels like a real medical system thinking, not a spinner. The 1.5-second forced minimum makes the AI feel substantial.

---

## Files to Create

```
src/
  index.css              ← Add all CSS variables + keyframes here
  index.html             ← Add Google Fonts link tags
  tailwind.config.js     ← Add color + animation extensions

  components/
    patient/
      StatusOrb.jsx      ← orbConfig lookup + animated rings
      RecoveryDayBadge.jsx ← SVG circle progress
      MilestoneCard.jsx  ← animate-milestone-in + coral accent bar
      AdaptivePlanCard.jsx ← collapsible plan list
      TrajectoryChart.jsx ← Recharts dual-line config above
      AdherenceHeatmap.jsx ← 7-col grid per medication
    
    checkin/
      VoiceRecorder.jsx  ← mic button + pulse rings + transcript stream
      RiskResultCard.jsx ← animate-slide-up + risk color band
      ProcessingState.jsx ← 3-step advancing loader
    
    nurse/
      RiskBadge.jsx      ← mode="patient"|"nurse" + left border on CRITICAL
      TriageTable.jsx    ← full table with priority left borders
      TrendArrow.jsx     ← TrendingUp/Down/Minus icons
```

---

*PRD is the separate document. This Design System contains zero backend or API decisions.*
*If a Tailwind class doesn't exist in the default palette, add it as a CSS variable + tailwind.config.js extension — never use arbitrary values like `bg-[#2D9B8A]` in components.*
