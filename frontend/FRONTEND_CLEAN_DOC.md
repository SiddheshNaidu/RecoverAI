# UNTITLED Frontend Boilerplate — Clean Doc
**Team UNTITLED | Build-it ON (TCET EWT) | Mar 28, 2026**
*Owner: Siddhesh (Architect + Dev) | Read by: Bishnupriya, Cursor, Antigravity*

---

## What This Is

A generic, PS-agnostic React frontend that works against the team's FastAPI backend the moment the PS drops. Zero setup on build day — every component, hook, API call, and state shape is pre-written. On Mar 27 at 12:30AM, Kaushik fills six fields in `.ai-context` and `AppContext.jsx`, and the skeleton becomes a working PS-specific app.

**Mental model:** The backend is a black box with six endpoints. This frontend knows exactly what each endpoint expects and what it returns. The UI just needs headlines and color — not rewiring.

---

## Folder Map

```
frontend-boilerplate/
├── .ai-context                ← THE LAW. Every AI reads this first.
├── .env.example               ← Copy to .env, set VITE_API_URL
├── index.html                 ← Update <title> per PS
├── package.json
├── vite.config.js             ← Dev proxy configured (no CORS pain locally)
├── tailwind.config.js
├── vercel.json                ← SPA routing + Vercel build config
└── src/
    ├── main.jsx               ← Entry. DO NOT TOUCH.
    ├── index.css              ← Tailwind directives. DO NOT TOUCH.
    ├── App.jsx                ← Root. Add routes here if multi-page.
    ├── api/
    │   └── client.js          ← ALL fetch calls. Siddhesh owns. Do not touch.
    ├── hooks/
    │   └── useApi.js          ← One hook per endpoint. Always { data, loading, error, execute }.
    ├── context/
    │   └── AppContext.jsx     ← Global state + PS_CONFIG flags. Kaushik fills at 12:30AM.
    ├── components/
    │   ├── UploadPanel.jsx    ← Text/Audio/File input. Tabs auto-hide per PS_CONFIG.
    │   ├── DataCard.jsx       ← Renders any Supabase item JSON as a readable card.
    │   ├── DataGallery.jsx    ← Grid/list of DataCards. Has empty + loading + error states.
    │   └── ui/
    │       ├── LoadingState.jsx  ← Spinner / bar / text variants.
    │       ├── ErrorState.jsx    ← Error box with optional retry button.
    │       └── StatusBadge.jsx   ← Colored label badge. Color auto-derived from string.
    └── pages/
        └── HomePage.jsx       ← The only page. Siddhesh reskins headlines per PS.
```

---

## Day-Zero Setup (Mar 26 Evening — Siddhesh)

```bash
# 1. In the repo root (alongside /backend)
cd frontend-boilerplate

# 2. Install deps
npm install

# 3. Create .env
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000

# 4. Start backend (separate terminal)
cd ../backend && uvicorn main:app --reload

# 5. Start frontend
cd ../frontend-boilerplate && npm run dev
# → http://localhost:5173

# 6. Verify: open browser, check no console errors, health check passes
```

**Done when:** Browser shows the page, no red console errors, the gallery loads (empty is fine).

---

## PS Day Quickstart (Mar 27, 12:30AM — Kaushik fills, Siddhesh executes)

### Step 1 — Fill `.ai-context` PS section

```
PS_ARCHETYPE:    [1–5]
PRIMARY_USER:    [who]
CORE_FEATURE:    [single most important thing for demo]
HERO_COMPONENT:  [which component is the demo money shot]
COLOR_THEME:     [e.g. "green/earth tones", "blue/civic", "amber/warm"]
AUDIO_NEEDED:    [yes/no]
```

### Step 2 — Fill `AppContext.jsx` PS_CONFIG (6 lines, 30 seconds)

```js
export const PS_CONFIG = {
  PROMPT_TYPE: "knowledge",     // ← archetype key (e.g. "crisis", "environment")
  AUDIO_ENABLED: true,          // ← show mic tab?
  FILE_ENABLED: false,          // ← show image upload tab?
  WHATSAPP_ENABLED: false,      // ← show WhatsApp send button on cards?
  PRIMARY_LABEL: "Item",        // ← what to call each result (e.g. "Report", "Card")
};
```

