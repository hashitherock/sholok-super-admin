import { useSyncExternalStore } from "react";
import { z } from "zod";
import { serviceItems } from "@/lib/nav-registry";

/** Versioned browser-local store. Bump STORE_VERSION and add a migration when the shape changes. */
export const STORE_KEY = "sholok.admin";
export const STORE_VERSION = 1;

export const serviceStatuses = ["active", "maintenance", "disabled"] as const;
export const serviceHealth = ["healthy", "degraded", "down"] as const;

const isoDate = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().trim().min(1, "Description is required").max(300, "Keep it under 300 characters"),
  owner: z.string().trim().min(1, "Owner team is required").max(80, "Keep it under 80 characters"),
  version: z.string().trim().regex(/^\d+\.\d+\.\d+$/, "Use a version like 1.4.0"),
  status: z.enum(serviceStatuses),
  health: z.enum(serviceHealth),
  users: z.number().int().nonnegative(),
  updatedAt: isoDate,
});
export type Service = z.infer<typeof serviceSchema>;

const userSchema = z.object({ id: z.string(), name: z.string(), status: z.enum(["active", "suspended"]), createdAt: isoDate, serviceId: z.string() });
const orderSchema = z.object({ id: z.string(), serviceId: z.string(), amount: z.number().nonnegative(), status: z.enum(["completed", "pending", "refunded"]), createdAt: isoDate });
const txSchema = z.object({ id: z.string(), amount: z.number().nonnegative(), status: z.enum(["succeeded", "pending", "failed"]), createdAt: isoDate });
const ticketSchema = z.object({ id: z.string(), subject: z.string(), status: z.enum(["open", "closed"]), createdAt: isoDate });
const approvalSchema = z.object({ id: z.string(), title: z.string(), status: z.enum(["pending", "approved", "rejected"]), createdAt: isoDate });
const reportDefSchema = z.object({ id: z.string(), name: z.string(), template: z.string(), days: z.number().int().positive(), createdAt: isoDate });
const reportRunSchema = z.object({ id: z.string(), name: z.string(), format: z.enum(["csv", "json", "preview"]), rows: z.number().int().nonnegative(), createdAt: isoDate });

export const dataSchema = z.object({
  services: z.array(serviceSchema),
  users: z.array(userSchema),
  orders: z.array(orderSchema),
  transactions: z.array(txSchema),
  tickets: z.array(ticketSchema),
  approvals: z.array(approvalSchema),
  reports: z.array(reportDefSchema),
  reportRuns: z.array(reportRunSchema),
});
export type AdminData = z.infer<typeof dataSchema>;

const envelopeSchema = z.object({ version: z.number().int(), savedAt: isoDate, data: z.unknown() });

/** Fixed reference date so sample records render identically on server and browser. */
export const SAMPLE_BASE = new Date("2026-11-01T00:00:00Z").getTime();
const DAY = 86_400_000;

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

const firstNames = ["Arin", "Nadia", "Rafi", "Tania", "Imran", "Sadia", "Kabir", "Mitu", "Joy", "Lina", "Omar", "Priya"];
const lastNames = ["Rahman", "Hossain", "Karim", "Akter", "Chowdhury", "Islam", "Das", "Ahmed"];

export function createSampleData(): AdminData {
  const r = rng(42);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)] as T;
  const at = (maxDays: number) => new Date(SAMPLE_BASE - Math.floor(r() * maxDays * DAY)).toISOString();
  const services: Service[] = serviceItems.map((s, i) => ({
    id: s.serviceId!, name: s.title, category: s.category!, description: s.description,
    owner: `${s.category} Team`, version: `1.${i % 5}.0`,
    status: i === 7 ? "maintenance" : i === 18 ? "disabled" : "active",
    health: i === 13 ? "degraded" : i === 18 ? "down" : "healthy",
    users: Math.floor(r() * 90_000) + 2_000, updatedAt: at(60),
  }));
  const ids = services.map((s) => s.id);
  const commerce = ["shopping", "smart-store", "pay", "series", "music"];
  return {
    services,
    users: Array.from({ length: 160 }, (_, i) => ({ id: `U-${1001 + i}`, name: `${pick(firstNames)} ${pick(lastNames)}`, status: r() < 0.93 ? "active" : "suspended", createdAt: at(90), serviceId: pick(ids) })),
    orders: Array.from({ length: 120 }, (_, i) => ({ id: `O-${5001 + i}`, serviceId: pick(commerce), amount: Math.round(r() * 4800 + 200), status: r() < 0.8 ? "completed" : r() < 0.6 ? "pending" : "refunded", createdAt: at(90) })),
    transactions: Array.from({ length: 140 }, (_, i) => ({ id: `T-${8001 + i}`, amount: Math.round(r() * 6000 + 100), status: r() < 0.85 ? "succeeded" : r() < 0.6 ? "pending" : "failed", createdAt: at(90) })),
    tickets: Array.from({ length: 24 }, (_, i) => ({ id: `S-${301 + i}`, subject: `${pick(services).name} sign-in question`, status: r() < 0.4 ? "open" : "closed", createdAt: at(30) })),
    approvals: Array.from({ length: 10 }, (_, i) => ({ id: `A-${71 + i}`, title: `${pick(["Seller onboarding", "Refund over limit", "Publisher contract", "Role elevation"])} #${71 + i}`, status: r() < 0.5 ? "pending" : "approved", createdAt: at(20) })),
    reports: [],
    reportRuns: [],
  };
}

