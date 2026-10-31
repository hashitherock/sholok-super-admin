import { describe, expect, it } from "vitest";
import { filterNav, navGroups, navItems, navLink, serviceItems } from "@/lib/nav-registry";

describe("navigation registry", () => {
  it("has exactly seven navigation groups", () => {
    expect(navGroups.map((g) => g.id)).toEqual(["dashboard", "services", "access", "content", "finance", "operations", "admin"]);
  });
  it("maps all 61 destinations to their stable route parameters", () => {
    for (const item of navItems) {
      const link = navLink(item.path);
      expect(link.to === "/" ? "/" : `/${link.params.group}/${link.params.page}`).toBe(item.path);
    }
  });
  it("searches item names and group names without losing destinations", () => {
    expect(filterNav("  WEATHER ").flatMap((g) => g.items).map((i) => i.id)).toEqual(["weather"]);
    expect(filterNav("Service Management").flatMap((g) => g.items)).toHaveLength(21);
    expect(filterNav("no-matching-destination")).toEqual([]);
    expect(filterNav("")).toBe(navGroups);
  });
  it("has exactly 61 items with unique paths", () => {
    expect(navItems.length).toBe(61);
    expect(new Set(navItems.map((i) => i.path)).size).toBe(61);
  });
  it("has exactly 20 canonical services", () => {
    expect(serviceItems.map((s) => s.serviceId)).toEqual(["search","mail","news","blog","cafe","shopping","smart-store","pay","maps","knowledge-in","webtoon","series","tv-videos","music","translator","dictionary","finance","sports","weather","my-account"]);
  });
  it("never uses the word Demo", () => {
    expect(JSON.stringify(navItems)).not.toMatch(/demo/i);
  });
});