### Step 3 — Update 3 strings in `HomePage.jsx`

```jsx
<h1>  Your PS-specific app name  </h1>
<p>   One-line description        </p>
<h2>  Submit Input / whatever fits </h2>
```

### Step 4 — Update `index.html` title

```html
<title>Your App Name</title>
```

**That's it.** The app is now PS-specific. All data flows through the already-wired components.

---

## Component Reference

### `UploadPanel`
```jsx
<UploadPanel onSuccess={(item) => console.log(item)} promptType="crisis" />
```
- `onSuccess` — called with the returned `Item` after any successful process-* call. Use it to trigger navigation, scroll, highlight, etc.
- `promptType` — overrides `PS_CONFIG.PROMPT_TYPE` for this panel instance. Omit to use the global default.
- Tabs auto-show/hide based on `PS_CONFIG.AUDIO_ENABLED` and `PS_CONFIG.FILE_ENABLED`. Text tab always visible.
- Audio tab uses the browser's native `MediaRecorder`. Shows mic → record → playback → submit flow.
- File tab: client-side MIME + size check (images only, max 10MB) before upload.

### `DataCard`
```jsx
<DataCard item={item} compact={false} onClick={() => setActive(item)} />
```
- Renders any `item.content` shape. Never hardcodes field names.
- `PRIORITY_KEYS` (in the file) controls which fields appear first. Add PS-specific keys to this array on Mar 27.
- WhatsApp delivery button auto-shows when `PS_CONFIG.WHATSAPP_ENABLED = true`.
- `compact` — truncates preview for grid layout.

### `DataGallery`
```jsx
<DataGallery items={items} loading={loading} error={error} onRetry={refetch} layout="grid" />
```
- `layout`: `"list"` (default) or `"grid"` (2–3 columns, compact cards).
- Shows 3 skeleton cards while loading. Shows `ErrorState` on error. Shows empty state when `items.length === 0`.

### `useApi` hooks
```js
const { data, loading, error, execute, reset } = useProcessText();
// execute returns the result directly, also sets data state
const item = await execute("my text", "knowledge");
```
Every hook returns the same shape: `{ data, loading, error, execute, reset }`. Call `reset()` to clear state between submissions.

---

## API Contract (read-only reference)

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/api/process-text` | `{ text, prompt_type }` | `Item` |
| POST | `/api/process-audio` | `FormData { audio, prompt_type }` | `{ transcript, item }` |
| POST | `/api/process-image` | `FormData { image }` | `Item` |
| POST | `/api/generate` | `{ prompt }` | `{ result: string }` |
| GET  | `/api/items` | — | `{ items[], count }` |
| POST | `/api/items` | `{ type, content, metadata }` | `Item` |
| POST | `/api/deliver` | `{ phone, message }` | `{ success }` |
| GET  | `/health` | — | `{ status: "ok" }` |

**Item shape (Supabase):**
```ts
{
  id: string        // uuid
  type: string      // e.g. "structured:knowledge"
  content: {}       // JSONB — varies per archetype
  metadata: {}      // JSONB — source, prompt_type, transcript, etc.
  created_at: string // ISO 8601
}
```

---

## Bishnupriya's Task Protocol

You work in `/src/components` only. Kaushik hands you atomic tasks. Every task is one component. Here's how each task goes:

1. **Task arrives from Kaushik:** e.g. "Build a KnowledgeCard variant of DataCard with a yellow domain badge and a 3-bullet key_points section."
2. **Open Cursor.** Point it at the single component file — not the whole project.
3. **Paste the task + the component file** into Cursor. Never paste all of `/src`.
4. **Check output against `.ai-context`:** Did it use useState? ✓ Did it add a new library? ✗ Reject and re-prompt.
5. **Commit:** `feat: KnowledgeCard — yellow domain badge, key_points bullets`
6. **Push to your branch.** Kaushik reviews and merges.

**Never touch:**
- `src/api/client.js`
- `src/hooks/useApi.js`
- `src/context/AppContext.jsx`
- Any backend file

---

## Deployment Checklist (Mar 27 Evening)

### Vercel (Frontend)
```bash
# 1. Push to main
git push origin main

