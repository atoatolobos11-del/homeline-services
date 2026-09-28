# 🧪 Homeline E-Commerce — E2E Smoke Test Report

**Date:** 2026-09-28
**Commit:** `8ca361d` — Add system architecture diagram (docs/system-architecture.html)
**Scope:** API + database end-to-end (live Supabase project)
**Result:** ✅ **PASSED** — 45 checks, 0 failures, 2 findings

---

## 1. Environment Under Test

| Component | Detail | Status |
| --------- | ------ | ------ |
| API server | `node server/server.js` → `localhost:5000` | ✅ Running |
| Client dev server | `vite` → `localhost:3000` | ✅ Running |
| Database | Supabase (Postgres) — live project, not a mock | ✅ Connected |
| `/api/health` | `{"ok":true,"database":"supabase"}` | ✅ |
| Products loaded | 24 | ✅ |
| Categories loaded | 7 | ✅ |

Both servers were **already running** in this environment before the test. No code was
changed during this test.

---

## 2. What Was Tested

### 2.1 Full order lifecycle — PASS ✅

The most important path in the app: create an order, move stock, track it, cancel it,
and confirm stock returns. Self-cleaning — stock was restored to its original value.

| Step | Action | Expected | Actual |
| ---- | ------ | -------- | ------ |
| 1 | Read stock before | bamboo-04 = 15, mug-set-09 = 10 | ✅ 15, 10 |
| 2 | `POST /api/orders` (bamboo ×2, mug ×1, total 697) | `201` | ✅ `201` → `HML-20260928-1005`, `order_id: 6` |
| 3 | Read stock after | 13, 9 (decremented) | ✅ 13, 9 |
| 4 | `GET /api/orders/HML-20260928-1005` | `200` + line items | ✅ `200`, items + unit/cost price + profit |
| 5 | Read stock before cancel | 13, 9 | ✅ 13, 9 |
| 6 | `POST /api/orders/cancel` | `200` | ✅ `200`, `status: cancelled` |
| 7 | Read stock after cancel | 15, 10 (restored) | ✅ 15, 10 |
| 8 | `POST /api/orders/cancel` again | `409` rejected | ✅ `409` "This order is already cancelled." |
| 9 | Re-track the order | `status: cancelled` | ✅ cancelled |

Stock math verified end to end, including the atomic DB transaction behind
`record_order` / `cancel_order`.

### 2.2 Read endpoints — PASS ✅

| Endpoint | Expected | Actual |
| -------- | -------- | ------ |
| `GET /api/health` | `200` | ✅ `200` |
| `GET /api/products` | `200` + 24 rows | ✅ 24 |
| `GET /api/products/:id` (`eco-bottle-01`) | `200` | ✅ `200` |
| `GET /api/products/:id` (unknown) | `404` | ✅ `404` "Product not found" |
| `GET /api/categories` | `200` + 7 rows | ✅ 7 |
| `GET /api/inventory` | `200` | ✅ 24 |
| `GET /api/inventory/movements` | `200` | ✅ 4 rows, joined product name + image |
| `GET /api/orders` | `200` + summary | ✅ orders + revenue/itemsSold/today/week |
| `GET /api/orders/:orderNumber` | `200` | ✅ `200` |
| `GET /api/orders/:orderNumber` (unknown) | `404` | ✅ `404` with helpful message |
| `GET /api/reviews` | `200` | ✅ 16 |
| `GET /api/promos` | `200` | ✅ 4 |

snake_case → camelCase mapping in `mapProduct` confirmed correct for every field
(`best_seller`→`bestSeller`, `reorder_level`→`reorderLevel`, `cost_price`→`costPrice`, etc.).

### 2.3 Validation and error paths — PASS ✅ (16/16)

