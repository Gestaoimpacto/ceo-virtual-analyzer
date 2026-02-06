import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAnonContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("admin routes", () => {
  it("admin.allAnalyses should reject non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.allAnalyses({ limit: 10, offset: 0 })
    ).rejects.toThrow();
  });

  it("admin.allAnalyses should reject anonymous users", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.allAnalyses({ limit: 10, offset: 0 })
    ).rejects.toThrow();
  });

  it("admin.stats should reject non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.stats()
    ).rejects.toThrow();
  });
});

describe("ai routes", () => {
  it("ai.generateRecommendations should reject anonymous users", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.ai.generateRecommendations({
        empresaNome: "Test Company",
        scoreGeral: 50,
        scoreFinanceiro: 40,
        scoreComercial: 60,
        scoreOperacional: 50,
        scorePessoas: 70,
        scoreTecnologia: 30,
      })
    ).rejects.toThrow();
  });
});

describe("analysis routes", () => {
  it("analysis.list should reject anonymous users", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.analysis.list({ limit: 10 })
    ).rejects.toThrow();
  });
});