# 2. In Vercel dashboard → Environment Variables:
#    VITE_API_URL = https://your-railway-app.railway.app

# 3. Trigger redeploy if env var was just added
```

### Confirm live deploy works:
- [ ] `https://your-app.vercel.app` loads with no console errors
- [ ] Text submission returns a card
- [ ] Audio tab records and transcribes (if AUDIO_ENABLED)
- [ ] Gallery loads existing items from Supabase
- [ ] WhatsApp delivery sends to Sakshi's real number (if WHATSAPP_ENABLED)
- [ ] Works on mobile viewport (open on your phone)

---

## Golden Rules (Frontend Edition)

| Rule | Reason |
|------|--------|
| No localStorage — ever | `.ai-context` law. State resets on refresh. That's fine for a demo. |
| No new libraries | `npm install X` is banned. If Tailwind can't do it, write 10 lines of CSS. |
| useState/useContext only | Redux is overkill. AppContext handles everything we need. |
| Never point Cursor at the whole project | Pass only the specific file. Broad context = hallucinations. |
| Console errors = demo failure | Zero tolerance on demo day. Fix all red console output before 8PM Mar 27. |
| Text must be readable at 1080p projected | Minimum `text-sm` (14px). Check at actual presentation scale. |
| All loading states ≥ 500ms visible | If API is fast, add `await new Promise(r => setTimeout(r, 500))` for demo feel. |
| Demo on live Vercel URL only | Never `localhost` in front of judges. |

---

## Archetype → PS_CONFIG Cheat Sheet

When Kaushik identifies the archetype, copy-paste the matching config block into `AppContext.jsx`:

**Archetype 1 — Knowledge / Education:**
```js
PROMPT_TYPE: "knowledge", AUDIO_ENABLED: true, FILE_ENABLED: false,
WHATSAPP_ENABLED: true, PRIMARY_LABEL: "Knowledge Card"
```

**Archetype 2 — Scheme / Benefits Discovery:**
```js
PROMPT_TYPE: "scheme_match", AUDIO_ENABLED: false, FILE_ENABLED: false,
WHATSAPP_ENABLED: true, PRIMARY_LABEL: "Scheme Match"
```

**Archetype 3 — Crisis / Emergency:**
```js
PROMPT_TYPE: "crisis", AUDIO_ENABLED: true, FILE_ENABLED: false,
WHATSAPP_ENABLED: true, PRIMARY_LABEL: "Response Plan"
```

**Archetype 4 — Environmental Monitoring:**
```js
PROMPT_TYPE: "environment", AUDIO_ENABLED: false, FILE_ENABLED: true,
WHATSAPP_ENABLED: false, PRIMARY_LABEL: "Report"
```

**Archetype 5 — Livelihood / Economic:**
```js
PROMPT_TYPE: "livelihood", AUDIO_ENABLED: false, FILE_ENABLED: false,
WHATSAPP_ENABLED: true, PRIMARY_LABEL: "Opportunity"
```

---

## Files to Have Ready Before Midnight (Mar 26 Checklist)

| File | Status | Done When |
|------|--------|-----------|
| `.env` created from `.env.example` | Siddhesh | `VITE_API_URL` set |
| `npm install` completed | Siddhesh | No errors in terminal |
| `npm run dev` starts | Siddhesh | Browser opens at 5173 |
| Backend running on 8000 | Siddhesh | `/health` returns `{"status":"ok"}` |
| Supabase `items` table seeded with 1 test row | Siddhesh | Gallery shows 1 card |
| Text submit flow works end-to-end | Siddhesh | Card appears after submit |
| Audio tab records + transcribes (if needed) | Siddhesh | Mic → text → card |
| Vercel linked to GitHub repo | Siddhesh | Auto-deploy on push works |
| Bishnupriya can run locally | Bishnupriya | Frontend + backend both start |
| Bishnupriya's Cursor student tier active | Bishnupriya | 500 fast requests showing |

---

*This document and the `.ai-context` file are the only sources of truth. If Cursor suggests anything that contradicts either file, reject the suggestion and re-prompt with the constraint.*
