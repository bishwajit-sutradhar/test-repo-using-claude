# Music EP Kit Generator for Artists — Execution Plan

## Context
A greenfield web application that lets independent music artists log in, enter their personal details and song metadata, and receive an AI-generated professional EP press/release kit (artist bio, press release, track descriptions, social captions, streaming pitch, interview talking points). The project currently has only a CLAUDE.md file — all code needs to be built from scratch.

**Stack**: React + Vite + Tailwind (frontend) · Node.js + Express (backend) · Supabase/PostgreSQL (DB + Auth) · Provider-agnostic LLM (OpenAI / Gemini / Anthropic)

---

## Folder Structure (Monorepo)

```
music-ep-kit/
├── CLAUDE.md
├── EXECUTION_PLAN.md
├── .gitignore
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.cjs
│   ├── tsconfig.json
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── routes.tsx
│       ├── lib/
│       │   ├── supabaseClient.ts     # createClient() singleton
│       │   ├── apiClient.ts          # axios instance w/ JWT interceptor
│       │   └── constants.ts
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useArtistProfile.ts
│       │   └── useEPKit.ts
│       ├── store/
│       │   └── authStore.ts          # Zustand auth slice
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── SignupPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── ArtistProfilePage.tsx
│       │   ├── SongDetailsPage.tsx
│       │   ├── GenerateKitPage.tsx
│       │   └── KitViewPage.tsx
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   ├── forms/
│       │   │   ├── ArtistProfileForm.tsx
│       │   │   ├── SongCard.tsx
│       │   │   └── SongListManager.tsx
│       │   ├── kit/
│       │   │   ├── KitDisplay.tsx
│       │   │   ├── KitSection.tsx
│       │   │   └── KitExportButton.tsx
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Input.tsx
│       │       ├── Textarea.tsx
│       │       ├── Spinner.tsx
│       │       └── Toast.tsx
│       └── types/index.ts
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts                  # server entry + app.listen
│       ├── app.ts                    # Express app + middleware stack
│       ├── config/
│       │   └── env.ts                # envalid — fail-fast on missing secrets
│       ├── lib/
│       │   ├── supabaseAdmin.ts      # service-role client (bypasses RLS)
│       │   ├── llmClient.ts          # provider-agnostic LLM factory
│       │   └── providers/
│       │       ├── openai.provider.ts
│       │       ├── gemini.provider.ts
│       │       └── anthropic.provider.ts
│       ├── middleware/
│       │   ├── authMiddleware.ts     # Supabase JWT verification
│       │   ├── validateBody.ts       # Zod schema validator factory
│       │   └── rateLimiter.ts        # express-rate-limit config
│       ├── routes/
│       │   ├── index.ts
│       │   ├── artist.routes.ts
│       │   ├── song.routes.ts
│       │   └── kit.routes.ts
│       ├── controllers/
│       │   ├── artist.controller.ts
│       │   ├── song.controller.ts
│       │   └── kit.controller.ts
│       ├── services/
│       │   ├── artist.service.ts
│       │   ├── song.service.ts
│       │   ├── kit.service.ts        # fetch DB → build prompt → generateCompletion() → write result
│       │   └── prompt.service.ts     # pure prompt construction (no I/O, easily testable)
│       ├── schemas/
│       │   ├── artist.schema.ts      # Zod schemas
│       │   ├── song.schema.ts
│       │   └── kit.schema.ts
│       └── types/index.ts
│
└── supabase/
    └── migrations/
        ├── 001_create_artists.sql
        ├── 002_create_songs.sql
        ├── 003_create_ep_kits.sql
        └── 004_rls_policies.sql
```

---

## Database Schema

### `artists`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | `gen_random_uuid()` |
| `user_id` | `uuid UNIQUE NOT NULL` | FK → `auth.users.id` |
| `stage_name` | `text NOT NULL` | |
| `real_name` | `text` | optional |
| `genre` | `text NOT NULL` | e.g. "Afrobeats, R&B" |
| `location` | `text` | City, Country |
| `bio_raw` | `text` | user-written bio seed |
| `influences` | `text[]` | array of artist names |
| `years_active` | `int` | |
| `website_url` | `text` | |
| `social_handles` | `jsonb` | `{instagram, twitter, tiktok, spotify}` |
| `press_photo_url` | `text` | Supabase Storage URL |
| `created_at` / `updated_at` | `timestamptz` | |

### `songs`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `artist_id` | `uuid NOT NULL` | FK → `artists.id` ON DELETE CASCADE |
| `user_id` | `uuid NOT NULL` | FK → `auth.users.id` (denorm for RLS) |
| `title` | `text NOT NULL` | |
| `track_number` | `smallint NOT NULL` | ordering on EP |
| `duration_seconds` | `int` | |
| `bpm` | `smallint` | range-validated 40–300 |
| `key_signature` | `text` | e.g. "C minor" |
| `mood` | `text[]` | e.g. `["melancholic","anthemic"]` |
| `themes` | `text` | lyrical themes |
| `production_notes` | `text` | instrumentation, producer |
| `featured_artists` | `text[]` | |
| `lyrics_excerpt` | `text` | tone context for LLM |
| `created_at` / `updated_at` | `timestamptz` | |

