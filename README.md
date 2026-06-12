# Order Tracker — UI Prototype

A mobile-first, click-through prototype of the Order Tracker concept (see
REQUIREMENTS.md v0.3): a local business owner takes orders on-site, shares
them on WhatsApp, and ticks items off as they're fulfilled.

This is a **frontend-only prototype** — there is no backend. All data lives
in an in-memory store persisted to `localStorage`, pre-seeded with demo
customers, catalog items and orders so every screen has realistic content.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL on a phone (or use your browser's mobile viewport).
Sign in with **any email and password**, complete the one-time business
onboarding, and you land in the app.

## What's clickable

- **Auth & onboarding** — fake email/password sign-in, blocking business
  profile setup (name, address, phone, PAN/GST).
- **Orders** — Pending/Completed tabs, search by order number or customer,
  newest first.
- **Create order** — pick a customer (searchable bottom sheet with inline
  "add new customer"), add items via catalog autocomplete or freeform text,
  per-order "include prices" toggle with live subtotal, order notes.
- **Fulfilment** — tick checkboxes on a pending order; strikethrough + fade,
  auto-move to Completed with a toast when the last item is ticked.
- **Edit/delete rules** — editing locks once fulfilment starts; deletes are
  soft. Completed orders can be **reopened** (ticks preserved).
- **Share on WhatsApp** — PDF/image choice, rendered document preview
  (business header, item table, ₹ totals), hands off to the OS share sheet
  via the Web Share API where available; copyable customer phone hint.
- **Customers** — searchable CRUD, detail screen with order history,
  soft delete (orders keep a snapshot).
- **Catalog** — searchable CRUD with units and default prices,
  archive/restore.
- **Settings** — edit business profile, CSV export (orders/customers/
  catalog — real downloads), sign out, reset demo data.

## Stack

- Vite + React 19 + TypeScript
- [HeroUI v3](https://heroui.com) (React Aria based) + Tailwind CSS v4
- react-router for client routing
- Vitest + Testing Library smoke tests (`npm test`) that click through
  sign-in → onboarding → fulfilment → order creation in jsdom

## Out of scope (prototype)

Real auth/API/D1 persistence, actual PDF/PNG generation, PWA install &
offline resilience — see REQUIREMENTS.md §5 for the production
architecture these would follow.
