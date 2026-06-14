# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow

**Always follow this flow for every change (fix, feature, refactor, etc.):**

1. Create a branch before starting: `git checkout -b type/short-description` (e.g. `fix/login-csrf`, `feat/link-monitoring`)
2. Implement the changes
3. **Wait for user validation before committing**
4. After user confirms, commit on the branch
5. Merge into master: `git checkout master && git merge --no-ff branch-name && git branch -d branch-name`

Never commit directly to `master`. Never merge without explicit user approval.

### One Branch Per Request — Critical Rule

**Every user request opens its own branch.** The scope of the branch is exactly the scope of that request — no more, no less.

**When the user asks for something new while a branch is already open:**

1. Detect that the new request is off-topic from the current branch.
2. Ask the user: *"Ainda estamos no escopo de `<branch-atual>` — isso foi concluído ou posso abrir uma branch separada para essa nova solicitação?"*
3. If the current work **is done**: commit, merge, delete the branch, then open a new one for the new request.
4. If the current work **is not done**: branch off the current branch — `git checkout -b type/new-topic` — resolve the new request there, merge it back into the working branch, then resume the original work.
5. Never mix unrelated changes in the same branch — each branch must map to exactly one user request.

**Branch lifecycle:**
- Open the branch at the start of the request, before writing any code.
- Delete the branch immediately after merging — never leave dead branches behind.
- If multiple branches exist at the end of a session, list them and ask the user which to merge or discard before closing.

### Branch Staleness — Critical Rule

**A branch must live only as long as its work session.** Once a feature or fix is merged, the branch is deleted immediately. If a branch is left open and master moves forward, the branch will diverge and create conflicts.

**Rules to prevent stale branches:**
- If work on a branch spans more than one session, rebase or merge master into the branch at the start of the new session (`git merge master`) before continuing.
- Never let a documentation/refactor branch diverge from the code — if code branches land on master, rebase the docs branch before continuing.
- When in doubt: `git log --oneline master..<branch>` to see how far ahead it is, and `git diff master...<branch> --stat` to see divergence.

## Static Information — Post-Merge Update Protocol

After merging any branch into master, evaluate whether the changes affect the system's static information and update accordingly **before closing the session**.

### What to update and when

| Artifact | File | Update when |
|---|---|---|
| **Changelog** | `app/(dashboard)/changelog/page.tsx` | Any feat, fix, security, refactor, or perf merged to master |
| **Security report** | `SECURITY_REPORT.md` | Any security-related change (new finding, fix, config, auth) |
| **System report** | `SYSTEM_REPORT.md` | Significant architecture changes, new modules, score changes |
| **Build number** | `app/api/version/route.ts` | **Automatic** — derived from `git rev-list --count HEAD`, no action needed |

### Changelog update rules (`app/(dashboard)/changelog/page.tsx`)

The `RELEASES` array is the single source of truth for the changelog page. Keep it current.

**When to add a new release entry:**
- A meaningful set of features, fixes, or security patches lands on master
- The release represents a coherent "version" from the user's perspective

**When to amend the current latest release:**
- A fix or small improvement ships that belongs to the same release cycle
- The `latest: true` entry should always reflect everything in the current cycle

**Entry format:**
```ts
{ type: "feat" | "fix" | "security" | "refactor" | "perf", text: "..." }
```
- `security` — auth changes, vulnerability fixes, crypto, rate limiting, audit
- `feat` — new user-visible functionality
- `fix` — bug corrections
- `refactor` — internal improvements, DX, code quality
- `perf` — measurable performance improvements

Write entries from the **user's perspective**, not the developer's. "Página /profile com gerenciamento de 2FA" not "Added profile-client.tsx with TOTP state machine".

### Security report update rules (`SECURITY_REPORT.md`)

Edit the file directly — no scripts or database required. The page `/security` reads it statically.

- Add a new finding (`SEC-NNN`) when a new vulnerability or risk is identified
- Change status from `ABERTO` to `RESOLVIDO` when a fix lands on master
- Update the summary counts at the top of the file
- Date-stamp the last update

