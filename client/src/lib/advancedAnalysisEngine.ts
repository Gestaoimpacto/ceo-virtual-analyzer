import { CompanyData, AnalysisResult, DiagnosticArea, Recommendation, ActionPlanWeek } from '@/types/company';

// =====================================================
// BENCHMARKS POR SETOR (Dados de mercado brasileiro)
// =====================================================
const SECTOR_BENCHMARKS: Record<string, {
  margemLucroMedia: number;
  ticketMedioMercado: number;
  taxaConversaoMedia: number;
  npsReferencia: number;
  turnoverMedio: number;
  cicloVendasMedio: number;
  cacIdeal: number;
  ltvCacIdeal: number;
  inadimplenciaMedia: number;
  crescimentoMedio: number;
}> = {
  'Tecnologia': {
    margemLucroMedia: 20,
    ticketMedioMercado: 3000,
    taxaConversaoMedia: 4,
    npsReferencia: 60,
    turnoverMedio: 25,
    cicloVendasMedio: 21,
    cacIdeal: 800,
    ltvCacIdeal: 3,
    inadimplenciaMedia: 3,
    crescimentoMedio: 25,
  },
  'Serviços': {
    margemLucroMedia: 15,
    ticketMedioMercado: 1500,
    taxaConversaoMedia: 5,
    npsReferencia: 55,
    turnoverMedio: 30,
    cicloVendasMedio: 14,
    cacIdeal: 500,
    ltvCacIdeal: 3,
    inadimplenciaMedia: 5,
    crescimentoMedio: 15,
  },
  'Varejo': {
    margemLucroMedia: 8,
    ticketMedioMercado: 200,
    taxaConversaoMedia: 15,
    npsReferencia: 50,
    turnoverMedio: 40,
    cicloVendasMedio: 1,
    cacIdeal: 50,
    ltvCacIdeal: 4,
    inadimplenciaMedia: 4,
    crescimentoMedio: 10,
  },
  'Indústria': {
    margemLucroMedia: 12,
    ticketMedioMercado: 10000,
    taxaConversaoMedia: 8,
    npsReferencia: 55,
    turnoverMedio: 20,
    cicloVendasMedio: 45,
    cacIdeal: 2000,
    ltvCacIdeal: 4,
    inadimplenciaMedia: 3,
    crescimentoMedio: 12,
  },
  'Saúde': {
    margemLucroMedia: 18,
    ticketMedioMercado: 500,
    taxaConversaoMedia: 20,
    npsReferencia: 65,
    turnoverMedio: 25,
    cicloVendasMedio: 7,
    cacIdeal: 200,
    ltvCacIdeal: 5,
    inadimplenciaMedia: 6,
    crescimentoMedio: 18,
  },
  'Educação': {
    margemLucroMedia: 25,
    ticketMedioMercado: 800,
    taxaConversaoMedia: 6,
    npsReferencia: 60,
    turnoverMedio: 35,
    cicloVendasMedio: 14,
    cacIdeal: 300,
    ltvCacIdeal: 4,
    inadimplenciaMedia: 8,
    crescimentoMedio: 20,
  },
  'default': {
    margemLucroMedia: 15,
    ticketMedioMercado: 1000,
    taxaConversaoMedia: 5,
    npsReferencia: 50,
    turnoverMedio: 30,
    cicloVendasMedio: 21,
    cacIdeal: 500,
    ltvCacIdeal: 3,
    inadimplenciaMedia: 5,
    crescimentoMedio: 15,
  },
};

