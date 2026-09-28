# 📘 Homeline — Project Documentation

Full technical reference for the Homeline e-commerce portfolio project.
Last verified against commit `8ca361d` on **2026-09-28**.

> **Related docs:** [`README.md`](./README.md) (setup + overview — note it is partly
> outdated, see [§12](#12-known-issues--gaps)) · [`PRD.md`](./PRD.md) ·
> [`SMOKE_TEST.md`](./SMOKE_TEST.md) (latest test run) ·
> [`IMAGE_COVERAGE.md`](./IMAGE_COVERAGE.md) ·
> `docs/system-architecture.html` (visual diagram)

---

## Table of contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Project structure](#3-project-structure)
4. [Getting started](#4-getting-started)
5. [Data model](#5-data-model)
6. [API reference](#6-api-reference)
7. [Frontend](#7-frontend)
8. [Features](#8-features)
9. [Authentication and its limits](#9-authentication-and-its-limits)
10. [Deployment](#10-deployment)
11. [Scripts reference](#11-scripts-reference)
12. [Known issues and gaps](#12-known-issues--gaps)
13. [Test coverage](#13-test-coverage)

---

## 1. Overview

Homeline is an eco-friendly kitchenware storefront. A single React SPA serves two distinct
audiences behind one route tree:

- **The storefront** — catalog browsing, search, product detail, cart, checkout, order
  tracking, and customer reviews.
- **The Inventory dashboard** (`/inventory`) — a back-office view with stock editing,
  restocking, a sales report with charts and CSV/print export, an activity audit trail,
  a customer list, and promo-code management.

This is a portfolio project. It is a **demonstration**, not a production system: the
"login" is client-side only, there is no payment processor, and the order pipeline stops at
recording the sale. See [§9](#9-authentication-and-its-limits) and
[§12](#12-known-issues--gaps) before reusing any of it.

**Stack:**

| Layer | Technology |
| ----- | ---------- |
| Frontend | React 18.3, Vite 5.4, React Router 7, Tailwind CSS 3.4, Lucide React |
| State | React Context API (`CartContext`, `DataContext`) — no Redux |
| Backend | Node.js 20, Express 4.18, CORS |
| Database | Supabase (Postgres) via `@supabase/supabase-js` + Row Level Security |
| Tooling | Vite, PostCSS, oxlint, Docker, Docker Compose |

**Scale of the seeded catalog:** 24 products, 7 categories, 4 promo codes.

---

## 2. Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  Client  (Vite dev :3000)   │         │  Server  (Express :5000)     │
│                             │         │                              │
│  React SPA                  │  /api   │  21 REST routes              │
│  ├─ DataContext             │────────►│  ├─ snake_case → camelCase   │
│  ├─ CartContext             │  proxy  │  ├─ input validation        │
│  └─ React Router            │  (dev)  │  └─ rpc() → Postgres fns    │
│                             │         │                              │
│  localStorage:              │         │  @supabase/supabase-js      │
│  ├─ homeline-cart           │         │  (anon publishable key)     │
│  ├─ homelineUsers           │         │                              │
│  └─ homelineCurrentUser     │         └──────────────┬───────────────┘
└─────────────────────────────┘                        │
                                                    RLS policies
                                          ┌─────────────▼─────────────┐
                                          │      Supabase Postgres    │
                                          │  9 tables · 3 RPCs        │
                                          │  SECURITY DEFINER fns     │
                                          └───────────────────────────┘
```

### Data flow: catalog

1. `DataProvider` (`client/src/context/DataContext.jsx`) fetches `/api/products` and
   `/api/categories` once on mount, in parallel via `Promise.all`.
2. The server queries Supabase and maps every row through `mapProduct()`
   (`server.js:20`) to convert snake_case columns to the camelCase shape the UI expects.
3. There is **no hardcoded fallback data.** If the API fails, the storefront renders empty
   and `error` is set — a deliberate choice so the database stays the single source of
   truth.
4. `refresh()` re-fetches after any mutation (checkout, stock edit) without a full reload.

### Data flow: checkout

This is the most important path in the app.

1. The client `POST`s the cart to `/api/orders`.
2. The server validates the payload, then calls the **`record_order`** Postgres function
   with the Supabase client.
3. `record_order` is `SECURITY DEFINER` and runs as one transaction: it validates stock for
   every line, creates the `orders` row, creates `order_items`, decrements `products.stock`,
   and writes a `stock_movements` audit row per product. If any line is short on stock it
   rolls back and returns `{ ok: false, insufficient: [...] }` → HTTP `409`.
4. The server maps that to `201`, or `409` on insufficient stock.
5. The client shows the order number and calls `refresh()` so stock badges update.

Because step 3 is a single Postgres transaction, stock can never be decremented without the
corresponding order existing.

### Proxy vs. direct API calls

The client reads `import.meta.env.VITE_API_URL || '/api'`. With no `.env` present, requests
go to the relative path `/api` and the Vite dev server proxies them to
`http://localhost:5000` (`client/vite.config.js`). In production you **must** set
`VITE_API_URL` to the absolute backend URL — see [§10](#10-deployment).

---

## 3. Project structure

```
e-commerce/
├── client/                        # React frontend
│   ├── public/                    # static assets, logo, favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── home/              # 10 home page sections
│   │   │   ├── inventory/         # Sales, SalesCharts, Activity, Customers, Promos, ProductForm
│   │   │   ├── layout/            # Header, Footer, CartSidebar, Layout
│   │   │   ├── product/           # ProductCard, ProductGrid, ColorSwatches, ReviewsSection
│   │   │   └── ui/                # Button, Badge, SectionTitle, Toast, HelpChatbot
│   │   ├── context/               # CartContext, DataContext
│   │   ├── data/images.js         # static image map
│   │   ├── hooks/                 # useCart, useDebounce
│   │   ├── pages/                 # 24 route components
│   │   ├── utils/                 # orders.js (API helpers), stock.js (formatters)
│   │   ├── App.jsx                # router + auth gate
│   │   ├── main.jsx               # provider composition
│   │   └── index.css
│   ├── Dockerfile, vite.config.js, tailwind.config.js, vercel.json
│
├── server/                        # Express backend
│   ├── server.js                  # the entire API (21 routes, ~630 lines)
│   ├── supabase/seed.sql          # full schema + RLS + RPCs + seed data
│   ├── scripts/                   # seed.js, diagnose.js
│   ├── Dockerfile, .env.example
│
├── docs/system-architecture.html
├── docker-compose.yml
├── PRD.md, README.md, SMOKE_TEST.md, IMAGE_COVERAGE.md
```

---

## 4. Getting started

### Prerequisites

Node.js 18+ (Docker images use Node 20) and npm. A Supabase project with the schema from
`server/supabase/seed.sql` applied.

### Backend

```bash
cd server
npm install
cp .env.example .env      # then fill in the Supabase values below
npm run dev               # or: npm start
```

`server/.env`:

```ini
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...   # or the legacy sb_ anon JWT
```

### Frontend

```bash
cd client
npm install
npm run dev               # http://localhost:3000
```

No `.env` is required for local work — the dev server proxies `/api` to port 5000.

### Database setup

Open the Supabase dashboard → **SQL Editor** → paste `server/supabase/seed.sql` → **Run**.
The file is idempotent: tables use `create table if not exists`, the three functions use
`create or replace`, and every insert uses `on conflict`. Re-running it is safe.

### Docker

```bash
docker compose up --build
```

> ⚠️ **`docker compose up` is currently broken for the API.** The `server` service in
> `docker-compose.yml` passes only `PORT` and `NODE_ENV` — it does **not** pass
> `SUPABASE_URL` or `SUPABASE_ANON_KEY`. The server therefore starts in an unconfigured
> state (`{"ok":true,"database":"unconfigured"}`) and **every data route returns `503`**.
> Add the two Supabase variables to the `server.environment` block to fix it. The client
> service is unaffected.

### Verify the setup

```bash
curl http://localhost:5000/api/health
# {"ok":true,"database":"supabase"}
```

`"unconfigured"` here means the env vars never reached the process.

---

## 5. Data model

Source of truth: `server/supabase/seed.sql`. Nine tables, all with RLS enabled.

### Tables

| Table | Purpose | Key columns |
| ----- | ------- | ----------- |
| `products` | Catalog | `id` (text PK), `slug` (unique), `price`, `category`, `image`, `colors` (jsonb), `stock`, `sku`, `reorder_level`, `cost_price`, `sort_order`, flags `featured`/`best_seller`/`new_arrival` |
| `categories` | Catalog nav | `id` (text PK), `name`, `slug`, `description`, `image`, `sort_order` |
| `orders` | One row per checkout | `id` (identity), `order_number` (unique), `customer_name`, `customer_email`, `total`, `status`, `created_at` |
| `order_items` | Order lines | `order_id` (FK cascade), `product_id` (FK), `unit_price`, **`cost_price`**, `quantity`, `subtotal` |
| `stock_movements` | Append-only audit log | `product_id` (FK), `change_type` (`sale`/`restock`/`adjustment`), `quantity` (≠0), `reason`, `stock_after` |
| `reviews` | Customer reviews | `product_id` (FK), `customer_name`, `rating` (1–5 CHECK), `comment` |
| `promo_codes` | Discount codes | `id` (text PK, uppercase), `discount_type` (`percent`/`fixed`), `value` (>0), `min_spend`, `expires_at`, `active` |
| `newsletter_subscribers` | Email signups | `email` (unique) |
| `contact_messages` | Contact form | `name`, `email`, `message` |

Two design decisions worth knowing:

- **`order_items.cost_price` is frozen at sale time** (`seed.sql:400`). Profit in the Sales
  report is computed from this snapshot, so editing a product's cost later never rewrites
  historical margins.
- **`stock_movements` is append-only.** Stock is never edited directly — it moves only
  through a function that also writes a movement row explaining why. `stock_after` records
  the resulting balance, so the log can be replayed to reconstruct any balance.

### Database functions (`SECURITY DEFINER`)

All stock and order writes go through three functions. Because they are `SECURITY DEFINER`
and owned by `postgres`, they bypass RLS — the anon key cannot write to `orders`,
`order_items`, or `stock_movements` at all, it can only *call* these.

**`record_order(p_customer_name, p_customer_email, p_total, p_items jsonb) → jsonb`**
Validates stock for every item, then in one transaction creates the order, its line items,
decrements stock, and writes a `sale` movement per product. Returns
`{ok: true, order_number, order_id, total}` or `{ok: false, insufficient: [ids]}`.
Assigns the order number from the `order_number_seq` sequence as
`HML-YYYYMMDD-NNNN` (sequence starts at 1000).

**`cancel_order(p_order_number) → jsonb`**
Only cancellable **within 24 hours** of creation. Restores stock for every line, writes an
`adjustment` movement per product, sets `status = 'cancelled'`. Returns `{ok: false,
message}` if already cancelled or the window has passed.

**`adjust_stock(p_product_id, p_delta, p_change_type, p_reason) → integer`**
Applies a signed delta and writes a movement. Raises if the result would go negative.
Returns the new stock level.

### Row Level Security

RLS is enabled on all nine tables. The intent is "public catalog, protected internals":

- `select` is public on `products`, `categories`, `orders`, `order_items`,
  `stock_movements`, `reviews`, `promo_codes`.
- `insert` is public on `newsletter_subscribers`, `contact_messages`, `reviews`,
  `promo_codes`, **`products`**.
- `update` is public on **`products`** and **`promo_codes`**.

⚠️ Those two bolded write policies mean **anyone with the anon key can create and edit
products and promo codes.** `seed.sql:298-301` acknowledges this as demo-only. Combined
with the client-side login, the Inventory dashboard provides no real protection. Tighten
these to an authenticated role before using real data.

---

## 6. API reference

Base URL: `http://localhost:5000/api`. All request and response bodies are JSON. CORS is
wide open (`app.use(cors())`).

If Supabase is unconfigured, every route except `/api/health` returns `503` with
`"Supabase is not configured"`.

### Health

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/health` | `{"ok":true,"database":"supabase"\|"unconfigured"}` |

### Products

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/products` | All products, ordered by `sort_order` |
| `GET` | `/products/:id` | Single product · `404` if unknown |
| `POST` | `/products` | Create. Requires `name`, `price` ≥ 0, `category`. Slug is generated and suffixed for uniqueness; `sku` auto-generated if omitted; `sort_order` defaults to 99 · `409` on slug collision |
| `PATCH` | `/products/:id` | Partial update · `400` if no valid fields · `404` if unknown |

`PATCH` accepts `name`, `category`, `badge`, `description`, `image`, `sku`, `price`,
`costPrice` (nullable), `reorderLevel`, `featured`, `bestSeller`, `newArrival`, `colors`.
Note it does **not** accept `stock` — stock moves only via the inventory endpoints, by
design.

### Categories

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/categories` | All categories, ordered by `sort_order` |

### Orders

| Method | Path | Notes |
| ------ | ---- | ----- |
| `POST` | `/orders` | Checkout. `201` with `{ok, total, order_id, order_number}` · `400` invalid payload · `409` insufficient stock with the offending IDs |
| `GET` | `/orders` | Last 200 orders with line items **and** a `summary` (orders, revenue, itemsSold, todayOrders, todayRevenue, weekRevenue) |
| `GET` | `/orders/:orderNumber` | Public track lookup by order number · `404` if unknown |
| `POST` | `/orders/cancel` | Body `{orderNumber}` · `409` if already cancelled or past the 24-hour window |

> ⚠️ **Response casing is inconsistent.** `POST /orders` returns snake_case
> (`order_id`, `order_number`); every other endpoint returns camelCase. The client reads the
> snake_case field correctly, but this is a footgun. See
> [§12](#12-known-issues--gaps).

### Inventory

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/inventory` | Same shape as `/products` (full product list) |
| `GET` | `/inventory/movements` | Last 200 audit rows, newest first, with joined product name + image |
| `PATCH` | `/inventory/:id` | Set an exact stock number · `400` unless an integer 0–99999 · `404` unknown product · returns `unchanged: true` when no-op |
| `POST` | `/inventory/restock` | Body `{id, quantity, reason?}` · quantity 1–10000 · `400` otherwise |

Both write paths log a `stock_movements` row. `PATCH` records `change_type: 'adjustment'`;
restock records `'restock'`.

### Reviews

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/reviews` | All reviews, newest first. Optional `?productId=` filter |
| `POST` | `/reviews` | Body `{productId, customerName, rating, comment?}` · rating must be an integer 1–5 · `201` |

### Promo codes

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/promos` | All codes, newest first |
| `POST` | `/promos` | Body `{id, discountType, value, minSpend?, expiresAt?}` · code uppercased · `discountType` is `percent` or `fixed` (defaults to `percent`) |
| `PATCH` | `/promos/:id` | Body `{active: boolean}` — enable/disable |

### Forms

| Method | Path | Notes |
| ------ | ---- | ----- |
| `POST` | `/newsletter` | Body `{email}` · `201` · `409` if already subscribed |
| `POST` | `/contact` | Body `{name, email, message}` · `201` |

---

## 7. Frontend

### Routing

`App.jsx` renders a fixed `Header`, the route outlet, `ScrollToTop`, `Footer`, and the
`HelpChatbot` on every page. All of `/about`, `/sustainability`, `/journal`, `/careers`,
`/contact`, `/shipping`, `/returns`, `/faq`, and `/login` are public. **Everything else
requires a logged-in user** and redirects to `/login`:

`/catalog` · `/shop` · `/bestsellers` · `/categories` · `/profile` · `/inventory` ·
`/cart` · `/checkout` · `/order` · `/order/:orderNumber` · `/product/:slug`

### State

- **`DataContext`** — products, categories, `loading`, `error`, `refresh()`. Fetched once,
  re-fetched after mutations.
- **`CartContext`** — the cart, persisted to `localStorage` under `homeline-cart` on every
  change. Exposes `cartItems`, `addToCart`, `removeFromCart`, `updateQuantity`,
  `updateItemVariant`, `clearCart`, `cartCount`, `cartTotal`.

Two cart behaviours are worth knowing:

- **Quantity is capped to available stock** in both `addToCart` and `updateQuantity`:
  `Math.min(Math.max(1, item.stock), quantity)`. Setting quantity to 0 or below removes
  the line.
- **Variants are modelled as separate cart lines.** `updateItemVariant` rewrites the line
  id to `${baseProductId}-${color}-${size}`; if a line for that variant already exists the
  quantities merge. The base product is remembered in `baseProductId` so switching colour
  does not create a brand-new product identity.

### Design tokens

Defined in `client/tailwind.config.js`:

| Token | Value | Token | Value |
| ----- | ----- | ----- | ----- |
| `primary` | `#1a4d2e` | `cream` | `#f5f1e8` |
| `primary-dark` | `#0f3320` | `beige` | `#e8e0d0` |
| `primary-light` | `#2d6b47` | `olive` | `#697756` |
| `secondary` | `#7a9b7e` | `charcoal` | `#2c2c2c` |
| `accent` | `#8b9474` | `muted` | `#6b7669` |
| `sage` | `#9db39b` | `sand` | `#d6c7a3` |
| `line` | `#ddd6c6` | | |

Fonts: **DM Sans** (body) and **DM Serif Display** (headings), both from Google Fonts.

Breakpoints are mobile-first — **mobile** `< 768px`, **tablet** `768–1279px`,
**desktop** `≥ 1280px`.

### Shared utilities

`client/src/utils/stock.js` — shared by the storefront and the dashboard:

- `getStockStatus(stock, reorderLevel)` → `'out'` when ≤ 0, `'low'` when ≤ reorder level,
  else `'in'`. Defaults: `LOW_STOCK_THRESHOLD = 5`, `DEFAULT_REORDER_LEVEL = 3`.
- `formatPeso(value)` → `₱1,234.56` (en-PH locale, always 2 decimals).
- `formatDateTime(value)` → returns `—` for an unparseable date.

`client/src/utils/orders.js` — `fetchOrder(orderNumber)` and `cancelOrder(orderNumber)`,
both throwing `Error` with the server's message so callers can show it directly.

---

## 8. Features

### Storefront

- **Home** — hero, product collection, featured banner, category carousel, best sellers,
  new arrivals, sustainability section, testimonials, editorial, newsletter CTA.
- **Shop** — debounced search (300 ms via `useDebounce`) synced to the `?q=` query
  parameter, with category and sort filters.
- **Header search** — debounced live results dropdown.
- **Product detail** — gallery, color swatches, quantity, stock badges, reviews section
  with a write-a-review form.
- **Content pages** — About, Sustainability, Journal, Careers, Contact, Shipping, Returns,
  FAQ.

### Cart and checkout

- Slide-in cart sidebar plus a full `/cart` page with per-line colour/size and quantity
  editing.
- Three-step checkout (shipping → payment → review) with:
  - shipping: Standard ₱0, Express ₱150, Priority ₱250
  - gift wrap: none ₱0, classic ₱50, premium ₱100
  - promo-code field validated against `/api/promos` (type, min spend, expiry, active flag)
  - a fake card form — **no payment processor is integrated**
- On success, shows the order number with a link to track it, and offers **Cancel Order**
  directly on the confirmation screen.
- After a successful order the cart is cleared and catalog data is refreshed.

### Order tracking

`/order` and `/order/:orderNumber`. The input is normalised with `.trim().toUpperCase()`
before lookup. Renders status, line items, totals, and a cancel action behind a
confirmation step.

### Inventory dashboard (`/inventory`)

- **Stock** — editable table, low-stock and out-of-stock banners, restock and exact-set
  actions, add/edit product via a modal form.
- **Sales** — orders table, revenue and profit figures, period selector, daily-revenue and
  top-products charts, and CSV export / print.
- **Activity** — the `stock_movements` audit trail with reasons and running balances.
- **Customers** — customer list derived from order history.
- **Promos** — create, enable, and disable discount codes.

### Help chatbot

`client/src/components/ui/HelpChatbot.jsx` — a 16-topic knowledge base covering shipping,
returns, products, and care, plus:

- quick replies and a typing indicator
- **live order lookup** when the message matches `/HML-\d{8}-\d{4}/i`, calling
  `GET /api/orders/:orderNumber`
- a handoff path to a human via the Contact page

---

## 9. Authentication and its limits

**This is not authentication.** Be explicit about this if the project is presented.

- `Login.jsx` registers and logs users against `localStorage` key `homelineUsers`, storing
  **passwords in plaintext**.
- The "session" is the presence of `homelineCurrentUser` in `localStorage`. `App.jsx`
  reads it once on mount and re-reads on the `homeline-auth-changed` event.
- Route protection is a client-side `<Navigate to="/login" replace />` — there is no
  server-side session, token, or middleware.
- The Inventory dashboard is reachable by typing one `localStorage.setItem` call into
  devtools. It displays cost prices, profit, sales figures, and customer email addresses.
- No password hashing, no rate limiting, no email verification, no password reset.

Appropriate for a portfolio demo of a storefront UI. It must not be described as handling
real accounts or customer data, and real credentials must never be entered into it.

---

## 10. Deployment

### Frontend — Vercel

`client/vercel.json` rewrites all paths to `index.html` for client-side routing.

| Setting | Value |
| ------- | ----- |
| Root directory | `client` |
| Build command | `npm run build` |
| Output directory | `dist` |

**Set `VITE_API_URL`** (e.g. `https://your-api.onrender.com/api`) in the project
environment variables. Without it the deployed app requests `/api/...` relative to the
Vercel domain, the rewrite serves `index.html` instead of JSON, and the storefront renders
**with no products and no visible error**. This is the single most likely deployment
failure.

### Backend — Render

`render.yaml` is included. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the Render
dashboard; do not rely on the committed `server/.env`, which is gitignored.

Also supported: Railway, Heroku, DigitalOcean App Platform, AWS Elastic Beanstalk.

### Production checklist

- [ ] `VITE_API_URL` set on the frontend host
- [ ] `SUPABASE_URL` + `SUPABASE_ANON_KEY` set on the backend host
- [ ] `/api/health` returns `"database":"supabase"`
- [ ] RLS write policies on `products` and `promo_codes` tightened to an authenticated role
- [ ] CORS restricted to the real frontend origin (currently `cors()` allows all)
- [ ] Rate limiting added to the public `POST` endpoints

---

## 11. Scripts reference

| Location | Command | Runs |
| -------- | ------- | ---- |
| `client` | `npm run dev` | Vite dev server on :3000 with `/api` proxy |
| `client` | `npm run build` | Production build to `dist/` |
| `client` | `npm run preview` | Serve the built `dist/` |
| `server` | `npm start` | `node server.js` |
| `server` | `npm run dev` | `node --watch server.js` (restarts on change) |
| root | `docker compose up --build` | Both services — **see the warning in [§4](#4-getting-started)** |

Helper scripts in `server/scripts/` (run manually, not wired into `package.json`):
`seed.js` and `diagnose.js`.

Current production build size: `index.js` 420.87 kB (112.65 kB gzipped), CSS 47.86 kB
(8.41 kB gzipped).

---

## 12. Known issues and gaps

Ordered by how likely you are to hit them.

### 1. `docker compose up` leaves the API unconfigured 🔴

The `server` service omits the Supabase variables, so every data route returns `503`. Add
`SUPABASE_URL` and `SUPABASE_ANON_KEY` to its `environment` block.

### 2. Missing `VITE_API_URL` breaks deployed storefronts 🔴

Fails silently — the app loads but shows zero products. Set it on the host.

### 3. Product and promo writes are world-writable 🔴

The RLS policies `"anon can insert/update products"` and the promo equivalents let anyone
holding the anon key rewrite the catalog. Intentional for the demo, wrong for anything
real.

### 4. Chatbot order lookup is case-sensitive 🟡

`HelpChatbot.jsx:7` uses `ORDER_RE = /HML-\d{8}-\d{4}/i` — case-insensitive — but
`lookupOrder` (line 141) passes the captured string to a case-sensitive `.eq()` in
`server.js:326`. Typing `hml-20260928-1005` yields *"I couldn't find an order"* for an order
that exists. The Track page is unaffected because `OrderStatus.jsx:25` calls
`.toUpperCase()`. Fix: uppercase in `extractOrderNumber`, and/or normalise server-side in
the `orderNumber` route.

### 5. Inconsistent response casing on order creation 🟡

`POST /api/orders` returns `order_id` / `order_number` while every other endpoint returns
camelCase. Works today only because `Checkout.jsx:206` reads the snake_case field.

### 6. `README.md` is out of date 🟡

It still describes a local-JSON backend with no Supabase, no auth, no orders, no inventory
dashboard, and a 5-endpoint API — there are 21 routes. It also lists product detail pages,
search, and category filtering as "future enhancements" when all three already ship. This
document is the accurate reference.

### 7. Order numbers leak daily volume ⚪

`HML-20260928-1005` encodes the date and a per-day sequence, so a customer can infer how
many orders were placed that day and guess adjacent numbers. Sequential-only would be safer.

### 8. Docker images run dev servers 🟡

Both Dockerfiles use `npm run dev` (and `node --watch`) rather than building and serving
production output. Fine for development containers, unsuitable for production.

### 9. Cancelled orders cannot be deleted ⚪

There is no delete endpoint, so demo orders can only be cancelled. Removing them requires
direct database access.

---

## 13. Test coverage

**There is no automated test suite.** No test runner, framework, or test files are
installed in either package — the only verification is manual.

The most recent manual pass is documented in [`SMOKE_TEST.md`](./SMOKE_TEST.md):
**45 API/database checks, all passing**, including the full order lifecycle (create →
stock decrement → track → cancel → stock restore) and 16 validation/error paths.

**Not yet verified:** everything in the browser. No rendered page, cart interaction,
checkout UI, dashboard tab, or chatbot reply has been exercised end to end. See
[§6 of that report](./SMOKE_TEST.md#6-not-covered) for the full list.

Adding a test runner is the highest-value next step — the order lifecycle in particular is
well suited to integration tests, since the Supabase functions make the behaviour
deterministic.
