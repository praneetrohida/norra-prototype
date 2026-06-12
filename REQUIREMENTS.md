# Order Tracker — Requirements (v0.3)

Mobile-first web app for a local business owner to take orders from end customers on-site, share them on WhatsApp, and tick items off as they're fulfilled.

All major v1 decisions are locked in (see §7 for the confirmed list). The architecture is in §5; data model in §6. Anything still open is called out inline.

Working name "Order Tracker" with a neutral palette — to be re-skinned when branding is decided.

---

## 1. Users and roles

**Single role: business owner.** One account per business. The owner is the only user.

- No staff invites in v1.
- No admin / super-admin role.
- Multi-user support is explicitly out of scope for v1 but the data model should leave room for it (orders belong to a business, not a user).

## 2. High-level flow

1. Owner signs up, completes business onboarding (one-time).
2. Owner adds end customers to their customer list (ongoing).
3. On-site with an end customer, owner creates an order: picks the customer, adds items + quantities, optionally adds prices, saves.
4. Order is assigned an order number and lands in **Pending**.
5. Owner shares the order on WhatsApp as PDF or image.
6. Later, owner opens the pending order and checks off items as they're fulfilled.
7. When the last item is checked, the order auto-moves to **Completed**.

## 3. Functional requirements

### 3.1 Sign-up & auth

- **Email + password** sign-up and sign-in.
- Password reset via email link.
- Session persistence so the owner stays logged in across visits (token in secure cookie or local storage; backend on Cloudflare).
- One owner account per business; the email used at sign-up is the account identifier.

### 3.2 Onboarding & business profile

After sign-up, the owner sets up their business once. Editable later from a Settings screen.

- Business name (required)
- Address (multi-line)
- Contact phone (required — also used as default WhatsApp number on shared orders)
- Contact email (optional; defaults to the sign-up email)
- PAN number (optional, prints on PDF if filled in)
- GST number (optional, prints on PDF if filled in)

Onboarding is a blocking step: until business profile is complete, the rest of the app is gated.

### 3.3 End customer management

A simple CRUD list of end customers, scoped to the business.

**Fields:**
- Name (required)
- Phone number (required — needed to share orders on WhatsApp directly to them)
- Address (optional, multi-line)
- Notes (optional, freeform)

**Screens:**
- Customer list — searchable by name or phone.
- Customer detail — shows their info + list of their past orders (pending and completed).
- Create / edit customer.
- Delete customer — soft delete; existing orders retain a snapshot of customer details so deletion doesn't break history.

### 3.4 Item catalog

Owner maintains a master list of items used to speed up order entry. Catalog is optional — orders can also use freeform items.

**Catalog item fields:**
- Name (required)
- Unit (optional — e.g., kg, piece, box)
- Default price (optional)
- Active / archived flag (so old items can be hidden without breaking past orders)

**Screens:**
- Catalog list — searchable, with quick-add.
- Create / edit item.
- Archive item (soft delete; past orders keep the item name/price as a snapshot).

### 3.5 Creating an order

The core flow. Optimised for one-handed mobile use while standing in front of a customer.

**Steps in the create-order screen:**
1. Pick end customer (search + select; option to "Add new customer" inline if not in list).
2. Add items. Each line has:
   - Item name — autocomplete from catalog; if no match, the typed text becomes a freeform item on this order.
   - Quantity (required, positive number, decimals allowed for kg-style units).
   - Unit (auto-filled from catalog, editable).
   - Price per unit (optional — see §3.6).
3. Optional order-level notes (e.g., "deliver before 6pm").
4. Toggle: include prices on this order (yes / no). When yes, each line shows price and the order shows a subtotal.
5. Save → order is assigned a number and lands in Pending.

**Order number format:** monotonically increasing per business, zero-padded, e.g. `#000123`. Counter never resets.

**Validation:**
- At least one item required.
- Customer required.
- Quantity > 0 for every line.

