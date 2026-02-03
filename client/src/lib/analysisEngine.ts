import { 
  CompanyData, 
  AnalysisResult, 
  DiagnosticoArea, 
  Recomendacao, 
  PlanoAcao,
  BenchmarkSetor 
} from '@/types/company';

// Benchmarks por setor (valores de referência do mercado brasileiro)
const SECTOR_BENCHMARKS: Record<string, BenchmarkSetor> = {
  'Comércio': {
    setor: 'Comércio',
    margemLucroMedia: 8,
    ticketMedioMercado: 250,
    taxaConversaoMedia: 3,
    npsReferencia: 50,
    turnoverMedio: 35,
    cicloVendasMedio: 7,
  },
  'Serviços': {
    setor: 'Serviços',
    margemLucroMedia: 15,
    ticketMedioMercado: 500,
    taxaConversaoMedia: 5,
    npsReferencia: 55,
    turnoverMedio: 25,
    cicloVendasMedio: 14,
  },
  'Indústria': {
    setor: 'Indústria',
    margemLucroMedia: 12,
    ticketMedioMercado: 5000,
    taxaConversaoMedia: 8,
    npsReferencia: 45,
    turnoverMedio: 20,
    cicloVendasMedio: 30,
  },
  'Tecnologia': {
    setor: 'Tecnologia',
    margemLucroMedia: 20,
    ticketMedioMercado: 2000,
    taxaConversaoMedia: 4,
    npsReferencia: 60,
    turnoverMedio: 30,
    cicloVendasMedio: 21,
  },
  'Saúde': {
    setor: 'Saúde',
    margemLucroMedia: 18,
    ticketMedioMercado: 800,
    taxaConversaoMedia: 6,
    npsReferencia: 65,
    turnoverMedio: 22,
    cicloVendasMedio: 3,
  },
  'Educação': {
    setor: 'Educação',
    margemLucroMedia: 25,
    ticketMedioMercado: 1500,
    taxaConversaoMedia: 5,
    npsReferencia: 55,
    turnoverMedio: 28,
    cicloVendasMedio: 14,
  },
  'Alimentação': {
    setor: 'Alimentação',
    margemLucroMedia: 10,
    ticketMedioMercado: 45,
    taxaConversaoMedia: 15,
    npsReferencia: 50,
    turnoverMedio: 45,
    cicloVendasMedio: 1,
  },
  'Construção': {
    setor: 'Construção',
    margemLucroMedia: 8,
    ticketMedioMercado: 50000,
    taxaConversaoMedia: 10,
    npsReferencia: 40,
    turnoverMedio: 30,
    cicloVendasMedio: 60,
  },
  'default': {
    setor: 'Geral',
    margemLucroMedia: 12,
    ticketMedioMercado: 1000,
    taxaConversaoMedia: 5,
    npsReferencia: 50,
    turnoverMedio: 30,
    cicloVendasMedio: 14,
  },
};

// Função principal de análise
export function analyzeCompany(data: CompanyData): AnalysisResult {
  const benchmark = getBenchmarkForSector(data.setor);
  
  // Calcular scores por área
  const scoreFinanceiro = calculateFinancialScore(data, benchmark);
  const scoreComercial = calculateCommercialScore(data, benchmark);
  const scoreOperacional = calculateOperationalScore(data);
  const scorePessoas = calculatePeopleScore(data, benchmark);
  const scoreTecnologia = calculateTechnologyScore(data);
  
  // Score geral ponderado
  const scoreGeral = Math.round(
    scoreFinanceiro * 0.25 +
    scoreComercial * 0.25 +
    scoreOperacional * 0.2 +
    scorePessoas * 0.15 +
    scoreTecnologia * 0.15
  );
  
  // Gerar diagnósticos
  const diagnosticoFinanceiro = generateFinancialDiagnosis(data, benchmark, scoreFinanceiro);
  const diagnosticoComercial = generateCommercialDiagnosis(data, benchmark, scoreComercial);
  const diagnosticoOperacional = generateOperationalDiagnosis(data, scoreOperacional);
  const diagnosticoPessoas = generatePeopleDiagnosis(data, benchmark, scorePessoas);
  const diagnosticoTecnologia = generateTechnologyDiagnosis(data, scoreTecnologia);
  
  // Gerar recomendações priorizadas
  const recomendacoesPrioritarias = generateRecommendations(
    data, 
    benchmark,
    { scoreFinanceiro, scoreComercial, scoreOperacional, scorePessoas, scoreTecnologia }
  );
  
  // Gerar plano de ação 90 dias
  const planoAcao90Dias = generateActionPlan(recomendacoesPrioritarias);
  
  return {
    empresa: data.empresa,
    setor: data.setor || 'Não informado',
    cidade: data.cidade || 'Não informada',
    scoreGeral,
    scoreFinanceiro,
    scoreComercial,
    scoreOperacional,
    scorePessoas,
    scoreTecnologia,
    diagnosticoFinanceiro,
    diagnosticoComercial,
    diagnosticoOperacional,
    diagnosticoPessoas,
    diagnosticoTecnologia,
    recomendacoesPrioritarias,
    planoAcao90Dias,
    benchmarks: benchmark,
  };
}

