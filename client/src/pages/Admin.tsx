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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

type TabId = 'overview' | 'insights' | 'empresas' | 'detalhes';

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSetor, setFilterSetor] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

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
    return dashboardQuery.data.allAnalyses.filter(a => {
      const matchesSearch = !searchTerm ||
        a.empresaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.cnpj && a.cnpj.includes(searchTerm)) ||
        (a.cidade && a.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.userName && a.userName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSetor = !filterSetor || a.setor === filterSetor;
      return matchesSearch && matchesSetor;
    });
  }, [dashboardQuery.data, searchTerm, filterSetor]);

  const setores = useMemo(() => {
    if (!dashboardQuery.data?.allAnalyses) return [];
    const unique = new Set(dashboardQuery.data.allAnalyses.map(a => a.setor).filter(Boolean));
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

  const handleExportCSV = () => {
    if (!filteredAnalyses.length) return;
    const headers = ['Empresa', 'CNPJ', 'Setor', 'Cidade', 'Aluno', 'Score Geral', 'Financeiro', 'Comercial', 'Operacional', 'Pessoas', 'Tecnologia', 'Data'];
    const rows = filteredAnalyses.map(a => [
      a.empresaNome,
      a.cnpj || '',
      a.setor || '',
      a.cidade || '',
      a.userName || '',
      a.scoreGeral,
      a.scoreFinanceiro,
      a.scoreComercial,
      a.scoreOperacional,
      a.scorePessoas,
      a.scoreTecnologia,
      new Date(a.createdAt).toLocaleDateString('pt-BR'),
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CEO_GI_Relatorio_Admin_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'insights', label: 'Dores & Oportunidades', icon: Lightbulb },
    { id: 'empresas', label: 'Empresas', icon: Building2 },
    { id: 'detalhes', label: 'Tabela Detalhada', icon: List },
  ];

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Análises', value: stats?.totalAnalyses || 0, icon: BarChart3, color: 'primary', bgColor: 'bg-primary/20' },
            { label: 'Alunos Ativos', value: stats?.totalUsers || 0, icon: Users, color: 'blue-400', bgColor: 'bg-blue-500/20' },
            { label: 'Score Médio', value: stats?.avgScoreGeral || 0, icon: TrendingUp, color: 'emerald-400', bgColor: 'bg-emerald-500/20', isScore: true },
            { label: 'Setores', value: stats?.setoresDistribuicao?.length || 0, icon: Building2, color: 'purple-400', bgColor: 'bg-purple-500/20' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card/50 border border-border/50 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 text-${card.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <p className={`text-3xl font-bold ${card.isScore ? getScoreColor(card.value as number) : 'text-foreground'}`}>
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-card/30 p-1 rounded-xl border border-border/30 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Visão Geral */}
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

            {/* Áreas com Maior Déficit */}
            {insights?.areasComMaiorDeficit && insights.areasComMaiorDeficit.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-border/50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Ranking de Áreas (Menor para Maior Score)
                </h2>
                <div className="space-y-3">
                  {insights.areasComMaiorDeficit.map((area, i) => (
                    <div key={area.area} className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-red-500/20 text-red-400' : i === 1 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-card text-muted-foreground'
                      }`}>
                        {i + 1}
                      </span>
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
                          <span className={`text-lg font-bold ${getScoreColor(s.avgScore)}`}>{s.avgScore}</span>
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
                          <span className={`text-lg font-bold ${getScoreColor(c.avgScore)}`}>{c.avgScore}</span>
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

        {/* Tab: Dores & Oportunidades */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Principais Dores */}
            {insights?.principaisDores && insights.principaisDores.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-400" />
                  Principais Dores e Problemas
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Problemas mais recorrentes identificados nas empresas analisadas</p>
                <div className="space-y-2">
                  {insights.principaisDores.map((dor, i) => {
                    const maxCount = insights.principaisDores[0]?.count || 1;
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                        <span className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-400 shrink-0 mt-0.5">
                          {i + 1}
                        </span>
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

            {/* Principais Causas */}
            {insights?.principaisCausas && insights.principaisCausas.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/50 border border-yellow-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-yellow-400" />
                  Causas Raiz Identificadas
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Causas fundamentais que geram os problemas nas empresas</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {insights.principaisCausas.map((causa, i) => (
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

            {/* Principais Oportunidades */}
            {insights?.principaisOportunidades && insights.principaisOportunidades.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-emerald-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-emerald-400" />
                  Principais Oportunidades
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Pontos fortes e oportunidades identificados nas empresas</p>
                <div className="space-y-2">
                  {insights.principaisOportunidades.map((op, i) => {
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

            {/* Principais Necessidades */}
            {insights?.principaisNecessidades && insights.principaisNecessidades.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 border border-blue-500/20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Necessidades e Ações Prioritárias
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Ações mais recomendadas e necessidades identificadas</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {insights.principaisNecessidades.map((nec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">{nec.item}</p>
                        <span className="text-xs text-muted-foreground">{nec.count} empresa(s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Mensagem quando não há dados */}
            {(!insights?.principaisDores?.length && !insights?.principaisCausas?.length && !insights?.principaisOportunidades?.length) && (
              <div className="bg-card/50 border border-border/50 rounded-xl p-12 text-center">
                <Lightbulb className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">Ainda não há dados suficientes para gerar insights.</p>
                <p className="text-xs text-muted-foreground mt-1">Os insights serão exibidos quando houver análises salvas.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Empresas */}
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
                  {insights.empresasEmRisco.map((empresa, i) => (
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
                      <div className="flex gap-2">
                        <span className="text-xs text-red-400">Piores áreas:</span>
                        {empresa.pioresAreas.map((area) => (
                          <span key={area.area} className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                            {area.area}: {area.score}
                          </span>
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
                  {insights.empresasDestaque.map((empresa, i) => (
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
                      <div className="flex gap-2">
                        <span className="text-xs text-emerald-400">Melhores áreas:</span>
                        {empresa.melhoresAreas.map((area) => (
                          <span key={area.area} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                            {area.area}: {area.score}
                          </span>
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
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <select
                  value={filterSetor}
                  onChange={(e) => setFilterSetor(e.target.value)}
                  className="px-4 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Todos os setores</option>
                  {setores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAnalyses.map((a) => {
                  const badge = getScoreBadge(a.scoreGeral);
                  return (
                    <div key={a.id} className="bg-background/30 rounded-xl border border-border/20 p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">{a.empresaNome}</h3>
                          <p className="text-xs text-muted-foreground">{a.setor || 'N/A'} • {a.cidade || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Aluno: {a.userName || 'N/A'}</p>
                        </div>
                        <div className="text-center shrink-0 ml-3">
                          <span className={`text-2xl font-bold ${getScoreColor(a.scoreGeral)}`}>{a.scoreGeral}</span>
                          <span className={`block text-[10px] px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
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

        {/* Tab: Tabela Detalhada */}
        {activeTab === 'detalhes' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por empresa, CNPJ, cidade ou aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border/50 rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={filterSetor}
                  onChange={(e) => setFilterSetor(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-card/50 border border-border/50 rounded-lg text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[200px]"
                >
                  <option value="">Todos os setores</option>
                  {setores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border/30">
                <h2 className="text-lg font-semibold text-foreground">
                  Todas as Análises ({filteredAnalyses.length})
                </h2>
              </div>

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
                      {filteredAnalyses.map((analysis) => (
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
                            <td className="p-3 hidden md:table-cell text-muted-foreground">
                              {analysis.userName || '-'}
                            </td>
                            <td className="p-3 hidden lg:table-cell text-muted-foreground">{analysis.setor || '-'}</td>
                            <td className="p-3 hidden lg:table-cell text-muted-foreground">{analysis.cidade || '-'}</td>
                            <td className="p-3 text-center">
                              <span className={`font-bold text-lg ${getScoreColor(analysis.scoreGeral)}`}>
                                {analysis.scoreGeral}
                              </span>
                            </td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scoreFinanceiro)}`}>{analysis.scoreFinanceiro}</td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scoreComercial)}`}>{analysis.scoreComercial}</td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scoreOperacional)}`}>{analysis.scoreOperacional}</td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scorePessoas)}`}>{analysis.scorePessoas}</td>
                            <td className={`p-3 text-center hidden md:table-cell ${getScoreColor(analysis.scoreTecnologia)}`}>{analysis.scoreTecnologia}</td>
                            <td className="p-3 text-muted-foreground text-xs">
                              {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-3 text-center">
                              {expandedId === analysis.id ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </td>
                          </tr>
                          {expandedId === analysis.id && (
                            <tr key={`${analysis.id}-detail`}>
                              <td colSpan={12} className="p-4 bg-background/30">
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
                                      <div className="mt-1.5 h-1.5 bg-background/50 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-primary' : item.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${item.score}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-3 py-1 rounded-full ${getScoreBadge(analysis.scoreGeral).bg} ${getScoreBadge(analysis.scoreGeral).text}`}>
                                    {getScoreBadge(analysis.scoreGeral).label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    CNPJ: {analysis.cnpj || 'N/A'} • {analysis.setor || 'N/A'} • {analysis.cidade || 'N/A'}
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
