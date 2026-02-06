import { useState, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSetor, setFilterSetor] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const statsQuery = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const analysesQuery = trpc.admin.allAnalyses.useQuery(
    { limit: 500 },
    {
      enabled: isAuthenticated && user?.role === 'admin',
      retry: false,
    }
  );

  const filteredAnalyses = useMemo(() => {
    if (!analysesQuery.data?.analyses) return [];
    
    return analysesQuery.data.analyses.filter(a => {
      const matchesSearch = !searchTerm || 
        a.empresaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.cnpj && a.cnpj.includes(searchTerm)) ||
        (a.cidade && a.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.userName && a.userName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSetor = !filterSetor || a.setor === filterSetor;
      
      return matchesSearch && matchesSetor;
    });
  }, [analysesQuery.data, searchTerm, filterSetor]);

  const setores = useMemo(() => {
    if (!analysesQuery.data?.analyses) return [];
    const unique = new Set(analysesQuery.data.analyses.map(a => a.setor).filter(Boolean));
    return Array.from(unique) as string[];
  }, [analysesQuery.data]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20';
    if (score >= 60) return 'bg-primary/20';
    if (score >= 40) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
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

  const handleExportCSV = () => {
    if (!filteredAnalyses.length) return;
    
    const headers = ['Empresa', 'CNPJ', 'Setor', 'Cidade', 'Aluno', 'Score Geral', 'Financeiro', 'Comercial', 'Operacional', 'Pessoas', 'Tecnologia', 'Data'];
    const rows = filteredAnalyses.map(a => [
      a.empresaNome,
      a.cnpj || '',
      a.setor || '',
      a.cidade || '',
      a.userName || a.userEmail || '',
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
              <span className="text-sm font-medium">Painel Admin</span>
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

      <div className="container px-4 py-8 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 border border-border/50 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Total Análises</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalAnalyses || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 border border-border/50 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">Alunos Ativos</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 border border-border/50 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-muted-foreground">Score Médio</span>
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(stats?.avgScoreGeral || 0)}`}>
              {stats?.avgScoreGeral || 0}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 border border-border/50 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-muted-foreground">Setores</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats?.setoresDistribuicao?.length || 0}</p>
          </motion.div>
        </div>

        {/* Scores Médios por Área */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 border border-border/50 rounded-xl p-6 mb-8"
          >
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
                <div key={item.label} className={`rounded-lg p-4 ${getScoreBg(item.score)} text-center`}>
                  <item.icon className={`w-5 h-5 mx-auto mb-1 ${getScoreColor(item.score)}`} />
                  <p className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Distribuição por Setor */}
        {stats && stats.setoresDistribuicao.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card/50 border border-border/50 rounded-xl p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Distribuição por Setor
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.setoresDistribuicao.map((s) => (
                <div key={s.setor} className="bg-background/50 rounded-lg p-3 border border-border/30">
                  <p className="text-sm font-medium text-foreground">{s.setor}</p>
                  <p className="text-2xl font-bold text-primary">{s.count}</p>
                  <p className="text-xs text-muted-foreground">análises</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
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
              {setores.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Tabela de Análises */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card/50 border border-border/50 rounded-xl overflow-hidden"
        >
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
                    <>
                      <tr
                        key={analysis.id}
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
                          {analysis.userName || analysis.userEmail || '-'}
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
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {[
                                { label: 'Financeiro', score: analysis.scoreFinanceiro },
                                { label: 'Comercial', score: analysis.scoreComercial },
                                { label: 'Operacional', score: analysis.scoreOperacional },
                                { label: 'Pessoas', score: analysis.scorePessoas },
                                { label: 'Tecnologia', score: analysis.scoreTecnologia },
                              ].map((item) => (
                                <div key={item.label} className={`rounded-lg p-3 ${getScoreBg(item.score)} text-center`}>
                                  <p className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
                                  <p className="text-xs text-muted-foreground">{item.label}</p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
