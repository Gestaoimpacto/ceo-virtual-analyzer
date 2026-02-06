import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { saveCompanyAnalysis, getUserAnalyses, getAnalysisById, deleteAnalysis, countUserAnalyses, getAllAnalyses, getAdminStats, countAllAnalyses, getAdminDashboardData } from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
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

  // Rotas administrativas
  admin: router({
    // Listar todas as análises
    allAnalyses: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).optional().default(100),
        offset: z.number().min(0).optional().default(0),
      }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit || 100;
        const offset = input?.offset || 0;
        const analyses = await getAllAnalyses(limit, offset);
        const total = await countAllAnalyses();
        
        return { analyses, total };
      }),

    // Estatísticas gerais
    stats: adminProcedure.query(async () => {
      const stats = await getAdminStats();
      return stats;
    }),

    // Dashboard completo com dados detalhados
    dashboard: adminProcedure.query(async () => {
      const data = await getAdminDashboardData();
      if (!data) {
        return {
          allAnalyses: [],
          scoresBySetor: [],
          scoresByCidade: [],
          totalUsers: 0,
          insights: {
            principaisDores: [],
            principaisOportunidades: [],
            areasComMaiorDeficit: [],
            empresasEmRisco: [],
            empresasDestaque: [],
          },
        };
      }

      // Processar insights a partir dos dados
      const analyses = data.allAnalyses;
      
      // Identificar áreas com maior déficit
      const areaScores = [
        { area: 'Financeiro', avg: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.scoreFinanceiro, 0) / analyses.length) : 0 },
        { area: 'Comercial', avg: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.scoreComercial, 0) / analyses.length) : 0 },
        { area: 'Operacional', avg: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.scoreOperacional, 0) / analyses.length) : 0 },
        { area: 'Pessoas', avg: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.scorePessoas, 0) / analyses.length) : 0 },
        { area: 'Tecnologia', avg: analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.scoreTecnologia, 0) / analyses.length) : 0 },
      ].sort((a, b) => a.avg - b.avg);

      // Empresas em risco (score geral < 40)
      const empresasEmRisco = analyses
        .filter(a => a.scoreGeral < 40)
        .map(a => ({
          nome: a.empresaNome,
          setor: a.setor || 'N/A',
          scoreGeral: a.scoreGeral,
          pioresAreas: [
            { area: 'Financeiro', score: a.scoreFinanceiro },
            { area: 'Comercial', score: a.scoreComercial },
            { area: 'Operacional', score: a.scoreOperacional },
            { area: 'Pessoas', score: a.scorePessoas },
            { area: 'Tecnologia', score: a.scoreTecnologia },
          ].sort((x, y) => x.score - y.score).slice(0, 2),
          aluno: a.userName || 'N/A',
        }));

      // Empresas destaque (score geral >= 70)
      const empresasDestaque = analyses
        .filter(a => a.scoreGeral >= 70)
        .map(a => ({
          nome: a.empresaNome,
          setor: a.setor || 'N/A',
          scoreGeral: a.scoreGeral,
          melhoresAreas: [
            { area: 'Financeiro', score: a.scoreFinanceiro },
            { area: 'Comercial', score: a.scoreComercial },
            { area: 'Operacional', score: a.scoreOperacional },
            { area: 'Pessoas', score: a.scorePessoas },
            { area: 'Tecnologia', score: a.scoreTecnologia },
          ].sort((x, y) => y.score - x.score).slice(0, 2),
          aluno: a.userName || 'N/A',
        }));

      // Extrair dores e oportunidades dos analysisResult
      const doresMap: Record<string, number> = {};
      const oportunidadesMap: Record<string, number> = {};
      const causasMap: Record<string, number> = {};
      const necessidadesMap: Record<string, number> = {};

      for (const a of analyses) {
        const result = a.analysisResult as any;
        if (!result) continue;

        // Extrair diagnósticos
        const diagnosticos = result.diagnosticos || result.diagnosticosAvancados || [];
        for (const d of diagnosticos) {
          if (d && typeof d === 'object') {
            // Problemas/dores
            const problemas = d.problemas || d.pontosFracos || [];
            for (const p of problemas) {
              if (typeof p === 'string' && p.length > 5) {
                doresMap[p] = (doresMap[p] || 0) + 1;
              }
            }
            // Oportunidades
            const oportunidades = d.oportunidades || d.pontosFortes || [];
            for (const o of oportunidades) {
              if (typeof o === 'string' && o.length > 5) {
                oportunidadesMap[o] = (oportunidadesMap[o] || 0) + 1;
              }
            }
            // Causas
            if (d.causasRaiz) {
              for (const c of d.causasRaiz) {
                if (typeof c === 'string' && c.length > 5) {
                  causasMap[c] = (causasMap[c] || 0) + 1;
                }
              }
            }
            // Necessidades/ações
            if (d.acoesImediatas) {
              for (const n of d.acoesImediatas) {
                if (typeof n === 'string' && n.length > 5) {
                  necessidadesMap[n] = (necessidadesMap[n] || 0) + 1;
                }
              }
            }
          }
        }

        // Extrair recomendações
        const recomendacoes = result.recomendacoes || [];
        for (const r of recomendacoes) {
          if (r && typeof r === 'object' && r.titulo) {
            necessidadesMap[r.titulo] = (necessidadesMap[r.titulo] || 0) + 1;
          }
        }
      }

      const sortByCount = (map: Record<string, number>) =>
        Object.entries(map)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([item, count]) => ({ item, count }));

      return {
        allAnalyses: analyses.map(a => ({
          id: a.id,
          empresaNome: a.empresaNome,
          cnpj: a.cnpj,
          setor: a.setor,
          cidade: a.cidade,
          scoreGeral: a.scoreGeral,
          scoreFinanceiro: a.scoreFinanceiro,
          scoreComercial: a.scoreComercial,
          scoreOperacional: a.scoreOperacional,
          scorePessoas: a.scorePessoas,
          scoreTecnologia: a.scoreTecnologia,
          createdAt: a.createdAt,
          userName: a.userName,
          userEmail: a.userEmail,
        })),
        scoresBySetor: data.scoresBySetor,
        scoresByCidade: data.scoresByCidade,
        totalUsers: data.totalUsers,
        insights: {
          principaisDores: sortByCount(doresMap),
          principaisOportunidades: sortByCount(oportunidadesMap),
          principaisCausas: sortByCount(causasMap),
          principaisNecessidades: sortByCount(necessidadesMap),
          areasComMaiorDeficit: areaScores,
          empresasEmRisco,
          empresasDestaque,
        },
      };
    }),
  }),

  // Integração com IA Generativa
  ai: router({
    // Gerar recomendações personalizadas com IA
    generateRecommendations: protectedProcedure
      .input(z.object({
        empresaNome: z.string(),
        setor: z.string().optional(),
        cidade: z.string().optional(),
        scoreGeral: z.number(),
        scoreFinanceiro: z.number(),
        scoreComercial: z.number(),
        scoreOperacional: z.number(),
        scorePessoas: z.number(),
        scoreTecnologia: z.number(),
        companyData: z.any(),
        analysisResult: z.any(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `Você é um CEO experiente e consultor empresarial de alto nível, especialista em:
- Finanças corporativas e gestão financeira
- Marketing digital e tradicional
- CRM e gestão de relacionamento com clientes
- Vendas e estratégia comercial
- Inteligência Artificial aplicada a negócios
- Gestão de pessoas e cultura organizacional
- Processos e operações

Seu papel é analisar os dados de uma empresa e fornecer recomendações ALTAMENTE PERSONALIZADAS, PRÁTICAS e ACIONÁVEIS.

REGRAS:
1. Seja específico - não dê conselhos genéricos. Use os dados reais da empresa.
2. Priorize por impacto - comece pelo que vai gerar mais resultado em menos tempo.
3. Inclua números e métricas quando possível.
4. Sugira ferramentas e metodologias específicas.
5. Considere o porte da empresa e o setor de atuação.
6. Responda em português brasileiro.
7. Use formatação markdown para organizar a resposta.`;

        const companyContext = `
## Dados da Empresa
- **Nome**: ${input.empresaNome}
- **Setor**: ${input.setor || 'Não informado'}
- **Cidade**: ${input.cidade || 'Não informada'}

## Scores de Maturidade (0-100)
- **Score Geral**: ${input.scoreGeral}/100
- **Financeiro**: ${input.scoreFinanceiro}/100
- **Comercial**: ${input.scoreComercial}/100
- **Operacional**: ${input.scoreOperacional}/100
- **Pessoas**: ${input.scorePessoas}/100
- **Tecnologia**: ${input.scoreTecnologia}/100

## Dados Detalhados
${JSON.stringify(input.companyData, null, 2)}
`;

        const userPrompt = `Analise os dados desta empresa e forneça um relatório CEO completo com:

${companyContext}

Forneça:

### 1. DIAGNÓSTICO EXECUTIVO (3-4 parágrafos)
Análise geral da situação da empresa, pontos fortes e fracos mais críticos.

### 2. TOP 5 AÇÕES PRIORITÁRIAS (próximos 30 dias)
Para cada ação:
- O que fazer (específico)
- Por que é urgente
- Resultado esperado
- Investimento estimado (se aplicável)

### 3. ESTRATÉGIA COMERCIAL E MARKETING
- Táticas específicas para aumentar vendas
- Canais de aquisição recomendados para o setor
- Sugestões de campanhas e conteúdo
- Métricas a acompanhar

### 4. GESTÃO FINANCEIRA
- Análise de margem e lucratividade
- Recomendações para redução de custos
- Estratégias de precificação
- Indicadores financeiros a monitorar

### 5. GESTÃO DE PESSOAS E PROCESSOS
- Estrutura organizacional recomendada
- Processos prioritários para documentar
- Cultura e engajamento
- Indicadores de RH

### 6. TECNOLOGIA E INOVAÇÃO
- Ferramentas recomendadas para o porte/setor
- Automações prioritárias
- Uso de IA no negócio
- Roadmap tecnológico

### 7. PLANO DE AÇÃO 90 DIAS
Cronograma detalhado mês a mês com entregas específicas.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });

          const content = response.choices[0]?.message?.content;
          const textContent = typeof content === 'string' 
            ? content 
            : Array.isArray(content) 
              ? content.filter(c => c.type === 'text').map(c => (c as { type: 'text'; text: string }).text).join('\n')
              : '';

          return { 
            success: true, 
            recommendation: textContent,
            model: response.model,
          };
        } catch (error) {
          console.error("[AI] Failed to generate recommendations:", error);
          return { 
            success: false, 
            recommendation: "Não foi possível gerar as recomendações da IA neste momento. Por favor, tente novamente.",
            error: error instanceof Error ? error.message : "Erro desconhecido",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
