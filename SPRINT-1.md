# Sprint 1 — Implementation Plan
## Skeleton + Landing Page | 2 weeks

### Exit Criteria
User signs up via Clerk, writes 5 entries in the Tiptap editor, closes browser, returns, all entries are intact (local-first + server sync). Landing page live at spectrathink.io with pricing tiers and waitlist.

---

## Phase 1: Scaffolding (Days 1-2)

### 1.1 Monorepo Setup
```bash
# Root workspace
mkdir spectra && cd spectra
npm init -w apps/web -w apps/api -w packages/shared

# Frontend
cd apps/web
npm create vite@latest . -- --template react-ts
npm install react-query @tanstack/react-query zustand
npm install motion                    # Motion for React (formerly framer-motion)
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install lucide-react
npm install tailwindcss @tailwindcss/vite

# shadcn/ui (after Tailwind configured)
npx shadcn@latest init
npx shadcn@latest add sidebar resizable command sheet tooltip sonner

# Backend
cd ../api
npm init -y
npm install express cors helmet
npm install @clerk/express
npm install prisma @prisma/client
npm install bullmq ioredis
npm install zod
npm install -D typescript @types/express @types/node tsx

# Shared types
cd ../../packages/shared
# TypeScript interfaces shared between frontend and backend
```

### 1.2 Prisma + Database
- Copy `prisma/schema.prisma` from this repo
- Set up Railway PostgreSQL instance
- Run `npx prisma migrate dev --name init`
- Verify all 12 tables created (most will be empty until later sprints)
- Set up pgvector extension (for Sprint 2 embeddings): `CREATE EXTENSION IF NOT EXISTS vector;`

### 1.3 File Structure
Create the directory structure per CLAUDE.md. Key files for Sprint 1:

```
apps/web/src/
├── components/
│   ├── ui/              # shadcn (reskinned)
│   ├── layout/
│   │   ├── AppLayout.tsx       # Sidebar + main content + (future) analysis panel
│   │   ├── Sidebar.tsx         # Collapsible icon sidebar
│   │   └── MainContent.tsx     # Centered content area
│   ├── editor/
│   │   ├── EntryEditor.tsx     # Tiptap editor
│   │   ├── MirrorThreshold.tsx # 200-char progress indicator
│   │   └── ActionBar.tsx       # Mirror/Spar/Lens buttons (Mirror disabled until Sprint 2)
│   └── entries/
│       ├── EntryList.tsx       # Entry list view
│       ├── EntryListItem.tsx   # Individual entry in list
│       └── EmptyState.tsx      # "What's on your mind?"
├── lib/
│   ├── spectra-tokens.css     # All CSS custom properties
│   ├── spectra-motion.ts      # Three spring signatures
│   ├── api.ts                 # React Query client + endpoint wrappers
│   └── local-storage.ts       # IndexedDB draft persistence
├── stores/
│   ├── editor-store.ts        # Active entry, draft content
│   └── ui-store.ts            # Sidebar state, active view
├── hooks/
│   ├── useEntries.ts          # React Query hooks for entries
│   ├── useAutoSave.ts         # 3-second debounced auto-save
│   └── useFocusMode.ts        # Sidebar collapse on typing
└── pages/
    ├── EntriesPage.tsx        # Entry list
    └── EditorPage.tsx         # Editor for specific entry
```

---

## Phase 2: Design Foundation (Days 2-3)

### 2.1 spectra-tokens.css
```css
:root {
  --bg: #0b0b10;
  --surface: #0f0f16;
  --surface2: #141420;
  --surface3: #1a1a28;
  --border: rgba(155, 147, 180, 0.06);
  --border2: rgba(155, 147, 180, 0.10);
  --text: #8b879e;
  --text-strong: #cbc7da;
  --white: #eeeaf6;
  --lavender: #9b93b4;
  --amber: #c8a96e;
  --violet: #a07ec8;
  --blue: #6e9ec8;
  --teal: #6ec8a9;
  --rose: #c86e8b;
  --gradient: linear-gradient(90deg, #c8a96e, #a07ec8, #6e9ec8);
  --red: #c86e6e;
  --yellow: #c8b86e;
  --green: #6ec87a;
  
  /* Typography */
  --font-body: 'DM Sans', -apple-system, sans-serif;
  --font-headline: 'Playfair Display', Georgia, serif;
  --font-mono: 'DM Mono', 'SF Mono', monospace;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  
  /* Radii */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
}
```