### Enforcement

This update step is **not optional** — static information that drifts from the codebase misleads both users and future development sessions. If the changes are minor (typo fix, style tweak, test), skip the update and note why. Otherwise, update before the session ends.

---

## Common Commands

```bash
# First-time setup
docker compose up -d      # Start PostgreSQL container
npm run db:migrate        # Apply migrations and create tables
npm run create-user       # Create initial admin user

# Development (Next.js + monitoring worker simultaneously)
npm run dev:all

# Run only the Next.js dev server
npm run dev

# Run only the background monitoring worker
npm run worker

# Tests
npm test                  # Run all tests (~560 tests, ~49 suites)
npm run test:coverage     # With coverage report
npm run test:integration  # Integration + load tests (requires PostgreSQL container)
npm test -- --testPathPatterns="__tests__/api/devices.test.ts"  # Single test file

# Database
npm run db:migrate        # Apply pending migrations
npm run db:studio         # Open Prisma Studio GUI
npm run db:generate       # Regenerate Prisma client after schema changes

# Security findings are tracked in SECURITY_REPORT.md and displayed at /security
# Edit SECURITY_REPORT.md directly to add/update findings (no database required)

# Type checking
npx tsc --noEmit
```

## Architecture

This is **WatchIT Tower**, a local IT monitoring dashboard built with:
- **Next.js 14 (App Router)** — frontend + API routes
- **shadcn/ui v4 (Base UI)** — component library
- **Prisma 7 + PostgreSQL** — database via Docker (`docker-compose.yml`)
- **NextAuth.js v5** — JWT authentication (credentials provider)
- **`worker/`** — separate Node.js process that polls devices and writes to the database

### Database Setup

The database runs in Docker. Connection string is set in `.env`:
```
DATABASE_URL="postgresql://it_dashboard:it_dashboard@localhost:5432/it_dashboard"
```

`prisma.config.ts` loads `.env` via `dotenv/config` and validates that `DATABASE_URL` is set —
it throws an error at startup if missing (prevents the "dev-secret" class of silent misconfiguration).

After changing `prisma/schema.prisma`, always run:
```bash
npm run db:migrate    # creates and applies the migration
npm run db:generate   # regenerates the Prisma client types
```

Since `prisma migrate dev` requires a TTY, apply migrations manually in Docker:
```bash
docker compose exec -T postgres psql -U it_dashboard -d it_dashboard -f migration.sql
# then register the migration in _prisma_migrations manually
npm run db:generate
```

### Key Architectural Points

**Two-process model:** `npm run dev:all` runs Next.js and `worker/index.ts` in parallel via `concurrently`. The worker runs background monitoring checks independently of HTTP requests.

**Monitoring worker flow:** `worker/scheduler.ts` reads all devices from the DB, sets up a `setInterval` per device (based on `device.checkInterval`), and every tick runs the enabled monitors in parallel via `Promise.allSettled`. Results are written to `DeviceStatus` (upsert, one row per device) and `StatusHistory` (append, for graphs). Links with RouterOS config are polled every 60s via `pollLinks()`.

**Worker graceful shutdown:** `worker/index.ts` traps `SIGTERM`/`SIGINT` and calls `shutdown()` from `scheduler.ts`, which clears all intervals and drains in-flight async operations (tracked via `pendingChecks: Set<Promise<unknown>>`) before calling `db.$disconnect()`. The worker never loses a write mid-flight on container stop.

**Worker heartbeat:** `scheduler.ts` upserts a `WorkerHeartbeat` row every 60 seconds. `/api/health` reads it and reports `workerStatus: "ok" | "stale" | "unknown"` (stale = last heartbeat > 3 minutes ago). When stale, `/api/health` fires a fire-and-forget POST to `WORKER_STALE_WEBHOOK_URL` (if set) with a 1-hour cooldown.

