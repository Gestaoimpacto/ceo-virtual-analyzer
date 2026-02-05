import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { getLoginUrl } from '@/const';
import { motion } from 'framer-motion';
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
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'wouter';

export default function History() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [selectedAnalysis, setSelectedAnalysis] = useState<number | null>(null);

  // Buscar lista de análises
  const { data: analysesData, isLoading, refetch } = trpc.analysis.list.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  // Mutation para deletar análise
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

  // Se não estiver autenticado
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
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container py-6">
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
            {analysesData && (
              <Badge variant="secondary" className="text-sm">
                {analysesData.total} análise{analysesData.total !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        {isLoading || authLoading ? (
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
            {analysesData?.analyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
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
                    {/* Scores por área */}
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

                    {/* Data */}
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

                    {/* Ações */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          // Salvar dados no localStorage e redirecionar para home
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
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