### 3.6 Pricing (optional per order)

Prices are optional and decided per order.

- When the "include prices" toggle is off, the order, list view, and shared file show only item names and quantities.
- When on, each line carries a price (defaulted from the catalog if available, editable), and the order shows a total. **No tax handling in v1** — the line total is simply `qty × unit_price` and the order total is the sum.
- Pricing toggle is per order, not per business — owner can mix priced and non-priced orders.
- All prices render with a hardcoded **₹** symbol (e.g. `₹1,250.00`). Two decimal places.

### 3.7 Order list & detail

**Pending list** and **Completed list** are the two main tabs.

- Each row shows: order number, customer name, item count, date created, total (if priced).
- Sort: newest first.
- Search: by order number or customer name.
- Tap row → order detail.

**Order detail (pending):**
- Header: order number, customer (tappable to view customer), date, optional total.
- Item list with a checkbox next to each.
- Tap a checkbox → item marked fulfilled. Visual: strikethrough + faded.
- When all items are checked → order auto-moves to Completed with a "Marked as completed" toast and is no longer editable.
- Actions: Share (WhatsApp), Edit (only if no items fulfilled yet — see §3.9), Delete.

**Order detail (completed):**
- Read-only by default.
- Actions: Share (WhatsApp), **Reopen**, Delete.
- **Reopen** moves the order back to Pending and clears `completed_at`. Per-line fulfilment state is preserved, so the owner can untick whichever item was wrong and continue. Confirmation dialog before reopening.

### 3.8 Sharing on WhatsApp

When the owner taps Share, they're given two options: **Share as PDF** and **Share as image**. The generated file is then handed to the **OS share sheet** via the Web Share API (`navigator.share` with a `File`), from which the owner picks WhatsApp (or any other target) and the customer's chat.

This is the practical path because WhatsApp deep links (`wa.me/<phone>?text=…`) carry text only and cannot attach files. The OS share sheet works on Android Chrome and iOS Safari for file sharing on supported devices; on platforms without `navigator.share`, the app falls back to a download button so the owner can attach the file manually.

The customer's saved phone number is shown next to the Share button as a copyable hint, so the owner can quickly find the right chat in WhatsApp.

**Shared file contents (same layout for both formats):**
- Business header: name, address, phone, PAN and GST (if filled in).
- Order number and date.
- Customer name (and phone / address if present).
- Item table: name, quantity, unit; unit price + line total if pricing is on.
- Order total (if pricing is on), rendered with ₹.
- Order notes (if any).
- Footer: "Generated by Order Tracker" (replaceable when branding is locked).

The image is a single rendered PNG of the same layout, sized for WhatsApp's preview.

### 3.9 Edit & delete

- **Edit order:** allowed only while pending AND no items are fulfilled yet. Once the first checkbox is ticked, the order content is frozen — only the fulfilment state can change. This keeps history honest.
- **Delete order:** soft delete. Removed from lists but retained in the DB so order numbers stay unique and stats stay consistent.
- **Edit customer / catalog item:** always allowed. Past orders keep a snapshot of the values at order-creation time.

### 3.10 Fulfilment behaviour

- Order stays in Pending until every item is ticked.
- When the last item is ticked, order auto-moves to Completed.
- No separate "partial" state.
- No manual "close with unfulfilled items" action in v1.

## 4. Non-functional requirements

- **Mobile-first PWA.** Designed primarily for one-handed use on a phone in portrait. Desktop is supported but secondary.
- **Installable.** Add-to-home-screen with app icon and splash screen.
- **Save-resilient.** If the network drops mid-save, the order is not lost — the client retries automatically. Full offline compose (creating orders with no network) is explicitly out of scope for v1.
- **English only** in v1. No i18n framework wired in; revisit if real demand surfaces.
- **Fast cold start** on mid-range Android (<3s to interactive on 4G).
- **Accessible:** WCAG 2.1 AA targets — tap targets ≥44px, color contrast ≥4.5:1 for text, screen-reader labels on all icon-only buttons.
- **Data ownership.** Owner can export all orders + customers + catalog as CSV from Settings. (Trust-builder for a small-business app.)