### 2.2 spectra-motion.ts
```typescript
export const spectraSpring = {
  reveal:   { type: "spring" as const, stiffness: 120, damping: 28, mass: 1.2 },
  navigate: { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.8 },
  react:    { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.5 },
};

export const staggerChildren = {
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};
```

### 2.3 shadcn Override
After installing shadcn components, override all color tokens. In each component file:
- Replace `bg-background` → `bg-[var(--surface)]`
- Replace `text-foreground` → `text-[var(--text)]`
- Replace default `rounded-lg` → `rounded-[var(--radius-lg)]`
- Remove all default shadows — use background color elevation only
- Replace `border-border` → `border-[var(--border)]`

### 2.4 Noise Texture
Global SVG noise overlay on body (fixed position, pointer-events: none, opacity 0.025). Already in the brand CSS — copy from spectra-v7.html.

### 2.5 Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

---

## Phase 3: Auth (Days 3-4)

### 3.1 Clerk Setup
- Create Clerk application (spectra-prod)
- Enable Email + Google OAuth providers
- Install `@clerk/clerk-react` (frontend) and `@clerk/express` (backend)
- Wrap app in `<ClerkProvider>`
- Implement sign-in/sign-up pages (minimal styling, Spectra tokens applied)
- Backend middleware: extract Clerk userId from session, attach to all requests

### 3.2 User Sync
On first sign-in, create User record in PostgreSQL if not exists:
```typescript
// POST /api/auth/sync — called after Clerk sign-in
const user = await prisma.user.upsert({
  where: { id: clerkUserId },
  update: { email, name, avatarUrl },
  create: { id: clerkUserId, email, name, avatarUrl },
});
```

---

## Phase 4: Entry CRUD (Days 4-6)

### 4.1 API Routes
```
POST   /api/entries          — Create entry
GET    /api/entries          — List entries (userId scoped, newest first)
GET    /api/entries/:id      — Get single entry
PATCH  /api/entries/:id      — Update entry (content, title)
DELETE /api/entries/:id      — Soft delete entry
```

All routes:
- Authenticate via Clerk middleware
- Scope queries to `userId` (from Clerk session)
- Validate input with Zod
- Return `{ data, error, meta }` shape
- Title auto-generated from first line of content (truncated to 100 chars)

### 4.2 Zod Schemas
```typescript
const createEntrySchema = z.object({
  content: z.string().min(1),
  inputMode: z.enum(['text', 'voice']).default('text'),
});

const updateEntrySchema = z.object({
  content: z.string().min(1).optional(),
  title: z.string().max(100).optional(),
});
```

### 4.3 Word Count
Computed server-side on save. Simple `content.split(/\s+/).filter(Boolean).length`.

---

## Phase 5: Frontend — Entry List (Days 6-8)

### 5.1 EntryList.tsx
- React Query: `useQuery(['entries'], fetchEntries)`
- Renders list of EntryListItem components
- "New Entry" button at top (full width, spectral gradient border-top on hover)
- Keyboard: ↑/↓ navigate, Enter opens, ⌘N creates new
- Empty state: Playfair italic "What's on your mind?" at 0.3 opacity

### 5.2 EntryListItem.tsx
- First line as title (DM Sans 14px, --white)
- Relative date below (DM Mono 10px, --text, 0.4 opacity)
- Status indicators right-aligned: ◇ (Mirrored), ⚔ (Sparred), colored dots (Lensed)
- Sprint 1: no indicators yet (no Mirror/Spar), but component structure supports them
- Hover: background transitions to surface2 (200ms fade, Motion react spring)

### 5.3 Navigation
- Click entry → navigate to `/entry/:id` (EditorPage)
- Click "New Entry" → create entry via API → navigate to new entry's editor
- Back button on editor → navigate to entry list

---

## Phase 6: Frontend — Editor (Days 8-10)

### 6.1 EntryEditor.tsx (Tiptap)
- Tiptap with StarterKit (bold, italic, headings via Markdown shortcuts)
- NO visible toolbar. Formatting via keyboard shortcuts only.
- Typography: DM Sans 16px, line-height 1.85, --white at 0.9 opacity
- Max-width 620px centered in main content area
- Placeholder: "Start writing your thinking..." (--text at 0.3)

### 6.2 MirrorThreshold.tsx
- Subtle progress bar below editor (or at bottom of action bar)
- Fills as character count approaches 200
- No number display — just visual progress
- At 200+: Mirror button becomes interactive (opacity 0.2 → 1.0)
- Sprint 1: button is visible but non-functional (tooltip: "Coming soon")

