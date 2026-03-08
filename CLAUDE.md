# CLAUDE.md — Spectra Project Context

## What Is Spectra

Spectra is a cognitive gym for professionals. It uses AI to challenge your thinking, surface hidden assumptions, and track how your reasoning develops over time. It's not a journaling app, not a PKM tool, not an AI assistant. It's a thinking training system with a personal training record.

**Core thesis:** Critical thinking is the one human skill that becomes more valuable as AI gets better at everything else. No product exists that treats it as a trainable skill with progressive development and measurable improvement. Spectra is that product.

**Domain:** spectrathink.io  
**Tagline:** "A gymnasium for the mind."  
**Primary message:** "Train the skill AI can't replace."

## Architecture Overview

```
Frontend: React (Vite) + TypeScript + React Query + Zustand + Tiptap + Motion (Framer) + Sigma.js + Recharts
Backend:  Node.js/Express (CRUD) + FastAPI/Python (AI ops) + Prisma + Bull
AI:       Anthropic API (Sonnet 4) + prompts versioned in DB + pgvector
Voice:    Deepgram Nova-3 (STT) + Aura-2 (TTS) — Sprint 5-6
Database: PostgreSQL + pgvector + Redis
Infra:    Vercel (frontend) + Railway (backend) + Clerk (auth) + PostHog + Sentry
UI:       shadcn/ui primitives + 21st.dev patterns + fully custom Spectra skin
```

### Two-Server Architecture (ADR-002)
- **Node/Express** handles CRUD, auth (Clerk), job queues (Bull), and serves the API
- **FastAPI/Python** handles all AI operations: Anthropic API calls, embedding generation, prompt management, NLP
- Why: Python AI ecosystem is superior. Clean separation. Each server scales independently.

### Key ADRs
- ADR-001: Web-only (React/Vite) — no React Native until v2
- ADR-003: PostgreSQL for graph (v1), Neo4j deferred to Sprint 5+
- ADR-004: Local-first (IndexedDB) — drafts never leave the device until explicit save
- ADR-005: Prompts versioned in DB — hot-swap without redeploy, model-agnostic
- ADR-006: Three-tier data privacy (sacred/private/aggregate)
- ADR-007: Voice via Deepgram (zero-retention, mip_opt_out=true always)

## Data Model

See `prisma/schema.prisma` for the full schema. Key relationships:

```
User (1) ──► (many) Entry
Entry (1) ──► (0-1) MirrorAnalysis ──► (2-3) Assumption
Entry (1) ──► (0-1) SparSession ──► (many) SparTurn
Entry (1) ──► (0-many) LensApplication
User (1) ──► (many) GraphNode ──► (many) GraphEdge
User (1) ──► (1) CognitiveProfile  ← computed, not entered
User (1) ──► (many) Milestone       ← triggered by Profile thresholds
```

**The critical entity is Assumption.** Every Mirror creates 2-3 assumptions. Each is a first-class record with a lifecycle: identified → examined → revised → recurring. Cross-entry recurrence is detected via pgvector similarity. The recurrence rate is the core metric of the Cognitive Profile.

## Privacy Architecture (ADR-006)

**Tier 1 — Sacred (Never Collected):**  
Entry.content, MirrorAnalysis (frame, avoidedQuestion), SparTurn (challengeMsg, userResponse). Encrypted at rest. Never used for AI training. Never read by humans. Voice audio is transient — streamed, transcribed, immediately discarded.

**Tier 2 — Private (Stored for User):**  
Assumptions, LensApplications, GraphNodes, CognitiveProfile. User-owned, exportable, deletable on demand.

**Tier 3 — Aggregate (Anonymized):**  
Assumption type frequencies, framework patterns, cohort trajectories. No individual content or identity.

**ALL queries MUST be scoped to userId. No exceptions. Enforce at API layer.**

## Product Features (v1)

### Layer 1: The Workout
- **F1 Entry System** — Freeform text, Tiptap editor, local-first (IndexedDB), 200-char Mirror threshold
- **F2 Mirror** — Structured AI analysis: frame + 2-3 tagged assumptions + avoided question. Streams. Each assumption stored as individual record.
- **F3 Spar** — Multi-turn adversarial dialogue. 10-turn cap. "Pause" exit → synthesis mode. Each turn tagged with engagement type (engage/deflect/concede). NOT a chatbot — it's rounds.
- **F4 Lenses** — Socratic (Sprint 3), Inversion (Sprint 4), Steelman (Sprint 4). Each application tracked for framework distribution.