## 5. Architecture & tech stack

The entire app runs on Cloudflare's edge platform — no separate origin server, no VPS, no container runtime.

### 5.1 Frontend

- **Vite + React + TypeScript** — build tooling and UI framework.
- **TanStack Router** — file-based, type-safe client routing.
- **TanStack Query** — server-state cache, retries, optimistic updates.
- **TanStack Form** — form state with Zod validation.
- **Tailwind CSS** + **HeroUI** — utility-first styling with HeroUI's runtime component library (built on React Aria primitives). Easy to re-skin when branding lands via HeroUI's theme tokens.
- **vite-plugin-pwa** — service worker, web app manifest, install prompts.
- **date-fns** — date formatting and arithmetic.
- **libphonenumber-js** (mobile build) — phone number validation and formatting.

Hosted on **Cloudflare Pages** (static build, edge-cached, deployed from git).

### 5.2 Backend (API)

- **Cloudflare Workers** — serverless functions at the edge.
- **Hono** — minimal, type-safe web framework. Routes are organised by resource: `/auth`, `/business`, `/customers`, `/items`, `/orders`.
- **Hono RPC client (`hc`)** — the frontend imports the server's type to get end-to-end type safety with no codegen step.
- **Zod** + `@hono/zod-validator` — request/response validation and the single source of truth for shapes shared between client and server.

### 5.3 Data layer

- **Cloudflare D1** — managed SQLite, single primary region (closest to the customer base). Read replicas at the edge.
- **Drizzle ORM** + **Drizzle Kit** — schema definition in TypeScript, type-safe queries, generated migrations.
- **JSON columns** are stored as TEXT and parsed via Drizzle helpers (used for `order.customer_snapshot`).
- **FTS5** virtual tables used for customer-name and order-number search if simple `LIKE` becomes slow.

See §6 for the logical data model.

### 5.4 Auth & sessions

- **better-auth** running inside the Hono Worker. Handles email + password sign-up, sign-in, password reset, and session lifecycle.
- Sessions stored in D1 (server-side), so logout invalidates immediately on all devices.
- Session token in an **HTTP-only, Secure, SameSite=Lax cookie**.
- Password hashing: argon2id (better-auth default on Workers).

### 5.5 Email delivery

- **Resend** for transactional email (password reset, future verification mails).
- One sender domain, configured via DNS records that better-auth + Resend will provide.

### 5.6 PDF & image generation

Both render from a single shared template definition (one source of truth for layout):

- **PDF: pdf-lib** in the Worker. Pure JS, runs in the V8 isolate. Vector output, small file size.
- **Image: workers-og** (npm package by kvnang) in the Worker. Takes JSX-like input, produces a PNG suitable for WhatsApp's preview.

Generated files are returned directly in the response. Not cached server-side in v1 (orders are small; regenerating is cheap).

### 5.7 File sharing

Handled entirely on the client via the **Web Share API** with a `File` payload (see §3.8). No file is uploaded anywhere; the byte stream from the Worker goes straight into the share sheet.

### 5.8 Environments & deployment

- **dev** (local) — Wrangler in local mode with a local D1 file; Vite dev server hits the Worker on a local port.
- **prod** — single production deployment on Cloudflare.
- No dedicated staging environment in v1. Preview deployments per-PR via Cloudflare Pages cover most of the same need.
- Secrets managed via `wrangler secret` (prod) and `.dev.vars` (local).

### 5.9 Testing

- **Vitest** for client unit/component tests.
- **@cloudflare/vitest-pool-workers** for Worker tests (run inside Miniflare, with a real D1 in-memory).
- Smoke E2E via Playwright is a nice-to-have, not required for v1.

### 5.10 Observability