// =====================================================
// TÁTICAS COMERCIAIS DETALHADAS
// =====================================================
interface TacticaComercial {
  problema: string;
  condicao: (data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default']) => boolean;
  taticas: {
    titulo: string;
    descricao: string;
    passos: string[];
    ferramentas: string[];
    metricas: string[];
    prazo: string;
    investimento: string;
  }[];
}

const TATICAS_COMERCIAIS: TacticaComercial[] = [
  {
    problema: 'Taxa de Conversão Baixa',
    condicao: (data, bench) => data.taxaConversaoGeral < bench.taxaConversaoMedia * 0.8,
    taticas: [
      {
        titulo: 'Implementar Metodologia SPIN Selling',
        descricao: 'Treinar equipe comercial na técnica de vendas consultivas SPIN (Situação, Problema, Implicação, Necessidade-Solução)',
        passos: [
          '1. Mapear as 10 principais objeções dos clientes',
          '2. Criar script de perguntas SPIN para cada objeção',
          '3. Realizar workshop de 4h com equipe comercial',
          '4. Implementar role-play semanal de 30 minutos',
          '5. Gravar e analisar 5 calls por vendedor/semana',
          '6. Criar biblioteca de melhores práticas'
        ],
        ferramentas: ['Gong.io ou Chorus para gravação de calls', 'Planilha de tracking de objeções', 'Playbook de vendas'],
        metricas: ['Taxa de conversão por etapa do funil', 'Tempo médio de call', 'Objeções mais frequentes'],
        prazo: '30 dias para implementação inicial',
        investimento: 'Baixo (treinamento interno)'
      },
      {
        titulo: 'Qualificação BANT Rigorosa',
        descricao: 'Implementar framework de qualificação para focar em leads com maior probabilidade de fechamento',
        passos: [
          '1. Definir critérios de Budget mínimo por segmento',
          '2. Mapear cargos com Authority de decisão',
          '3. Criar perguntas para identificar Need real',
          '4. Estabelecer Timeline máximo aceitável',
          '5. Criar scorecard de qualificação (0-100)',
          '6. Definir nota mínima para avançar no funil'
        ],
        ferramentas: ['CRM com campos customizados', 'Formulário de qualificação', 'Dashboard de qualidade de leads'],
        metricas: ['% de leads qualificados vs total', 'Conversão por score de qualificação', 'Tempo economizado em leads não qualificados'],
        prazo: '15 dias para implementação',
        investimento: 'Baixo (configuração de CRM)'
      },
      {
        titulo: 'Revisão e Padronização de Propostas',
        descricao: 'Criar propostas focadas em valor e ROI, não apenas em preço',
        passos: [
          '1. Auditar últimas 20 propostas enviadas',
          '2. Identificar padrões de propostas que converteram',
          '3. Criar template com seções: Problema, Solução, ROI, Investimento',
          '4. Incluir calculadora de ROI personalizada',
          '5. Adicionar cases de sucesso relevantes',
          '6. Criar versão para cada segmento de cliente'
        ],
        ferramentas: ['PandaDoc ou Proposify', 'Calculadora de ROI em Excel', 'Banco de cases'],
        metricas: ['Taxa de aceite de propostas', 'Tempo de decisão após proposta', 'Valor médio de propostas aceitas'],
        prazo: '21 dias para criar templates',
        investimento: 'Médio (ferramenta de propostas)'
      }
    ]
  },
  {
    problema: 'Ciclo de Vendas Longo',
    condicao: (data, bench) => data.cicloMedioVendas > bench.cicloVendasMedio * 1.3,
    taticas: [
      {
        titulo: 'Mutual Action Plan (MAP)',
        descricao: 'Criar cronograma compartilhado com cliente para acelerar decisão',
        passos: [
          '1. Definir template de MAP com marcos típicos',
          '2. Incluir datas de: demo, proposta, negociação, assinatura',
          '3. Identificar stakeholders e suas responsabilidades',
          '4. Compartilhar documento editável com cliente',
          '5. Revisar semanalmente o progresso',
          '6. Escalar quando houver atrasos'
        ],
        ferramentas: ['Google Docs compartilhado', 'Notion ou Asana', 'Template de MAP'],
        metricas: ['% de deals com MAP ativo', 'Redução no ciclo de vendas', 'Taxa de cumprimento de marcos'],
        prazo: '7 dias para criar template',
        investimento: 'Baixo (documentação)'
      },
      {
        titulo: 'Estratégia de Multithreading',
        descricao: 'Envolver múltiplos stakeholders desde o início para evitar bloqueios',
        passos: [
          '1. Mapear organograma do cliente (mínimo 3 contatos)',
          '2. Identificar: Champion, Decisor, Influenciador, Usuário',
          '3. Criar conteúdo específico para cada persona',
          '4. Agendar reuniões com cada stakeholder',
          '5. Documentar preocupações de cada um',
          '6. Criar proposta que enderece todas as preocupações'
        ],
        ferramentas: ['LinkedIn Sales Navigator', 'Mapa de stakeholders', 'CRM com múltiplos contatos'],
        metricas: ['Número de contatos por deal', 'Deals perdidos por falta de acesso', 'Tempo de resposta por stakeholder'],
        prazo: '14 dias para implementar processo',
        investimento: 'Médio (LinkedIn Sales Navigator)'
      }
    ]
  },
  {
    problema: 'Ticket Médio Baixo',
    condicao: (data, bench) => data.ticketMedio < bench.ticketMedioMercado * 0.7,
    taticas: [
      {
        titulo: 'Estratégia de Bundling e Upsell',
        descricao: 'Criar pacotes de produtos/serviços com desconto progressivo',
        passos: [
          '1. Analisar combinações mais frequentes de compra',
          '2. Criar 3 pacotes: Básico, Profissional, Enterprise',
          '3. Definir desconto progressivo (5%, 10%, 15%)',
          '4. Treinar equipe em técnicas de upsell',
          '5. Criar checklist de ofertas adicionais',
          '6. Implementar gatilhos automáticos no CRM'
        ],
        ferramentas: ['Análise de cesta de compras', 'Tabela de preços por pacote', 'Scripts de upsell'],
        metricas: ['Ticket médio por pacote', '% de vendas com upsell', 'Receita incremental de upsell'],
        prazo: '21 dias para estruturar pacotes',
        investimento: 'Baixo (reestruturação comercial)'
      },
      {
        titulo: 'Precificação Baseada em Valor',
        descricao: 'Reposicionar preços com base no ROI entregue ao cliente',
        passos: [
          '1. Calcular ROI médio dos últimos 10 clientes',
          '2. Documentar economia/ganho gerado por cliente',
          '3. Criar calculadora de valor para prospects',
          '4. Treinar equipe para vender valor, não features',
          '5. Ajustar preços para capturar % do valor gerado',
          '6. Criar garantia de ROI para reduzir risco percebido'
        ],
        ferramentas: ['Calculadora de ROI', 'Cases com números reais', 'Proposta baseada em valor'],
        metricas: ['Elasticidade de preço', 'Win rate por faixa de preço', 'Percepção de valor (pesquisa)'],
        prazo: '30 dias para implementar',
        investimento: 'Baixo (reposicionamento)'
      }
    ]
  }
];

// =====================================================
// TÁTICAS DE MARKETING DETALHADAS
// =====================================================
interface TacticaMarketing {
  problema: string;
  condicao: (data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default']) => boolean;
  taticas: {
    titulo: string;
    descricao: string;
    passos: string[];
    ferramentas: string[];
    metricas: string[];
    prazo: string;
    investimento: string;
  }[];
}

const TATICAS_MARKETING: TacticaMarketing[] = [
  {
    problema: 'Custo de Aquisição Alto (CAC > LTV/3)',
    condicao: (data) => {
      const cac = data.custoAquisicaoCliente || 0;
      const ltv = data.ltv || 0;
      return cac > 0 && ltv > 0 && cac > ltv / 3;
    },
    taticas: [
      {
        titulo: 'Programa de Indicação Estruturado',
        descricao: 'Criar sistema de referral com incentivos para clientes indicarem novos clientes',
        passos: [
          '1. Definir recompensa para indicador (desconto, crédito, brinde)',
          '2. Definir benefício para indicado (desconto primeira compra)',
          '3. Criar landing page exclusiva para indicações',
          '4. Implementar tracking de indicações no CRM',
          '5. Automatizar comunicação de convite',
          '6. Criar campanha de ativação com clientes atuais',
          '7. Gamificar com ranking de indicadores'
        ],
        ferramentas: ['ReferralCandy ou Viral Loops', 'Landing page dedicada', 'Automação de email'],
        metricas: ['Número de indicações/mês', 'Taxa de conversão de indicados', 'CAC de indicações vs outros canais'],
        prazo: '21 dias para lançar programa',
        investimento: 'Médio (ferramenta + recompensas)'
      },
      {
        titulo: 'Marketing de Conteúdo SEO-First',
        descricao: 'Criar conteúdo evergreen que gere tráfego orgânico qualificado',
        passos: [
          '1. Pesquisar 50 palavras-chave do seu nicho (volume + intenção)',
          '2. Priorizar 10 keywords com melhor oportunidade',
          '3. Criar calendário de 12 artigos (1 por keyword)',
          '4. Produzir artigos de 2000+ palavras com estrutura SEO',
          '5. Implementar link building interno',
          '6. Criar lead magnets para cada artigo',
          '7. Monitorar rankings e ajustar'
        ],
        ferramentas: ['SEMrush ou Ahrefs', 'Google Search Console', 'WordPress com Yoast'],
        metricas: ['Tráfego orgânico mensal', 'Posição média das keywords', 'Leads gerados por conteúdo'],
        prazo: '90 dias para ver resultados',
        investimento: 'Médio (ferramenta SEO + produção de conteúdo)'
      },
      {
        titulo: 'Otimização de Canais Pagos',
        descricao: 'Pausar canais ineficientes e dobrar investimento nos que funcionam',
        passos: [
          '1. Calcular CAC por canal dos últimos 3 meses',
          '2. Identificar canais com CAC acima da média',
          '3. Pausar ou reduzir 50% dos canais ineficientes',
          '4. Realocar budget para canais com melhor CAC',
          '5. Testar novos públicos nos canais eficientes',
          '6. Implementar atribuição multi-touch',
          '7. Revisar semanalmente e ajustar'
        ],
        ferramentas: ['Google Analytics 4', 'Planilha de CAC por canal', 'Ferramenta de atribuição'],
        metricas: ['CAC por canal', 'ROAS por canal', '% de budget por canal'],
        prazo: '30 dias para otimização inicial',
        investimento: 'Baixo (realocação de budget existente)'
      }
    ]
  },
  {
    problema: 'Geração de Leads Insuficiente',
    condicao: (data) => data.leadsMes < 100,
    taticas: [
      {
        titulo: 'Lead Magnet de Alto Valor',
        descricao: 'Criar material gratuito irresistível que capture leads qualificados',
        passos: [
          '1. Identificar maior dor/desejo do seu ICP',
          '2. Criar conteúdo que resolva parcialmente (ebook, template, ferramenta)',
          '3. Desenvolver landing page com copy persuasivo',
          '4. Criar sequência de nutrição pós-download (5 emails)',
          '5. Promover em todos os canais (ads, social, email)',
          '6. Testar diferentes formatos (webinar, quiz, calculadora)',
          '7. Otimizar baseado em taxa de conversão'
        ],
        ferramentas: ['Canva para design', 'Unbounce ou Leadpages', 'ActiveCampaign ou RD Station'],
        metricas: ['Downloads do lead magnet', 'Taxa de conversão da LP', 'MQL gerados do lead magnet'],
        prazo: '14 dias para criar e lançar',
        investimento: 'Baixo a Médio (design + ferramenta de LP)'
      },
      {
        titulo: 'Webinars Semanais de Geração',
        descricao: 'Realizar webinars educativos que gerem leads qualificados em escala',
        passos: [
          '1. Definir tema que resolva problema do ICP',
          '2. Criar apresentação de 45 min + 15 min Q&A',
          '3. Configurar página de inscrição com campos de qualificação',
          '4. Promover 2 semanas antes (email, ads, social)',
          '5. Enviar lembretes (7 dias, 1 dia, 1 hora antes)',
          '6. Gravar e disponibilizar replay por 48h',
          '7. Fazer follow-up comercial com participantes'
        ],
        ferramentas: ['Zoom ou StreamYard', 'Página de inscrição', 'Automação de emails'],
        metricas: ['Inscritos por webinar', 'Taxa de comparecimento', 'Leads qualificados gerados'],
        prazo: '7 dias para primeiro webinar',
        investimento: 'Baixo (ferramentas gratuitas disponíveis)'
      },
      {
        titulo: 'LinkedIn Outbound Estruturado',
        descricao: 'Prospecção ativa no LinkedIn com mensagens personalizadas',
        passos: [
          '1. Definir ICP detalhado (cargo, empresa, setor)',
          '2. Criar lista de 500 prospects no Sales Navigator',
          '3. Desenvolver sequência de 5 mensagens (conexão + follow-ups)',
          '4. Personalizar primeira mensagem com gatilho específico',
          '5. Conectar com 50 pessoas/dia',
          '6. Enviar mensagens de valor (não venda direta)',
          '7. Agendar calls com interessados'
        ],
        ferramentas: ['LinkedIn Sales Navigator', 'Dux-Soup ou Expandi', 'Calendly'],
        metricas: ['Taxa de aceite de conexão', 'Taxa de resposta', 'Reuniões agendadas'],
        prazo: '30 dias para ver resultados',
        investimento: 'Médio (Sales Navigator + ferramenta de automação)'
      }
    ]
  }
];

// =====================================================
// TÁTICAS FINANCEIRAS DETALHADAS
// =====================================================
interface TacticaFinanceira {
  problema: string;
  condicao: (data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default']) => boolean;
  taticas: {
    titulo: string;
    descricao: string;
    passos: string[];
    ferramentas: string[];
    metricas: string[];
    prazo: string;
    investimento: string;
  }[];
}

const TATICAS_FINANCEIRAS: TacticaFinanceira[] = [
  {
    problema: 'Margem de Lucro Baixa',
    condicao: (data, bench) => data.lucroLiquido6MesesPercent < bench.margemLucroMedia * 0.7,
    taticas: [
      {
        titulo: 'Análise ABC de Custos',
        descricao: 'Identificar os 20% dos custos que representam 80% do total e atacá-los',
        passos: [
          '1. Exportar todos os custos dos últimos 6 meses',
          '2. Classificar por categoria (fixo, variável, semi-variável)',
          '3. Ordenar do maior para o menor',
          '4. Identificar top 10 custos (geralmente 80% do total)',
          '5. Analisar cada um: necessário? pode reduzir? pode eliminar?',
          '6. Criar plano de redução com metas por categoria',
          '7. Implementar controles para evitar retorno'
        ],
        ferramentas: ['Excel/Google Sheets', 'ERP ou sistema financeiro', 'Dashboard de custos'],
        metricas: ['Custo total mensal', 'Custo por categoria', '% de redução vs baseline'],
        prazo: '30 dias para análise e plano',
        investimento: 'Baixo (análise interna)'
      },
      {
        titulo: 'Renegociação com Fornecedores',
        descricao: 'Buscar redução de 10-15% nos principais contratos',
        passos: [
          '1. Listar top 10 fornecedores por valor',
          '2. Pesquisar alternativas no mercado (3 cotações)',
          '3. Preparar argumentação: volume, histórico, potencial',
          '4. Agendar reunião de renegociação',
          '5. Propor: desconto por volume, prazo maior, pagamento antecipado',
          '6. Documentar novos termos em contrato',
          '7. Monitorar cumprimento dos novos preços'
        ],
        ferramentas: ['Planilha de fornecedores', 'Pesquisa de mercado', 'Modelo de contrato'],
        metricas: ['% de desconto obtido', 'Economia mensal', 'Prazo de pagamento'],
        prazo: '45 dias para renegociar principais',
        investimento: 'Baixo (negociação)'
      },
      {
        titulo: 'Eliminação de Produtos/Serviços Deficitários',
        descricao: 'Cortar ofertas que não geram margem positiva',
        passos: [
          '1. Calcular margem de contribuição por produto/serviço',
          '2. Identificar itens com margem negativa ou muito baixa',
          '3. Analisar: pode aumentar preço? pode reduzir custo?',
          '4. Se não, criar plano de descontinuação',
          '5. Comunicar clientes afetados com antecedência',
          '6. Oferecer alternativas ou migração',
          '7. Realocar recursos para produtos rentáveis'
        ],
        ferramentas: ['Análise de margem por produto', 'Matriz BCG', 'Plano de comunicação'],
        metricas: ['Margem por produto', 'Mix de receita', 'Margem média ponderada'],
        prazo: '60 dias para análise e decisão',
        investimento: 'Baixo (análise estratégica)'
      }
    ]
  },
  {
    problema: 'Inadimplência Alta',
    condicao: (data, bench) => data.inadimplenciaPercent > bench.inadimplenciaMedia * 1.5,
    taticas: [
      {
        titulo: 'Implementar Análise de Crédito',
        descricao: 'Avaliar risco de crédito antes de aprovar vendas a prazo',
        passos: [
          '1. Definir critérios de aprovação (faturamento, tempo de mercado, histórico)',
          '2. Contratar serviço de consulta (Serasa, Boa Vista)',
          '3. Criar scorecard de crédito interno',
          '4. Definir limites por faixa de score',
          '5. Treinar equipe comercial no processo',
          '6. Implementar alçadas de aprovação',
          '7. Monitorar inadimplência por faixa de score'
        ],
        ferramentas: ['Serasa Experian ou Boa Vista', 'Scorecard de crédito', 'Workflow de aprovação'],
        metricas: ['% de aprovação', 'Inadimplência por faixa', 'Tempo de análise'],
        prazo: '21 dias para implementar',
        investimento: 'Médio (serviço de consulta)'
      },
      {
        titulo: 'Régua de Cobrança Automatizada',
        descricao: 'Automatizar comunicações de cobrança em diferentes estágios',
        passos: [
          '1. Mapear jornada de cobrança (D-5, D+1, D+7, D+15, D+30)',
          '2. Criar templates de comunicação para cada estágio',
          '3. Configurar automação no sistema financeiro',
          '4. Incluir múltiplos canais (email, SMS, WhatsApp)',
          '5. Definir escalação para cobrança telefônica',
          '6. Criar política de negativação (D+60)',
          '7. Monitorar efetividade de cada estágio'
        ],
        ferramentas: ['Sistema financeiro com automação', 'Templates de cobrança', 'Integração WhatsApp'],
        metricas: ['Taxa de recuperação por estágio', 'Dias médios de atraso', 'Custo de cobrança'],
        prazo: '14 dias para configurar',
        investimento: 'Baixo (configuração de sistema)'
      }
    ]
  },
  {
    problema: 'Fluxo de Caixa Apertado',
    condicao: (data) => {
      // Considera apertado se endividamento é alto ou custo financeiro é alto
      return data.endividamento === 'Alto' || data.custoFinanceiroMensal > 10;
    },
    taticas: [
      {
        titulo: 'Antecipação de Recebíveis',
        descricao: 'Antecipar valores a receber para melhorar liquidez imediata',
        passos: [
          '1. Mapear todos os recebíveis dos próximos 90 dias',
          '2. Cotar taxas em 3+ instituições (bancos, fintechs)',
          '3. Comparar custo de antecipação vs custo de oportunidade',
          '4. Negociar taxas com base no volume',
          '5. Antecipar valores estrategicamente (não tudo)',
          '6. Usar recursos para quitar dívidas mais caras',
          '7. Criar política de antecipação recorrente'
        ],
        ferramentas: ['Planilha de recebíveis', 'Comparador de taxas', 'Plataformas de antecipação'],
        metricas: ['Taxa de antecipação', 'Volume antecipado', 'Impacto no fluxo de caixa'],
        prazo: '7 dias para primeira operação',
        investimento: 'Custo da taxa de antecipação'
      },
      {
        titulo: 'Modelo de Recorrência',
        descricao: 'Migrar para modelo de assinatura/mensalidade para previsibilidade',
        passos: [
          '1. Identificar produtos/serviços que podem ser recorrentes',
          '2. Definir planos de assinatura (mensal, trimestral, anual)',
          '3. Criar incentivos para migração (desconto, benefícios)',
          '4. Implementar sistema de cobrança recorrente',
          '5. Comunicar clientes atuais sobre nova modalidade',
          '6. Criar meta de % de receita recorrente',
          '7. Monitorar churn e LTV de assinantes'
        ],
        ferramentas: ['Sistema de assinaturas (Vindi, Asaas)', 'Planos de preço', 'Métricas de SaaS'],
        metricas: ['MRR (Monthly Recurring Revenue)', 'Churn rate', 'LTV de assinantes'],
        prazo: '45 dias para estruturar',
        investimento: 'Médio (sistema de recorrência)'
      }
    ]
  }
];

// =====================================================
// TÁTICAS DE PESSOAS DETALHADAS
// =====================================================
interface TacticaPessoas {
  problema: string;
  condicao: (data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default']) => boolean;
  taticas: {
    titulo: string;
    descricao: string;
    passos: string[];
    ferramentas: string[];
    metricas: string[];
    prazo: string;
    investimento: string;
  }[];
}

const TATICAS_PESSOAS: TacticaPessoas[] = [
  {
    problema: 'Turnover Alto',
    condicao: (data, bench) => data.turnover12Meses > bench.turnoverMedio * 1.3,
    taticas: [
      {
        titulo: 'Programa de Onboarding Estruturado',
        descricao: 'Criar experiência de integração que aumente retenção nos primeiros 90 dias',
        passos: [
          '1. Mapear jornada ideal do novo colaborador (dia 1, semana 1, mês 1, mês 3)',
          '2. Criar checklist de atividades para cada marco',
          '3. Designar buddy/mentor para cada novo colaborador',
          '4. Preparar kit de boas-vindas (materiais, acessos, equipamentos)',
          '5. Agendar reuniões de acompanhamento (D+7, D+30, D+60, D+90)',
          '6. Criar avaliação de experiência de onboarding',
          '7. Ajustar processo baseado em feedback'
        ],
        ferramentas: ['Checklist de onboarding', 'Plataforma de treinamento', 'Pesquisa de satisfação'],
        metricas: ['Turnover nos primeiros 90 dias', 'NPS de onboarding', 'Tempo até produtividade'],
        prazo: '30 dias para estruturar',
        investimento: 'Baixo (processo interno)'
      },
      {
        titulo: 'Plano de Carreira e Desenvolvimento',
        descricao: 'Criar trilhas claras de crescimento para reter talentos',
        passos: [
          '1. Definir níveis de carreira por área (Jr, Pleno, Sr, Especialista, Líder)',
          '2. Documentar requisitos para cada nível (skills, entregas, tempo)',
          '3. Criar matriz de competências por função',
          '4. Implementar PDI (Plano de Desenvolvimento Individual)',
          '5. Realizar conversas de carreira trimestrais',
          '6. Criar programa de mentoria interna',
          '7. Vincular promoções a critérios objetivos'
        ],
        ferramentas: ['Matriz de competências', 'Template de PDI', 'Sistema de gestão de pessoas'],
        metricas: ['% de colaboradores com PDI', 'Promoções internas vs contratações', 'Satisfação com carreira'],
        prazo: '60 dias para estruturar',
        investimento: 'Baixo a Médio (sistema de gestão)'
      },
      {
        titulo: 'Pesquisa de Clima e Ação',
        descricao: 'Identificar causas de insatisfação e agir preventivamente',
        passos: [
          '1. Aplicar pesquisa de clima (eNPS + perguntas específicas)',
          '2. Garantir anonimato para respostas honestas',
          '3. Analisar resultados por área/líder',
          '4. Identificar top 3 pontos de melhoria',
          '5. Criar plano de ação com responsáveis e prazos',
          '6. Comunicar resultados e ações para equipe',
          '7. Repetir pesquisa trimestralmente'
        ],
        ferramentas: ['Google Forms ou Typeform', 'Planilha de análise', 'Plano de ação'],
        metricas: ['eNPS', 'Participação na pesquisa', 'Evolução dos indicadores'],
        prazo: '14 dias para primeira pesquisa',
        investimento: 'Baixo (ferramentas gratuitas)'
      }
    ]
  },
  {
    problema: 'Produtividade Baixa',
    condicao: (data) => data.notaOperacoesQualidade < 6,
    taticas: [
      {
        titulo: 'Implementação de OKRs',
        descricao: 'Definir objetivos claros e mensuráveis para cada pessoa/equipe',
        passos: [
          '1. Definir OKRs da empresa (3 objetivos, 3-5 KRs cada)',
          '2. Desdobrar para áreas/equipes',
          '3. Cada colaborador define seus OKRs alinhados',
          '4. Realizar check-in semanal de progresso',
          '5. Fazer revisão mensal com ajustes',
          '6. Celebrar conquistas e aprender com falhas',
          '7. Renovar OKRs trimestralmente'
        ],
        ferramentas: ['Planilha de OKRs', 'Weekdone ou similar', 'Reuniões de check-in'],
        metricas: ['% de OKRs atingidos', 'Engajamento com OKRs', 'Clareza de prioridades'],
        prazo: '21 dias para primeiro ciclo',
        investimento: 'Baixo (metodologia)'
      },
      {
        titulo: 'Rituais de Gestão Padronizados',
        descricao: 'Implementar daily, weekly e monthly para alinhamento contínuo',
        passos: [
          '1. Definir formato da Daily (15 min): o que fez, o que vai fazer, bloqueios',
          '2. Definir formato da Weekly (1h): resultados, prioridades, decisões',
          '3. Definir formato da Monthly (2h): review de métricas, planejamento',
          '4. Criar templates/agendas para cada ritual',
          '5. Treinar líderes na facilitação',
          '6. Medir efetividade dos rituais',
          '7. Ajustar baseado em feedback'
        ],
        ferramentas: ['Templates de reunião', 'Ferramenta de gestão de tarefas', 'Dashboard de métricas'],
        metricas: ['Aderência aos rituais', 'Duração média', 'Satisfação com reuniões'],
        prazo: '14 dias para implementar',
        investimento: 'Baixo (processo)'
      }
    ]
  }
];

// =====================================================
// TÁTICAS DE PROCESSOS E TECNOLOGIA
// =====================================================
interface TacticaProcessos {
  problema: string;
  condicao: (data: CompanyData) => boolean;
  taticas: {
    titulo: string;
    descricao: string;
    passos: string[];
    ferramentas: string[];
    metricas: string[];
    prazo: string;
    investimento: string;
  }[];
}

const TATICAS_PROCESSOS: TacticaProcessos[] = [
  {
    problema: 'Falta de Dashboards e Visibilidade',
    condicao: (data) => data.dashboardsKPIs === 'Não' || data.dashboardsKPIs === 'Parcial',
    taticas: [
      {
        titulo: 'Implementar Dashboard Executivo',
        descricao: 'Criar painel único com KPIs principais para tomada de decisão',
        passos: [
          '1. Definir 10-15 KPIs mais importantes (financeiro, comercial, operacional)',
          '2. Identificar fonte de dados de cada KPI',
          '3. Escolher ferramenta de BI (Power BI, Metabase, Google Data Studio)',
          '4. Conectar fontes de dados',
          '5. Criar visualizações claras e acionáveis',
          '6. Definir frequência de atualização',
          '7. Treinar equipe na interpretação'
        ],
        ferramentas: ['Power BI, Metabase ou Google Data Studio', 'Conexões com sistemas', 'Documentação de KPIs'],
        metricas: ['Uso do dashboard', 'Tempo para decisão', 'Acurácia dos dados'],
        prazo: '30 dias para MVP',
        investimento: 'Médio (ferramenta de BI)'
      }
    ]
  },
  {
    problema: 'Não Utiliza Inteligência Artificial',
    condicao: (data) => data.usoIAHoje === 'Não',
    taticas: [
      {
        titulo: 'Quick Wins com IA Generativa',
        descricao: 'Implementar IA em processos de alto volume e baixa complexidade',
        passos: [
          '1. Mapear processos repetitivos (atendimento, conteúdo, análise)',
          '2. Identificar 3 casos de uso prioritários',
          '3. Testar ferramentas de IA (ChatGPT, Claude, ferramentas específicas)',
          '4. Criar prompts/templates para cada caso de uso',
          '5. Treinar equipe no uso das ferramentas',
          '6. Medir ganho de produtividade',
          '7. Expandir para outros casos de uso'
        ],
        ferramentas: ['ChatGPT/Claude para texto', 'Ferramentas de IA específicas', 'Templates de prompts'],
        metricas: ['Horas economizadas', 'Qualidade do output', 'Adoção pela equipe'],
        prazo: '14 dias para primeiros casos',
        investimento: 'Baixo a Médio (assinaturas de IA)'
      },
      {
        titulo: 'Chatbot de Atendimento',
        descricao: 'Automatizar atendimento inicial com chatbot inteligente',
        passos: [
          '1. Mapear perguntas frequentes (FAQ)',
          '2. Categorizar por complexidade (simples, média, complexa)',
          '3. Criar fluxos de atendimento para perguntas simples',
          '4. Configurar escalação para humano quando necessário',
          '5. Integrar com WhatsApp/site',
          '6. Treinar chatbot com histórico de conversas',
          '7. Monitorar e melhorar continuamente'
        ],
        ferramentas: ['ManyChat, Zenvia ou similar', 'Base de conhecimento', 'Integração WhatsApp'],
        metricas: ['% de atendimentos resolvidos pelo bot', 'Tempo médio de resposta', 'Satisfação do cliente'],
        prazo: '21 dias para implementar',
        investimento: 'Médio (plataforma de chatbot)'
      }
    ]
  },
  {
    problema: 'CRM Não Utilizado ou Subutilizado',
    condicao: (data) => data.crmUtilizado === 'Não' || data.funilDefinido === 'Não',
    taticas: [
      {
        titulo: 'Implementação de CRM',
        descricao: 'Estruturar gestão de relacionamento com clientes e pipeline de vendas',
        passos: [
          '1. Escolher CRM adequado ao porte (Pipedrive, HubSpot, RD Station)',
          '2. Definir etapas do funil de vendas',
          '3. Configurar campos obrigatórios por etapa',
          '4. Importar base de clientes e leads existentes',
          '5. Treinar equipe comercial (mínimo 4h)',
          '6. Definir SLAs de atualização',
          '7. Criar dashboards de acompanhamento'
        ],
        ferramentas: ['CRM escolhido', 'Documentação do processo', 'Treinamento'],
        metricas: ['Adoção do CRM', 'Dados atualizados', 'Visibilidade do pipeline'],
        prazo: '21 dias para implementar',
        investimento: 'Médio (licenças de CRM)'
      }
    ]
  }
];

// =====================================================
// FUNÇÃO PRINCIPAL DE ANÁLISE EXPANDIDA
// =====================================================
export function analyzeCompanyAdvanced(data: CompanyData): AnalysisResult {
  const benchmark = SECTOR_BENCHMARKS[data.setor] || SECTOR_BENCHMARKS['default'];
  
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
    scoreOperacional * 0.20 +
    scorePessoas * 0.15 +
    scoreTecnologia * 0.15
  );
  
