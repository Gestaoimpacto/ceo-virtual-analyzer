import { useState, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Building2, 
  Calendar, 
  BarChart3, 
  Trash2, 
  Eye,
  LogIn,
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Cpu,
  Settings,
  GitCompare,
  Download,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'wouter';

interface AnalysisItem {
  id: number;
  empresaNome: string;
  setor: string | null;
  cidade: string | null;
  cnpj: string | null;
  scoreGeral: number;
  scoreFinanceiro: number;
  scoreComercial: number;
  scoreOperacional: number;
  scorePessoas: number;
  scoreTecnologia: number;
  companyData: any;
  analysisResult: any;
  createdAt: string;
}

function ComparisonView({ analysis1, analysis2, onClose }: { 
  analysis1: AnalysisItem; 
  analysis2: AnalysisItem; 
  onClose: () => void;
}) {
  const areas = [
    { label: 'Score Geral', key1: analysis1.scoreGeral, key2: analysis2.scoreGeral, icon: BarChart3 },
    { label: 'Financeiro', key1: analysis1.scoreFinanceiro, key2: analysis2.scoreFinanceiro, icon: DollarSign },
    { label: 'Comercial', key1: analysis1.scoreComercial, key2: analysis2.scoreComercial, icon: TrendingUp },
    { label: 'Operacional', key1: analysis1.scoreOperacional, key2: analysis2.scoreOperacional, icon: Settings },
    { label: 'Pessoas', key1: analysis1.scorePessoas, key2: analysis2.scorePessoas, icon: Users },
    { label: 'Tecnologia', key1: analysis1.scoreTecnologia, key2: analysis2.scoreTecnologia, icon: Cpu },
  ];

  const getDiffIcon = (diff: number) => {
    if (diff > 0) return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (diff < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getDiffColor = (diff: number) => {
    if (diff > 0) return 'text-emerald-500';
    if (diff < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const handleExportComparison = () => {
    const rows = areas.map(a => ({
      'Área': a.label,
      'Análise 1': `${a.key1}%`,
      'Análise 2': `${a.key2}%`,
      'Diferença': `${a.key2 - a.key1 > 0 ? '+' : ''}${a.key2 - a.key1}%`,
    }));

    let csv = `Comparação de Análises - CEO DO GI\n\n`;
    csv += `Análise 1: ${analysis1.empresaNome} (${new Date(analysis1.createdAt).toLocaleDateString('pt-BR')})\n`;
    csv += `Análise 2: ${analysis2.empresaNome} (${new Date(analysis2.createdAt).toLocaleDateString('pt-BR')})\n\n`;
    csv += Object.keys(rows[0]).join(',') + '\n';
    rows.forEach(row => {
      csv += Object.values(row).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparacao_${analysis1.empresaNome}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Comparação exportada em CSV!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header da comparação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <GitCompare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Comparação de Análises</h2>
            <p className="text-sm text-muted-foreground">Evolução entre as duas análises selecionadas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportComparison}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cards das duas análises */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-500/50 text-blue-400">Análise 1</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(analysis1.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <CardTitle className="text-lg">{analysis1.empresaNome}</CardTitle>
            <CardDescription>{analysis1.setor || 'Setor não informado'} • {analysis1.cidade || ''}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/50 text-primary">Análise 2</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(analysis2.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <CardTitle className="text-lg">{analysis2.empresaNome}</CardTitle>
            <CardDescription>{analysis2.setor || 'Setor não informado'} • {analysis2.cidade || ''}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Tabela de comparação */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Área</th>
                  <th className="text-center p-4 text-sm font-medium text-blue-400">Análise 1</th>
                  <th className="text-center p-4 text-sm font-medium text-primary">Análise 2</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Diferença</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Evolução</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((area, idx) => {
                  const diff = area.key2 - area.key1;
                  const Icon = area.icon;
                  return (
                    <tr key={idx} className={`border-b border-border/30 ${idx === 0 ? 'bg-card/50 font-semibold' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">{area.label}</span>
                        </div>
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-blue-400">{area.key1}%</span>
                      </td>
                      <td className="text-center p-4">
                        <span className="text-sm text-primary">{area.key2}%</span>
                      </td>
                      <td className="text-center p-4">
                        <span className={`text-sm font-medium ${getDiffColor(diff)}`}>
                          {diff > 0 ? '+' : ''}{diff}%
                        </span>
                      </td>
                      <td className="text-center p-4">
                        <div className="flex items-center justify-center gap-1">
                          {getDiffIcon(diff)}
                          {/* Barra visual */}
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${diff > 0 ? 'bg-emerald-500' : diff < 0 ? 'bg-red-500' : 'bg-muted-foreground'}`}
                              style={{ width: `${Math.min(Math.abs(diff), 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">Resumo da Evolução</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-emerald-500/10">
              <div className="text-2xl font-bold text-emerald-500">
                {areas.filter(a => a.key2 > a.key1).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Áreas melhoraram</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-muted-foreground">
                {areas.filter(a => a.key2 === a.key1).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Sem alteração</div>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10">
              <div className="text-2xl font-bold text-red-500">
                {areas.filter(a => a.key2 < a.key1).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Áreas pioraram</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function History() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<AnalysisItem[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const { data: analysesData, isLoading, refetch } = trpc.analysis.list.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  const deleteAnalysisMutation = trpc.analysis.delete.useMutation({
    onSuccess: () => {
      toast.success('Análise excluída com sucesso!');
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao excluir análise', { description: error.message });
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta análise?')) {
      await deleteAnalysisMutation.mutateAsync({ id });
    }
  };

  const handleToggleCompare = (analysis: AnalysisItem) => {
    setSelectedForCompare(prev => {
      const isSelected = prev.some(a => a.id === analysis.id);
      if (isSelected) {
        return prev.filter(a => a.id !== analysis.id);
      }
      if (prev.length >= 2) {
        toast.info('Selecione no máximo 2 análises para comparar.');
        return prev;
      }
      return [...prev, analysis];
    });
  };

  const handleStartComparison = () => {
    if (selectedForCompare.length === 2) {
      setShowComparison(true);
    } else {
      toast.info('Selecione exatamente 2 análises para comparar.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-500';
    if (score >= 60) return 'bg-primary/20 text-primary';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-500';
    return 'bg-red-500/20 text-red-500';
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Faça login para continuar</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar seu histórico de análises.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => window.location.href = getLoginUrl()}>
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <HistoryIcon className="w-6 h-6 text-primary" />
                  Histórico de Análises
                </h1>
                <p className="text-sm text-muted-foreground">
                  {user?.name ? `Olá, ${user.name}!` : ''} Suas análises salvas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {analysesData && analysesData.total > 1 && (
                <Button 
                  variant={compareMode ? "default" : "outline"} 
                  size="sm"
                  onClick={() => {
                    setCompareMode(!compareMode);
                    setSelectedForCompare([]);
                    setShowComparison(false);
                  }}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  {compareMode ? 'Cancelar' : 'Comparar'}
                </Button>
              )}
              {analysesData && (
                <Badge variant="secondary" className="text-sm">
                  {analysesData.total} análise{analysesData.total !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Barra de comparação */}
          <AnimatePresence>
            {compareMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">
                      {selectedForCompare.length === 0 && 'Selecione 2 análises para comparar'}
                      {selectedForCompare.length === 1 && `1 selecionada - selecione mais 1`}
                      {selectedForCompare.length === 2 && '2 análises selecionadas'}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={selectedForCompare.length !== 2}
                    onClick={handleStartComparison}
                  >
                    Comparar Agora
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <AnimatePresence mode="wait">
          {showComparison && selectedForCompare.length === 2 ? (
            <ComparisonView 
              key="comparison"
              analysis1={selectedForCompare[0]} 
              analysis2={selectedForCompare[1]} 
              onClose={() => {
                setShowComparison(false);
                setSelectedForCompare([]);
                setCompareMode(false);
              }}
            />
          ) : isLoading || authLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : analysesData?.analyses.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle>Nenhuma análise salva</CardTitle>
                <CardDescription>
                  Você ainda não salvou nenhuma análise. Faça uma análise e clique em "Salvar Análise" para guardar no seu histórico.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/">
                  <Button className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Fazer Nova Análise
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analysesData?.analyses.map((analysis: any, index: number) => {
                const isSelected = selectedForCompare.some(a => a.id === analysis.id);
                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`h-full transition-all ${
                        compareMode 
                          ? isSelected 
                            ? 'border-primary ring-2 ring-primary/30 cursor-pointer' 
                            : 'hover:border-primary/50 cursor-pointer'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={compareMode ? () => handleToggleCompare(analysis) : undefined}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {compareMode && (
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                              }`}>
                                {isSelected && <span className="text-xs text-primary-foreground font-bold">
                                  {selectedForCompare.findIndex(a => a.id === analysis.id) + 1}
                                </span>}
                              </div>
                            )}
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base line-clamp-1">
                                {analysis.empresaNome}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {analysis.setor || 'Setor não informado'}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getScoreBadge(analysis.scoreGeral)}>
                            {analysis.scoreGeral}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-5 gap-2 text-center">
                          <div className="space-y-1">
                            <DollarSign className={`w-4 h-4 mx-auto ${getScoreColor(analysis.scoreFinanceiro)}`} />
                            <span className="text-xs text-muted-foreground">{analysis.scoreFinanceiro}%</span>
                          </div>
                          <div className="space-y-1">
                            <TrendingUp className={`w-4 h-4 mx-auto ${getScoreColor(analysis.scoreComercial)}`} />
                            <span className="text-xs text-muted-foreground">{analysis.scoreComercial}%</span>
                          </div>
                          <div className="space-y-1">
                            <Settings className={`w-4 h-4 mx-auto ${getScoreColor(analysis.scoreOperacional)}`} />
                            <span className="text-xs text-muted-foreground">{analysis.scoreOperacional}%</span>
                          </div>
                          <div className="space-y-1">
                            <Users className={`w-4 h-4 mx-auto ${getScoreColor(analysis.scorePessoas)}`} />
                            <span className="text-xs text-muted-foreground">{analysis.scorePessoas}%</span>
                          </div>
                          <div className="space-y-1">
                            <Cpu className={`w-4 h-4 mx-auto ${getScoreColor(analysis.scoreTecnologia)}`} />
                            <span className="text-xs text-muted-foreground">{analysis.scoreTecnologia}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(analysis.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>

                        {!compareMode && (
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                localStorage.setItem('loadAnalysis', JSON.stringify({
                                  companyData: analysis.companyData,
                                  analysisResult: analysis.analysisResult
                                }));
                                window.location.href = '/';
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(analysis.id)}
                              disabled={deleteAnalysisMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
