// Tipos para dados da empresa extraídos do Excel
export interface CompanyData {
  // Dados Pessoais e da Empresa
  nome: string;
  sobrenome: string;
  telefone: string;
  email: string;
  empresa: string;
  dataNascimento: string;
  nomePrisma: string;
  cidade: string;
  cnpj: string;
  dataAbertura: string;
  setor: string;
  setorOutro: string;
  segmento: string;
  instagram: string;
  site: string;

  // Estrutura
  numSocios: number;
  numColaboradores: number;
  possuiPlanoMetas: string;
  maturidadeGerencial: string;
  expectativa4Dias: string;
  visao3a5Anos: string;

  // Metas e Objetivos
  metaFaturamentoAnual: number;
  margemLucroAlvo: number;
  topObjetivosAno: string;
  kpisEstrategicos: string;
  iniciativasOKRs: string;

  // Restrições e Estratégia
  maioresRestricoes: string;
  apetiteRisco: string;
  vantagemCompetitiva: string;
  clientePrioritario: string;
  regiaoAtuacao: string;

  // Comercial
  canaisAquisicao: string;
  taxaConversaoGeral: number;
  ticketMedio: number;
  nps: number;
  principaisObjecoes: string;
  concorrenciaPredominante: string;
  diferenciaisPercebidos: string;

  // Financeiro
  faturamento6Meses: number;
  lucroLiquido6MesesPercent: number;
  custoAquisicaoCliente: number;
  ltv: number;
  inadimplenciaPercent: number;
  endividamento: string;
  custoFinanceiroMensal: number;
  softwaresFinanceiros: string;

  // CRM e Vendas
  crmUtilizado: string;
  funilDefinido: string;
  taxaConversaoFunil: number;
  cicloMedioVendas: number;
  leadsMes: number;
  canaisPagosAtivos: string;
  roasMedio: number;
  conteudosPerformam: string;
  timeComercial: string;
  modeloComissionamento: string;
  winRate: number;
  motivosPerda: string;

  // Gestão de Pessoas
  existeOrganograma: string;
  camadasLideranca: number;
  perfisMapeados: string;
  turnover12Meses: number;
  absenteismo: number;
  rituaisGestao: string;
  modeloMetas: string;
  fortalezasLideranca: string;
  gapsGestao: string;
  areasCarenciaPessoas: string;

  // Tecnologia
  stackAtual: string;
  ondeDadosVivem: string;
  dashboardsKPIs: string;
  usoIAHoje: string;
  integracoesDesejadas: string;

  // Autoavaliação (notas 1-10)
  notaEstrategiaMetas: number;
  notaFinancasLucratividade: number;
  notaComercialMarketing: number;
  notaOperacoesQualidade: number;
  notaPessoasLideranca: number;
  notaTecnologiaDados: number;
}

// Estrutura para análise e recomendações
export interface AnalysisResult {
  empresa: string;
  setor: string;
  cidade: string;
  
  // Scores calculados
  scoreGeral: number;
  scoreFinanceiro: number;
  scoreComercial: number;
  scoreOperacional: number;
  scorePessoas: number;
  scoreTecnologia: number;
  
  // Diagnósticos por área
  diagnosticoFinanceiro: DiagnosticoArea;
  diagnosticoComercial: DiagnosticoArea;
  diagnosticoOperacional: DiagnosticoArea;
  diagnosticoPessoas: DiagnosticoArea;
  diagnosticoTecnologia: DiagnosticoArea;
  
  // Recomendações priorizadas
  recomendacoesPrioritarias: Recomendacao[];
  planoAcao90Dias: PlanoAcao[] | ActionPlanWeek[];
  
  // Benchmarks do setor
  benchmarks: BenchmarkSetor;
}

export interface DiagnosticoArea {
  area?: string;
  status: 'critico' | 'atencao' | 'adequado' | 'excelente';
  pontosFortesText: string[];
  pontosAtencaoText: string[];
  oportunidades: string[];
}

// Alias para compatibilidade
export type DiagnosticArea = DiagnosticoArea;