### 6.3 ActionBar.tsx
- Three buttons: Mirror, Spar, Lenses (dropdown)
- Bottom-center of editor area, 24px above bottom edge
- Sprint 1: all disabled/coming-soon state
- Mirror: disabled below 200 chars, enabled (but non-functional) above
- Design: DM Mono text, surface background, border, hover → spectral gradient border-top

### 6.4 Auto-Save
- Debounced save: 3 seconds after last keystroke
- Use `useAutoSave` hook with React Query mutation
- Toast on save: "Saved" via Sonner (bottom-right, 1.5s fade, DM Mono 10px)
- Optimistic updates: local state updates immediately, background sync

### 6.5 Local-First (IndexedDB)
- On keystroke: save draft to IndexedDB immediately
- On explicit save / auto-save: sync to server
- On load: check IndexedDB for unsaved draft, merge with server state
- Library: idb-keyval (lightweight) or Dexie

### 6.6 Focus Mode
- `useFocusMode` hook: tracks keyboard activity
- After 2s of typing: sidebar collapses to icon-only (or fully hides)
- On mouse move to left edge (< 60px): sidebar reappears
- Animation: navigate spring

---

## Phase 7: Layout (Days 8-10, parallel)

### 7.1 AppLayout.tsx
```tsx
<SidebarProvider defaultOpen={false}>
  <Sidebar collapsible="icon" side="left">
    {/* ... */}
  </Sidebar>
  <SidebarInset>
    <main className="flex-1 flex justify-center">
      <div className="w-full max-w-[680px] px-8 py-8">
        <Outlet /> {/* React Router */}
      </div>
    </main>
  </SidebarInset>
</SidebarProvider>
```

### 7.2 Sidebar.tsx
- Width: 52px collapsed (icon-only), 220px expanded
- Toggle: Cmd+B (from shadcn Sidebar keyboard shortcut)
- Icons (lucide-react): FileText (Entries), Brain (Your Thinking), Network (Graph), Settings
- Sprint 1: only Entries is active. Others are dimmed (opacity 0.3).
- Hover glow: icon gets ambient colored box-shadow matching its section color
- Bottom: user avatar (from Clerk), settings icon
- Spectra logo/prism at top (small, centered)

### 7.3 Command Palette
- ⌘K to open
- Commands: "New Entry", "Search entries..." (filters list), navigation items
- shadcn Command component, reskinned with Spectra tokens
- Spectral gradient border-top on the dialog

---

## Phase 8: Deploy + Landing Page (Days 10-14, parallel)

### 8.1 Deployment
- **Vercel:** Connect GitHub repo → apps/web → auto-deploy on push to main
- **Railway:** 
  - PostgreSQL instance (provision + connection string)
  - Node/Express service (apps/api)
  - Redis instance (for future rate limiting / Bull queues)
- **Environment variables:** Set in Vercel and Railway dashboards
- **CI/CD:** GitHub Actions for lint + type-check on PR

### 8.2 Landing Page
Parallel track. Can be a separate Vite project or a route within the main app.
- Hero: "AI made everyone faster. Nothing made anyone think better."
- Pricing tiers (from product sheet)
- Waitlist capture (email → stored in separate waitlist table or external service)
- Brand styling from spectra-v7.html
- Deploy to spectrathink.io (Vercel custom domain)

---

## Quality Gates (Before Sprint 1 Merge)

- [ ] User can sign up via Clerk (email + Google)
- [ ] User can create a new entry
- [ ] Entry editor uses Tiptap with DM Sans 16px
- [ ] Entry saves automatically after 3s of inactivity
- [ ] Entry list shows all entries, newest first
- [ ] Closing browser and returning preserves all entries
- [ ] Sidebar collapses/expands with Cmd+B
- [ ] ⌘K opens command palette
- [ ] All API endpoints scoped to authenticated userId
- [ ] No default shadcn styling visible (all Spectra tokens)
- [ ] Noise texture overlay renders
- [ ] Three spring signatures work (test with sidebar open/close)
- [ ] Empty state shows on fresh account
- [ ] Mirror/Spar/Lens buttons visible but disabled
- [ ] 200-char threshold indicator visible on editor
- [ ] Landing page live at spectrathink.io
- [ ] PostHog initialized (basic page view tracking)
- [ ] No TypeScript errors, no console errors
