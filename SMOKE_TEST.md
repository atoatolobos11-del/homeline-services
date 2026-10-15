# 🧪 Homeline E-Commerce — E2E Smoke Test Report

**Date:** 2026-10-01
**Commit:** `9dafc6d` — Fix: Inventory now admin-only (admin@homeline.ph)
**Scope:** API + database end-to-end, live Supabase project
**Result:** ✅ **PASSED** — 78 checks, 0 failures

> This report covers two passes on 2026-10-01: the discovery run that found the
> bugs, and the verification run after fixing them. All four findings below are
> closed. One earlier problem turned out to be bigger than first reported —
> `costPrice` was leaking through the *public* products route, not just inventory.

---

## 1. Environment Under Test

| Component | Detail | Status |
| --------- | ------ | ------ |
| API server | `node server/server.js` → `localhost:5000` | ✅ Running |
| Client dev server | `vite` → `localhost:3000` | ✅ Running |
| Database | Supabase (Postgres) — live project | ✅ Connected |
| `/api/health` | `{"ok":true,"database":"supabase"}` | ✅ |
| Products / Categories / Reviews | 24 / 7 / 16 | ✅ |
| `npm run build` | 1632 modules, ~32s, no warnings | ✅ |

---

## 2. Results

### 2.1 Anonymous access to admin routes — PASS ✅ (8/8)

The whole point of the fix. Every one of these returned `200` with live data before,
and now returns `401`:

| Route | Before | Now |
| ----- | ------ | --- |
| `GET /api/inventory` | `200` + cost prices | `401` |
| `GET /api/orders` | `200` + customer PII | `401` |
| `GET /api/inventory/movements` | `200` + audit log | `401` |
| `PATCH /api/inventory/:id` | `200` | `401` |
| `POST /api/inventory/restock` | `200` | `401` |
| `POST /api/products` | `201` | `401` |
| `PATCH /api/products/:id` | `200` | `401` |
| `PATCH /api/promos/:id` | `200` | `401` |

### 2.2 Cost prices no longer reach the public — PASS ✅

| Route | Before | Now |
| ----- | ------ | --- |
| `GET /api/products` | `costPrice` on all 24 | omitted |
| `GET /api/products/:id` | `costPrice` | omitted |
| `GET /api/orders/:orderNumber` | `costPrice` + `profit` per line | omitted |
| `GET /api/inventory` (admin) | `costPrice` | `costPrice` (unchanged, now gated) |

This one mattered more than the original write-up suggested: `mapProduct` was
serialising `cost_price` for *every* product response, so supplier margins were
public even to someone who never touched `/api/inventory`.

### 2.3 Public routes still work — PASS ✅ (6/6)

`/api/health`, `/api/products`, `/api/categories`, `/api/reviews`, `/api/promos`,
and order tracking are all still reachable with no credentials. Nothing regressed
into over-restriction.

### 2.4 Admin authentication — PASS ✅ (17/17)

| Check | Result |
| ----- | ------ |
| `POST /api/admin/session` correct credentials | `200`, signed 8h token |
| Wrong password / wrong email | `401`, identical message (no user enumeration) |
| Token is not the password | ✅ |
| Bearer token → `/api/inventory` | `200`, includes `costPrice` |
| Bearer token → `/api/orders` | `200` |
| Bearer token → `/api/admin/session` | `200`, verifies |
| Garbage / empty / wrong-scheme / tampered-signature tokens | all `401` |
| `X-Admin-Secret` correct → access | `200` |
| `X-Admin-Secret` wrong | `401` |
| Login rate limit | `429` after 8 attempts per IP / 15 min |

### 2.5 Promo visibility split — PASS ✅

Anonymous callers get only active, unexpired codes. An admin sees drafts and
disabled codes too, so the dashboard can still manage them. Verified both
directions, including that a newly deactivated code immediately disappears from
the public list.

### 2.6 Order lifecycle — PASS ✅ (unchanged behaviour, self-cleaning)

| Step | Expected | Actual |
| ---- | -------- | ------ |
| Baseline stock | bamboo-04 = 15, mug-set-09 = 10 | ✅ 15, 10 |
| `POST /api/orders` | `201`, total 697 | ✅ `201` → `HML-20261001-1012`, `orderId: 13` |
| Stock after create | 13, 9 | ✅ 13, 9 |
| Cancel (lowercase order number) | `200` | ✅ `200` |
| Stock after cancel | 15, 10 restored | ✅ 15, 10 |
| Double cancel | `409` | ✅ |

Stock math is still correct end to end, and net stock change is zero.

### 2.7 Response casing — PASS ✅

| Endpoint | Keys |
| -------- | ---- |
| `POST /api/orders` | `ok, total, orderId, orderNumber` |
| `POST /api/orders/cancel` | `ok, status, orderNumber` |

No snake_case in any response body.

### 2.8 Case-insensitive order lookup — PASS ✅

`HML-20260928-1003`, `hml-20260928-1003`, and `Hml-20260928-1003` all return `200`.

### 2.9 Email validation — PASS ✅ (12/12)

| Input | Result |
| ----- | ------ |
| `not-an-email`, `plainstring`, `a@b`, `smoke@@example.com` | `400` |
| empty, `a b@c.com`, `@example.com`, `user@` | `400` |
| `real.address+tag<ts>@example.co.uk`, `user_name<ts>@example.io` | `201` |
| duplicate subscribe | `409` |
| `POST /api/contact` with malformed email | `400` |

