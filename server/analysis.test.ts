import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do módulo db
vi.mock("./db", () => ({
  saveCompanyAnalysis: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    empresaNome: "Empresa Teste",
    cnpj: "12.345.678/0001-90",
    setor: "Tecnologia",
    cidade: "São Paulo",
    companyData: {},
    analysisResult: {},
    scoreGeral: 75,
    scoreFinanceiro: 70,
    scoreComercial: 80,
    scoreOperacional: 75,
    scorePessoas: 72,
    scoreTecnologia: 78,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getUserAnalyses: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      empresaNome: "Empresa Teste",
      scoreGeral: 75,
      createdAt: new Date(),
    },
  ]),
  getAnalysisById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    empresaNome: "Empresa Teste",
    companyData: {},
    analysisResult: {},
    scoreGeral: 75,
  }),
  deleteAnalysis: vi.fn().mockResolvedValue(true),
  countUserAnalyses: vi.fn().mockResolvedValue(5),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("analysis.save", () => {
  it("saves analysis for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.save({
      empresaNome: "Empresa Teste",
      cnpj: "12.345.678/0001-90",
      setor: "Tecnologia",
      cidade: "São Paulo",
      companyData: { empresa: "Empresa Teste" },
      analysisResult: { scoreGeral: 75 },
      scoreGeral: 75,
      scoreFinanceiro: 70,
      scoreComercial: 80,
      scoreOperacional: 75,
      scorePessoas: 72,
      scoreTecnologia: 78,
    });

    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
    expect(result.analysis?.empresaNome).toBe("Empresa Teste");
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.analysis.save({
        empresaNome: "Empresa Teste",
        companyData: {},
        analysisResult: {},
        scoreGeral: 75,
        scoreFinanceiro: 70,
        scoreComercial: 80,
        scoreOperacional: 75,
        scorePessoas: 72,
        scoreTecnologia: 78,
      })
    ).rejects.toThrow();
  });
});

describe("analysis.list", () => {
  it("returns user analyses", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.list({ limit: 10 });

    expect(result.analyses).toBeDefined();
    expect(Array.isArray(result.analyses)).toBe(true);
    expect(result.total).toBeDefined();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.analysis.list()).rejects.toThrow();
  });
});

describe("analysis.get", () => {
  it("returns specific analysis for owner", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.get({ id: 1 });

    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.analysis.get({ id: 1 })).rejects.toThrow();
  });
});

describe("analysis.delete", () => {
  it("deletes analysis for owner", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.delete({ id: 1 });

    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.analysis.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("analysis.count", () => {
  it("returns count for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.count();

    expect(result.count).toBeDefined();
    expect(typeof result.count).toBe("number");
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.analysis.count()).rejects.toThrow();
  });
});
