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

      // Extrair dados estratificados do companyData de cada análise
      const empresasDetalhadas = analyses.map(a => {
        const cd = (a.companyData || {}) as any;
        return {
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
          // Dados financeiros
          faturamento6Meses: Number(cd.faturamento6Meses) || 0,
          lucroLiquido6MesesPercent: Number(cd.lucroLiquido6MesesPercent) || 0,
          custoAquisicaoCliente: Number(cd.custoAquisicaoCliente) || 0,
          ltv: Number(cd.ltv) || 0,
          inadimplenciaPercent: Number(cd.inadimplenciaPercent) || 0,
          endividamento: cd.endividamento || 'N/A',
          custoFinanceiroMensal: Number(cd.custoFinanceiroMensal) || 0,
          ticketMedio: Number(cd.ticketMedio) || 0,
          metaFaturamentoAnual: Number(cd.metaFaturamentoAnual) || 0,
          margemLucroAlvo: Number(cd.margemLucroAlvo) || 0,
          // Dados estruturais
          numSocios: Number(cd.numSocios) || 0,
          numColaboradores: Number(cd.numColaboradores) || 0,
          existeOrganograma: cd.existeOrganograma || 'N/A',
          camadasLideranca: Number(cd.camadasLideranca) || 0,
          maturidadeGerencial: cd.maturidadeGerencial || 'N/A',
          possuiPlanoMetas: cd.possuiPlanoMetas || 'N/A',
          // Dados de pessoas
          turnover12Meses: Number(cd.turnover12Meses) || 0,
          absenteismo: Number(cd.absenteismo) || 0,
          rituaisGestao: cd.rituaisGestao || 'N/A',
          modeloMetas: cd.modeloMetas || 'N/A',
          perfisMapeados: cd.perfisMapeados || 'N/A',
          // Dados comerciais
          leadsMes: Number(cd.leadsMes) || 0,
          taxaConversaoGeral: Number(cd.taxaConversaoGeral) || 0,
          taxaConversaoFunil: Number(cd.taxaConversaoFunil) || 0,
          cicloMedioVendas: Number(cd.cicloMedioVendas) || 0,
          nps: Number(cd.nps) || 0,
          roasMedio: Number(cd.roasMedio) || 0,
          winRate: Number(cd.winRate) || 0,
          canaisAquisicao: cd.canaisAquisicao || 'N/A',
          crmUtilizado: cd.crmUtilizado || 'N/A',
          funilDefinido: cd.funilDefinido || 'N/A',
          // Dados de tecnologia
          stackAtual: cd.stackAtual || 'N/A',
          ondeDadosVivem: cd.ondeDadosVivem || 'N/A',
          dashboardsKPIs: cd.dashboardsKPIs || 'N/A',
          usoIAHoje: cd.usoIAHoje || 'N/A',
          integracoesDesejadas: cd.integracoesDesejadas || 'N/A',
          softwaresFinanceiros: cd.softwaresFinanceiros || 'N/A',
          // Autoavaliação
          notaEstrategiaMetas: Number(cd.notaEstrategiaMetas) || 0,
          notaFinancasLucratividade: Number(cd.notaFinancasLucratividade) || 0,
          notaComercialMarketing: Number(cd.notaComercialMarketing) || 0,
          notaOperacoesQualidade: Number(cd.notaOperacoesQualidade) || 0,
          notaPessoasLideranca: Number(cd.notaPessoasLideranca) || 0,
          notaTecnologiaDados: Number(cd.notaTecnologiaDados) || 0,
          // Dados adicionais
          segmento: cd.segmento || 'N/A',
          regiaoAtuacao: cd.regiaoAtuacao || 'N/A',
          apetiteRisco: cd.apetiteRisco || 'N/A',
          timeComercial: cd.timeComercial || 'N/A',
          modeloComissionamento: cd.modeloComissionamento || 'N/A',
          motivosPerda: cd.motivosPerda || 'N/A',
          principaisObjecoes: cd.principaisObjecoes || 'N/A',
          concorrenciaPredominante: cd.concorrenciaPredominante || 'N/A',
          diferenciaisPercebidos: cd.diferenciaisPercebidos || 'N/A',
          vantagemCompetitiva: cd.vantagemCompetitiva || 'N/A',
          fortalezasLideranca: cd.fortalezasLideranca || 'N/A',
          gapsGestao: cd.gapsGestao || 'N/A',
          areasCarenciaPessoas: cd.areasCarenciaPessoas || 'N/A',
        };
      });

      // Calcular agregações financeiras
      const empresasComFaturamento = empresasDetalhadas.filter(e => e.faturamento6Meses > 0);
      const totalFaturamento = empresasComFaturamento.reduce((s, e) => s + e.faturamento6Meses, 0);
      const avgFaturamento = empresasComFaturamento.length > 0 ? Math.round(totalFaturamento / empresasComFaturamento.length) : 0;
      const avgTicketMedio = empresasDetalhadas.filter(e => e.ticketMedio > 0).length > 0
        ? Math.round(empresasDetalhadas.filter(e => e.ticketMedio > 0).reduce((s, e) => s + e.ticketMedio, 0) / empresasDetalhadas.filter(e => e.ticketMedio > 0).length)
        : 0;
      const avgMargemLucro = empresasDetalhadas.filter(e => e.lucroLiquido6MesesPercent > 0).length > 0
        ? Math.round(empresasDetalhadas.filter(e => e.lucroLiquido6MesesPercent > 0).reduce((s, e) => s + e.lucroLiquido6MesesPercent, 0) / empresasDetalhadas.filter(e => e.lucroLiquido6MesesPercent > 0).length * 10) / 10
        : 0;
      const avgInadimplencia = empresasDetalhadas.filter(e => e.inadimplenciaPercent > 0).length > 0
        ? Math.round(empresasDetalhadas.filter(e => e.inadimplenciaPercent > 0).reduce((s, e) => s + e.inadimplenciaPercent, 0) / empresasDetalhadas.filter(e => e.inadimplenciaPercent > 0).length * 10) / 10
        : 0;

      // Calcular agregações estruturais
      const totalColaboradores = empresasDetalhadas.reduce((s, e) => s + e.numColaboradores, 0);
      const totalSocios = empresasDetalhadas.reduce((s, e) => s + e.numSocios, 0);
      const avgColaboradores = empresasDetalhadas.length > 0 ? Math.round(totalColaboradores / empresasDetalhadas.length * 10) / 10 : 0;
      const avgTurnover = empresasDetalhadas.filter(e => e.turnover12Meses > 0).length > 0
        ? Math.round(empresasDetalhadas.filter(e => e.turnover12Meses > 0).reduce((s, e) => s + e.turnover12Meses, 0) / empresasDetalhadas.filter(e => e.turnover12Meses > 0).length * 10) / 10
        : 0;
      const avgAbsenteismo = empresasDetalhadas.filter(e => e.absenteismo > 0).length > 0
        ? Math.round(empresasDetalhadas.filter(e => e.absenteismo > 0).reduce((s, e) => s + e.absenteismo, 0) / empresasDetalhadas.filter(e => e.absenteismo > 0).length * 10) / 10
        : 0;

      // Calcular agregações comerciais
      const avgNPS = empresasDetalhadas.filter(e => e.nps > 0).length > 0
        ? Math.round(empresasDetalhadas.filter(e => e.nps > 0).reduce((s, e) => s + e.nps, 0) / empresasDetalhadas.filter(e => e.nps > 0).length)
        : 0;
      const avgLeadsMes = empresasDetalhadas.filter(e => e.leadsMes > 0).length > 0
        ? Math.round(empresasDetalhadas.filter(e => e.leadsMes > 0).reduce((s, e) => s + e.leadsMes, 0) / empresasDetalhadas.filter(e => e.leadsMes > 0).length)
        : 0;
      const avgTaxaConversao = empresasDetalhadas.filter(e => e.taxaConversaoGeral > 0).length > 0
        ? Math.round(empresasDetalhadas.filter(e => e.taxaConversaoGeral > 0).reduce((s, e) => s + e.taxaConversaoGeral, 0) / empresasDetalhadas.filter(e => e.taxaConversaoGeral > 0).length * 10) / 10
        : 0;
      const avgCicloVendas = empresasDetalhadas.filter(e => e.cicloMedioVendas > 0).length > 0
        ? Math.round(empresasDetalhadas.filter(e => e.cicloMedioVendas > 0).reduce((s, e) => s + e.cicloMedioVendas, 0) / empresasDetalhadas.filter(e => e.cicloMedioVendas > 0).length)
        : 0;

      // Faturamento por setor
      const faturamentoBySetor: Record<string, { total: number; count: number; avg: number }> = {};
      for (const e of empresasDetalhadas) {
        const setor = e.setor || 'Não informado';
        if (!faturamentoBySetor[setor]) faturamentoBySetor[setor] = { total: 0, count: 0, avg: 0 };
        faturamentoBySetor[setor].total += e.faturamento6Meses;
        faturamentoBySetor[setor].count += 1;
      }
      Object.keys(faturamentoBySetor).forEach(k => {
        faturamentoBySetor[k].avg = Math.round(faturamentoBySetor[k].total / faturamentoBySetor[k].count);
      });

      // Distribuição de porte (por número de colaboradores)
      const porteDistribuicao = {
        mei: empresasDetalhadas.filter(e => e.numColaboradores <= 1).length,
        micro: empresasDetalhadas.filter(e => e.numColaboradores >= 2 && e.numColaboradores <= 9).length,
        pequena: empresasDetalhadas.filter(e => e.numColaboradores >= 10 && e.numColaboradores <= 49).length,
        media: empresasDetalhadas.filter(e => e.numColaboradores >= 50 && e.numColaboradores <= 99).length,
        grande: empresasDetalhadas.filter(e => e.numColaboradores >= 100).length,
      };

      // Distribuição de faixa de faturamento (6 meses)
      const faixaFaturamento = {
        ate50k: empresasDetalhadas.filter(e => e.faturamento6Meses > 0 && e.faturamento6Meses <= 50000).length,
        de50a200k: empresasDetalhadas.filter(e => e.faturamento6Meses > 50000 && e.faturamento6Meses <= 200000).length,
        de200a500k: empresasDetalhadas.filter(e => e.faturamento6Meses > 200000 && e.faturamento6Meses <= 500000).length,
        de500kA1M: empresasDetalhadas.filter(e => e.faturamento6Meses > 500000 && e.faturamento6Meses <= 1000000).length,
        acima1M: empresasDetalhadas.filter(e => e.faturamento6Meses > 1000000).length,
        naoInformado: empresasDetalhadas.filter(e => e.faturamento6Meses === 0).length,
      };

      return {
        allAnalyses: empresasDetalhadas,
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
        aggregations: {
          financeiro: {
            totalFaturamento,
            avgFaturamento,
            avgTicketMedio,
            avgMargemLucro,
            avgInadimplencia,
            avgCustoAquisicao: empresasDetalhadas.filter(e => e.custoAquisicaoCliente > 0).length > 0
              ? Math.round(empresasDetalhadas.filter(e => e.custoAquisicaoCliente > 0).reduce((s, e) => s + e.custoAquisicaoCliente, 0) / empresasDetalhadas.filter(e => e.custoAquisicaoCliente > 0).length)
              : 0,
            avgLTV: empresasDetalhadas.filter(e => e.ltv > 0).length > 0
              ? Math.round(empresasDetalhadas.filter(e => e.ltv > 0).reduce((s, e) => s + e.ltv, 0) / empresasDetalhadas.filter(e => e.ltv > 0).length)
              : 0,
            faturamentoBySetor: Object.entries(faturamentoBySetor).map(([setor, data]) => ({ setor, ...data })),
            faixaFaturamento,
          },
          estrutural: {
            totalColaboradores,
            totalSocios,
            avgColaboradores,
            avgTurnover,
            avgAbsenteismo,
            porteDistribuicao,
            empresasComOrganograma: empresasDetalhadas.filter(e => e.existeOrganograma?.toLowerCase()?.includes('sim')).length,
            empresasComPlanoMetas: empresasDetalhadas.filter(e => e.possuiPlanoMetas?.toLowerCase()?.includes('sim')).length,
          },
          comercial: {
            avgNPS,
            avgLeadsMes,
            avgTaxaConversao,
            avgCicloVendas,
            avgROAS: empresasDetalhadas.filter(e => e.roasMedio > 0).length > 0
              ? Math.round(empresasDetalhadas.filter(e => e.roasMedio > 0).reduce((s, e) => s + e.roasMedio, 0) / empresasDetalhadas.filter(e => e.roasMedio > 0).length * 10) / 10
              : 0,
            avgWinRate: empresasDetalhadas.filter(e => e.winRate > 0).length > 0
              ? Math.round(empresasDetalhadas.filter(e => e.winRate > 0).reduce((s, e) => s + e.winRate, 0) / empresasDetalhadas.filter(e => e.winRate > 0).length * 10) / 10
              : 0,
          },
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
