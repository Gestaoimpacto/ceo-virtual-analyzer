import { eq, desc, sql, count, avg } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, companyAnalyses, InsertCompanyAnalysis, CompanyAnalysis } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Funções de Análise de Empresas ============

/**
 * Salvar uma nova análise de empresa
 */
export async function saveCompanyAnalysis(analysis: InsertCompanyAnalysis): Promise<CompanyAnalysis | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save analysis: database not available");
    return null;
  }

  try {
    const result = await db.insert(companyAnalyses).values(analysis);
    const insertId = result[0].insertId;
    
    // Buscar o registro inserido
    const inserted = await db.select().from(companyAnalyses).where(eq(companyAnalyses.id, insertId)).limit(1);
    return inserted.length > 0 ? inserted[0] : null;
  } catch (error) {
    console.error("[Database] Failed to save analysis:", error);
    throw error;
  }
}

/**
 * Listar análises de um usuário
 */
export async function getUserAnalyses(userId: number, limit: number = 50): Promise<CompanyAnalysis[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get analyses: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(companyAnalyses)
      .where(eq(companyAnalyses.userId, userId))
      .orderBy(desc(companyAnalyses.createdAt))
      .limit(limit);
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get user analyses:", error);
    throw error;
  }
}

/**
 * Buscar uma análise específica por ID
 */
export async function getAnalysisById(id: number, userId: number): Promise<CompanyAnalysis | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get analysis: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(companyAnalyses)
      .where(eq(companyAnalyses.id, id))
      .limit(1);
    
    // Verificar se pertence ao usuário
    if (result.length > 0 && result[0].userId === userId) {
      return result[0];
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to get analysis:", error);
    throw error;
  }
}

/**
 * Deletar uma análise
 */
export async function deleteAnalysis(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete analysis: database not available");
    return false;
  }

  try {
    // Primeiro verificar se pertence ao usuário
    const existing = await getAnalysisById(id, userId);
    if (!existing) {
      return false;
    }
    
    await db.delete(companyAnalyses).where(eq(companyAnalyses.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete analysis:", error);
    throw error;
  }
}

/**
 * Contar total de análises de um usuário
 */
export async function countUserAnalyses(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot count analyses: database not available");
    return 0;
  }

  try {
    const result = await db
      .select()
      .from(companyAnalyses)
      .where(eq(companyAnalyses.userId, userId));
    
    return result.length;
  } catch (error) {
    console.error("[Database] Failed to count analyses:", error);
    throw error;
  }
}

// ============ Funções Admin ============

/**
 * Listar todas as análises (admin) com dados do usuário
 */
export async function getAllAnalyses(limit: number = 100, offset: number = 0): Promise<Array<CompanyAnalysis & { userName?: string | null; userEmail?: string | null }>> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        id: companyAnalyses.id,
        userId: companyAnalyses.userId,
        empresaNome: companyAnalyses.empresaNome,
        cnpj: companyAnalyses.cnpj,
        setor: companyAnalyses.setor,
        cidade: companyAnalyses.cidade,
        companyData: companyAnalyses.companyData,
        analysisResult: companyAnalyses.analysisResult,
        scoreGeral: companyAnalyses.scoreGeral,
        scoreFinanceiro: companyAnalyses.scoreFinanceiro,
        scoreComercial: companyAnalyses.scoreComercial,
        scoreOperacional: companyAnalyses.scoreOperacional,
        scorePessoas: companyAnalyses.scorePessoas,
        scoreTecnologia: companyAnalyses.scoreTecnologia,
        createdAt: companyAnalyses.createdAt,
        updatedAt: companyAnalyses.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(companyAnalyses)
      .leftJoin(users, eq(companyAnalyses.userId, users.id))
      .orderBy(desc(companyAnalyses.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get all analyses:", error);
    throw error;
  }
}

/**
 * Obter estatísticas gerais (admin)
 */
export async function getAdminStats(): Promise<{
  totalAnalyses: number;
  totalUsers: number;
  avgScoreGeral: number;
  avgScoreFinanceiro: number;
  avgScoreComercial: number;
  avgScoreOperacional: number;
  avgScorePessoas: number;
  avgScoreTecnologia: number;
  setoresDistribuicao: Array<{ setor: string; count: number }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalAnalyses: 0, totalUsers: 0,
      avgScoreGeral: 0, avgScoreFinanceiro: 0, avgScoreComercial: 0,
      avgScoreOperacional: 0, avgScorePessoas: 0, avgScoreTecnologia: 0,
      setoresDistribuicao: [],
    };
  }

  try {
    // Total de análises
    const totalResult = await db.select({ total: count() }).from(companyAnalyses);
    const totalAnalyses = totalResult[0]?.total || 0;

    // Total de usuários únicos com análises
    const usersResult = await db
      .selectDistinct({ userId: companyAnalyses.userId })
      .from(companyAnalyses);
    const totalUsers = usersResult.length;

    // Médias de scores
    const avgResult = await db.select({
      avgGeral: avg(companyAnalyses.scoreGeral),
      avgFinanceiro: avg(companyAnalyses.scoreFinanceiro),
      avgComercial: avg(companyAnalyses.scoreComercial),
      avgOperacional: avg(companyAnalyses.scoreOperacional),
      avgPessoas: avg(companyAnalyses.scorePessoas),
      avgTecnologia: avg(companyAnalyses.scoreTecnologia),
    }).from(companyAnalyses);

    // Distribuição por setor
    const setoresResult = await db
      .select({
        setor: companyAnalyses.setor,
        count: count(),
      })
      .from(companyAnalyses)
      .groupBy(companyAnalyses.setor);

    return {
      totalAnalyses,
      totalUsers,
      avgScoreGeral: Math.round(Number(avgResult[0]?.avgGeral || 0)),
      avgScoreFinanceiro: Math.round(Number(avgResult[0]?.avgFinanceiro || 0)),
      avgScoreComercial: Math.round(Number(avgResult[0]?.avgComercial || 0)),
      avgScoreOperacional: Math.round(Number(avgResult[0]?.avgOperacional || 0)),
      avgScorePessoas: Math.round(Number(avgResult[0]?.avgPessoas || 0)),
      avgScoreTecnologia: Math.round(Number(avgResult[0]?.avgTecnologia || 0)),
      setoresDistribuicao: setoresResult.map(s => ({
        setor: s.setor || 'Não informado',
        count: s.count,
      })),
    };
  } catch (error) {
    console.error("[Database] Failed to get admin stats:", error);
    throw error;
  }
}

/**
 * Contar total de análises (admin)
 */
export async function countAllAnalyses(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.select({ total: count() }).from(companyAnalyses);
    return result[0]?.total || 0;
  } catch (error) {
    console.error("[Database] Failed to count all analyses:", error);
    throw error;
  }
}
