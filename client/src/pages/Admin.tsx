import { useState, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Shield,
  Activity,
  Target,
  DollarSign,
  Cpu,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Star,
  Flame,
  Lightbulb,
  Wrench,
  Heart,
  MapPin,
  Eye,
  TrendingDown,
  Zap,
  FileText,
  PieChart,
  LayoutDashboard,
  List,
  Briefcase,
  UserCheck,
  Percent,
  Hash,
  Layers,
  Megaphone,
  Database,
  BarChart2,
  Calendar,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ScoreGeralTrendChart, ScoresByAreaTrendChart, VolumeAnalisesTrendChart, FaturamentoTrendChart } from '@/components/TrendCharts';

type TabId = 'overview' | 'financeiro' | 'estrutura' | 'comercial' | 'tecnologia' | 'insights' | 'empresas' | 'detalhes';

// Helper para formatar moeda
const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toLocaleString('pt-BR')}`;
};

const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSetor, setFilterSetor] = useState('');
  const [filterPorte, setFilterPorte] = useState('');
  const [filterFaixa, setFilterFaixa] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [detailView, setDetailView] = useState<'table' | 'cards'>('table');

  // Helper para aplicar atalhos de período
  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const todayStr = formatDate(now);

    if (preset === '') {
      setDateFrom('');
      setDateTo('');
      return;
    }
    if (preset === '7d') {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      setDateFrom(formatDate(from));
      setDateTo(todayStr);
    } else if (preset === '30d') {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      setDateFrom(formatDate(from));
      setDateTo(todayStr);
    } else if (preset === '90d') {
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      setDateFrom(formatDate(from));
      setDateTo(todayStr);
    } else if (preset === 'mes') {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      setDateFrom(formatDate(from));
      setDateTo(todayStr);
    } else if (preset === 'ano') {
      const from = new Date(now.getFullYear(), 0, 1);
      setDateFrom(formatDate(from));
      setDateTo(todayStr);
    }
  };

  const dashboardQuery = trpc.admin.dashboard.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const statsQuery = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const filteredAnalyses = useMemo(() => {
    if (!dashboardQuery.data?.allAnalyses) return [];
    return dashboardQuery.data.allAnalyses.filter((a: any) => {
      const matchesSearch = !searchTerm ||
        a.empresaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.cnpj && a.cnpj.includes(searchTerm)) ||
        (a.cidade && a.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.userName && a.userName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSetor = !filterSetor || a.setor === filterSetor;
      const matchesPorte = !filterPorte || (() => {
        const cols = a.numColaboradores || 0;
        if (filterPorte === 'mei') return cols <= 1;
        if (filterPorte === 'micro') return cols >= 2 && cols <= 9;
        if (filterPorte === 'pequena') return cols >= 10 && cols <= 49;
        if (filterPorte === 'media') return cols >= 50 && cols <= 99;
        if (filterPorte === 'grande') return cols >= 100;
        return true;
      })();
      const matchesFaixa = !filterFaixa || (() => {
        const fat = a.faturamento6Meses || 0;
        if (filterFaixa === 'ate50k') return fat > 0 && fat <= 50000;
        if (filterFaixa === 'de50a200k') return fat > 50000 && fat <= 200000;
        if (filterFaixa === 'de200a500k') return fat > 200000 && fat <= 500000;
        if (filterFaixa === 'de500kA1M') return fat > 500000 && fat <= 1000000;
        if (filterFaixa === 'acima1M') return fat > 1000000;
        return true;
      })();
      const matchesDate = (() => {
        if (!dateFrom && !dateTo) return true;
        const analysisDate = new Date(a.createdAt);
        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          if (analysisDate < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (analysisDate > to) return false;
        }
        return true;
      })();
      return matchesSearch && matchesSetor && matchesPorte && matchesFaixa && matchesDate;
    });
  }, [dashboardQuery.data, searchTerm, filterSetor, filterPorte, filterFaixa, dateFrom, dateTo]);

  const setores = useMemo(() => {
    if (!dashboardQuery.data?.allAnalyses) return [];
    const unique = new Set(dashboardQuery.data.allAnalyses.map((a: any) => a.setor).filter(Boolean));
    return Array.from(unique) as string[];
  }, [dashboardQuery.data]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 60) return 'bg-primary/20 border-primary/30';
    if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excelente', bg: 'bg-emerald-500/20', text: 'text-emerald-400' };
    if (score >= 60) return { label: 'Bom', bg: 'bg-primary/20', text: 'text-primary' };
    if (score >= 40) return { label: 'Regular', bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
    return { label: 'Crítico', bg: 'bg-red-500/20', text: 'text-red-400' };
  };

  const getValueColor = (value: number, thresholds: { good: number; warning: number; inverse?: boolean }) => {
    if (thresholds.inverse) {
      if (value <= thresholds.good) return 'text-emerald-400';
      if (value <= thresholds.warning) return 'text-yellow-400';
      return 'text-red-400';
    }
    if (value >= thresholds.good) return 'text-emerald-400';
    if (value >= thresholds.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">Faça login para acessar o painel administrativo.</p>
          <Button onClick={() => window.location.href = getLoginUrl()} className="bg-primary hover:bg-primary/90">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">Você não tem permissão para acessar esta área.</p>
          <Link href="/">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = statsQuery.data;
  const dashboard = dashboardQuery.data;
  const insights = dashboard?.insights;
  const agg = (dashboard as any)?.aggregations;

  const handleExportCSV = () => {
    if (!filteredAnalyses.length) return;
    const headers = [
      'Empresa', 'CNPJ', 'Setor', 'Segmento', 'Cidade', 'Aluno',
      'Score Geral', 'Financeiro', 'Comercial', 'Operacional', 'Pessoas', 'Tecnologia',
      'Faturamento 6M', 'Lucro Líquido %', 'Ticket Médio', 'Meta Faturamento Anual', 'Margem Alvo %',
      'CAC', 'LTV', 'Inadimplência %', 'Endividamento', 'Custo Financeiro Mensal',
      'Nº Sócios', 'Nº Colaboradores', 'Organograma', 'Camadas Liderança', 'Plano de Metas',
      'Turnover %', 'Absenteísmo %', 'Maturidade Gerencial',
      'Leads/Mês', 'Taxa Conversão %', 'NPS', 'Ciclo Vendas (dias)', 'ROAS', 'Win Rate %',
      'CRM', 'Funil Definido', 'Canais Aquisição',
      'Stack', 'Uso IA', 'Softwares Financeiros',
      'Nota Estratégia', 'Nota Finanças', 'Nota Comercial', 'Nota Operações', 'Nota Pessoas', 'Nota Tecnologia',
      'Data'
    ];
    const rows = filteredAnalyses.map((a: any) => [
      a.empresaNome, a.cnpj || '', a.setor || '', a.segmento || '', a.cidade || '', a.userName || '',
      a.scoreGeral, a.scoreFinanceiro, a.scoreComercial, a.scoreOperacional, a.scorePessoas, a.scoreTecnologia,
      a.faturamento6Meses || '', a.lucroLiquido6MesesPercent || '', a.ticketMedio || '', a.metaFaturamentoAnual || '', a.margemLucroAlvo || '',
      a.custoAquisicaoCliente || '', a.ltv || '', a.inadimplenciaPercent || '', a.endividamento || '', a.custoFinanceiroMensal || '',
      a.numSocios || '', a.numColaboradores || '', a.existeOrganograma || '', a.camadasLideranca || '', a.possuiPlanoMetas || '',
      a.turnover12Meses || '', a.absenteismo || '', a.maturidadeGerencial || '',
      a.leadsMes || '', a.taxaConversaoGeral || '', a.nps || '', a.cicloMedioVendas || '', a.roasMedio || '', a.winRate || '',
      a.crmUtilizado || '', a.funilDefinido || '', a.canaisAquisicao || '',
      a.stackAtual || '', a.usoIAHoje || '', a.softwaresFinanceiros || '',
      a.notaEstrategiaMetas || '', a.notaFinancasLucratividade || '', a.notaComercialMarketing || '',
      a.notaOperacoesQualidade || '', a.notaPessoasLideranca || '', a.notaTecnologiaDados || '',
      new Date(a.createdAt).toLocaleDateString('pt-BR'),
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CEO_GI_Relatorio_Completo_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'estrutura', label: 'Estrutura & Pessoas', icon: Users },
    { id: 'comercial', label: 'Comercial', icon: Target },
    { id: 'tecnologia', label: 'Tecnologia', icon: Cpu },
    { id: 'insights', label: 'Dores & Oportunidades', icon: Lightbulb },
    { id: 'empresas', label: 'Empresas', icon: Building2 },
    { id: 'detalhes', label: 'Tabela Completa', icon: List },
  ];

  // Componente reutilizável para KPI Card
  const KPICard = ({ label, value, subtitle, icon: Icon, color, bgColor }: {
    label: string; value: string | number; subtitle?: string; icon: typeof DollarSign; color: string; bgColor: string;
  }) => (
    <div className="bg-card/50 border border-border/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );

  // Componente para barra de progresso com label
  const MetricBar = ({ label, value, max, suffix, color }: {
    label: string; value: number; max: number; suffix?: string; color: string;
  }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2.5 bg-background/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground w-16 text-right">{value}{suffix || ''}</span>
    </div>
  );

  // Componente para tabela de empresa com dados detalhados
  const EmpresaDetailRow = ({ empresa, type }: { empresa: any; type: 'financeiro' | 'estrutura' | 'comercial' | 'tecnologia' }) => {
    if (type === 'financeiro') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3 bg-background/20 rounded-lg border border-border/10">
          <div><span className="text-[10px] text-muted-foreground block">Faturamento 6M</span><span className="text-sm font-medium text-foreground">{empresa.faturamento6Meses > 0 ? formatCurrency(empresa.faturamento6Meses) : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Lucro Líq. %</span><span className={`text-sm font-medium ${getValueColor(empresa.lucroLiquido6MesesPercent, { good: 15, warning: 5 })}`}>{empresa.lucroLiquido6MesesPercent > 0 ? `${empresa.lucroLiquido6MesesPercent}%` : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Ticket Médio</span><span className="text-sm font-medium text-foreground">{empresa.ticketMedio > 0 ? formatCurrency(empresa.ticketMedio) : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Inadimplência</span><span className={`text-sm font-medium ${getValueColor(empresa.inadimplenciaPercent, { good: 3, warning: 8, inverse: true })}`}>{empresa.inadimplenciaPercent > 0 ? `${empresa.inadimplenciaPercent}%` : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">CAC</span><span className="text-sm font-medium text-foreground">{empresa.custoAquisicaoCliente > 0 ? formatCurrency(empresa.custoAquisicaoCliente) : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">LTV</span><span className="text-sm font-medium text-foreground">{empresa.ltv > 0 ? formatCurrency(empresa.ltv) : '-'}</span></div>
        </div>
      );
    }
    if (type === 'estrutura') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3 bg-background/20 rounded-lg border border-border/10">
          <div><span className="text-[10px] text-muted-foreground block">Sócios</span><span className="text-sm font-medium text-foreground">{empresa.numSocios || '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Colaboradores</span><span className="text-sm font-medium text-foreground">{empresa.numColaboradores || '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Organograma</span><span className="text-sm font-medium text-foreground">{empresa.existeOrganograma}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Turnover</span><span className={`text-sm font-medium ${getValueColor(empresa.turnover12Meses, { good: 5, warning: 15, inverse: true })}`}>{empresa.turnover12Meses > 0 ? `${empresa.turnover12Meses}%` : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Absenteísmo</span><span className={`text-sm font-medium ${getValueColor(empresa.absenteismo, { good: 3, warning: 7, inverse: true })}`}>{empresa.absenteismo > 0 ? `${empresa.absenteismo}%` : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Maturidade</span><span className="text-sm font-medium text-foreground">{empresa.maturidadeGerencial}</span></div>
        </div>
      );
    }
    if (type === 'comercial') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3 bg-background/20 rounded-lg border border-border/10">
          <div><span className="text-[10px] text-muted-foreground block">Leads/Mês</span><span className="text-sm font-medium text-foreground">{empresa.leadsMes > 0 ? empresa.leadsMes : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Conversão</span><span className={`text-sm font-medium ${getValueColor(empresa.taxaConversaoGeral, { good: 5, warning: 2 })}`}>{empresa.taxaConversaoGeral > 0 ? `${empresa.taxaConversaoGeral}%` : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">NPS</span><span className={`text-sm font-medium ${getValueColor(empresa.nps, { good: 50, warning: 0 })}`}>{empresa.nps !== 0 ? empresa.nps : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Ciclo Vendas</span><span className="text-sm font-medium text-foreground">{empresa.cicloMedioVendas > 0 ? `${empresa.cicloMedioVendas}d` : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">ROAS</span><span className={`text-sm font-medium ${getValueColor(empresa.roasMedio, { good: 3, warning: 1 })}`}>{empresa.roasMedio > 0 ? `${empresa.roasMedio}x` : '-'}</span></div>
          <div><span className="text-[10px] text-muted-foreground block">Win Rate</span><span className={`text-sm font-medium ${getValueColor(empresa.winRate, { good: 30, warning: 15 })}`}>{empresa.winRate > 0 ? `${empresa.winRate}%` : '-'}</span></div>
        </div>
      );
    }
    // tecnologia
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-background/20 rounded-lg border border-border/10">
        <div><span className="text-[10px] text-muted-foreground block">Stack</span><span className="text-sm font-medium text-foreground truncate block">{empresa.stackAtual}</span></div>
        <div><span className="text-[10px] text-muted-foreground block">Uso de IA</span><span className="text-sm font-medium text-foreground truncate block">{empresa.usoIAHoje}</span></div>
        <div><span className="text-[10px] text-muted-foreground block">CRM</span><span className="text-sm font-medium text-foreground truncate block">{empresa.crmUtilizado}</span></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#091018]/90 backdrop-blur-md border-b border-white/10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Brain className="w-6 h-6 text-primary" />
                <span className="font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>CEO DO GI</span>
              </div>
            </Link>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1.5 text-primary">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Painel Administrativo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleExportCSV} variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container px-4 py-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          {[
            { label: 'Análises', value: stats?.totalAnalyses || 0, icon: BarChart3, color: 'text-primary', bgColor: 'bg-primary/20' },
            { label: 'Alunos', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
            { label: 'Score Médio', value: stats?.avgScoreGeral || 0, icon: TrendingUp, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
            { label: 'Setores', value: stats?.setoresDistribuicao?.length || 0, icon: Building2, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
            { label: 'Fat. Total', value: agg ? formatCurrency(agg.financeiro.totalFaturamento) : '-', icon: DollarSign, color: 'text-primary', bgColor: 'bg-primary/20' },
            { label: 'Colaboradores', value: agg?.estrutural?.totalColaboradores || 0, icon: UserCheck, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
            { label: 'NPS Médio', value: agg?.comercial?.avgNPS || 0, icon: Heart, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
            { label: 'Conversão', value: agg ? `${agg.comercial.avgTaxaConversao}%` : '-', icon: Target, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card/50 border border-border/50 rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-7 h-7 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">{card.label}</span>
              </div>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-card/30 p-1 rounded-xl border border-border/30 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filtros globais */}
        <div className="space-y-2 mb-4">
          {/* Linha 1: Busca + Selects */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar empresa, CNPJ, cidade ou aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/50 rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={filterSetor}
              onChange={(e) => setFilterSetor(e.target.value)}
              className="px-3 py-2 bg-card/50 border border-border/50 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Todos os setores</option>
              {setores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterPorte}
              onChange={(e) => setFilterPorte(e.target.value)}
              className="px-3 py-2 bg-card/50 border border-border/50 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Todos os portes</option>
              <option value="mei">MEI (0-1)</option>
              <option value="micro">Micro (2-9)</option>
              <option value="pequena">Pequena (10-49)</option>
              <option value="media">Média (50-99)</option>
              <option value="grande">Grande (100+)</option>
            </select>
            <select
              value={filterFaixa}
              onChange={(e) => setFilterFaixa(e.target.value)}
              className="px-3 py-2 bg-card/50 border border-border/50 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Todas as faixas</option>
              <option value="ate50k">Até R$ 50k</option>
              <option value="de50a200k">R$ 50k - 200k</option>
              <option value="de200a500k">R$ 200k - 500k</option>
              <option value="de500kA1M">R$ 500k - 1M</option>
              <option value="acima1M">Acima de R$ 1M</option>
            </select>
          </div>

          {/* Linha 2: Filtro de Período */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Período:</span>
            </div>
            {/* Atalhos rápidos */}
            <div className="flex gap-1">
              {[
                { id: '7d', label: '7 dias' },
                { id: '30d', label: '30 dias' },
                { id: '90d', label: '90 dias' },
                { id: 'mes', label: 'Este mês' },
                { id: 'ano', label: 'Este ano' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyDatePreset(datePreset === preset.id ? '' : preset.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    datePreset === preset.id
                      ? 'bg-primary text-white'
                      : 'bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-border/50" />
            {/* Inputs de data */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">De:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setDatePreset('custom'); }}
                className="px-2 py-1 bg-card/50 border border-border/50 rounded-md text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 [color-scheme:dark]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Até:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setDatePreset('custom'); }}
                className="px-2 py-1 bg-card/50 border border-border/50 rounded-md text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 [color-scheme:dark]"
              />
            </div>
            {/* Botão limpar */}
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setDatePreset(''); }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3 h-3" />
                Limpar
              </button>
            )}
            {/* Indicador de período ativo */}
            {(dateFrom || dateTo) && (
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {dateFrom && dateTo
                  ? `${new Date(dateFrom + 'T12:00:00').toLocaleDateString('pt-BR')} - ${new Date(dateTo + 'T12:00:00').toLocaleDateString('pt-BR')}`
                  : dateFrom
                    ? `A partir de ${new Date(dateFrom + 'T12:00:00').toLocaleDateString('pt-BR')}`
                    : `Até ${new Date(dateTo + 'T12:00:00').toLocaleDateString('pt-BR')}`
                }
              </span>
            )}
          </div>
        </div>

        {/* ==================== TAB: VISÃO GERAL ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Scores por Área */}
            {stats && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Scores Médios por Área
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Financeiro', score: stats.avgScoreFinanceiro, icon: DollarSign },
                    { label: 'Comercial', score: stats.avgScoreComercial, icon: Target },
                    { label: 'Operacional', score: stats.avgScoreOperacional, icon: Activity },
                    { label: 'Pessoas', score: stats.avgScorePessoas, icon: Users },
                    { label: 'Tecnologia', score: stats.avgScoreTecnologia, icon: Cpu },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-xl p-4 border ${getScoreBg(item.score)} text-center`}>
                      <item.icon className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(item.score)}`} />
                      <p className={`text-3xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                      <div className="mt-2 h-2 bg-background/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-primary' : item.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Ranking de Áreas */}
            {insights?.areasComMaiorDeficit && insights.areasComMaiorDeficit.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Ranking de Áreas (Menor para Maior Score)
                </h2>
                <div className="space-y-3">
                  {insights.areasComMaiorDeficit.map((area: any, i: number) => (
                    <div key={area.area} className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-red-500/20 text-red-400' : i === 1 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-card text-muted-foreground'
                      }`}>{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{area.area}</span>
                          <span className={`text-sm font-bold ${getScoreColor(area.avg)}`}>{area.avg}/100</span>
                        </div>
                        <div className="h-3 bg-background/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${area.avg}%` }}
                            transition={{ duration: 1, delay: i * 0.15 }}
                            className={`h-full rounded-full ${
                              area.avg >= 80 ? 'bg-emerald-500' : area.avg >= 60 ? 'bg-primary' : area.avg >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Gráficos de Tendência Temporal */}
            {filteredAnalyses.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Score Geral ao Longo do Tempo */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Evolução do Score Geral
                  </h2>
                  <ScoreGeralTrendChart analyses={filteredAnalyses} />
                </motion.div>

                {/* Volume de Análises por Mês */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Volume de Análises por Mês
                  </h2>
                  <VolumeAnalisesTrendChart analyses={filteredAnalyses} />
                </motion.div>
              </div>
            )}

            {/* Scores por Área ao Longo do Tempo */}
            {filteredAnalyses.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Evolução dos Scores por Área
                </h2>
                <ScoresByAreaTrendChart analyses={filteredAnalyses} />
              </motion.div>
            )}

            {/* Faturamento Médio ao Longo do Tempo */}
            {filteredAnalyses.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Evolução do Faturamento Médio
                </h2>
                <FaturamentoTrendChart analyses={filteredAnalyses} />
              </motion.div>
            )}

            {/* Distribuição por Setor e Cidade */}
            <div className="grid md:grid-cols-2 gap-6">
              {dashboard?.scoresBySetor && dashboard.scoresBySetor.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Score Médio por Setor
                  </h2>
                  <div className="space-y-3">
                    {dashboard.scoresBySetor.map((s: any) => (
                      <div key={s.setor} className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/20">
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.setor}</p>
                          <p className="text-xs text-muted-foreground">{s.count} análise(s)</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${getScoreColor(s.avgGeral)}`}>{s.avgGeral}</span>
                          <span className="text-xs text-muted-foreground ml-1">/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {dashboard?.scoresByCidade && dashboard.scoresByCidade.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Score Médio por Cidade
                  </h2>
                  <div className="space-y-3">
                    {dashboard.scoresByCidade.map((c: any) => (
                      <div key={c.cidade} className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/20">
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.cidade}</p>
                          <p className="text-xs text-muted-foreground">{c.count} análise(s)</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${getScoreColor(c.avgGeral)}`}>{c.avgGeral}</span>
                          <span className="text-xs text-muted-foreground ml-1">/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: FINANCEIRO ==================== */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            {/* KPIs Financeiros */}
            {agg && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                  <KPICard label="Fat. Total (6M)" value={formatCurrency(agg.financeiro.totalFaturamento)} icon={DollarSign} color="text-primary" bgColor="bg-primary/20" />
                  <KPICard label="Fat. Médio (6M)" value={formatCurrency(agg.financeiro.avgFaturamento)} icon={BarChart3} color="text-blue-400" bgColor="bg-blue-500/20" />
                  <KPICard label="Ticket Médio" value={formatCurrency(agg.financeiro.avgTicketMedio)} icon={Briefcase} color="text-purple-400" bgColor="bg-purple-500/20" />
                  <KPICard label="Margem Lucro" value={`${agg.financeiro.avgMargemLucro}%`} icon={TrendingUp} color="text-emerald-400" bgColor="bg-emerald-500/20" />
                  <KPICard label="Inadimplência" value={`${agg.financeiro.avgInadimplencia}%`} icon={AlertTriangle} color="text-red-400" bgColor="bg-red-500/20" />
                  <KPICard label="CAC Médio" value={formatCurrency(agg.financeiro.avgCustoAquisicao)} icon={Target} color="text-amber-400" bgColor="bg-amber-500/20" />
                  <KPICard label="LTV Médio" value={formatCurrency(agg.financeiro.avgLTV)} icon={Heart} color="text-pink-400" bgColor="bg-pink-500/20" />
                </div>
              </motion.div>
            )}

            {/* Faturamento por Setor */}
            {agg?.financeiro?.faturamentoBySetor && agg.financeiro.faturamentoBySetor.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-primary" />
                  Faturamento por Setor (6 meses)
                </h2>
                <div className="space-y-3">
                  {agg.financeiro.faturamentoBySetor
                    .sort((a: any, b: any) => b.total - a.total)
                    .map((s: any) => {
                      const maxTotal = Math.max(...agg.financeiro.faturamentoBySetor.map((x: any) => x.total));
                      return (
                        <div key={s.setor} className="p-3 bg-background/30 rounded-lg border border-border/20">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{s.setor}</p>
                              <p className="text-xs text-muted-foreground">{s.count} empresa(s) | Média: {formatCurrency(s.avg)}</p>
                            </div>
                            <span className="text-lg font-bold text-primary">{formatCurrency(s.total)}</span>
                          </div>
                          <div className="h-2.5 bg-background/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(s.total / (maxTotal || 1)) * 100}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full rounded-full bg-primary/70"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* Distribuição por Faixa de Faturamento */}
            {agg?.financeiro?.faixaFaturamento && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Distribuição por Faixa de Faturamento
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Até R$ 50k', value: agg.financeiro.faixaFaturamento.ate50k, color: 'bg-red-500/20 border-red-500/30', textColor: 'text-red-400' },
                    { label: 'R$ 50k-200k', value: agg.financeiro.faixaFaturamento.de50a200k, color: 'bg-yellow-500/20 border-yellow-500/30', textColor: 'text-yellow-400' },
                    { label: 'R$ 200k-500k', value: agg.financeiro.faixaFaturamento.de200a500k, color: 'bg-primary/20 border-primary/30', textColor: 'text-primary' },
                    { label: 'R$ 500k-1M', value: agg.financeiro.faixaFaturamento.de500kA1M, color: 'bg-blue-500/20 border-blue-500/30', textColor: 'text-blue-400' },
                    { label: 'Acima R$ 1M', value: agg.financeiro.faixaFaturamento.acima1M, color: 'bg-emerald-500/20 border-emerald-500/30', textColor: 'text-emerald-400' },
                    { label: 'Não informado', value: agg.financeiro.faixaFaturamento.naoInformado, color: 'bg-card border-border/30', textColor: 'text-muted-foreground' },
                  ].map((faixa) => (
                    <div key={faixa.label} className={`rounded-xl p-4 border ${faixa.color} text-center`}>
                      <p className={`text-3xl font-bold ${faixa.textColor}`}>{faixa.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{faixa.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tabela Financeira por Empresa */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Dados Financeiros por Empresa ({filteredAnalyses.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-background/30">
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Empresa</th>
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Setor</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Fat. 6M</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Lucro %</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Ticket</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Inadimpl.</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">CAC</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">LTV</th>
                      <th className="text-center p-2.5 text-muted-foreground font-medium text-xs">Score Fin.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnalyses.map((a: any) => (
                      <tr key={a.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                        <td className="p-2.5">
                          <p className="font-medium text-foreground text-xs">{a.empresaNome}</p>
                          <p className="text-[10px] text-muted-foreground">{a.cidade || '-'}</p>
                        </td>
                        <td className="p-2.5 text-xs text-muted-foreground">{a.setor || '-'}</td>
                        <td className="p-2.5 text-right text-xs font-medium text-foreground">{a.faturamento6Meses > 0 ? formatCurrency(a.faturamento6Meses) : '-'}</td>
                        <td className={`p-2.5 text-right text-xs font-medium ${a.lucroLiquido6MesesPercent > 0 ? getValueColor(a.lucroLiquido6MesesPercent, { good: 15, warning: 5 }) : 'text-muted-foreground'}`}>{a.lucroLiquido6MesesPercent > 0 ? `${a.lucroLiquido6MesesPercent}%` : '-'}</td>
                        <td className="p-2.5 text-right text-xs font-medium text-foreground">{a.ticketMedio > 0 ? formatCurrency(a.ticketMedio) : '-'}</td>
                        <td className={`p-2.5 text-right text-xs font-medium ${a.inadimplenciaPercent > 0 ? getValueColor(a.inadimplenciaPercent, { good: 3, warning: 8, inverse: true }) : 'text-muted-foreground'}`}>{a.inadimplenciaPercent > 0 ? `${a.inadimplenciaPercent}%` : '-'}</td>
                        <td className="p-2.5 text-right text-xs font-medium text-foreground">{a.custoAquisicaoCliente > 0 ? formatCurrency(a.custoAquisicaoCliente) : '-'}</td>
                        <td className="p-2.5 text-right text-xs font-medium text-foreground">{a.ltv > 0 ? formatCurrency(a.ltv) : '-'}</td>
                        <td className="p-2.5 text-center">
                          <span className={`text-xs font-bold ${getScoreColor(a.scoreFinanceiro)}`}>{a.scoreFinanceiro}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAnalyses.length === 0 && (
                <div className="p-8 text-center">
                  <DollarSign className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ==================== TAB: ESTRUTURA & PESSOAS ==================== */}
        {activeTab === 'estrutura' && (
          <div className="space-y-6">
            {/* KPIs Estruturais */}
            {agg && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                  <KPICard label="Total Colaboradores" value={agg.estrutural.totalColaboradores} icon={Users} color="text-blue-400" bgColor="bg-blue-500/20" />
                  <KPICard label="Total Sócios" value={agg.estrutural.totalSocios} icon={UserCheck} color="text-purple-400" bgColor="bg-purple-500/20" />
                  <KPICard label="Média Colab." value={agg.estrutural.avgColaboradores} icon={Hash} color="text-cyan-400" bgColor="bg-cyan-500/20" />
                  <KPICard label="Turnover Médio" value={`${agg.estrutural.avgTurnover}%`} icon={TrendingDown} color="text-red-400" bgColor="bg-red-500/20" />
                  <KPICard label="Absenteísmo" value={`${agg.estrutural.avgAbsenteismo}%`} icon={AlertTriangle} color="text-yellow-400" bgColor="bg-yellow-500/20" />
                  <KPICard label="Com Organograma" value={agg.estrutural.empresasComOrganograma} icon={Layers} color="text-emerald-400" bgColor="bg-emerald-500/20" subtitle={`de ${filteredAnalyses.length}`} />
                  <KPICard label="Com Plano Metas" value={agg.estrutural.empresasComPlanoMetas} icon={Target} color="text-primary" bgColor="bg-primary/20" subtitle={`de ${filteredAnalyses.length}`} />
                </div>
              </motion.div>
            )}

            {/* Distribuição por Porte */}
            {agg?.estrutural?.porteDistribuicao && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Distribuição por Porte (Nº Colaboradores)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: 'MEI (0-1)', value: agg.estrutural.porteDistribuicao.mei, color: 'bg-red-500/20 border-red-500/30', textColor: 'text-red-400' },
                    { label: 'Micro (2-9)', value: agg.estrutural.porteDistribuicao.micro, color: 'bg-yellow-500/20 border-yellow-500/30', textColor: 'text-yellow-400' },
                    { label: 'Pequena (10-49)', value: agg.estrutural.porteDistribuicao.pequena, color: 'bg-primary/20 border-primary/30', textColor: 'text-primary' },
                    { label: 'Média (50-99)', value: agg.estrutural.porteDistribuicao.media, color: 'bg-blue-500/20 border-blue-500/30', textColor: 'text-blue-400' },
                    { label: 'Grande (100+)', value: agg.estrutural.porteDistribuicao.grande, color: 'bg-emerald-500/20 border-emerald-500/30', textColor: 'text-emerald-400' },
                  ].map((porte) => (
                    <div key={porte.label} className={`rounded-xl p-4 border ${porte.color} text-center`}>
                      <p className={`text-3xl font-bold ${porte.textColor}`}>{porte.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{porte.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tabela Estrutural por Empresa */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Estrutura Organizacional por Empresa ({filteredAnalyses.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-background/30">
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Empresa</th>
                      <th className="text-center p-2.5 text-muted-foreground font-medium text-xs">Sócios</th>
                      <th className="text-center p-2.5 text-muted-foreground font-medium text-xs">Colab.</th>
                      <th className="text-center p-2.5 text-muted-foreground font-medium text-xs">Liderança</th>
                      <th className="text-center p-2.5 text-muted-foreground font-medium text-xs">Organograma</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Turnover</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Absent.</th>
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Maturidade</th>
                      <th className="text-center p-2.5 text-muted-foreground font-medium text-xs">Score Pes.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnalyses.map((a: any) => (
                      <tr key={a.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                        <td className="p-2.5">
                          <p className="font-medium text-foreground text-xs">{a.empresaNome}</p>
                          <p className="text-[10px] text-muted-foreground">{a.setor || '-'}</p>
                        </td>
                        <td className="p-2.5 text-center text-xs font-medium text-foreground">{a.numSocios || '-'}</td>
                        <td className="p-2.5 text-center text-xs font-medium text-foreground">{a.numColaboradores || '-'}</td>
                        <td className="p-2.5 text-center text-xs font-medium text-foreground">{a.camadasLideranca || '-'}</td>
                        <td className="p-2.5 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            a.existeOrganograma?.toLowerCase()?.includes('sim') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>{a.existeOrganograma?.toLowerCase()?.includes('sim') ? 'Sim' : 'Não'}</span>
                        </td>
                        <td className={`p-2.5 text-right text-xs font-medium ${a.turnover12Meses > 0 ? getValueColor(a.turnover12Meses, { good: 5, warning: 15, inverse: true }) : 'text-muted-foreground'}`}>{a.turnover12Meses > 0 ? `${a.turnover12Meses}%` : '-'}</td>
                        <td className={`p-2.5 text-right text-xs font-medium ${a.absenteismo > 0 ? getValueColor(a.absenteismo, { good: 3, warning: 7, inverse: true }) : 'text-muted-foreground'}`}>{a.absenteismo > 0 ? `${a.absenteismo}%` : '-'}</td>
                        <td className="p-2.5 text-xs text-muted-foreground truncate max-w-[120px]">{a.maturidadeGerencial}</td>
                        <td className="p-2.5 text-center">
                          <span className={`text-xs font-bold ${getScoreColor(a.scorePessoas)}`}>{a.scorePessoas}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAnalyses.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ==================== TAB: COMERCIAL ==================== */}
        {activeTab === 'comercial' && (
          <div className="space-y-6">
            {/* KPIs Comerciais */}
            {agg && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                  <KPICard label="NPS Médio" value={agg.comercial.avgNPS} icon={Heart} color="text-pink-400" bgColor="bg-pink-500/20" />
                  <KPICard label="Leads/Mês" value={agg.comercial.avgLeadsMes} icon={Megaphone} color="text-blue-400" bgColor="bg-blue-500/20" />
                  <KPICard label="Conversão" value={`${agg.comercial.avgTaxaConversao}%`} icon={Target} color="text-emerald-400" bgColor="bg-emerald-500/20" />
                  <KPICard label="Ciclo Vendas" value={`${agg.comercial.avgCicloVendas}d`} icon={Activity} color="text-purple-400" bgColor="bg-purple-500/20" />
                  <KPICard label="ROAS Médio" value={`${agg.comercial.avgROAS}x`} icon={TrendingUp} color="text-primary" bgColor="bg-primary/20" />
                  <KPICard label="Win Rate" value={`${agg.comercial.avgWinRate}%`} icon={Star} color="text-amber-400" bgColor="bg-amber-500/20" />
                </div>
              </motion.div>
            )}

            {/* Tabela Comercial por Empresa */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Dados Comerciais por Empresa ({filteredAnalyses.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-background/30">
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Empresa</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Leads/Mês</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Conversão</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">NPS</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Ciclo</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">ROAS</th>
                      <th className="text-right p-2.5 text-muted-foreground font-medium text-xs">Win Rate</th>
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">CRM</th>
                      <th className="text-center p-2.5 text-muted-foreground font-medium text-xs">Score Com.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnalyses.map((a: any) => (
                      <tr key={a.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                        <td className="p-2.5">
                          <p className="font-medium text-foreground text-xs">{a.empresaNome}</p>
                          <p className="text-[10px] text-muted-foreground">{a.setor || '-'}</p>
                        </td>
                        <td className="p-2.5 text-right text-xs font-medium text-foreground">{a.leadsMes > 0 ? a.leadsMes : '-'}</td>
                        <td className={`p-2.5 text-right text-xs font-medium ${a.taxaConversaoGeral > 0 ? getValueColor(a.taxaConversaoGeral, { good: 5, warning: 2 }) : 'text-muted-foreground'}`}>{a.taxaConversaoGeral > 0 ? `${a.taxaConversaoGeral}%` : '-'}</td>
                        <td className={`p-2.5 text-right text-xs font-medium ${a.nps !== 0 ? getValueColor(a.nps, { good: 50, warning: 0 }) : 'text-muted-foreground'}`}>{a.nps !== 0 ? a.nps : '-'}</td>
                        <td className="p-2.5 text-right text-xs font-medium text-foreground">{a.cicloMedioVendas > 0 ? `${a.cicloMedioVendas}d` : '-'}</td>
                        <td className={`p-2.5 text-right text-xs font-medium ${a.roasMedio > 0 ? getValueColor(a.roasMedio, { good: 3, warning: 1 }) : 'text-muted-foreground'}`}>{a.roasMedio > 0 ? `${a.roasMedio}x` : '-'}</td>
                        <td className={`p-2.5 text-right text-xs font-medium ${a.winRate > 0 ? getValueColor(a.winRate, { good: 30, warning: 15 }) : 'text-muted-foreground'}`}>{a.winRate > 0 ? `${a.winRate}%` : '-'}</td>
                        <td className="p-2.5 text-xs text-muted-foreground truncate max-w-[100px]">{a.crmUtilizado !== 'N/A' ? a.crmUtilizado : '-'}</td>
                        <td className="p-2.5 text-center">
                          <span className={`text-xs font-bold ${getScoreColor(a.scoreComercial)}`}>{a.scoreComercial}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAnalyses.length === 0 && (
                <div className="p-8 text-center">
                  <Target className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ==================== TAB: TECNOLOGIA ==================== */}
        {activeTab === 'tecnologia' && (
          <div className="space-y-6">
            {/* Tabela Tecnologia por Empresa */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                Dados de Tecnologia por Empresa ({filteredAnalyses.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-background/30">
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Empresa</th>
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Stack Atual</th>
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">CRM</th>
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Uso de IA</th>
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Dados</th>
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Dashboards</th>
                      <th className="text-left p-2.5 text-muted-foreground font-medium text-xs">Softwares Fin.</th>
                      <th className="text-center p-2.5 text-muted-foreground font-medium text-xs">Score Tec.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnalyses.map((a: any) => (
                      <tr key={a.id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                        <td className="p-2.5">
                          <p className="font-medium text-foreground text-xs">{a.empresaNome}</p>
                          <p className="text-[10px] text-muted-foreground">{a.setor || '-'}</p>
                        </td>
                        <td className="p-2.5 text-xs text-muted-foreground max-w-[120px] truncate" title={a.stackAtual}>{a.stackAtual !== 'N/A' ? a.stackAtual : '-'}</td>
                        <td className="p-2.5 text-xs text-muted-foreground max-w-[100px] truncate" title={a.crmUtilizado}>{a.crmUtilizado !== 'N/A' ? a.crmUtilizado : '-'}</td>
                        <td className="p-2.5 text-xs text-muted-foreground max-w-[120px] truncate" title={a.usoIAHoje}>{a.usoIAHoje !== 'N/A' ? a.usoIAHoje : '-'}</td>
                        <td className="p-2.5 text-xs text-muted-foreground max-w-[100px] truncate" title={a.ondeDadosVivem}>{a.ondeDadosVivem !== 'N/A' ? a.ondeDadosVivem : '-'}</td>
                        <td className="p-2.5 text-xs text-muted-foreground max-w-[100px] truncate" title={a.dashboardsKPIs}>{a.dashboardsKPIs !== 'N/A' ? a.dashboardsKPIs : '-'}</td>
                        <td className="p-2.5 text-xs text-muted-foreground max-w-[100px] truncate" title={a.softwaresFinanceiros}>{a.softwaresFinanceiros !== 'N/A' ? a.softwaresFinanceiros : '-'}</td>
                        <td className="p-2.5 text-center">
                          <span className={`text-xs font-bold ${getScoreColor(a.scoreTecnologia)}`}>{a.scoreTecnologia}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAnalyses.length === 0 && (
                <div className="p-8 text-center">
                  <Cpu className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ==================== TAB: DORES & OPORTUNIDADES ==================== */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {insights?.principaisDores && insights.principaisDores.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-400" />
                  Principais Dores e Problemas
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Problemas mais recorrentes identificados nas empresas analisadas</p>
                <div className="space-y-2">
                  {insights.principaisDores.map((dor: any, i: number) => {
                    const maxCount = insights.principaisDores[0]?.count || 1;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                        <span className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-400 shrink-0 mt-0.5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-relaxed">{dor.item}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-background/50 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${(dor.count / maxCount) * 100}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{dor.count}x</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {insights?.principaisCausas && insights.principaisCausas.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-yellow-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-yellow-400" />
                  Causas Raiz Identificadas
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Causas fundamentais que geram os problemas nas empresas</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {insights.principaisCausas.map((causa: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">{causa.item}</p>
                        <span className="text-xs text-muted-foreground">{causa.count} empresa(s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {insights?.principaisOportunidades && insights.principaisOportunidades.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-emerald-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-emerald-400" />
                  Principais Oportunidades
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Pontos fortes e oportunidades identificados nas empresas</p>
                <div className="space-y-2">
                  {insights.principaisOportunidades.map((op: any, i: number) => {
                    const maxCount = insights.principaisOportunidades[0]?.count || 1;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                        <Star className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-relaxed">{op.item}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-background/50 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${(op.count / maxCount) * 100}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{op.count}x</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {insights?.principaisNecessidades && insights.principaisNecessidades.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 border border-blue-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Necessidades e Ações Prioritárias
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Ações mais recomendadas e necessidades identificadas</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {insights.principaisNecessidades.map((nec: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">{nec.item}</p>
                        <span className="text-xs text-muted-foreground">{nec.count} empresa(s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {(!insights?.principaisDores?.length && !insights?.principaisCausas?.length && !insights?.principaisOportunidades?.length) && (
              <div className="bg-card/50 border border-border/50 rounded-xl p-12 text-center">
                <Lightbulb className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">Ainda não há dados suficientes para gerar insights.</p>
                <p className="text-xs text-muted-foreground mt-1">Os insights serão exibidos quando houver análises salvas.</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: EMPRESAS ==================== */}
        {activeTab === 'empresas' && (
          <div className="space-y-6">
            {/* Empresas em Risco */}
            {insights?.empresasEmRisco && insights.empresasEmRisco.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Empresas em Risco (Score &lt; 40)
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Empresas que necessitam de atenção imediata</p>
                <div className="space-y-3">
                  {insights.empresasEmRisco.map((empresa: any, i: number) => (
                    <div key={i} className="p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{empresa.nome}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">{empresa.setor}</span>
                            <span className="text-xs text-muted-foreground">Aluno: {empresa.aluno}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${getScoreColor(empresa.scoreGeral)}`}>{empresa.scoreGeral}</span>
                          <span className="text-xs text-muted-foreground block">/100</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs text-red-400">Piores áreas:</span>
                        {empresa.pioresAreas.map((area: any) => (
                          <span key={area.area} className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{area.area}: {area.score}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empresas Destaque */}
            {insights?.empresasDestaque && insights.empresasDestaque.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-emerald-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-400" />
                  Empresas Destaque (Score &ge; 70)
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Empresas com melhor desempenho geral</p>
                <div className="space-y-3">
                  {insights.empresasDestaque.map((empresa: any, i: number) => (
                    <div key={i} className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{empresa.nome}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">{empresa.setor}</span>
                            <span className="text-xs text-muted-foreground">Aluno: {empresa.aluno}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${getScoreColor(empresa.scoreGeral)}`}>{empresa.scoreGeral}</span>
                          <span className="text-xs text-muted-foreground block">/100</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs text-emerald-400">Melhores áreas:</span>
                        {empresa.melhoresAreas.map((area: any) => (
                          <span key={area.area} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{area.area}: {area.score}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Todas as empresas em cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Todas as Empresas ({filteredAnalyses.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAnalyses.map((a: any) => {
                  const badge = getScoreBadge(a.scoreGeral);
                  return (
                    <div key={a.id} className="bg-background/30 rounded-xl border border-border/20 p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">{a.empresaNome}</h3>
                          <p className="text-xs text-muted-foreground">{a.setor || 'N/A'} | {a.cidade || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Aluno: {a.userName || 'N/A'}</p>
                        </div>
                        <div className="text-center shrink-0 ml-3">
                          <span className={`text-2xl font-bold ${getScoreColor(a.scoreGeral)}`}>{a.scoreGeral}</span>
                          <span className={`block text-[10px] px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 mb-2">
                        {[
                          { label: 'Fin', score: a.scoreFinanceiro },
                          { label: 'Com', score: a.scoreComercial },
                          { label: 'Op', score: a.scoreOperacional },
                          { label: 'Pes', score: a.scorePessoas },
                          { label: 'Tec', score: a.scoreTecnologia },
                        ].map((item) => (
                          <div key={item.label} className="text-center">
                            <div className="h-1.5 bg-background/50 rounded-full overflow-hidden mb-1">
                              <div
                                className={`h-full rounded-full ${
                                  item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-primary' : item.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                            <span className={`text-[10px] ${getScoreColor(item.score)}`}>{item.label} {item.score}</span>
                          </div>
                        ))}
                      </div>
                      {/* Mini dados extras */}
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/10">
                        <div className="text-center">
                          <span className="text-[10px] text-muted-foreground block">Fat. 6M</span>
                          <span className="text-xs font-medium text-foreground">{a.faturamento6Meses > 0 ? formatCurrency(a.faturamento6Meses) : '-'}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] text-muted-foreground block">Colab.</span>
                          <span className="text-xs font-medium text-foreground">{a.numColaboradores || '-'}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] text-muted-foreground block">NPS</span>
                          <span className="text-xs font-medium text-foreground">{a.nps !== 0 ? a.nps : '-'}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 text-right">
                        {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  );
                })}
              </div>
              {filteredAnalyses.length === 0 && (
                <div className="p-8 text-center">
                  <Building2 className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ==================== TAB: TABELA COMPLETA ==================== */}
        {activeTab === 'detalhes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <List className="w-5 h-5 text-primary" />
                Tabela Completa ({filteredAnalyses.length} empresas)
              </h2>
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" /> Exportar CSV Completo
              </Button>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
              {filteredAnalyses.length === 0 ? (
                <div className="p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma análise encontrada.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30">
                        <th className="text-left p-3 text-muted-foreground font-medium">Empresa</th>
                        <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Aluno</th>
                        <th className="text-left p-3 text-muted-foreground font-medium hidden lg:table-cell">Setor</th>
                        <th className="text-left p-3 text-muted-foreground font-medium hidden lg:table-cell">Cidade</th>
                        <th className="text-center p-3 text-muted-foreground font-medium">Score</th>
                        <th className="text-center p-3 text-muted-foreground font-medium hidden md:table-cell">Fin.</th>
                        <th className="text-center p-3 text-muted-foreground font-medium hidden md:table-cell">Com.</th>
                        <th className="text-center p-3 text-muted-foreground font-medium hidden md:table-cell">Op.</th>
                        <th className="text-center p-3 text-muted-foreground font-medium hidden md:table-cell">Pes.</th>
                        <th className="text-center p-3 text-muted-foreground font-medium hidden md:table-cell">Tec.</th>
                        <th className="text-left p-3 text-muted-foreground font-medium">Data</th>
                        <th className="text-center p-3 text-muted-foreground font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAnalyses.map((analysis: any) => (
                        <AnimatePresence key={analysis.id}>
                          <tr
                            className="border-b border-border/20 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => setExpandedId(expandedId === analysis.id ? null : analysis.id)}
                          >
                            <td className="p-3">
                              <div>
                                <p className="font-medium text-foreground">{analysis.empresaNome}</p>
                                <p className="text-xs text-muted-foreground">{analysis.cnpj || '-'}</p>
                              </div>
                            </td>
                            <td className="p-3 hidden md:table-cell text-muted-foreground">{analysis.userName || '-'}</td>
                            <td className="p-3 hidden lg:table-cell text-muted-foreground">{analysis.setor || '-'}</td>
                            <td className="p-3 hidden lg:table-cell text-muted-foreground">{analysis.cidade || '-'}</td>
                            <td className="p-3 text-center">
                              <span className={`font-bold text-lg ${getScoreColor(analysis.scoreGeral)}`}>{analysis.scoreGeral}</span>
                            </td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scoreFinanceiro)}`}>{analysis.scoreFinanceiro}</td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scoreComercial)}`}>{analysis.scoreComercial}</td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scoreOperacional)}`}>{analysis.scoreOperacional}</td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scorePessoas)}`}>{analysis.scorePessoas}</td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scoreTecnologia)}`}>{analysis.scoreTecnologia}</td>
                            <td className="p-3 text-muted-foreground text-xs">{new Date(analysis.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td className="p-3 text-center">
                              {expandedId === analysis.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </td>
                          </tr>
                          {expandedId === analysis.id && (
                            <tr key={`${analysis.id}-detail`}>
                              <td colSpan={12} className="p-4 bg-background/30">
                                {/* Scores */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                  {[
                                    { label: 'Financeiro', score: analysis.scoreFinanceiro, icon: DollarSign },
                                    { label: 'Comercial', score: analysis.scoreComercial, icon: Target },
                                    { label: 'Operacional', score: analysis.scoreOperacional, icon: Activity },
                                    { label: 'Pessoas', score: analysis.scorePessoas, icon: Users },
                                    { label: 'Tecnologia', score: analysis.scoreTecnologia, icon: Cpu },
                                  ].map((item) => (
                                    <div key={item.label} className={`rounded-lg p-3 border ${getScoreBg(item.score)} text-center`}>
                                      <item.icon className={`w-4 h-4 mx-auto mb-1 ${getScoreColor(item.score)}`} />
                                      <p className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
                                      <p className="text-xs text-muted-foreground">{item.label}</p>
                                    </div>
                                  ))}
                                </div>
                                {/* Dados detalhados */}
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Financeiro</p>
                                    <EmpresaDetailRow empresa={analysis} type="financeiro" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-blue-400 mb-1.5 flex items-center gap-1"><Users className="w-3 h-3" /> Estrutura & Pessoas</p>
                                    <EmpresaDetailRow empresa={analysis} type="estrutura" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-emerald-400 mb-1.5 flex items-center gap-1"><Target className="w-3 h-3" /> Comercial</p>
                                    <EmpresaDetailRow empresa={analysis} type="comercial" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-purple-400 mb-1.5 flex items-center gap-1"><Cpu className="w-3 h-3" /> Tecnologia</p>
                                    <EmpresaDetailRow empresa={analysis} type="tecnologia" />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <span className={`text-xs px-3 py-1 rounded-full ${getScoreBadge(analysis.scoreGeral).bg} ${getScoreBadge(analysis.scoreGeral).text}`}>
                                    {getScoreBadge(analysis.scoreGeral).label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    CNPJ: {analysis.cnpj || 'N/A'} | {analysis.setor || 'N/A'} | {analysis.cidade || 'N/A'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
