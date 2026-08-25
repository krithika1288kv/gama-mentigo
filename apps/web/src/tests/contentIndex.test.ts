import { describe, expect, it } from "vitest";
import { findContentForQuery, getResourceById, listAllResources } from "@/lib/contentIndex";

describe("contentIndex", () => {
  it("returns matching resources for known topics", () => {
    const hits = findContentForQuery("I want to learn prompt engineering basics");
    expect(hits.some((r) => r.id === "prompt-engineering")).toBe(true);
  });

  it("returns empty array for unknown topics", () => {
    expect(findContentForQuery("lunch menu recommendations")).toEqual([]);
  });

  it("returns empty for blank query", () => {
    expect(findContentForQuery("   ")).toEqual([]);
  });

  it("looks up resource by id", () => {
    expect(getResourceById("responsible-ai")?.title).toMatch(/Responsible AI/i);
    expect(getResourceById("missing")).toBeUndefined();
  });

  it("lists all curated resources", () => {
    expect(listAllResources().length).toBeGreaterThanOrEqual(4);
  });
});