export interface Recomendacao {
  id: number | string;
  area: 'financeiro' | 'comercial' | 'operacional' | 'pessoas' | 'tecnologia' | 'estrategia' | 'Financeiro' | 'Comercial' | 'Marketing' | 'Pessoas' | 'Tecnologia';
  prioridade: 'alta' | 'media' | 'baixa';
  titulo: string;
  descricao: string;
  impactoEsperado: string;
  prazoSugerido: string;
  recursos: string;
  passos?: string[];
  ferramentas?: string[];
  metricas?: string[];
}

// Alias para compatibilidade
export type Recommendation = Recomendacao;

export interface PlanoAcao {
  semana: number;
  acoes: AcaoSemana[];
}

export interface AcaoSemana {
  acao: string;
  responsavel: string;
  entregavel: string;
  area?: string;
  recursos?: string;
  metricas?: string;
}

// Tipo expandido para plano de ação detalhado
export interface ActionPlanWeek {
  semana: number;
  fase: string;
  objetivo: string;
  acoes: {
    acao: string;
    responsavel: string;
    entregavel: string;
    recursos: string;
    metricas: string;
  }[];
}

// Alias para compatibilidade
export type PlanoAcaoSemana = ActionPlanWeek;

export interface BenchmarkSetor {
  setor: string;
  margemLucroMedia: number;
  ticketMedioMercado: number;
  taxaConversaoMedia: number;
  npsReferencia: number;
  turnoverMedio: number;
  cicloVendasMedio: number;
}

// Mapeamento de colunas do Excel
export const EXCEL_COLUMN_MAP: Record<number, keyof CompanyData> = {
  0: 'nome',
  1: 'sobrenome',
  2: 'telefone',
  3: 'email',
  4: 'empresa',
  5: 'dataNascimento',
  6: 'nomePrisma',
  7: 'cidade',
  8: 'cnpj',
  9: 'dataAbertura',
  10: 'setor',
  11: 'setorOutro',
  12: 'segmento',
  13: 'instagram',
  14: 'site',
  15: 'numSocios',
  16: 'numColaboradores',
  17: 'possuiPlanoMetas',
  18: 'maturidadeGerencial',
  19: 'expectativa4Dias',
  20: 'visao3a5Anos',
  21: 'metaFaturamentoAnual',
  22: 'margemLucroAlvo',
  23: 'topObjetivosAno',
  24: 'kpisEstrategicos',
  25: 'iniciativasOKRs',
  26: 'maioresRestricoes',
  27: 'apetiteRisco',
  28: 'vantagemCompetitiva',
  29: 'clientePrioritario',
  30: 'regiaoAtuacao',
  31: 'canaisAquisicao',
  32: 'taxaConversaoGeral',
  33: 'ticketMedio',
  34: 'nps',
  35: 'principaisObjecoes',
  36: 'concorrenciaPredominante',
  37: 'diferenciaisPercebidos',
  38: 'faturamento6Meses',
  39: 'lucroLiquido6MesesPercent',
  40: 'custoAquisicaoCliente',
  41: 'ltv',
  42: 'inadimplenciaPercent',
  43: 'endividamento',
  44: 'custoFinanceiroMensal',
  45: 'softwaresFinanceiros',
  46: 'crmUtilizado',
  47: 'funilDefinido',
  48: 'taxaConversaoFunil',
  49: 'cicloMedioVendas',
  50: 'leadsMes',
  51: 'canaisPagosAtivos',
  52: 'roasMedio',
  53: 'conteudosPerformam',
  54: 'timeComercial',
  55: 'modeloComissionamento',
  56: 'winRate',
  57: 'motivosPerda',
  58: 'existeOrganograma',
  59: 'camadasLideranca',
  60: 'perfisMapeados',
  61: 'turnover12Meses',
  62: 'absenteismo',
  63: 'rituaisGestao',
  64: 'modeloMetas',
  65: 'fortalezasLideranca',
  66: 'gapsGestao',
  67: 'areasCarenciaPessoas',
  68: 'stackAtual',
  69: 'ondeDadosVivem',
  70: 'dashboardsKPIs',
  71: 'usoIAHoje',
  72: 'integracoesDesejadas',
  73: 'notaEstrategiaMetas',
  74: 'notaFinancasLucratividade',
  75: 'notaComercialMarketing',
  76: 'notaOperacoesQualidade',
  77: 'notaPessoasLideranca',
  78: 'notaTecnologiaDados',
};