function getBenchmarkForSector(setor: string): BenchmarkSetor {
  const normalizedSetor = setor?.toLowerCase() || '';
  
  for (const [key, benchmark] of Object.entries(SECTOR_BENCHMARKS)) {
    if (normalizedSetor.includes(key.toLowerCase())) {
      return benchmark;
    }
  }
  
  return SECTOR_BENCHMARKS['default'];
}

// Cálculos de Score
function calculateFinancialScore(data: CompanyData, benchmark: BenchmarkSetor): number {
  let score = 50; // Base
  
  // Margem de lucro vs benchmark
  if (data.lucroLiquido6MesesPercent > 0) {
    const margemRatio = data.lucroLiquido6MesesPercent / benchmark.margemLucroMedia;
    score += Math.min(20, margemRatio * 15);
  }
  
  // Inadimplência (quanto menor, melhor)
  if (data.inadimplenciaPercent <= 2) score += 15;
  else if (data.inadimplenciaPercent <= 5) score += 10;
  else if (data.inadimplenciaPercent <= 10) score += 5;
  else score -= 10;
  
  // LTV/CAC ratio
  if (data.ltv > 0 && data.custoAquisicaoCliente > 0) {
    const ltvCacRatio = data.ltv / data.custoAquisicaoCliente;
    if (ltvCacRatio >= 3) score += 15;
    else if (ltvCacRatio >= 2) score += 10;
    else if (ltvCacRatio >= 1) score += 5;
  }
  
  // Autoavaliação financeira
  if (data.notaFinancasLucratividade >= 8) score += 10;
  else if (data.notaFinancasLucratividade >= 6) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function calculateCommercialScore(data: CompanyData, benchmark: BenchmarkSetor): number {
  let score = 50;
  
  // Taxa de conversão vs benchmark
  if (data.taxaConversaoGeral > 0) {
    const convRatio = data.taxaConversaoGeral / benchmark.taxaConversaoMedia;
    score += Math.min(15, convRatio * 10);
  }
  
  // NPS
  if (data.nps >= 70) score += 20;
  else if (data.nps >= 50) score += 15;
  else if (data.nps >= 30) score += 10;
  else if (data.nps > 0) score += 5;
  
  // Win rate
  if (data.winRate >= 40) score += 15;
  else if (data.winRate >= 25) score += 10;
  else if (data.winRate >= 15) score += 5;
  
  // CRM e funil definido
  if (data.funilDefinido?.toLowerCase().includes('sim')) score += 10;
  if (data.crmUtilizado && data.crmUtilizado !== 'Não utilizo') score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function calculateOperationalScore(data: CompanyData): number {
  let score = 50;
  
  // Plano de metas
  if (data.possuiPlanoMetas?.toLowerCase().includes('sim')) score += 15;
  
  // Maturidade gerencial
  const maturidade = data.maturidadeGerencial?.toLowerCase() || '';
  if (maturidade.includes('alto') || maturidade.includes('avançad')) score += 20;
  else if (maturidade.includes('médio') || maturidade.includes('intermediár')) score += 10;
  
  // KPIs definidos
  if (data.kpisEstrategicos && data.kpisEstrategicos.length > 10) score += 10;
  
  // Autoavaliação operacional
  if (data.notaOperacoesQualidade >= 8) score += 15;
  else if (data.notaOperacoesQualidade >= 6) score += 10;
  else if (data.notaOperacoesQualidade >= 4) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function calculatePeopleScore(data: CompanyData, benchmark: BenchmarkSetor): number {
  let score = 50;
  
  // Turnover vs benchmark
  if (data.turnover12Meses > 0) {
    if (data.turnover12Meses < benchmark.turnoverMedio * 0.5) score += 20;
    else if (data.turnover12Meses < benchmark.turnoverMedio) score += 10;
    else if (data.turnover12Meses > benchmark.turnoverMedio * 1.5) score -= 10;
  }
  
  // Organograma
  if (data.existeOrganograma?.toLowerCase().includes('sim')) score += 10;
  
  // Perfis mapeados
  if (data.perfisMapeados?.toLowerCase().includes('sim')) score += 10;
  
  // Rituais de gestão
  if (data.rituaisGestao && data.rituaisGestao.length > 10) score += 10;
  
  // Autoavaliação pessoas
  if (data.notaPessoasLideranca >= 8) score += 15;
  else if (data.notaPessoasLideranca >= 6) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

function calculateTechnologyScore(data: CompanyData): number {
  let score = 40;
  
  // Stack tecnológico
  if (data.stackAtual && data.stackAtual.length > 10) score += 15;
  
  // Dashboards e KPIs
  if (data.dashboardsKPIs?.toLowerCase().includes('sim')) score += 15;
  
  // Uso de IA
  const usoIA = data.usoIAHoje?.toLowerCase() || '';
  if (usoIA.includes('sim') || usoIA.includes('utiliz')) score += 15;
  
  // Onde dados vivem (centralizado é melhor)
  const dadosLocal = data.ondeDadosVivem?.toLowerCase() || '';
  if (dadosLocal.includes('erp') || dadosLocal.includes('central')) score += 10;
  
  // Autoavaliação tecnologia
  if (data.notaTecnologiaDados >= 8) score += 15;
  else if (data.notaTecnologiaDados >= 6) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

// Geração de Diagnósticos
function getStatusFromScore(score: number): 'critico' | 'atencao' | 'adequado' | 'excelente' {
  if (score >= 80) return 'excelente';
  if (score >= 60) return 'adequado';
  if (score >= 40) return 'atencao';
  return 'critico';
}

function generateFinancialDiagnosis(data: CompanyData, benchmark: BenchmarkSetor, score: number): DiagnosticoArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  // Análise de margem
  if (data.lucroLiquido6MesesPercent >= benchmark.margemLucroMedia) {
    pontosFortesText.push(`Margem de lucro de ${data.lucroLiquido6MesesPercent}% está acima da média do setor (${benchmark.margemLucroMedia}%)`);
  } else if (data.lucroLiquido6MesesPercent > 0) {
    pontosAtencaoText.push(`Margem de lucro de ${data.lucroLiquido6MesesPercent}% está abaixo da média do setor (${benchmark.margemLucroMedia}%)`);
    oportunidades.push('Revisar estrutura de custos e precificação para melhorar margem');
  }
  
  // Análise de inadimplência
  if (data.inadimplenciaPercent <= 3) {
    pontosFortesText.push(`Inadimplência controlada em ${data.inadimplenciaPercent}%`);
  } else if (data.inadimplenciaPercent > 5) {
    pontosAtencaoText.push(`Inadimplência de ${data.inadimplenciaPercent}% requer atenção imediata`);
    oportunidades.push('Implementar política de crédito mais rigorosa e cobrança proativa');
  }
  
  // LTV/CAC
  if (data.ltv > 0 && data.custoAquisicaoCliente > 0) {
    const ratio = data.ltv / data.custoAquisicaoCliente;
    if (ratio >= 3) {
      pontosFortesText.push(`Excelente relação LTV/CAC de ${ratio.toFixed(1)}x`);
    } else if (ratio < 2) {
      pontosAtencaoText.push(`Relação LTV/CAC de ${ratio.toFixed(1)}x indica necessidade de otimização`);
      oportunidades.push('Aumentar retenção de clientes ou reduzir custo de aquisição');
    }
  }
  
  // Endividamento
  const endiv = data.endividamento?.toLowerCase() || '';
  if (endiv.includes('alto') || endiv.includes('crítico')) {
    pontosAtencaoText.push('Nível de endividamento elevado compromete crescimento');
    oportunidades.push('Renegociar dívidas e criar plano de desalavancagem');
  }
  
  return {
    area: 'Finanças e Lucratividade',
    status: getStatusFromScore(score),
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

function generateCommercialDiagnosis(data: CompanyData, benchmark: BenchmarkSetor, score: number): DiagnosticoArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  // NPS
  if (data.nps >= 70) {
    pontosFortesText.push(`NPS de ${data.nps} indica alta satisfação e potencial de indicações`);
  } else if (data.nps >= 50) {
    pontosFortesText.push(`NPS de ${data.nps} está na zona de qualidade`);
  } else if (data.nps > 0 && data.nps < 30) {
    pontosAtencaoText.push(`NPS de ${data.nps} indica problemas na experiência do cliente`);
    oportunidades.push('Mapear jornada do cliente e identificar pontos de fricção');
  }
  
  // Taxa de conversão
  if (data.taxaConversaoGeral >= benchmark.taxaConversaoMedia) {
    pontosFortesText.push(`Taxa de conversão de ${data.taxaConversaoGeral}% está acima do mercado`);
  } else if (data.taxaConversaoGeral > 0) {
    pontosAtencaoText.push(`Taxa de conversão de ${data.taxaConversaoGeral}% pode ser otimizada`);
    oportunidades.push('Revisar processo de vendas e qualificação de leads');
  }
  
  // Funil e CRM
  if (!data.funilDefinido?.toLowerCase().includes('sim')) {
    pontosAtencaoText.push('Funil de vendas não está claramente definido');
    oportunidades.push('Estruturar funil de vendas com etapas e métricas claras');
  }
  
  if (!data.crmUtilizado || data.crmUtilizado.toLowerCase().includes('não')) {
    pontosAtencaoText.push('Ausência de CRM dificulta gestão de relacionamento');
    oportunidades.push('Implementar CRM para centralizar informações de clientes');
  }
  
  // Canais de aquisição
  if (data.canaisAquisicao && data.canaisAquisicao.split(',').length >= 3) {
    pontosFortesText.push('Diversificação saudável de canais de aquisição');
  } else {
    oportunidades.push('Diversificar canais de aquisição para reduzir dependência');
  }
  
  return {
    area: 'Comercial e Marketing',
    status: getStatusFromScore(score),
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

function generateOperationalDiagnosis(data: CompanyData, score: number): DiagnosticoArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  // Plano de metas
  if (data.possuiPlanoMetas?.toLowerCase().includes('sim')) {
    pontosFortesText.push('Possui plano de metas e orçamento estruturado');
  } else {
    pontosAtencaoText.push('Ausência de plano de metas compromete direcionamento');
    oportunidades.push('Desenvolver planejamento estratégico com metas SMART');
  }
  
  // KPIs
  if (data.kpisEstrategicos && data.kpisEstrategicos.length > 20) {
    pontosFortesText.push('KPIs estratégicos definidos e acompanhados');
  } else {
    pontosAtencaoText.push('KPIs estratégicos não estão claramente definidos');
    oportunidades.push('Definir KPIs por área alinhados aos objetivos estratégicos');
  }
  
  // Visão de longo prazo
  if (data.visao3a5Anos && data.visao3a5Anos.length > 20) {
    pontosFortesText.push('Visão de médio/longo prazo definida');
  } else {
    oportunidades.push('Construir visão estratégica de 3-5 anos com marcos claros');
  }
  
  // Autoavaliação
  if (data.notaEstrategiaMetas >= 7) {
    pontosFortesText.push('Boa percepção interna sobre estratégia e metas');
  }
  
  return {
    area: 'Estratégia e Operações',
    status: getStatusFromScore(score),
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

function generatePeopleDiagnosis(data: CompanyData, benchmark: BenchmarkSetor, score: number): DiagnosticoArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  // Turnover
  if (data.turnover12Meses > 0) {
    if (data.turnover12Meses < benchmark.turnoverMedio) {
      pontosFortesText.push(`Turnover de ${data.turnover12Meses}% está abaixo da média do setor`);
    } else if (data.turnover12Meses > benchmark.turnoverMedio * 1.3) {
      pontosAtencaoText.push(`Turnover de ${data.turnover12Meses}% está elevado para o setor`);
      oportunidades.push('Realizar pesquisa de clima e implementar plano de retenção');
    }
  }
  
  // Organograma
  if (data.existeOrganograma?.toLowerCase().includes('sim')) {
    pontosFortesText.push('Estrutura organizacional definida com organograma');
  } else {
    pontosAtencaoText.push('Ausência de organograma formal');
    oportunidades.push('Definir organograma com papéis e responsabilidades claros');
  }
  
  // Perfis comportamentais
  if (data.perfisMapeados?.toLowerCase().includes('sim')) {
    pontosFortesText.push('Perfis comportamentais da equipe mapeados');
  } else {
    oportunidades.push('Mapear perfis comportamentais para melhor alocação');
  }
  
  // Rituais de gestão
  if (data.rituaisGestao && data.rituaisGestao.length > 10) {
    pontosFortesText.push('Rituais de gestão estabelecidos');
  } else {
    pontosAtencaoText.push('Rituais de gestão não estão formalizados');
    oportunidades.push('Implementar reuniões de alinhamento e feedback estruturado');
  }
  
  // Gaps identificados
  if (data.gapsGestao && data.gapsGestao.length > 10) {
    pontosAtencaoText.push(`Gaps identificados: ${data.gapsGestao.substring(0, 100)}...`);
  }
  
  return {
    area: 'Pessoas e Liderança',
    status: getStatusFromScore(score),
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

function generateTechnologyDiagnosis(data: CompanyData, score: number): DiagnosticoArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  // Stack tecnológico
  if (data.stackAtual && data.stackAtual.length > 20) {
    pontosFortesText.push('Stack tecnológico definido e em uso');
  } else {
    pontosAtencaoText.push('Stack tecnológico limitado ou não documentado');
    oportunidades.push('Mapear necessidades e definir stack adequado ao negócio');
  }
  
  // Dashboards
  if (data.dashboardsKPIs?.toLowerCase().includes('sim')) {
    pontosFortesText.push('Dashboards de KPIs implementados');
  } else {
    pontosAtencaoText.push('Ausência de dashboards para acompanhamento de KPIs');
    oportunidades.push('Implementar dashboards para tomada de decisão baseada em dados');
  }
  
  // IA
  const usoIA = data.usoIAHoje?.toLowerCase() || '';
  if (usoIA.includes('sim') || usoIA.includes('utiliz')) {
    pontosFortesText.push('Já utiliza inteligência artificial em processos');
  } else {
    oportunidades.push('Explorar uso de IA para automação e insights');
  }
  
  // Centralização de dados
  const dadosLocal = data.ondeDadosVivem?.toLowerCase() || '';
  if (dadosLocal.includes('planilha') || dadosLocal.includes('excel')) {
    pontosAtencaoText.push('Dados dispersos em planilhas dificultam análise');
    oportunidades.push('Centralizar dados em sistema integrado');
  }
  
  // Integrações
  if (data.integracoesDesejadas && data.integracoesDesejadas.length > 10) {
    oportunidades.push(`Priorizar integrações: ${data.integracoesDesejadas.substring(0, 80)}...`);
  }
  
  return {
    area: 'Tecnologia e Dados',
    status: getStatusFromScore(score),
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

// Geração de Recomendações
function generateRecommendations(
  data: CompanyData, 
  benchmark: BenchmarkSetor,
  scores: { scoreFinanceiro: number; scoreComercial: number; scoreOperacional: number; scorePessoas: number; scoreTecnologia: number }
): Recomendacao[] {
  const recomendacoes: Recomendacao[] = [];
  let id = 1;
  
  // Ordenar áreas por score (menor primeiro = maior prioridade)
  const areas = [
    { area: 'financeiro' as const, score: scores.scoreFinanceiro },
    { area: 'comercial' as const, score: scores.scoreComercial },
    { area: 'operacional' as const, score: scores.scoreOperacional },
    { area: 'pessoas' as const, score: scores.scorePessoas },
    { area: 'tecnologia' as const, score: scores.scoreTecnologia },
  ].sort((a, b) => a.score - b.score);
  
  // Gerar recomendações baseadas nos gaps identificados
  
  // Financeiro
  if (scores.scoreFinanceiro < 70) {
    if (data.lucroLiquido6MesesPercent < benchmark.margemLucroMedia) {
      recomendacoes.push({
        id: id++,
        area: 'financeiro',
        prioridade: 'alta',
        titulo: 'Otimização de Margem de Lucro',
        descricao: `Sua margem atual de ${data.lucroLiquido6MesesPercent}% está abaixo da média do setor (${benchmark.margemLucroMedia}%). Realize análise ABC de custos, revise precificação e identifique produtos/serviços de baixa rentabilidade.`,
        impactoEsperado: `Aumento de ${Math.round((benchmark.margemLucroMedia - data.lucroLiquido6MesesPercent) * 0.5)}% na margem líquida`,
        prazoSugerido: '60 dias',
        recursos: 'Planilha de custos, análise de precificação, reunião com fornecedores',
      });
    }
    
    if (data.inadimplenciaPercent > 5) {
      recomendacoes.push({
        id: id++,
        area: 'financeiro',
        prioridade: 'alta',
        titulo: 'Redução de Inadimplência',
        descricao: `Inadimplência de ${data.inadimplenciaPercent}% impacta diretamente o caixa. Implemente política de crédito, régua de cobrança automatizada e ofereça incentivos para pagamento antecipado.`,
        impactoEsperado: 'Redução de 50% na inadimplência em 90 dias',
        prazoSugerido: '30 dias para implementar',
        recursos: 'Sistema de cobrança, análise de crédito, scripts de negociação',
      });
    }
  }
  
  // Comercial
  if (scores.scoreComercial < 70) {
    if (!data.funilDefinido?.toLowerCase().includes('sim')) {
      recomendacoes.push({
        id: id++,
        area: 'comercial',
        prioridade: 'alta',
        titulo: 'Estruturação do Funil de Vendas',
        descricao: 'Defina as etapas do funil (prospecção, qualificação, proposta, negociação, fechamento) com critérios claros de passagem e métricas de conversão por etapa.',
        impactoEsperado: 'Aumento de 20-30% na taxa de conversão',
        prazoSugerido: '15 dias',
        recursos: 'CRM, playbook de vendas, treinamento da equipe',
      });
    }
    
    if (data.nps < 50 && data.nps > 0) {
      recomendacoes.push({
        id: id++,
        area: 'comercial',
        prioridade: 'alta',
        titulo: 'Programa de Melhoria da Experiência do Cliente',
        descricao: `NPS de ${data.nps} indica oportunidade de melhoria. Mapeie a jornada do cliente, identifique pontos de fricção e implemente melhorias rápidas nos touchpoints críticos.`,
        impactoEsperado: 'Aumento de 15-20 pontos no NPS',
        prazoSugerido: '45 dias',
        recursos: 'Pesquisa qualitativa, mapa de jornada, plano de ação por touchpoint',
      });
    }
  }
  
  // Operacional
  if (scores.scoreOperacional < 70) {
    if (!data.possuiPlanoMetas?.toLowerCase().includes('sim')) {
      recomendacoes.push({
        id: id++,
        area: 'operacional',
        prioridade: 'alta',
        titulo: 'Implementação de Planejamento Estratégico',
        descricao: 'Desenvolva plano estratégico com visão, missão, objetivos SMART e desdobramento em metas departamentais. Inclua orçamento anual e revisões trimestrais.',
        impactoEsperado: 'Alinhamento organizacional e foco em resultados',
        prazoSugerido: '30 dias',
        recursos: 'Workshop estratégico, template de planejamento, facilitador',
      });
    }
  }
  
  // Pessoas
  if (scores.scorePessoas < 70) {
    if (data.turnover12Meses > benchmark.turnoverMedio) {
      recomendacoes.push({
        id: id++,
        area: 'pessoas',
        prioridade: 'media',
        titulo: 'Programa de Retenção de Talentos',
        descricao: `Turnover de ${data.turnover12Meses}% está acima do mercado. Realize pesquisa de clima, implemente programa de desenvolvimento e revise política de remuneração.`,
        impactoEsperado: 'Redução de 30% no turnover',
        prazoSugerido: '60 dias',
        recursos: 'Pesquisa de clima, plano de carreira, programa de reconhecimento',
      });
    }
    
    if (!data.existeOrganograma?.toLowerCase().includes('sim')) {
      recomendacoes.push({
        id: id++,
        area: 'pessoas',
        prioridade: 'media',
        titulo: 'Definição de Estrutura Organizacional',
        descricao: 'Formalize organograma com papéis, responsabilidades e níveis de autoridade. Documente descrições de cargo e matriz de competências.',
        impactoEsperado: 'Clareza de responsabilidades e melhor comunicação',
        prazoSugerido: '21 dias',
        recursos: 'Template de organograma, descrições de cargo, matriz RACI',
      });
    }
  }
  
  // Tecnologia
  if (scores.scoreTecnologia < 70) {
    if (!data.dashboardsKPIs?.toLowerCase().includes('sim')) {
      recomendacoes.push({
        id: id++,
        area: 'tecnologia',
        prioridade: 'media',
        titulo: 'Implementação de Business Intelligence',
        descricao: 'Crie dashboards executivos com KPIs principais de cada área. Automatize coleta de dados e estabeleça rotina de análise semanal.',
        impactoEsperado: 'Decisões 50% mais rápidas baseadas em dados',
        prazoSugerido: '45 dias',
        recursos: 'Ferramenta de BI, definição de KPIs, integração de dados',
      });
    }
    
    const usoIA = data.usoIAHoje?.toLowerCase() || '';
    if (!usoIA.includes('sim') && !usoIA.includes('utiliz')) {
      recomendacoes.push({
        id: id++,
        area: 'tecnologia',
        prioridade: 'baixa',
        titulo: 'Adoção de Inteligência Artificial',
        descricao: 'Identifique processos repetitivos que podem ser automatizados com IA. Comece com chatbots para atendimento, análise preditiva de vendas ou automação de relatórios.',
        impactoEsperado: 'Redução de 20% em tarefas operacionais',
        prazoSugerido: '90 dias',
        recursos: 'Mapeamento de processos, ferramentas de IA, treinamento',
      });
    }
  }
  
  // Adicionar recomendações estratégicas gerais
  if (data.metaFaturamentoAnual > 0 && data.faturamento6Meses > 0) {
    const faturamentoAnualizado = data.faturamento6Meses * 2;
    const gap = data.metaFaturamentoAnual - faturamentoAnualizado;
    
    if (gap > 0) {
      recomendacoes.push({
        id: id++,
        area: 'estrategia',
        prioridade: 'alta',
        titulo: 'Plano de Aceleração de Receita',
        descricao: `Gap de R$ ${gap.toLocaleString('pt-BR')} para atingir meta anual. Priorize: 1) Aumento de ticket médio, 2) Expansão de base de clientes, 3) Redução de churn.`,
        impactoEsperado: 'Fechamento do gap de faturamento',
        prazoSugerido: '90 dias',
        recursos: 'Análise de oportunidades, campanhas de upsell, programa de indicação',
      });
    }
  }
  
  // Ordenar por prioridade
  const prioridadeOrder = { alta: 0, media: 1, baixa: 2 };
  recomendacoes.sort((a, b) => prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade]);
  
  return recomendacoes.slice(0, 8); // Máximo 8 recomendações
}

// Geração de Plano de Ação 90 dias
function generateActionPlan(recomendacoes: Recomendacao[]): PlanoAcao[] {
  const plano: PlanoAcao[] = [];
  
  // Semanas 1-2: Quick wins e diagnósticos
  plano.push({
    semana: 1,
    acoes: [
      {
        acao: 'Reunião de alinhamento com liderança sobre diagnóstico',
        responsavel: 'CEO/Diretor',
        entregavel: 'Apresentação do diagnóstico e prioridades',
        area: 'Estratégia',
      },
      {
        acao: 'Levantamento detalhado de custos e margens por produto/serviço',
        responsavel: 'Financeiro',
        entregavel: 'Planilha ABC de rentabilidade',
        area: 'Finanças',
      },
    ],
  });
  
  plano.push({
    semana: 2,
    acoes: [
      {
        acao: 'Mapeamento do funil de vendas atual',
        responsavel: 'Comercial',
        entregavel: 'Documento com etapas e taxas de conversão',
        area: 'Comercial',
      },
      {
        acao: 'Pesquisa rápida de satisfação com clientes-chave',
        responsavel: 'Comercial/CS',
        entregavel: 'Relatório de feedback qualitativo',
        area: 'Comercial',
      },
    ],
  });
  
  // Semanas 3-4: Implementações iniciais
  plano.push({
    semana: 3,
    acoes: [
      {
        acao: 'Definição de KPIs prioritários por área',
        responsavel: 'Gestores',
        entregavel: 'Lista de KPIs com metas e responsáveis',
        area: 'Operações',
      },
      {
        acao: 'Início da implementação de melhorias no funil',
        responsavel: 'Comercial',
        entregavel: 'Novo processo documentado',
        area: 'Comercial',
      },
    ],
  });
  
  plano.push({
    semana: 4,
    acoes: [
      {
        acao: 'Revisão de política de crédito e cobrança',
        responsavel: 'Financeiro',
        entregavel: 'Nova política documentada',
        area: 'Finanças',
      },
      {
        acao: 'Primeira reunião de acompanhamento de KPIs',
        responsavel: 'CEO/Gestores',
        entregavel: 'Dashboard inicial de acompanhamento',
        area: 'Operações',
      },
    ],
  });
  
  // Semanas 5-8: Consolidação
  plano.push({
    semana: 6,
    acoes: [
      {
        acao: 'Avaliação de resultados das primeiras ações',
        responsavel: 'CEO',
        entregavel: 'Relatório de progresso',
        area: 'Estratégia',
      },
      {
        acao: 'Treinamento da equipe comercial no novo processo',
        responsavel: 'Comercial',
        entregavel: 'Equipe treinada e certificada',
        area: 'Comercial',
      },
    ],
  });
  
  plano.push({
    semana: 8,
    acoes: [
      {
        acao: 'Implementação de dashboard de gestão',
        responsavel: 'TI/Gestão',
        entregavel: 'Dashboard funcional',
        area: 'Tecnologia',
      },
      {
        acao: 'Revisão de estrutura organizacional',
        responsavel: 'RH/CEO',
        entregavel: 'Organograma atualizado',
        area: 'Pessoas',
      },
    ],
  });
  
  // Semanas 9-12: Otimização e escala
  plano.push({
    semana: 10,
    acoes: [
      {
        acao: 'Análise de ROI das iniciativas implementadas',
        responsavel: 'Financeiro',
        entregavel: 'Relatório de ROI',
        area: 'Finanças',
      },
      {
        acao: 'Pesquisa de clima organizacional',
        responsavel: 'RH',
        entregavel: 'Relatório de clima',
        area: 'Pessoas',
      },
    ],
  });
  
  plano.push({
    semana: 12,
    acoes: [
      {
        acao: 'Revisão trimestral de resultados',
        responsavel: 'CEO/Diretoria',
        entregavel: 'Apresentação de resultados Q1',
        area: 'Estratégia',
      },
      {
        acao: 'Planejamento do próximo ciclo de 90 dias',
        responsavel: 'CEO/Gestores',
        entregavel: 'Plano Q2 definido',
        area: 'Estratégia',
      },
    ],
  });
  
  return plano;
}

export { SECTOR_BENCHMARKS };