| Request | Expected | Actual |
| ------- | -------- | ------ |
| `POST /orders` blank name | `400` | ✅ "customerName is required" |
| `POST /orders` empty items | `400` | ✅ "items must be a non-empty array" |
| `POST /orders` quantity `0` | `400` | ✅ rejected |
| `POST /orders` quantity `1.5` | `400` | ✅ rejected (not an integer) |
| `POST /orders` negative price | `400` | ✅ rejected |
| `POST /orders` out-of-stock item | `409` | ✅ + `insufficient: ["canister-07"]` |
| `POST /orders` quantity `9999` | `409` | ✅ + `insufficient: ["bamboo-04"]` |
| `POST /reviews` no productId | `400` | ✅ |
| `POST /reviews` no customerName | `400` | ✅ |
| `POST /reviews` rating `9` | `400` | ✅ "whole number from 1 to 5" |
| `POST /reviews` rating `0` | `400` | ✅ rejected |
| `POST /promos` no code | `400` | ✅ |
| `POST /promos` negative value | `400` | ✅ |
| `POST /promos` invalid expiry date | `400` | ✅ "not a valid date" |
| `POST /newsletter` no email | `400` | ✅ |
| `POST /contact` missing fields | `400` | ✅ |

**Verified that the two `409` stock-conflict attempts created no phantom orders** —
order count stayed at 3.

### 2.4 Inventory write paths — PASS ✅

| Request | Expected | Actual |
| ------- | -------- | ------ |
| `PATCH /inventory/:id` stock `-1` | `400` | ✅ |
| `PATCH /inventory/:id` stock `2.5` | `400` | ✅ |
| `PATCH /inventory/:id` unknown product | `404` | ✅ |
| `POST /inventory/restock` quantity `0` | `400` | ✅ |
| `POST /inventory/restock` +2 | `200`, stock 15→17 | ✅ `200`, `delta: 2` |
| `PATCH /inventory/:id` back to 15 | `200`, stock 17→15 | ✅ `delta: -2` |
| `PATCH /inventory/:id` same value (15) | no-op | ✅ `unchanged: true` |

Stock restored to its original value — net zero.

### 2.5 Frontend build, proxy, and assets — PASS ✅

| Check | Result |
| ----- | ------ |
| `GET http://localhost:3000/` serves app, mounts `#root` | ✅ `200`, 985 bytes |
| Vite `/api` proxy → backend (health) | ✅ `200 {"ok":true,...}` |
| Vite `/api` proxy → backend (products) | ✅ `200`, 12,387 bytes |
| `npm run build` (production) | ✅ clean — 1630 modules, 7.29s |
| Bundle size | `index.js` 420.87 kB (112.65 kB gzip), CSS 47.86 kB (8.41 kB gzip) |
| All product + category images reachable | ✅ **31/31** (Pexels + Unsplash) |

---

## 3. Findings

### 🔴 Finding 1 — Chatbot order lookup is case-sensitive (bug)

**Severity:** Low (UX only, no data risk)
**File:** `client/src/components/ui/HelpChatbot.jsx:7, 136, 138`

The order-number regex is case-insensitive, but the value it captures is passed straight
to an exact-match database query:

```js
const ORDER_RE = /HML-\d{8}-\d{4}/i;          // line 7  — matches "hml-2026..."
const extractOrderNumber = (text) => (text.match(ORDER_RE) || [])[0] || null;  // line 136
const lookupOrder = async (orderNumber) => {
  res = await fetch(`${apiBase}/orders/${encodeURIComponent(orderNumber)}`);     // line 141
```

The server does a case-sensitive `.eq('order_number', orderNumber)` (`server.js:326`).

**Reproduced:**
```
GET /api/orders/HML-20260928-1005  →  200
GET /api/orders/hml-20260928-1005  →  404
```

A user typing `hml-20260928-1005` into the chatbot gets *"I couldn't find an order"* for an
order that exists.

The Track / Cancel Order page does **not** have this bug — `OrderStatus.jsx:25` normalizes
with `.trim().toUpperCase()` before the request.

**Fix:** uppercase in `extractOrderNumber`, and/or normalize server-side in the
`orderNumber` route so every client benefits:
```js
const orderNumber = String(req.params.orderNumber || '').trim().toUpperCase()
```

### 🟡 Finding 2 — Inconsistent response casing on order creation (fragile)

**Severity:** Low (currently not broken)

`POST /api/orders` is the only endpoint that returns snake_case in its body:

```json
{ "ok": true, "total": 697, "order_id": 6, "order_number": "HML-20260928-1005" }
```