### `ep_kits`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `artist_id` | `uuid NOT NULL` | FK → `artists.id` ON DELETE CASCADE |
| `user_id` | `uuid NOT NULL` | FK → `auth.users.id` |
| `ep_title` | `text NOT NULL` | |
| `ep_release_date` | `date` | |
| `ep_label` | `text` | indie label or "Independent" |
| `generation_status` | `text` | `pending` → `generating` → `complete` / `failed` |
| `content` | `jsonb` | full structured LLM output |
| `prompt_tokens_used` | `int` | cost tracking |
| `model_version` | `text` | e.g. `gpt-4o`, `gemini-1.5-pro`, `claude-sonnet-4-6` |
| `created_at` / `updated_at` | `timestamptz` | |

**`content` JSONB structure:**
```json
{
  "artist_bio": "...",
  "ep_overview": "...",
  "press_release": "...",
  "track_descriptions": [{ "track_number": 1, "title": "...", "description": "..." }],
  "social_captions": {
    "instagram_announcement": "...",
    "twitter_thread": ["...", "...", "..."],
    "tiktok_hook": "..."
  },
  "streaming_pitch": "...",
  "interview_talking_points": ["...", "...", "...", "...", "..."]
}
```

### RLS Policies (migration `004`)
All three tables follow identical pattern — users can only SELECT/INSERT/UPDATE/DELETE their own rows (`user_id = auth.uid()`). Backend uses service-role key which bypasses RLS only for kit generation writes.

---

## API Routes (all require `Authorization: Bearer <jwt>`)

### Artist Profile
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/artists/me` | Fetch own profile |
| `POST` | `/api/artists` | Create profile (first time) |
| `PUT` | `/api/artists/me` | Update profile |

### Songs
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/songs` | List all songs |
| `POST` | `/api/songs` | Add a song |
| `PUT` | `/api/songs/:id` | Update a song |
| `DELETE` | `/api/songs/:id` | Delete a song |