- **Cloudflare built-in Logs** + Workers Trace Events for v1. Free, accessible from the Cloudflare dashboard.
- No third-party error tracking (Sentry, etc.) in v1. Revisit once there are real users and real bug reports.

### 5.11 Folder layout (target)

```
apps/
  web/                 — Vite + React frontend
    src/routes/        — TanStack Router file-based routes
    src/components/    — HeroUI compositions + app components
    src/lib/           — share helpers, formatters, libphonenumber wrapper
  api/                 — Cloudflare Worker (Hono)
    src/routes/        — Hono route modules
    src/db/            — Drizzle schema + migrations
    src/auth/          — better-auth config
    src/share/         — pdf-lib + workers-og renderers (kvnang/workers-og)
    src/lib/           — zod schemas shared via export
packages/
  shared/              — types and zod schemas re-exported to both apps
```

## 6. Data model (first cut)

```
business        (id, name, address, phone, email, pan_no, gst_no, created_at)
owner_account   (id, business_id, auth_identifier, name, created_at)
end_customer    (id, business_id, name, phone, address, notes, deleted_at)
catalog_item    (id, business_id, name, unit, default_price, archived_at)
order           (id, business_id, number, customer_id, customer_snapshot, status,
                 priced, notes, total, created_at, completed_at, deleted_at)
order_line      (id, order_id, item_name, catalog_item_id_nullable, qty, unit,
                 unit_price_nullable, fulfilled_at_nullable)
```

Key shapes:
- `order.status` is one of `pending` | `completed`.
- `order.customer_snapshot` is a frozen JSON copy of the customer's name/phone/address at order time — so editing or deleting the customer never rewrites history.
- `order_line.fulfilled_at` is set when the checkbox is ticked. Order moves to `completed` (and `completed_at` is stamped) when every line has a `fulfilled_at`.

## 7. Confirmed decisions

| # | Topic | Decision |
|---|---|---|
| 1 | **Auth method** | Email + password, with email-link password reset. |
| 2 | **End-customer fields** | Name (required), phone (required), address, notes. |
| 3 | **Share format** | Both PDF and image — user picks at share time. |
| 4 | **WhatsApp delivery** | Web Share API → OS share sheet (no deep link with file attached). |
| 5 | **Tax handling** | None in v1. Line total = qty × unit price; order total = sum. |
| 6 | **Order numbering** | `#000123`, monotonically increasing per business, never resets. |
| 7 | **Reopen completed order** | Yes, available from completed-order detail; preserves per-line fulfilment state. |
| 8 | **Offline mode** | Save-resilience only. No full offline compose in v1. |
| 9 | **Tech stack** | See §5. Vite + React + TanStack on Cloudflare Pages; Hono + D1 + Drizzle + better-auth + Resend on Workers. |
| 10 | **Languages** | English only. |
| 11 | **Branding** | Neutral placeholder ("Order Tracker") for now; re-skin when decided. |
| 12 | **Currency** | Hardcoded ₹ (Indian rupee), two decimals. |

## 8. Out of scope for v1

Calling these out so they don't quietly creep in:

- Multi-user / staff invites.
- Inventory tracking (stock levels, low-stock alerts).
- Payments, invoicing beyond a simple total, payment status.
- Delivery routing / driver assignment.
- Reports & analytics dashboard.
- Push notifications.
- Multi-business support per owner account.

## 9. Suggested v1 milestones

1. **Auth + onboarding** — sign in, business profile setup.
2. **Customers + catalog CRUD.**
3. **Create order + order list/detail (no pricing, no sharing yet).**
4. **Fulfilment (checkboxes, auto-complete).**
5. **Pricing toggle + totals.**
6. **PDF + image generation + WhatsApp share.**
7. **CSV export + settings polish.**
8. **PWA install, offline-save resilience, accessibility pass.**

---

*v0.3 — architecture and WhatsApp share approach locked in. See SCAFFOLDING.md for the project bootstrap guide.*
