import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { saveCompanyAnalysis, getUserAnalyses, getAnalysisById, deleteAnalysis, countUserAnalyses } from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Rotas de análise de empresas
  analysis: router({
    // Salvar uma nova análise
    save: protectedProcedure
      .input(z.object({
        empresaNome: z.string().min(1),
        cnpj: z.string().optional(),
        setor: z.string().optional(),
        cidade: z.string().optional(),
        companyData: z.any(),
        analysisResult: z.any(),
        scoreGeral: z.number(),
        scoreFinanceiro: z.number(),
        scoreComercial: z.number(),
        scoreOperacional: z.number(),
        scorePessoas: z.number(),
        scoreTecnologia: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await saveCompanyAnalysis({
          userId: ctx.user.id,
          empresaNome: input.empresaNome,
          cnpj: input.cnpj || null,
          setor: input.setor || null,
          cidade: input.cidade || null,
          companyData: input.companyData,
          analysisResult: input.analysisResult,
          scoreGeral: input.scoreGeral,
          scoreFinanceiro: input.scoreFinanceiro,
          scoreComercial: input.scoreComercial,
          scoreOperacional: input.scoreOperacional,
          scorePessoas: input.scorePessoas,
          scoreTecnologia: input.scoreTecnologia,
        });
        
        return { success: true, analysis };
      }),

    // Listar análises do usuário
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).optional().default(50),
      }).optional())
      .query(async ({ ctx, input }) => {
        const limit = input?.limit || 50;
        const analyses = await getUserAnalyses(ctx.user.id, limit);
        const total = await countUserAnalyses(ctx.user.id);
        
        return { analyses, total };
      }),

    // Buscar uma análise específica
    get: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const analysis = await getAnalysisById(input.id, ctx.user.id);
        
        if (!analysis) {
          return { success: false, error: "Análise não encontrada" };
        }
        
        return { success: true, analysis };
      }),

    // Deletar uma análise
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const deleted = await deleteAnalysis(input.id, ctx.user.id);
        
        return { success: deleted };
      }),

    // Contar análises do usuário
    count: protectedProcedure.query(async ({ ctx }) => {
      const count = await countUserAnalyses(ctx.user.id);
      return { count };
    }),
  }),
});

export type AppRouter = typeof appRouter;
