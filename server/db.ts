import { eq, desc } from "drizzle-orm";
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
