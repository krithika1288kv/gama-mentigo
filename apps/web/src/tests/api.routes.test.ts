import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => ({ user: { email: "dev.learner@ust.com" } })),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
  isAuthBypassEnabled: () => true,
}));

describe("API routes", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.AUTH_BYPASS = "true";
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;
  });

  it("POST /api/tutor returns 400 for empty input", async () => {
    const { POST } = await import("@/app/api/tutor/route");
    const res = await POST(
      new Request("http://localhost/api/tutor", {
        method: "POST",
        body: JSON.stringify({ message: "", level: "Beginner" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("empty");
  });

  it("POST /api/tutor streams a mock response when Azure is not configured", async () => {
    const { POST } = await import("@/app/api/tutor/route");
    const res = await POST(
      new Request("http://localhost/api/tutor", {
        method: "POST",
        body: JSON.stringify({
          message: "What is prompt engineering?",
          level: "Beginner",
          history: [],
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.toLowerCase()).toContain("token");
    expect(text).toContain("own words");
    expect(text).not.toContain("Azure OpenAI not configured");
    expect(text.length).toBeGreaterThan(20);
  });

  it("POST /api/coach returns 400 for empty artifact", async () => {
    const { POST } = await import("@/app/api/coach/route");
    const res = await POST(
      new Request("http://localhost/api/coach", {
        method: "POST",
        body: JSON.stringify({ artifact: " ", artifactType: "ai_prompt" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("empty");
  });

  it("POST /api/coach streams feedback in demo mode", async () => {
    const { POST } = await import("@/app/api/coach/route");
    const res = await POST(
      new Request("http://localhost/api/coach", {
        method: "POST",
        body: JSON.stringify({
          artifact: "You are a helpful assistant. Summarize this doc.",
          artifactType: "ai_prompt",
          history: [],
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("What worked");
    expect(text).toContain("Suggested rewrite");
    expect(text).not.toContain("Azure OpenAI not configured");
  });
});
