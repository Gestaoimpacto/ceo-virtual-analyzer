import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de análises de empresas
 * Armazena os dados da empresa e o resultado da análise
 */
export const companyAnalyses = mysqlTable("company_analyses", {
  id: int("id").autoincrement().primaryKey(),
  /** ID do usuário que criou a análise */
  userId: int("userId").notNull(),
  /** Nome da empresa analisada */
  empresaNome: varchar("empresaNome", { length: 255 }).notNull(),
  /** CNPJ da empresa */
  cnpj: varchar("cnpj", { length: 20 }),
  /** Setor de atuação */
  setor: varchar("setor", { length: 100 }),
  /** Cidade */
  cidade: varchar("cidade", { length: 100 }),
  /** Dados completos da empresa (JSON) */
  companyData: json("companyData").notNull(),
  /** Resultado da análise (JSON) */
  analysisResult: json("analysisResult").notNull(),
  /** Score geral de maturidade */
  scoreGeral: int("scoreGeral").notNull(),
  /** Score financeiro */
  scoreFinanceiro: int("scoreFinanceiro").notNull(),
  /** Score comercial */
  scoreComercial: int("scoreComercial").notNull(),
  /** Score operacional */
  scoreOperacional: int("scoreOperacional").notNull(),
  /** Score de pessoas */
  scorePessoas: int("scorePessoas").notNull(),
  /** Score de tecnologia */
  scoreTecnologia: int("scoreTecnologia").notNull(),
  /** Data de criação */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Data de atualização */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyAnalysis = typeof companyAnalyses.$inferSelect;
export type InsertCompanyAnalysis = typeof companyAnalyses.$inferInsert;