Legitimate addresses with `+` tags, underscores, and multi-part TLDs still pass.

### 2.10 Customer order history — PASS ✅

`POST /api/orders/by-email` returns only orders matching the submitted email,
verified against a real seed order (`atoatolobos11@gmail.com` → 1 order), returns
empty for an unknown email, and never includes `costPrice` or `profit`.

### 2.11 Admin write paths — PASS ✅

Restock `+2` → delta 2, restore → delta -2, stock back to baseline. Promo create
`201` with a token, `401` without. Duplicate promo code `400`. Deactivate `200`.

### 2.12 Build — PASS ✅

1632 modules, `index.js` 424.33 kB (113.55 kB gzip), CSS 47.94 kB (8.42 kB gzip).

---

## 3. What changed

### Finding 1 — every data endpoint was world-readable → FIXED

**Server:** added `checkAdmin()` / `isAdminRequest()` guarding all eight sensitive
routes. Two auth paths: an HMAC-signed session token from `POST /api/admin/session`
(password check, 8h expiry), or `X-Admin-Secret` for scripts. A real Supabase
access token is also accepted and revalidated with `auth.getUser()`. Secret
comparison is constant-time via `crypto.timingSafeEqual`.

**Client:** new `components/inventory/AdminGate.jsx` prompts for the admin password
and stores the token; `utils/api.js` attaches it to every admin call and clears it
on `401`. The old `localStorage.email === 'admin@homeline.ph'` checks in `App.jsx`,
`Inventory.jsx`, and `Header.jsx` are gone — they were the vulnerability's disguise,
not a defence.

Both auth modes default to **denying** when unconfigured, so a fresh checkout can't
come up wide open.

### Finding 2 — newsletter accepted malformed emails → FIXED

Added `EMAIL_RE` and applied it to `/api/newsletter` and `/api/contact`. Also fixed
two client bugs found along the way: the newsletter form claimed success on
*every* response (`CommunityCTA.jsx`) and the About contact form reported success
even when the server rejected the submission (`About.jsx`).

### Finding 3 — case-sensitive order lookup → FIXED

`.trim().toUpperCase()` on both the lookup and cancel routes. `HelpChatbot.jsx` also
uppercases its regex capture, so the chatbot's case-insensitive match no longer
produces a 404 for an order that exists.

### Finding 4 — snake_case on order writes → FIXED

`POST /api/orders` and `POST /api/orders/cancel` now normalise the RPC result to
camelCase before responding. `Checkout.jsx` updated to read `orderNumber`.

### Additional: cost prices were public → FIXED

`mapProduct` took a `{ includeCost }` flag. Only admin routes pass it. The public
tracking route and the customer history endpoint also stopped emitting `profit`,
which is derived from cost.

---

## 4. Not covered

The **browser-driven UI walkthrough did not run** — no desktop browser is connected
to this session (`browser.disconnected`). The admin sign-in form, the dashboard
tabs, cart interactions, and checkout UI are therefore verified only at the API
layer. Worth retesting once a browser is attached:

- `/inventory` gate: sign-out shows the form, wrong password is rejected, correct
  password loads the dashboard, sign-out clears the token
- Header showing/hiding the Inventory link based on session
- Profile page loading order history through the new endpoint
- Cart, checkout, and promo-code application in the UI
- Console errors and failed requests during navigation

Also unverified: Supabase RLS. The anon key can still `SELECT` from `orders` and
`INSERT` into `newsletter_subscribers` / `contact_messages` / `promo_codes` at the
REST layer, bypassing the API entirely. Application-level auth is now correct, but
policies should be tightened too — see the README's Future Enhancements.

---

## 5. Test data left behind

Stock is back to its original values (`bamboo-04` = 15, `mug-set-09` = 10).

| Artifact | Detail |
| -------- | ------ |
| Orders `HML-20261001-1006` … `-1012` | `E2E Smoke Test <e2e-smoke@homeline.ph>`, all `cancelled`, ₱697 |
| `stock_movements` | grew from 4 → ~40 rows (sale/cancel/restock/cleanup pairs) |
| Promo codes | `SMOKETMP1`, `SMOKETMP2`, `SMK<timestamp>` ×4 — all created then deactivated, so hidden from the public list |
| Newsletter | 4 malformed addresses from the discovery run, plus valid `user_name<ts>@example.io` addresses |

RLS blocks `DELETE` with the anon key, so none of this can be cleaned up
programmatically. Remove it in the Supabase dashboard if a clean dataset matters.
`stock_movements` is append-only by design, so those rows are expected residue.

---

## 6. How to re-run

```bash
cd server && npm install && npm start    # :5000
cd client && npm install && npm run dev  # :3000
```

Then:

```bash
curl http://localhost:5000/api/health
curl http://localhost:3000/api/health

# the finding this whole change set was about
curl -i localhost:5000/api/inventory    # expect 401, was 200
curl -i localhost:5000/api/orders       # expect 401, was 200
```

Note for the admin dashboard: `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` must be
set in `server/.env` or sign-in returns `503` by design. Generate with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

The verification harness is an ad hoc Node script using only `fetch`. Worth
committing as `tests/smoke.mjs` — and a Playwright suite for the UI layer the
browser gap keeps leaving open.