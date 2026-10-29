import { describe, expect, it } from "vitest";
import { navItems, serviceItems } from "@/lib/nav-registry";

describe("navigation registry", () => {
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