Every other endpoint returns camelCase (`orderNumber`, `productId`, `unitPrice`…). The
client reads the snake_case field correctly at `Checkout.jsx:206`, so this works today —
but it is a trap for the next change, and it is what caused a false 404 during this very
test run (the probe read `orderNumber` off a response that only had `order_number`).

**Fix:** normalize the RPC result in `server.js` before responding:
```js
res.status(201).json({
  ok: true,
  total: result.data.total,
  orderId: result.data.order_id,
  orderNumber: result.data.order_number,
})
```
and update the two reads in `Checkout.jsx:206,209`.

---

## 4. Non-blocking observations

**Auth is not real authentication.** `Login.jsx` stores **plaintext passwords** in
`localStorage` under `homelineUsers`, and `App.jsx` gates every route on the presence of a
`homelineCurrentUser` key. Any user can set that key in devtools and reach `/inventory`
(cost prices, sales figures, customer emails) or `/profile` (order history) with no
credentials. Acceptable for a portfolio demo, but it must never be presented as handling
real customer data.

**`README.md` is significantly out of date.** It still describes:
- a backend that "uses local JSON data" — the API is now Supabase-only, with no fallback
- no auth, no orders, no inventory dashboard, no reviews, no promo codes, no chatbot
- a 5-endpoint API list — there are 20+ routes
- "Future Enhancements" including product detail pages, search, and category filtering,
  all of which already ship

**`client/.env` is not committed** (only `.env.example`). Local dev works via the Vite
`/api` proxy, but a Vercel or Render deploy renders a storefront with **zero products** and
no error unless `VITE_API_URL` is set — `vercel.json` only rewrites everything to
`index.html`, with no `/api` route.

**Order numbers leak daily volume.** `HML-20260928-1005` encodes both the date and a
per-day sequence, so any customer can infer how many orders were placed that day and
brute-force nearby numbers. Minor, but a sequential-only format would be safer.

---

## 5. Test data left behind

Stock levels are back to their original values. The following audit records remain, which
is correct behavior — `stock_movements` is an append-only log by design:

- Order `HML-20260928-1005` — customer `E2E Smoke Test <e2e-smoke@homeline.ph>`, status
  `cancelled`, total ₱697
- Movement rows for the sale, the cancellation, and the restock/restore pair on
  `bamboo-04` (reasons `E2E smoke test restock` / `E2E smoke test cleanup`)

The app has no delete-order or purge-movement endpoint, so these were removed by
cancelling rather than deleting. Delete them directly in Supabase if a clean dataset
matters.

---

## 6. Not covered

The **browser-driven UI walkthrough did not run** — no desktop browser was connected to
this session, and the browser tool is an opt-in experimental feature. The following are
therefore **unverified** and should be retested once a browser is attached:

- Rendered pages: Home, Shop, Catalog, Categories, Bestsellers, product detail, Profile,
  About / Sustainability / Journal / Careers / Contact / Shipping / Returns / FAQ
- Register → login flow and the auth redirect behavior
- Cart interactions: add, quantity/color/variant editing, stock capping, and
  localStorage persistence across a reload
- Checkout UI end to end (the underlying API order flow *was* verified — see 2.1)
- Track / Cancel Order page UI, including lowercase input
- Inventory dashboard tabs: Sales, Activity, Customers, Promos, sales charts, CSV/print
- Help chatbot: quick replies, live order lookup, typing indicator, handoff
- Console errors, React warnings, and failed network requests during navigation

Two smaller items also unverified: the `POST` happy paths for newsletter subscribe and
contact submit (only their `400` validation branches were exercised, to avoid writing junk
rows into the live database), and promo-code enable/disable via `PATCH /api/promos/:id`.

---

## 7. How to re-run

```bash
# 1. backend
cd server
cp .env.example .env        # then set SUPABASE_URL and SUPABASE_ANON_KEY
npm install && npm start    # :5000

# 2. frontend
cd client
npm install
npm run dev                 # :3000
```

Then confirm:

```bash
curl http://localhost:5000/api/health
# {"ok":true,"database":"supabase"}
```