### Layer 2: The Coaching
- **F5 Knowledge Graph** — Auto-extracted concepts, Sigma.js visualization (Sprint 5-6)
- **F6 Pattern Detection** — After 10+ entries, surface recurring assumptions and framework defaults

### Layer 3: The Training Record
- **F7 Cognitive Profile** — THE MOAT. Assumption Tracker, Framework Distribution, Challenge Resilience, Blind Spot Map, Growth Timeline. Built incrementally Sprint 3→8.
- **F8 Progression System** — Session Feedback → Weekly Digest → Profile Dashboard → Milestones → Adaptive Difficulty
- **F9 Voice Mode** — Deepgram STT/TTS. Think on the move. Sprint 5-6.

## Design System

**Guiding metaphor:** "A private study at night." Dark walls, warm lamp, good notebook. Nothing demands attention.

### Tokens
```css
--bg: #0b0b10;          /* Near-black, not pure black */
--surface: #0f0f16;     /* Card backgrounds */
--surface2: #141420;    /* Elevated cards, hover states */
--surface3: #1a1a28;    /* Highest elevation */
--text: #8b879e;        /* Body text */
--text-strong: #cbc7da; /* Emphasized text */
--white: #eeeaf6;       /* Headings, entry text */
--lavender: #9b93b4;    /* Brand primary, labels */
--amber: #c8a96e;       /* Spectral gradient start, Entry-related */
--violet: #a07ec8;      /* Spectral gradient mid, Profile-related */
--blue: #6e9ec8;        /* Spectral gradient end, Graph-related */
--teal: #6ec8a9;        /* Lens-related */
--rose: #c86e8b;        /* Spar/challenge-related */
```

### Typography
- **Body/UI:** DM Sans (400, 500) — 14px base, 16px for editor
- **Headlines:** Playfair Display italic — sparingly, max 1 per screen
- **Labels/Mono:** DM Mono (400, 500) — 10-11px, uppercase, letter-spaced

### Motion (Three Spring Signatures)
```typescript
export const spectraSpring = {
  reveal:   { type: "spring", stiffness: 120, damping: 28, mass: 1.2 },  // Mirror panel, assumption cards
  navigate: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },  // View switches, sidebar
  react:    { type: "spring", stiffness: 500, damping: 30, mass: 0.5 },  // Hovers, presses
}
```
Rules: Nothing bounces (high damping, 2-5% overshoot max). Nothing loops. Content never moves after settling. Exits are 1.5x faster than entries.

### Bespoke Details
- **Spectral Edge:** 2px vertical gradient (amber→violet→blue) on left border of analysis panel. The visual signature.
- **Mirror Shimmer:** At 200 chars, gradient sweeps across Mirror button text once (800ms). Signals readiness.
- **Contemplative Beat:** 400ms pause between Spar rounds. Deliberate silence.
- **Focus Mode:** Sidebar auto-collapses when typing begins, returns on mouse-to-left-edge.
- **Empty State Poetry:** Playfair italic, low opacity, contemplative rather than instructional.

### Layout
```
┌─────┬────────────────────────────────┬──────────────────────┐
│ 52px│         MAIN CONTENT           │    ANALYSIS PANEL    │
│ side│    Editor or Entry List        │    (Mirror / Spar)   │
│ bar │    max-width: 680px centered   │    360px, resizable  │
│     │    padding: 32px               │    280–480px range   │
└─────┴────────────────────────────────┴──────────────────────┘
```

### shadcn Strategy
Use shadcn for **behavior only** (focus, ARIA, keyboard, composability). Override ALL visual styling with Spectra tokens. No default shadcn styling should survive. Components used: Sidebar, Resizable, Command, Sheet, Tooltip, Sonner.

## Sprint Plan

### Sprint 1 (Current) — Skeleton + Landing Page
**Exit criteria:** User signs up, writes 5 entries, closes browser, returns, all entries intact. Landing page live at spectrathink.io.

