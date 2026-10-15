// Admin session handling for the Inventory dashboard.
//
// The dashboard is admin-only and the server verifies that on every admin
// request — the route guard in App.jsx is a UI convenience, not the security
// boundary. Sign-in goes to POST /api/admin/session, which checks the password
// and returns a short-lived signed token; we keep that token and send it as a
// Bearer header.

import { supabase } from './supabaseClient';

export const ADMIN_TOKEN_KEY = 'homelineAdminToken';
// Must match the server's ADMIN_EMAIL (server/.env, Render env vars) — that
// value is the real gatekeeper; this one only controls link visibility and
// the prefilled email on the admin sign-in form.
export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || 'admin2026@gmail.com';

const apiBase = import.meta.env.VITE_API_URL || '/api';

export const getAdminToken = () => {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const clearAdminToken = () => {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

/** Headers for admin API calls. Empty when signed out. */
export const adminHeaders = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * fetch wrapper that attaches the admin token. On a 401 the stored token is
 * cleared, so a stale or revoked session can't wedge the dashboard.
 */
export const adminFetch = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...adminHeaders(),
    ...(options.headers || {}),
  };
  const res = await fetch(path.startsWith('http') ? path : `${apiBase}${path}`, {
    ...options,
    headers,
  });
  if (res.status === 401) clearAdminToken();
  return res;
};

/** True when a token is stored. Optimistic only — the server has the final say. */
export const hasAdminToken = () => Boolean(getAdminToken());

/** Sign in with the admin password. Returns { ok } or { ok: false, error }. */
export const adminSignIn = async (email, password) => {
  try {
    const res = await fetch(`${apiBase}/admin/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: body.error || 'Could not sign in' };
    }
    localStorage.setItem(ADMIN_TOKEN_KEY, body.token);
    return { ok: true, email: body.email };
  } catch {
    return { ok: false, error: 'Network error — could not reach the server' };
  }
};

/** Confirm the stored token is still accepted. */
export const verifyAdminSession = async () => {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await adminFetch('/admin/session');
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * One-click admin entry for the admin account. Uses the current Supabase
 * session's access token as the Bearer token — the server revalidates it with
 * auth.getUser() and only accepts it when it belongs to ADMIN_EMAIL (see
 * checkAdmin in server.js). No admin password or extra env vars needed.
 * Returns { ok } or { ok: false, error }.
 */
export const adminSignInWithSupabase = async () => {
  try {
    if (!supabase) return { ok: false, error: 'Login is not configured on this site yet.' };
    const { data, error } = await supabase.auth.getSession();
    if (error) return { ok: false, error: error.message };
    const token = data?.session?.access_token;
    if (!token) return { ok: false, error: 'You are not signed in. Log in first.' };
    const res = await fetch(`${apiBase}/admin/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: body.error || 'This account is not an admin' };
    }
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error — could not reach the server' };
  }
};

export const adminSignOut = async () => {
  try {
    await fetch(`${apiBase}/admin/session`, { method: 'DELETE', headers: adminHeaders() });
  } catch {
    /* best effort — the local token is cleared regardless */
  }
  clearAdminToken();
};