**Fail-fast at startup:** `worker/index.ts` calls `validateKey()` (from `lib/crypto.ts`) and `validateSecret()` (from `lib/webhook.ts`) before starting the scheduler. If `ENCRYPTION_KEY` or `WEBHOOK_SECRET` are missing or too short, the worker exits immediately with a clear error instead of failing silently later.

**RouterOS traffic measurement:** `/interface/monitor-traffic` is a streaming command and does not accept `=count=` via the API. Instead, `worker/monitors/link-traffic.ts` reads `rx-byte`/`tx-byte` from `/interface/print` twice with a 1-second interval and computes `(Δbytes × 8) = bits/second`.

**Credential encryption:** RouterOS credentials are encrypted with AES-256-GCM (IV random per operation) via `lib/crypto.ts` before being stored. `resolveRouterosCredentials()` decrypts them at use time in the worker. The API never returns plaintext credentials — `sanitizeDevice()` strips all credential fields from responses.

**Webhook authentication:** Link UP/DOWN endpoints (`/api/links/[id]/up|down`) are protected by HMAC-SHA256 tokens generated from `WEBHOOK_SECRET + linkId`. `lib/webhook.ts` exposes `generateWebhookToken()` and `verifyWebhookToken()` using `crypto.timingSafeEqual` to prevent timing attacks.

**JSON body parsing:** All POST/PUT API routes use `parseBody()` from `lib/parse-body.ts` instead of calling `req.json()` directly. This returns a typed `{ ok: true, data }` or `{ ok: false, response: NextResponse 400 }` so malformed JSON never leaks a 500 `SyntaxError`.

**Rate limiting:** `middleware.ts` applies a 10-request / 15-minute limit per IP on `POST /api/auth/callback/credentials`. State is in-process memory — does not survive restarts. Acceptable for single-instance use.

**shadcn/ui v4 uses Base UI:** The `Button` component does not support `asChild`. Use `buttonVariants()` with a Next.js `<Link>` when you need a link styled as a button. For dialogs, use the `render` prop on Base UI trigger components.

**Authentication middleware:** `middleware.ts` protects all routes except `/login` and `/api/auth/*`. The session is JWT-based, no database sessions.

**`GET /api/devices` supports `?type=` filter** — pass a `DeviceType` value (e.g. `?type=MIKROTIK`) to filter by device type. Used by the link form to populate the Mikrotik dropdown.

**Structured logging:** The worker uses `lib/logger.ts` (`log("info"|"warn"|"error", msg, ctx)`) which emits JSON to stdout. Never use `console.log` directly in `worker/`.

### File Structure