### EP Kits
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/kits` | List all kits |
| `GET` | `/api/kits/:id` | Get single kit with content |
| `POST` | `/api/kits` | Create + trigger generation (atomic) |
| `DELETE` | `/api/kits/:id` | Delete a kit |

> `user_id` in all DB operations comes from the **verified JWT**, never from the request body — prevents IDOR attacks.

---

## LLM Integration (Provider-Agnostic)

**CLAUDE.md rule**: Do not default to Claude API. Support multiple providers; the active provider is set via the `LLM_PROVIDER` env var.

### Provider Abstraction

`llmClient.ts` exposes a single async function `generateCompletion(system, user)`. Internally routes to the configured adapter:

```typescript
// lib/llmClient.ts
export async function generateCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
  switch (env.LLM_PROVIDER) {
    case 'openai':    return openaiAdapter(systemPrompt, userPrompt);
    case 'gemini':    return geminiAdapter(systemPrompt, userPrompt);
    case 'anthropic': return anthropicAdapter(systemPrompt, userPrompt);
    default: throw new Error(`Unknown LLM_PROVIDER: ${env.LLM_PROVIDER}`);
  }
}
```

| Provider File | Provider | Default Model |
|---|---|---|
| `openai.provider.ts` | OpenAI | `gpt-4o` |
| `gemini.provider.ts` | Google Gemini | `gemini-1.5-pro` |
| `anthropic.provider.ts` | Anthropic Claude | `claude-sonnet-4-6` |

**Default**: `LLM_PROVIDER=openai`. No provider is hardcoded in application logic.

All providers receive the same system prompt (instructs model to respond with pure JSON matching the `content` schema) + a dynamically built human turn from artist + song data. User-supplied text is inserted as data, not instructions — mitigates prompt injection.

**Output**: `JSON.parse()` on raw response text. Parse failure → `generation_status = 'failed'` → 502 returned. No silent errors.

---

## Security Checklist

- **JWT enforcement**: every `/api/*` route uses `authMiddleware.ts` — `supabase.auth.getUser(token)`
- **No IDOR**: `user_id` sourced from JWT claim, never from request body
- **RLS**: all three tables have row-level security policies
- **Service-role key**: backend-only; Supabase anon key is frontend-safe by design
- **Input validation**: Zod schemas on all POST/PUT; UUID format on route params; `bpm` range-checked 40–300
- **CORS**: explicit `origin` allowlist via `FRONTEND_URL` env var, not `*`
- **Rate limiting**: 100 req/15min general; **5 req/hour on `/api/kits`** to prevent LLM API cost abuse
- **Helmet**: CSP, HSTS, X-Frame-Options headers
- **Body size limit**: `express.json({ limit: '50kb' })`
- **Prompt injection**: user text is data in human turn; system prompt structure is fixed server-side
- **Env secrets**: `envalid` fails fast on missing vars; `.env` in `.gitignore`; `.env.example` committed
- **Parameterized queries**: Supabase JS client only — no raw SQL string interpolation

---

## Environment Variables

### `backend/.env.example`
```bash
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # never expose to frontend
SUPABASE_JWT_SECRET=your_jwt_secret

# LLM Provider — set ONE of: openai | gemini | anthropic (default: openai)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_key
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=sk-ant-your_key     # only needed if LLM_PROVIDER=anthropic

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
KIT_GENERATION_LIMIT_PER_HOUR=5
```

### `frontend/.env.example`
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key    # safe to expose — public key by design
VITE_API_BASE_URL=http://localhost:3001
```

---

## Phased Build Order

### Phase 1 — Foundation (auth + boilerplate)
**Goal**: Monorepo boots; auth works end-to-end; backend rejects unauthenticated requests.
1. Create monorepo folder structure + `.gitignore`
2. Init `frontend/package.json` (Vite + React + TS + Tailwind + React Router + Zustand + React Hook Form + Zod + Axios)
3. Init `backend/package.json` (Express + TS + ts-node-dev + Zod + envalid + helmet + cors + express-rate-limit)
4. Run Supabase migrations `001`–`004` in Supabase Dashboard
5. Build `LoginPage` + `SignupPage` using Supabase Auth JS
6. Build `ProtectedRoute` + `authStore`
7. Build `authMiddleware.ts`
8. **Smoke test**: sign up → log in → hit protected endpoint with JWT

### Phase 2 — Artist Profile
**Goal**: Artist can create/edit their profile; data persists.
1. Implement `GET/POST/PUT /api/artists`
2. Build `ArtistProfileForm` (React Hook Form + Zod)
3. Build `ArtistProfilePage` + `useArtistProfile` hook
4. Build `Navbar` + `Sidebar` layout

### Phase 3 — Song Management
**Goal**: Full CRUD for songs on the EP.
1. Implement all four `/api/songs` routes
2. Build `SongCard` + `SongListManager`
3. Build `SongDetailsPage`

### Phase 4 — Kit Generation (core value)
**Goal**: End-to-end: fill form → LLM generates kit → renders on screen.
1. Build `prompt.service.ts` (pure, provider-neutral prompt construction)
2. Build `llmClient.ts` + all three provider adapters (`openai`, `gemini`, `anthropic`)
3. Build `kit.service.ts` (DB fetch → prompt → `generateCompletion()` → DB write)
4. Implement `POST /api/kits` + `GET /api/kits/:id`
5. Build `GenerateKitPage` (EP metadata form + loading state)
6. Build `KitDisplay` + `KitSection` + `KitViewPage`

### Phase 5 — Polish & Export
**Goal**: Kit history, export, UX refinements.
1. Implement `GET /api/kits` + `DashboardPage`
2. `KitExportButton` (PDF via jsPDF + clipboard copy)
3. `Toast` notifications, `Spinner` / skeleton states
4. Responsive Tailwind polish pass

### Phase 6 — Security Hardening & Deployment Prep
**Goal**: Ship-ready.
1. Add `helmet` + `express-rate-limit` + CORS origin allowlist
2. Audit all routes for auth middleware coverage
3. Run through full security checklist
4. Write both `.env.example` files
5. `envalid` validation in `config/env.ts`
6. Update `README.md` with local dev setup

---

## Critical Files

| File | Why Critical |
|---|---|
| `backend/src/middleware/authMiddleware.ts` | Every authenticated route depends on it — a bug here is a security hole |
| `supabase/migrations/004_rls_policies.sql` | Last line of defense — incorrect RLS exposes all user data |
| `backend/src/services/prompt.service.ts` | Prompt quality directly determines output quality |
| `backend/src/services/kit.service.ts` | Orchestrates the full generation pipeline |
| `backend/src/lib/llmClient.ts` + `providers/` | Provider-agnostic routing — adding/removing a provider is isolated here |
| `frontend/src/lib/apiClient.ts` | Axios JWT interceptor — broken interceptors break all authenticated calls |
| `backend/src/config/env.ts` | Fail-fast on missing secrets — prevents silent undefined leakage |

---

## Verification (End-to-End Test)
1. `cd backend && npm run dev` — server starts, `envalid` passes, no missing env errors
2. `cd frontend && npm run dev` — Vite starts on port 5173
3. Navigate to `/signup` — create an account
4. Complete artist profile — verify row in `artists` table in Supabase Dashboard
5. Add 3+ songs — verify rows in `songs` table
6. Generate Kit — observe `generation_status` flip `pending → generating → complete`
7. View kit — all sections render (bio, press release, track descriptions, social captions)
8. Export as PDF — confirm download
9. Sign out → hit `/api/artists/me` directly → confirm 401
10. Sign in as different user → confirm first user's kits are not visible (RLS test)
