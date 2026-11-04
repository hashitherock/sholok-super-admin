import { beforeEach, describe, expect, it } from "vitest";
import {
  STORE_KEY, __reloadFromStorage, createSampleData, parseStored, resetToSample, serialize, series, summarize, updateData, updateService,
} from "@/lib/admin-store";
import { queryServices } from "@/components/admin/pages/AllServices";
import { reportTemplates, toCsv } from "@/components/admin/pages/Reports";

const read = () => { __reloadFromStorage(); const r = parseStored(localStorage.getItem(STORE_KEY)); return r && r.ok ? r.data : null; };

beforeEach(() => { localStorage.clear(); resetToSample(); });

describe("service registry", () => {
  it("has exactly 20 distinct services including Cafe, Shopping and Smart Store separately", () => {
    const ids = createSampleData().services.map((s) => s.id);
    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
    expect(ids).toEqual(expect.arrayContaining(["cafe", "shopping", "smart-store"]));
  });
  it("sample data is deterministic", () => {
    expect(createSampleData()).toEqual(createSampleData());
  });
});

describe("persistence", () => {
  it("saves a service edit and reads it back after reload", () => {
    expect(updateService("mail", { owner: "Mail Ops", version: "2.0.0" })).toBe(true);
    const mail = read()!.services.find((s) => s.id === "mail")!;
    expect(mail.owner).toBe("Mail Ops");
    expect(mail.version).toBe("2.0.0");
  });
  it("disabling a service persists and lowers the active count", () => {
    const before = summarize(createSampleData()).servicesActive;
    updateService("news", { status: "disabled" });
    const data = read()!;
    expect(data.services.find((s) => s.id === "news")!.status).toBe("disabled");
    expect(summarize(data).servicesActive).toBe(before - 1);
  });
  it("rejects invalid changes without saving", () => {
    expect(updateData((d) => ({ ...d, services: d.services.map((s) => ({ ...s, version: "bad" })) }))).toBe(false);
    expect(localStorage.getItem(STORE_KEY)).toBeNull();
  });
  it("reports corrupt, unversioned, newer and wrong-count data instead of crashing", () => {
    expect(parseStored("{oops")).toMatchObject({ ok: false });
    expect(parseStored(JSON.stringify({ data: {} }))).toMatchObject({ ok: false });
    expect(parseStored(JSON.stringify({ version: 99, savedAt: new Date().toISOString(), data: {} }))).toMatchObject({ ok: false });
    const d = createSampleData();
    expect(parseStored(serialize({ ...d, services: d.services.slice(1) }))).toMatchObject({ ok: false });
    expect(parseStored(serialize(d))).toMatchObject({ ok: true });
  });
});

describe("calculations", () => {
  it("summary totals match the records", () => {
    const d = createSampleData();
    const s = summarize(d);
    expect(s.totalUsers).toBe(160);
    expect(s.servicesTotal).toBe(20);
    expect(s.servicesActive).toBe(18);
    expect(s.sales).toBe(d.orders.filter((o) => o.status === "completed").reduce((t, o) => t + o.amount, 0));
  });
  it("weekly series counts every record within 12 weeks", () => {
    const d = createSampleData();
    expect(series(d.users, 13, 7).reduce((t, b) => t + b.value, 0)).toBe(160);
  });
});

describe("services list and reports", () => {
  it("filters, searches and sorts", () => {
    const list = createSampleData().services;
    expect(queryServices(list, { text: "", status: "all", category: "Commerce", sort: "name" }).map((s) => s.id)).toEqual(["shopping", "smart-store"]);
    expect(queryServices(list, { text: "papago", status: "all", category: "all", sort: "name" }).map((s) => s.id)).toEqual(["translator"]);
    const byUsers = queryServices(list, { text: "", status: "all", category: "all", sort: "users" });
    expect(byUsers[0]!.users).toBeGreaterThanOrEqual(byUsers[19]!.users);
  });
  it("exports CSV with escaped values", () => {
    expect(toCsv([{ a: "x,y", b: 1 }])).toBe('a,b\n"x,y",1');
    expect(reportTemplates["services"]!.rows(createSampleData(), 30)).toHaveLength(20);
  });
});