```
app/
  (auth)/login/           # Login page (public)
  (dashboard)/            # All protected pages (layout checks session)
    page.tsx              # Overview dashboard: KPIs, system health, links table,
                          #   incidents timeline, device grid — polls every 30s
    devices/
      page.tsx            # Device list table
      [id]/page.tsx       # Device detail with charts
      [id]/edit/page.tsx  # Edit form
      new/page.tsx        # Create form
    links/
      page.tsx            # Link management: table with bandwidth utilization,
                          #   form with RouterOS config + contracted bandwidth
      [id]/page.tsx       # Link detail with traffic card
    incidents/
      page.tsx            # Incidents history page (paginated)
    security/
      page.tsx            # Security findings from SECURITY_REPORT.md (static, no DB)
    profile/
      page.tsx            # User profile + 2FA self-management (all roles)
    changelog/
      page.tsx            # Release history — RELEASES array is source of truth
    manual/
      page.tsx            # User manual — 10 sections, accessible to all roles
    dev-manual/
      page.tsx            # Developer manual — architecture and patterns (ADMIN only)
    test-manual/
      page.tsx            # Test strategy manual — 12 sections covering all suites (ADMIN only)
    users/
      page.tsx            # User management: create, edit, 2FA toggle (ADMIN only)
    system/
      page.tsx            # DB metrics and log retention control (ADMIN only)
    audit/
      page.tsx            # Audit trail with filters and CSV export (ADMIN only)
  api/
    auth/[...nextauth]/   # NextAuth handler
    devices/              # GET all (supports ?type=), POST create
    devices/[id]/         # GET one, PUT update, DELETE
    devices/bulk/         # POST bulk-create by IP range
    status/[deviceId]/    # GET history (query: ?hours=24)
    health/               # GET system health + worker liveness (WorkerHeartbeat)
    counts/               # GET lightweight device/link counts for sidebar badges (polled)
    overview/             # GET sparklines + link segments for dashboard
    incidents/            # GET paginated incident list derived from StatusHistory
    timeline/             # GET unified event timeline (devices + links, ?hours=24)
    links/                # GET all, POST create
    links/[id]/           # GET one, PUT update, DELETE
    links/[id]/up|down    # Webhook endpoints (HMAC-SHA256, no session required)
    links/[id]/events/    # GET link event history
    links/test-traffic    # POST: validate RouterOS connection before saving

worker/
  index.ts                # Entry point — fail-fast validation, SIGTERM/SIGINT, graceful shutdown
  scheduler.ts            # Per-device setInterval + pollLinks() every 60s + WorkerHeartbeat
  monitors/
    ping.ts               # ICMP via `ping` package
    http.ts               # HTTP fetch check
    snmp.ts               # SNMP v2c via `net-snmp`
    routeros.ts           # RouterOS API via `routeros` package
    link-traffic.ts       # RouterOS two-sample traffic measurement

lib/
  db.ts                   # Prisma client singleton
  auth.ts                 # NextAuth configuration (validates NEXTAUTH_SECRET on load)
  auth.config.ts          # Shared NextAuth config (used by middleware + API route)
  crypto.ts               # AES-256-GCM encrypt/decrypt + validateKey() fail-fast
  webhook.ts              # HMAC-SHA256 token generation/verification + validateSecret()
  parse-body.ts           # Safe req.json() wrapper — returns 400 instead of 500 on bad JSON
  logger.ts               # Structured JSON logging for worker (log(level, msg, ctx))
  format.ts               # formatUptime, formatResponseTime, formatPercent
  pdf-export.ts           # exportToPdf(element) — SVG rasterization + oklch→rgb + html2pdf.js
  utils.ts                # cn() className helper
  schemas/
    device.ts             # Zod schemas for device create/update/bulk

components/
  device-card.tsx         # Card used in the overview grid
  device-detail-drawer.tsx  # Slide-in drawer with device details + sparkline
  device-form.tsx         # Shared form for create/edit (react-hook-form + zod)
  device-type-badge.tsx   # Colored badge per device type
  link-detail-drawer.tsx  # Slide-in drawer with link details + live traffic tiles
  status-badge.tsx        # Online/Offline badge
  metrics-chart.tsx       # Recharts AreaChart wrapper
  ping-chart.tsx          # Ping history chart
  ping-sparkline.tsx      # Inline SVG sparkline for ping history
  topbar.tsx              # Page header with title, subtitle, live indicator
  sidebar.tsx             # Navigation sidebar
  ui/                     # shadcn components (do not edit manually)

prisma/
  schema.prisma           # DB schema (see summary below)
  migrations/             # Migration history (PostgreSQL)

scripts/
  create-user.ts          # CLI to create/update admin user
  migrate-credentials.ts  # One-time migration of plaintext credentials to AES-256-GCM

docs/
  openapi.yaml            # OpenAPI 3.1 spec for all 17 API endpoints

__tests__/
  api/                    # API route tests
    devices.test.ts       # GET/POST /api/devices
    devices-id.test.ts    # GET/PUT/DELETE /api/devices/[id]
    devices-bulk.test.ts  # POST /api/devices/bulk
    health.test.ts        # GET /api/health (worker liveness, uptime%)
    incidents.test.ts     # GET /api/incidents (pagination, filters)
    links.test.ts         # GET/POST/PUT/DELETE /api/links + [id]
    links-webhook.test.ts # GET /api/links/[id]/up|down (HMAC verification)
    overview.test.ts      # GET /api/overview (sparklines, link segments)
    status.test.ts        # GET /api/status/[deviceId]
    timeline.test.ts      # GET /api/timeline (event types, dedup, NaN guard)
  worker/                 # Worker monitor tests
    ping.test.ts
    http.test.ts
    snmp.test.ts
    routeros.test.ts
    link-traffic.test.ts
    scheduler.test.ts     # shutdown drain, idempotency
  lib/                    # Library unit tests
    crypto.test.ts        # encrypt/decrypt roundtrip, validateKey
    webhook.test.ts       # token generation, HMAC verification, validateSecret
    logger.test.ts        # JSON output, level routing
    format.test.ts        # formatUptime, formatResponseTime, formatPercent
  components/             # React component tests
    device-card.test.tsx
    status-badge.test.tsx
  integration/
    webhook-flow.test.ts  # End-to-end webhook UP/DOWN flow
  security/
    api-auth.test.ts      # 401 enforcement on all protected routes
```