  // Gerar diagnósticos detalhados
  const diagnosticoFinanceiro = generateFinancialDiagnostic(data, benchmark, scoreFinanceiro);
  const diagnosticoComercial = generateCommercialDiagnostic(data, benchmark, scoreComercial);
  const diagnosticoOperacional = generateOperationalDiagnostic(data, scoreOperacional);
  const diagnosticoPessoas = generatePeopleDiagnostic(data, benchmark, scorePessoas);
  const diagnosticoTecnologia = generateTechnologyDiagnostic(data, scoreTecnologia);
  
  // Gerar recomendações com táticas reais
  const recomendacoes = generateAdvancedRecommendations(data, benchmark);
  
  // Gerar plano de ação de 90 dias
  const planoAcao = generateDetailedActionPlan(data, benchmark, recomendacoes);
  
  return {
    empresa: data.empresa,
    setor: data.setor,
    cidade: data.cidade,
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
    recomendacoesPrioritarias: recomendacoes,
    planoAcao90Dias: planoAcao,
    benchmarks: {
      setor: data.setor,
      margemLucroMedia: benchmark.margemLucroMedia,
      ticketMedioMercado: benchmark.ticketMedioMercado,
      taxaConversaoMedia: benchmark.taxaConversaoMedia,
      npsReferencia: benchmark.npsReferencia,
      turnoverMedio: benchmark.turnoverMedio,
      cicloVendasMedio: benchmark.cicloVendasMedio,
    },
  };
}

// =====================================================
// FUNÇÕES DE CÁLCULO DE SCORE
// =====================================================
function calculateFinancialScore(data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default']): number {
  let score = 50; // Base
  
  // Margem de lucro
  const margemRatio = data.lucroLiquido6MesesPercent / benchmark.margemLucroMedia;
  if (margemRatio >= 1.2) score += 20;
  else if (margemRatio >= 1) score += 15;
  else if (margemRatio >= 0.8) score += 10;
  else if (margemRatio >= 0.5) score += 5;
  else score -= 10;
  
  // LTV/CAC
  const ltvCac = data.ltv / (data.custoAquisicaoCliente || 1);
  if (ltvCac >= 5) score += 15;
  else if (ltvCac >= 3) score += 10;
  else if (ltvCac >= 2) score += 5;
  else score -= 10;
  
  // Inadimplência
  if (data.inadimplenciaPercent <= benchmark.inadimplenciaMedia * 0.5) score += 10;
  else if (data.inadimplenciaPercent <= benchmark.inadimplenciaMedia) score += 5;
  else if (data.inadimplenciaPercent > benchmark.inadimplenciaMedia * 1.5) score -= 10;
  
  // Endividamento
  if (data.endividamento === 'Baixo') score += 5;
  else if (data.endividamento === 'Alto') score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function calculateCommercialScore(data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default']): number {
  let score = 50;
  
  // Taxa de conversão
  const conversaoRatio = data.taxaConversaoGeral / benchmark.taxaConversaoMedia;
  if (conversaoRatio >= 1.3) score += 20;
  else if (conversaoRatio >= 1) score += 15;
  else if (conversaoRatio >= 0.7) score += 5;
  else score -= 10;
  
  // Ticket médio
  const ticketRatio = data.ticketMedio / benchmark.ticketMedioMercado;
  if (ticketRatio >= 1.2) score += 15;
  else if (ticketRatio >= 0.8) score += 10;
  else score -= 5;
  
  // NPS
  if (data.nps >= 70) score += 15;
  else if (data.nps >= 50) score += 10;
  else if (data.nps >= 30) score += 5;
  else score -= 10;
  
  // Ciclo de vendas
  const cicloRatio = data.cicloMedioVendas / benchmark.cicloVendasMedio;
  if (cicloRatio <= 0.7) score += 10;
  else if (cicloRatio <= 1) score += 5;
  else if (cicloRatio > 1.5) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function calculateOperationalScore(data: CompanyData): number {
  let score = 50;
  
  // Organograma
  if (data.existeOrganograma === 'Sim') score += 10;
  
  // Rituais de gestão
  if (data.rituaisGestao && data.rituaisGestao.toLowerCase().includes('daily')) score += 5;
  if (data.rituaisGestao && data.rituaisGestao.toLowerCase().includes('weekly')) score += 5;
  
  // Modelo de metas
  if (data.modeloMetas && data.modeloMetas.toLowerCase().includes('okr')) score += 10;
  else if (data.possuiPlanoMetas === 'Sim') score += 5;
  
  // Autoavaliação
  score += (data.notaEstrategiaMetas - 5) * 3;
  score += (data.notaOperacoesQualidade - 5) * 3;
  
  return Math.max(0, Math.min(100, score));
}

function calculatePeopleScore(data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default']): number {
  let score = 50;
  
  // Turnover
  const turnoverRatio = data.turnover12Meses / benchmark.turnoverMedio;
  if (turnoverRatio <= 0.5) score += 20;
  else if (turnoverRatio <= 0.8) score += 15;
  else if (turnoverRatio <= 1) score += 10;
  else if (turnoverRatio > 1.5) score -= 15;
  
  // Absenteísmo
  if (data.absenteismo <= 2) score += 10;
  else if (data.absenteismo <= 4) score += 5;
  else if (data.absenteismo > 6) score -= 10;
  
  // Perfis mapeados
  if (data.perfisMapeados === 'Sim') score += 10;
  
  // Autoavaliação
  score += (data.notaPessoasLideranca - 5) * 3;
  
  return Math.max(0, Math.min(100, score));
}

function calculateTechnologyScore(data: CompanyData): number {
  let score = 50;
  
  // CRM
  if (data.crmUtilizado && data.crmUtilizado !== 'Não') score += 15;
  if (data.funilDefinido === 'Sim') score += 5;
  
  // Dashboards
  if (data.dashboardsKPIs === 'Sim') score += 15;
  else if (data.dashboardsKPIs === 'Parcial') score += 5;
  
  // IA
  if (data.usoIAHoje === 'Sim') score += 15;
  
  // Autoavaliação
  score += (data.notaTecnologiaDados - 5) * 3;
  
  return Math.max(0, Math.min(100, score));
}

// =====================================================
// FUNÇÕES DE DIAGNÓSTICO
// =====================================================
function generateFinancialDiagnostic(data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default'], score: number): DiagnosticArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  // Análise de margem
  if (data.lucroLiquido6MesesPercent >= benchmark.margemLucroMedia) {
    pontosFortesText.push(`Margem de lucro de ${data.lucroLiquido6MesesPercent}% está acima da média do setor (${benchmark.margemLucroMedia}%)`);
  } else {
    pontosAtencaoText.push(`Margem de lucro de ${data.lucroLiquido6MesesPercent}% está abaixo da média do setor (${benchmark.margemLucroMedia}%)`);
    oportunidades.push('Revisar estrutura de custos e precificação para melhorar margem');
  }
  
  // Análise LTV/CAC
  const ltvCac = data.ltv / (data.custoAquisicaoCliente || 1);
  if (ltvCac >= 3) {
    pontosFortesText.push(`Relação LTV/CAC de ${ltvCac.toFixed(1)}x indica eficiência na aquisição de clientes`);
  } else {
    pontosAtencaoText.push(`Relação LTV/CAC de ${ltvCac.toFixed(1)}x está abaixo do ideal (3x)`);
    oportunidades.push('Reduzir CAC através de canais orgânicos ou aumentar LTV com upsell/cross-sell');
  }
  
  // Análise de inadimplência
  if (data.inadimplenciaPercent <= benchmark.inadimplenciaMedia) {
    pontosFortesText.push(`Inadimplência de ${data.inadimplenciaPercent}% está controlada`);
  } else {
    pontosAtencaoText.push(`Inadimplência de ${data.inadimplenciaPercent}% está acima da média do setor (${benchmark.inadimplenciaMedia}%)`);
    oportunidades.push('Implementar análise de crédito e régua de cobrança automatizada');
  }
  
  // Análise de endividamento
  if (data.endividamento === 'Baixo') {
    pontosFortesText.push('Nível de endividamento saudável permite investimentos estratégicos');
  } else if (data.endividamento === 'Alto') {
    pontosAtencaoText.push('Alto endividamento pode comprometer fluxo de caixa e limitar crescimento');
    oportunidades.push('Renegociar dívidas e criar plano de desalavancagem');
  }
  
  return {
    status: score >= 70 ? 'excelente' : score >= 50 ? 'adequado' : score >= 30 ? 'atencao' : 'critico',
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

function generateCommercialDiagnostic(data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default'], score: number): DiagnosticArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  // Taxa de conversão
  if (data.taxaConversaoGeral >= benchmark.taxaConversaoMedia) {
    pontosFortesText.push(`Taxa de conversão de ${data.taxaConversaoGeral}% está acima da média do setor`);
  } else {
    pontosAtencaoText.push(`Taxa de conversão de ${data.taxaConversaoGeral}% está abaixo da média (${benchmark.taxaConversaoMedia}%)`);
    oportunidades.push('Implementar metodologia SPIN Selling e qualificação BANT');
  }
  
  // NPS
  if (data.nps >= 70) {
    pontosFortesText.push(`NPS de ${data.nps} indica excelência em satisfação do cliente`);
  } else if (data.nps >= 50) {
    pontosFortesText.push(`NPS de ${data.nps} está em zona de qualidade`);
  } else {
    pontosAtencaoText.push(`NPS de ${data.nps} indica oportunidade de melhoria na experiência do cliente`);
    oportunidades.push('Mapear jornada do cliente e implementar melhorias nos pontos de atrito');
  }
  
  // Ciclo de vendas
  if (data.cicloMedioVendas <= benchmark.cicloVendasMedio) {
    pontosFortesText.push(`Ciclo de vendas de ${data.cicloMedioVendas} dias está eficiente`);
  } else {
    pontosAtencaoText.push(`Ciclo de vendas de ${data.cicloMedioVendas} dias está acima da média (${benchmark.cicloVendasMedio} dias)`);
    oportunidades.push('Implementar Mutual Action Plan e estratégia de multithreading');
  }
  
  // Ticket médio
  if (data.ticketMedio >= benchmark.ticketMedioMercado) {
    pontosFortesText.push(`Ticket médio de R$ ${data.ticketMedio.toLocaleString('pt-BR')} está competitivo`);
  } else {
    pontosAtencaoText.push(`Ticket médio abaixo do mercado indica oportunidade de upsell`);
    oportunidades.push('Criar estratégia de bundling e precificação baseada em valor');
  }
  
  return {
    status: score >= 70 ? 'excelente' : score >= 50 ? 'adequado' : score >= 30 ? 'atencao' : 'critico',
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

function generateOperationalDiagnostic(data: CompanyData, score: number): DiagnosticArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  if (data.existeOrganograma === 'Sim') {
    pontosFortesText.push('Estrutura organizacional definida com organograma claro');
  } else {
    pontosAtencaoText.push('Falta de organograma pode gerar confusão de responsabilidades');
    oportunidades.push('Criar organograma e definir claramente papéis e responsabilidades');
  }
  
  if (data.possuiPlanoMetas === 'Sim') {
    pontosFortesText.push('Empresa possui plano de metas estruturado');
  } else {
    pontosAtencaoText.push('Ausência de plano de metas dificulta alinhamento e foco');
    oportunidades.push('Implementar metodologia OKR para definição e acompanhamento de metas');
  }
  
  if (data.rituaisGestao && data.rituaisGestao.length > 0) {
    pontosFortesText.push(`Rituais de gestão implementados: ${data.rituaisGestao}`);
  } else {
    pontosAtencaoText.push('Falta de rituais de gestão pode prejudicar alinhamento da equipe');
    oportunidades.push('Implementar Daily (15min), Weekly (1h) e Monthly (2h) padronizados');
  }
  
  return {
    status: score >= 70 ? 'excelente' : score >= 50 ? 'adequado' : score >= 30 ? 'atencao' : 'critico',
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

function generatePeopleDiagnostic(data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default'], score: number): DiagnosticArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  if (data.turnover12Meses <= benchmark.turnoverMedio) {
    pontosFortesText.push(`Turnover de ${data.turnover12Meses}% está controlado`);
  } else {
    pontosAtencaoText.push(`Turnover de ${data.turnover12Meses}% está acima da média do setor (${benchmark.turnoverMedio}%)`);
    oportunidades.push('Implementar programa de onboarding estruturado e plano de carreira');
  }
  
  if (data.absenteismo <= 3) {
    pontosFortesText.push(`Absenteísmo de ${data.absenteismo}% indica bom engajamento`);
  } else {
    pontosAtencaoText.push(`Absenteísmo de ${data.absenteismo}% pode indicar problemas de clima`);
    oportunidades.push('Realizar pesquisa de clima e implementar ações de engajamento');
  }
  
  if (data.perfisMapeados === 'Sim') {
    pontosFortesText.push('Perfis comportamentais mapeados facilitam gestão de pessoas');
  } else {
    pontosAtencaoText.push('Falta de mapeamento de perfis pode gerar conflitos e má alocação');
    oportunidades.push('Aplicar assessment comportamental (DISC, MBTI) em toda equipe');
  }
  
  return {
    status: score >= 70 ? 'excelente' : score >= 50 ? 'adequado' : score >= 30 ? 'atencao' : 'critico',
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

function generateTechnologyDiagnostic(data: CompanyData, score: number): DiagnosticArea {
  const pontosFortesText: string[] = [];
  const pontosAtencaoText: string[] = [];
  const oportunidades: string[] = [];
  
  if (data.crmUtilizado && data.crmUtilizado !== 'Não') {
    pontosFortesText.push(`CRM implementado: ${data.crmUtilizado}`);
  } else {
    pontosAtencaoText.push('Ausência de CRM prejudica gestão de relacionamento e pipeline');
    oportunidades.push('Implementar CRM com funil de vendas estruturado');
  }
  
  if (data.dashboardsKPIs === 'Sim') {
    pontosFortesText.push('Dashboards de KPIs implementados para tomada de decisão');
  } else {
    pontosAtencaoText.push('Falta de dashboards dificulta visibilidade e decisões baseadas em dados');
    oportunidades.push('Criar dashboard executivo com principais KPIs de cada área');
  }
  
  if (data.usoIAHoje === 'Sim') {
    pontosFortesText.push('Empresa já utiliza Inteligência Artificial em processos');
  } else {
    pontosAtencaoText.push('Não utilização de IA pode representar perda de competitividade');
    oportunidades.push('Identificar quick wins com IA: atendimento, conteúdo, análise de dados');
  }
  
  return {
    status: score >= 70 ? 'excelente' : score >= 50 ? 'adequado' : score >= 30 ? 'atencao' : 'critico',
    pontosFortesText,
    pontosAtencaoText,
    oportunidades,
  };
}

// =====================================================
// GERAÇÃO DE RECOMENDAÇÕES AVANÇADAS
// =====================================================
function generateAdvancedRecommendations(data: CompanyData, benchmark: typeof SECTOR_BENCHMARKS['default']): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Verificar táticas comerciais aplicáveis
  TATICAS_COMERCIAIS.forEach(tatica => {
    if (tatica.condicao(data, benchmark)) {
      tatica.taticas.forEach((t, index) => {
        recommendations.push({
          id: `comercial-${recommendations.length}`,
          area: 'Comercial',
          titulo: t.titulo,
          descricao: t.descricao,
          prioridade: index === 0 ? 'alta' : index === 1 ? 'media' : 'baixa',
          impactoEsperado: `Melhoria na ${tatica.problema.toLowerCase()}`,
          prazoSugerido: t.prazo,
          recursos: t.investimento,
          passos: t.passos,
          ferramentas: t.ferramentas,
          metricas: t.metricas,
        });
      });
    }
  });
  
  // Verificar táticas de marketing aplicáveis
  TATICAS_MARKETING.forEach(tatica => {
    if (tatica.condicao(data, benchmark)) {
      tatica.taticas.forEach((t, index) => {
        recommendations.push({
          id: `marketing-${recommendations.length}`,
          area: 'Marketing',
          titulo: t.titulo,
          descricao: t.descricao,
          prioridade: index === 0 ? 'alta' : index === 1 ? 'media' : 'baixa',
          impactoEsperado: `Melhoria na ${tatica.problema.toLowerCase()}`,
          prazoSugerido: t.prazo,
          recursos: t.investimento,
          passos: t.passos,
          ferramentas: t.ferramentas,
          metricas: t.metricas,
        });
      });
    }
  });
  
  // Verificar táticas financeiras aplicáveis
  TATICAS_FINANCEIRAS.forEach(tatica => {
    if (tatica.condicao(data, benchmark)) {
      tatica.taticas.forEach((t, index) => {
        recommendations.push({
          id: `financeiro-${recommendations.length}`,
          area: 'Financeiro',
          titulo: t.titulo,
          descricao: t.descricao,
          prioridade: index === 0 ? 'alta' : index === 1 ? 'media' : 'baixa',
          impactoEsperado: `Melhoria na ${tatica.problema.toLowerCase()}`,
          prazoSugerido: t.prazo,
          recursos: t.investimento,
          passos: t.passos,
          ferramentas: t.ferramentas,
          metricas: t.metricas,
        });
      });
    }
  });
  
  // Verificar táticas de pessoas aplicáveis
  TATICAS_PESSOAS.forEach(tatica => {
    if (tatica.condicao(data, benchmark)) {
      tatica.taticas.forEach((t, index) => {
        recommendations.push({
          id: `pessoas-${recommendations.length}`,
          area: 'Pessoas',
          titulo: t.titulo,
          descricao: t.descricao,
          prioridade: index === 0 ? 'alta' : index === 1 ? 'media' : 'baixa',
          impactoEsperado: `Melhoria na ${tatica.problema.toLowerCase()}`,
          prazoSugerido: t.prazo,
          recursos: t.investimento,
          passos: t.passos,
          ferramentas: t.ferramentas,
          metricas: t.metricas,
        });
      });
    }
  });
  
  // Verificar táticas de processos aplicáveis
  TATICAS_PROCESSOS.forEach(tatica => {
    if (tatica.condicao(data)) {
      tatica.taticas.forEach((t, index) => {
        recommendations.push({
          id: `processos-${recommendations.length}`,
          area: 'Tecnologia',
          titulo: t.titulo,
          descricao: t.descricao,
          prioridade: index === 0 ? 'alta' : 'media',
          impactoEsperado: `Melhoria na ${tatica.problema.toLowerCase()}`,
          prazoSugerido: t.prazo,
          recursos: t.investimento,
          passos: t.passos,
          ferramentas: t.ferramentas,
          metricas: t.metricas,
        });
      });
    }
  });
  
  // Ordenar por prioridade
  const prioridadeOrdem = { alta: 0, media: 1, baixa: 2 };
  recommendations.sort((a, b) => prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade]);
  
  // Limitar a 15 recomendações mais relevantes
  return recommendations.slice(0, 15);
}

// =====================================================
// GERAÇÃO DE PLANO DE AÇÃO DETALHADO
// =====================================================
function generateDetailedActionPlan(
  data: CompanyData, 
  benchmark: typeof SECTOR_BENCHMARKS['default'],
  recommendations: Recommendation[]
): ActionPlanWeek[] {
  const plano: ActionPlanWeek[] = [];
  
  // Semana 1: Diagnóstico e Quick Wins
  plano.push({
    semana: 1,
    fase: 'Diagnóstico',
    objetivo: 'Mapear situação atual e identificar quick wins',
    acoes: [
      {
        acao: 'Reunião de kick-off com lideranças para apresentar diagnóstico',
        responsavel: 'CEO/Diretor',
        entregavel: 'Alinhamento de prioridades e expectativas',
        recursos: 'Apresentação do diagnóstico',
        metricas: 'Participação de 100% das lideranças',
      },
      {
        acao: 'Coleta de dados complementares (financeiro, comercial, RH)',
        responsavel: 'Gestores de área',
        entregavel: 'Planilha consolidada de indicadores',
        recursos: 'Acesso aos sistemas',
        metricas: 'Dados de 6 meses coletados',
      },
      {
        acao: 'Identificar e priorizar 3 quick wins de alto impacto',
        responsavel: 'CEO/Diretor',
        entregavel: 'Lista priorizada com responsáveis',
        recursos: 'Matriz de impacto x esforço',
        metricas: 'Quick wins definidos',
      },
    ],
  });
  
  // Semana 2: Planejamento
  plano.push({
    semana: 2,
    fase: 'Planejamento',
    objetivo: 'Definir OKRs e estruturar iniciativas prioritárias',
    acoes: [
      {
        acao: 'Workshop de definição de OKRs do trimestre',
        responsavel: 'CEO + Lideranças',
        entregavel: '3 OKRs da empresa com KRs mensuráveis',
        recursos: 'Template de OKRs',
        metricas: 'OKRs aprovados por todos',
      },
      {
        acao: 'Desdobramento de OKRs para cada área',
        responsavel: 'Gestores de área',
        entregavel: 'OKRs por área alinhados aos da empresa',
        recursos: 'Reunião com cada área',
        metricas: 'OKRs de área definidos',
      },
      {
        acao: 'Criar cronograma detalhado das iniciativas prioritárias',
        responsavel: 'PMO/Gestor de projetos',
        entregavel: 'Cronograma com marcos e responsáveis',
        recursos: 'Ferramenta de gestão de projetos',
        metricas: 'Cronograma aprovado',
      },
    ],
  });
  
  // Semanas 3-4: Implementação de Quick Wins
  plano.push({
    semana: 3,
    fase: 'Quick Wins',
    objetivo: 'Implementar melhorias de impacto imediato',
    acoes: recommendations.filter(r => r.prioridade === 'alta').slice(0, 3).map(r => ({
      acao: r.titulo,
      responsavel: r.area === 'Comercial' ? 'Gestor Comercial' : 
                   r.area === 'Marketing' ? 'Gestor de Marketing' :
                   r.area === 'Financeiro' ? 'Gestor Financeiro' :
                   r.area === 'Pessoas' ? 'Gestor de RH' : 'Gestor de TI',
      entregavel: r.passos?.[0] || 'Implementação iniciada',
      recursos: r.recursos,
      metricas: r.metricas?.[0] || 'Melhoria mensurável',
    })),
  });
  
  plano.push({
    semana: 4,
    fase: 'Quick Wins',
    objetivo: 'Concluir quick wins e medir primeiros resultados',
    acoes: [
      {
        acao: 'Finalizar implementação dos quick wins',
        responsavel: 'Responsáveis designados',
        entregavel: 'Quick wins operacionais',
        recursos: 'Conforme cada iniciativa',
        metricas: '100% dos quick wins implementados',
      },
      {
        acao: 'Primeira medição de resultados',
        responsavel: 'Gestores de área',
        entregavel: 'Relatório de resultados iniciais',
        recursos: 'Dashboard de métricas',
        metricas: 'Variação vs baseline',
      },
      {
        acao: 'Reunião de review do primeiro mês',
        responsavel: 'CEO',
        entregavel: 'Ata com aprendizados e ajustes',
        recursos: 'Dados de performance',
        metricas: 'Decisões documentadas',
      },
    ],
  });
  
  // Semanas 5-8: Estruturação
  plano.push({
    semana: 5,
    fase: 'Estruturação',
    objetivo: 'Implementar processos e sistemas prioritários',
    acoes: recommendations.filter(r => r.prioridade === 'media').slice(0, 2).map(r => ({
      acao: `Iniciar: ${r.titulo}`,
      responsavel: r.area === 'Comercial' ? 'Gestor Comercial' : 
                   r.area === 'Marketing' ? 'Gestor de Marketing' :
                   r.area === 'Financeiro' ? 'Gestor Financeiro' :
                   r.area === 'Pessoas' ? 'Gestor de RH' : 'Gestor de TI',
      entregavel: 'Projeto iniciado com cronograma',
      recursos: r.recursos,
      metricas: 'Marcos do projeto definidos',
    })),
  });
  
  plano.push({
    semana: 6,
    fase: 'Estruturação',
    objetivo: 'Treinamento e capacitação da equipe',
    acoes: [
      {
        acao: 'Treinamento em novas metodologias/ferramentas',
        responsavel: 'RH + Gestores',
        entregavel: 'Equipe capacitada',
        recursos: 'Material de treinamento',
        metricas: '80% da equipe treinada',
      },
      {
        acao: 'Documentação de novos processos',
        responsavel: 'Donos de processo',
        entregavel: 'Processos documentados',
        recursos: 'Wiki/base de conhecimento',
        metricas: 'Processos críticos documentados',
      },
    ],
  });
  
  plano.push({
    semana: 7,
    fase: 'Estruturação',
    objetivo: 'Consolidar implementações e ajustar',
    acoes: [
      {
        acao: 'Ajustes finos nas implementações baseado em feedback',
        responsavel: 'Responsáveis de cada iniciativa',
        entregavel: 'Melhorias implementadas',
        recursos: 'Feedback da equipe',
        metricas: 'Problemas resolvidos',
      },
      {
        acao: 'Configuração de dashboards de acompanhamento',
        responsavel: 'TI/BI',
        entregavel: 'Dashboard operacional',
        recursos: 'Ferramenta de BI',
        metricas: 'KPIs visíveis em tempo real',
      },
    ],
  });
  
  plano.push({
    semana: 8,
    fase: 'Estruturação',
    objetivo: 'Review do segundo mês e preparação para escala',
    acoes: [
      {
        acao: 'Reunião de review do segundo mês',
        responsavel: 'CEO + Lideranças',
        entregavel: 'Análise de progresso dos OKRs',
        recursos: 'Dados de performance',
        metricas: 'OKRs no track',
      },
      {
        acao: 'Planejamento de escala das iniciativas bem-sucedidas',
        responsavel: 'CEO',
        entregavel: 'Plano de escala',
        recursos: 'Resultados das iniciativas',
        metricas: 'Iniciativas para escalar definidas',
      },
    ],
  });
  
  // Semanas 9-12: Execução e Otimização
  plano.push({
    semana: 9,
    fase: 'Execução',
    objetivo: 'Escalar iniciativas de sucesso',
    acoes: [
      {
        acao: 'Expandir iniciativas bem-sucedidas para toda empresa',
        responsavel: 'Gestores de área',
        entregavel: 'Iniciativas escaladas',
        recursos: 'Recursos adicionais se necessário',
        metricas: 'Cobertura de 100%',
      },
      {
        acao: 'Iniciar próximas iniciativas do backlog',
        responsavel: 'Responsáveis designados',
        entregavel: 'Novas iniciativas em andamento',
        recursos: 'Conforme planejado',
        metricas: 'Iniciativas iniciadas',
      },
    ],
  });
  
  plano.push({
    semana: 10,
    fase: 'Execução',
    objetivo: 'Otimização contínua',
    acoes: [
      {
        acao: 'Análise de dados e identificação de otimizações',
        responsavel: 'Analistas/BI',
        entregavel: 'Relatório de insights',
        recursos: 'Dados acumulados',
        metricas: 'Oportunidades identificadas',
      },
      {
        acao: 'Implementar otimizações de alto impacto',
        responsavel: 'Responsáveis de área',
        entregavel: 'Melhorias implementadas',
        recursos: 'Baseado em dados',
        metricas: 'Ganho incremental',
      },
    ],
  });
  
  plano.push({
    semana: 11,
    fase: 'Execução',
    objetivo: 'Preparação para próximo ciclo',
    acoes: [
      {
        acao: 'Coleta de feedback de toda equipe',
        responsavel: 'RH',
        entregavel: 'Pesquisa de satisfação',
        recursos: 'Formulário de feedback',
        metricas: 'Participação > 80%',
      },
      {
        acao: 'Documentação de aprendizados do trimestre',
        responsavel: 'Gestores',
        entregavel: 'Documento de lessons learned',
        recursos: 'Reuniões de retrospectiva',
        metricas: 'Aprendizados documentados',
      },
    ],
  });
  
  plano.push({
    semana: 12,
    fase: 'Fechamento',
    objetivo: 'Review final e planejamento do próximo trimestre',
    acoes: [
      {
        acao: 'Reunião de fechamento do trimestre com resultados',
        responsavel: 'CEO',
        entregavel: 'Apresentação de resultados',
        recursos: 'Dados consolidados',
        metricas: 'OKRs atingidos',
      },
      {
        acao: 'Celebração de conquistas e reconhecimento',
        responsavel: 'CEO + RH',
        entregavel: 'Evento de reconhecimento',
        recursos: 'Budget de celebração',
        metricas: 'Engajamento da equipe',
      },
      {
        acao: 'Definição de OKRs do próximo trimestre',
        responsavel: 'CEO + Lideranças',
        entregavel: 'OKRs Q+1 definidos',
        recursos: 'Aprendizados do trimestre',
        metricas: 'Continuidade do ciclo',
      },
    ],
  });
  
  return plano;
}

export { SECTOR_BENCHMARKS, TATICAS_COMERCIAIS, TATICAS_MARKETING, TATICAS_FINANCEIRAS, TATICAS_PESSOAS, TATICAS_PROCESSOS };