Tasks:
1. Project scaffolding: Vite + React + TypeScript
2. Auth: Clerk (email + Google OAuth)
3. Database: Prisma schema, PostgreSQL on Railway, all tables created (most empty)
4. Entry CRUD API (Node/Express, user_id scoped, encrypted content)
5. Entry List screen + Tiptap editor + 200-char Mirror threshold indicator
6. Local-first draft storage (IndexedDB, sync on save)
7. Global layout: collapsible icon sidebar + main content area
8. Design tokens: CSS variables, noise texture, DM Sans/Mono/Playfair fonts
9. Motion config: spectra-motion.ts with three spring signatures
10. Command palette (⌘K) — basic navigation
11. Deploy: Vercel (frontend) + Railway (backend), CI/CD
12. Landing page at spectrathink.io (parallel track)

### Sprint 2 — The Mirror + First Run
Tasks: Anthropic API integration, Mirror prompt engineering, structured output parsing, assumption record creation, Mirror UI panel (right-side, resizable), spectral edge animation, Session Feedback card, entry embeddings (pgvector), rate limiting, first-run example entry.

### Sprint 3 — Spar + Socratic Lens + Minimal Profile
Tasks: Multi-turn Spar API, engagement tagging, Spar UI (rounds not chat), Socratic lens, minimal "Your Thinking" screen (raw counts), PostHog analytics.

### Sprints 4-8
4: Inversion + Steelman lenses, Weekly Digest  
5-6: Knowledge Graph (Sigma.js), full Cognitive Profile dashboard, Voice Mode (Deepgram)  
7-8: Growth Timeline, Adaptive Difficulty, milestones

## File Structure (Target)

```
spectra/
├── apps/
│   ├── web/                    # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/         # shadcn components (reskinned)
│   │   │   │   ├── editor/     # Tiptap editor + Mirror threshold
│   │   │   │   ├── mirror/     # MirrorPanel, AssumptionCard, SpectralEdge
│   │   │   │   ├── spar/       # SparRound, SparProgress, SynthesisCard
│   │   │   │   ├── profile/    # CognitiveProfile, milestones
│   │   │   │   └── layout/     # Sidebar, MainContent, AnalysisPanel
│   │   │   ├── lib/
│   │   │   │   ├── spectra-motion.ts  # Spring configs
│   │   │   │   ├── spectra-tokens.css # CSS variables
│   │   │   │   └── api.ts            # API client (React Query)
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── pages/          # Route pages
│   │   └── index.html
│   │
│   ├── api/                    # Node/Express CRUD server
│   │   ├── src/
│   │   │   ├── routes/         # Entry, Mirror, Spar, Lens, Profile routes
│   │   │   ├── middleware/     # Auth (Clerk), rate limit, error handling
│   │   │   └── services/       # Business logic
│   │   └── package.json
│   │
│   └── ai/                     # FastAPI AI server
│       ├── app/
│       │   ├── routers/        # Mirror, Spar, Lens, Embedding endpoints
│       │   ├── prompts/        # Prompt loading from DB
│       │   └── services/       # Anthropic client, embedding, NLP
│       └── requirements.txt
│
├── prisma/
│   └── schema.prisma
│
├── packages/
│   └── shared/                 # Shared types, constants
│       └── types.ts
│
├── CLAUDE.md                   # This file
└── package.json                # Workspace root
```

## Coding Standards

- TypeScript strict mode everywhere
- Prisma for all database access (never raw SQL except for pgvector operations)
- React Query for all API calls (no useEffect for data fetching)
- Zustand for client state (editor content, sidebar state, active entry)
- Motion for React (not CSS transitions) for all interactive animations
- All API endpoints return consistent shape: `{ data, error, meta }`
- All API endpoints validate input with Zod
- All API endpoints scope queries to authenticated userId
- Console errors = bugs. No swallowed errors.
- No `any` types. If you can't type it, the architecture is wrong.

## Environment Variables

```
# Database
DATABASE_URL=postgresql://...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Redis
REDIS_URL=redis://...

# Deepgram (Sprint 5+)
DEEPGRAM_API_KEY=...

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry
SENTRY_DSN=https://...
```

## Anti-Patterns (Don't Do This)

- Don't make Mirror/Spar look like a chatbot. No chat bubbles. No typing indicators. No conversation threads.
- Don't use default shadcn styling. Every visible pixel uses Spectra tokens.
- Don't store AI response content for product improvement. Tier 1 Sacred.
- Don't build gamification (streaks, badges, confetti). Build progression (measurements of real cognitive development).
- Don't trigger Mirror automatically. Always explicit user action.
- Don't optimize for DAU, time-in-app, or entry volume. These are anti-metrics.
- Don't use CSS transitions for interactive elements. Use Motion springs.
- Don't make queries without userId scoping. Ever.