export type ParseResult = { ok: true; data: AdminData } | { ok: false; error: string };

/** Safely parse a stored string; never throws. */
export function parseStored(raw: string | null): ParseResult | null {
  if (raw === null) return null;
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return { ok: false, error: "Saved data is not valid JSON." }; }
  const env = envelopeSchema.safeParse(json);
  if (!env.success) return { ok: false, error: "Saved data is missing its version information." };
  if (env.data.version > STORE_VERSION) return { ok: false, error: `Saved data is from a newer version (${env.data.version}).` };
  const data = dataSchema.safeParse(env.data.data);
  if (!data.success) return { ok: false, error: `Saved data failed validation: ${data.error.issues[0]?.path.join(".")} ${data.error.issues[0]?.message}` };
  if (data.data.services.length !== 20 || new Set(data.data.services.map((s) => s.id)).size !== 20) {
    return { ok: false, error: "Saved data does not contain exactly 20 distinct services." };
  }
  return { ok: true, data: data.data };
}

export function serialize(data: AdminData) {
  return JSON.stringify({ version: STORE_VERSION, savedAt: new Date().toISOString(), data });
}

// ---- store ----
type State = { data: AdminData; isSample: boolean; loadError: string | null; saveError: string | null };
let serverState: State | null = null;
let state: State | null = null;
const listeners = new Set<() => void>();

function getServerState() {
  return (serverState ??= { data: createSampleData(), isSample: true, loadError: null, saveError: null });
}

function load(): State {
  const sample = createSampleData();
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(STORE_KEY); } catch {
    return { data: sample, isSample: true, loadError: "Browser storage is unavailable; changes won't be kept.", saveError: null };
  }
  const parsed = parseStored(raw);
  if (!parsed) return { data: sample, isSample: true, loadError: null, saveError: null };
  if (!parsed.ok) return { data: sample, isSample: true, loadError: parsed.error, saveError: null };
  return { data: parsed.data, isSample: true, loadError: null, saveError: null };
}

function getState() {
  if (typeof window === "undefined") return getServerState();
  return (state ??= load());
}

function emit() { listeners.forEach((l) => l()); }

export function updateData(fn: (d: AdminData) => AdminData): boolean {
  const cur = getState();
  const next = fn(cur.data);
  const checked = dataSchema.safeParse(next);
  if (!checked.success) { state = { ...cur, saveError: "Change rejected: it failed validation." }; emit(); return false; }
  try {
    window.localStorage.setItem(STORE_KEY, serialize(checked.data));
    state = { ...cur, data: checked.data, loadError: null, saveError: null };
    emit();
    return true;
  } catch {
    state = { ...cur, saveError: "Couldn't save to browser storage (it may be full or blocked)." };
    emit();
    return false;
  }
}

export function resetToSample() {
  try { window.localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
  state = { data: createSampleData(), isSample: true, loadError: null, saveError: null };
  emit();
}

/** Test helper: forget the in-memory copy so the next read reloads from storage. */
export function __reloadFromStorage() { state = null; }

export function useAdminStore() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    getState,
    getServerState,
  );
}

export function updateService(id: string, patch: Partial<Pick<Service, "description" | "owner" | "version" | "status" | "health">>) {
  return updateData((d) => ({
    ...d,
    services: d.services.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s)),
  }));
}

// ---- derived calculations ----
export function daysAgo(iso: string, now = SAMPLE_BASE) { return Math.floor((now - Date.parse(iso)) / DAY); }

export function withinDays<T extends { createdAt: string }>(rows: T[], days: number, now = SAMPLE_BASE) {
  return rows.filter((r) => { const d = daysAgo(r.createdAt, now); return d >= 0 && d < days; });
}

export function summarize(d: AdminData) {
  const sum = (a: { amount: number }[]) => a.reduce((t, x) => t + x.amount, 0);
  return {
    totalUsers: d.users.length,
    activeUsers: d.users.filter((u) => u.status === "active").length,
    servicesTotal: d.services.length,
    servicesActive: d.services.filter((s) => s.status === "active").length,
    servicesAttention: d.services.filter((s) => s.status !== "active" || s.health !== "healthy"),
    orders: d.orders.length,
    sales: sum(d.orders.filter((o) => o.status === "completed")),
    refundsPending: d.orders.filter((o) => o.status === "refunded").length,
    txVolume: sum(d.transactions.filter((t) => t.status === "succeeded")),
    openTickets: d.tickets.filter((t) => t.status === "open").length,
    pendingApprovals: d.approvals.filter((a) => a.status === "pending").length,
  };
}

/** Buckets rows into `buckets` consecutive periods of `size` days, oldest first. */
export function series<T extends { createdAt: string }>(rows: T[], buckets: number, size: number, value: (r: T) => number = () => 1, now = SAMPLE_BASE) {
  const out = Array.from({ length: buckets }, (_, i) => {
    const end = now - (buckets - 1 - i) * size * DAY;
    return { label: new Date(end - DAY).toISOString().slice(5, 10), value: 0 };
  });
  for (const r of rows) {
    const idx = buckets - 1 - Math.floor(daysAgo(r.createdAt, now) / size);
    if (idx >= 0 && idx < buckets && out[idx]) out[idx].value += value(r);
  }
  return out;
}

export function countBy<T>(rows: T[], key: (r: T) => string) {
  const m = new Map<string, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
  return [...m].map(([name, value]) => ({ name, value }));
}

export const money = (n: number) => `৳${n.toLocaleString("en-US")}`;