### Database Schema Summary

- `Device` — device config (IP, type, location, enabled protocols, encrypted credentials, check interval)
- `DeviceStatus` — one row per device, latest check result (upserted on each check)
- `StatusHistory` — append-only log of each check result, indexed by `(deviceId, timestamp)`
- `WorkerHeartbeat` — singleton row upserted every 60s by the worker; read by `/api/health` to detect crashes
- `User` — bcrypt-hashed credentials for dashboard login (has `version` field for optimistic locking)
- `Link` — internet link config; fields include `location`, `isOnline`, `mikrotikDeviceId` (FK→Device), `mikrotikInterface`, `downloadBps`, `uploadBps`, `latencyMs` (live traffic from worker), `contractedDownloadBps`, `contractedUploadBps` (manually configured bandwidth ceiling)
- `LinkEvent` — UP/DOWN webhook events per link, indexed by `(linkId, timestamp)`

### Adding a New Monitor Protocol

1. Create `worker/monitors/yourprotocol.ts` returning a typed result interface
2. Import and call it in `worker/scheduler.ts` inside `runChecks()` using `Promise.allSettled`
3. Map the result fields to the DB write (upsert `DeviceStatus`, insert `StatusHistory`)
4. Add enable/config fields to `prisma/schema.prisma`, run `npm run db:migrate`
5. Expose toggle + config fields in `components/device-form.tsx`

### Link Bandwidth Utilization

The `BandwidthCell` component (used in the dashboard and links table) shows current traffic vs contracted bandwidth with a color-coded progress bar:
- **Green** — below 70% utilization
- **Amber** — 70–90%
- **Red** — above 90%

Contracted values are stored in bps but entered/displayed in Mbps in the form.

### Security Architecture

- **Secrets validation at startup:** `validateKey()` and `validateSecret()` are called before `startScheduler()`. Missing or weak secrets abort the worker immediately.
- **Credential storage:** `routerosUserEnc` / `routerosPassEnc` fields store AES-256-GCM ciphertext. Plaintext fields (`routerosUser`, `routerosPass`) exist only as transient schema artifacts and are never persisted post-migration.
- **API credential stripping:** `sanitizeDevice()` removes all four credential fields from every API response, replacing them with `hasRouterosCredentials: boolean`.
- **Webhook tokens:** Generated as `HMAC-SHA256(WEBHOOK_SECRET, linkId)`, verified with `timingSafeEqual`. No session required on webhook endpoints — they are designed for external integrators (Zabbix, Nagios, scripts).
- **Rate limiting:** Login endpoint is capped at 10 attempts / 15 min per IP. State is in-memory (see SEC-014 in SECURITY_REPORT.md for known limitation).
- **Security report:** All known findings (open and resolved) are tracked in `SECURITY_REPORT.md` and displayed at `/security`. Edit that file directly to add new findings — no database or scripts required.
- **SSRF prevention:** `controllerIpSchema` in `lib/schemas/device.ts` rejects loopback, link-local, and multicast IPs for UniFi/Omada controller fields.
- **Webhook audit trail:** Link UP/DOWN webhook calls are logged to `AuditLog` with source IP and `username: "webhook"`.
