import { ActionPlanWeek, PlanoAcao, AcaoSemana } from '@/types/company';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Target, 
  Users, 
  FileText,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  TrendingUp,
  Rocket,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AdvancedActionPlanProps {
  plano: ActionPlanWeek[] | PlanoAcao[];
}

function normalizeActionPlan(plano: ActionPlanWeek[] | PlanoAcao[]): ActionPlanWeek[] {
  return plano.map((item) => {
    if ('fase' in item && 'objetivo' in item) {
      return item as ActionPlanWeek;
    }
    const planoAcao = item as PlanoAcao;
    return {
      semana: planoAcao.semana,
      fase: planoAcao.semana <= 2 ? 'Diagnóstico' : 
            planoAcao.semana <= 4 ? 'Quick Wins' : 
            planoAcao.semana <= 8 ? 'Estruturação' : 
            planoAcao.semana <= 11 ? 'Execução' : 'Fechamento',
      objetivo: `Semana ${planoAcao.semana}`,
      acoes: planoAcao.acoes.map((a: AcaoSemana) => ({
        acao: a.acao,
        responsavel: a.responsavel,
        entregavel: a.entregavel,
        recursos: a.recursos || 'A definir',
        metricas: a.metricas || 'A definir',
      })),
    };
  });
}

export function AdvancedActionPlan({ plano }: AdvancedActionPlanProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1, 2]);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToGestaoImpacto = async () => {
    setIsExporting(true);
    try {
      const normalizedData = normalizeActionPlan(plano);
      const token = localStorage.getItem('gestao_impacto_token');
      
      if (!token) {
        window.open('https://gestaodash-fcqqje9n.manus.space/connect-ceogi', '_blank' );
        toast({
          title: 'Conecte sua conta',
          description: 'Faça login no Gestão de Impacto e gere um token de integração.',
        });
        setIsExporting(false);
        return;
      }

      const response = await fetch('https://gestaodash-fcqqje9n.manus.space/api/integration/ceogi/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planoAcao: normalizedData,
          nomeEmpresa: 'Plano CEO GI',
        } ),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Projeto criado com sucesso!',
          description: `${data.tasksCreated} tarefas foram criadas no Gestão de Impacto.`,
        });
        window.open(`https://gestaodash-fcqqje9n.manus.space/projects/${data.projectId}`, '_blank' );
      } else {
        throw new Error('Falha ao criar projeto');
      }
    } catch (error) {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível criar o projeto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const normalizedPlano = normalizeActionPlan(plano);

  const fases = normalizedPlano.reduce((acc, semana) => {
    if (!acc[semana.fase]) {
      acc[semana.fase] = [];
    }
    acc[semana.fase].push(semana);
    return acc;
  }, {} as Record<string, ActionPlanWeek[]>);

  const faseConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    'Diagnóstico': { color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: <Lightbulb className="w-5 h-5" /> },
    'Planejamento': { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: <Target className="w-5 h-5" /> },
    'Quick Wins': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: <TrendingUp className="w-5 h-5" /> },
    'Estruturação': { color: 'text-purple-400', bg: 'bg-purple-400/10', icon: <FileText className="w-5 h-5" /> },
    'Execução': { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: <CheckCircle2 className="w-5 h-5" /> },
    'Fechamento': { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: <Calendar className="w-5 h-5" /> },
  };

  const toggleWeek = (semana: number) => {
    setExpandedWeeks(prev => 
      prev.includes(semana)
        ? prev.filter(s => s !== semana)
        : [...prev, semana]
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-card/30 rounded-xl p-6 border border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Visão Geral do Plano de 90 Dias
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Object.entries(fases).map(([fase, semanas]) => {
            const config = faseConfig[fase] || faseConfig['Diagnóstico'];
            const semanasStr = semanas.map(s => s.semana).join(', ');
            
            return (
              <button
                key={fase}
                onClick={() => setSelectedPhase(selectedPhase === fase ? null : fase)}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-300",
                  selectedPhase === fase 
                    ? `${config.bg} border-current ${config.color}` 
                    : "bg-card/50 border-border/50 hover:border-border"
                )}
              >
                <div className={cn("flex items-center gap-2 mb-1", config.color)}>
                  {config.icon}
                  <span className="text-xs font-medium truncate">{fase}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Semanas {semanasStr}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso do Trimestre</span>
            <span className="text-foreground font-medium">12 semanas</span>
          </div>
          <div className="h-3 bg-muted/30 rounded-full overflow-hidden flex">
            {Object.entries(fases).map(([fase, semanas]) => {
              const config = faseConfig[fase] || faseConfig['Diagnóstico'];
              const width = (semanas.length / 12) * 100;
              
              return (
                <div
                  key={fase}
                  className={cn("h-full transition-all", config.bg.replace('/10', '/50'))}
                  style={{ width: `${width}%` }}
                  title={`${fase}: ${semanas.length} semanas`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {normalizedPlano.map((semana, index) => {
          const config = faseConfig[semana.fase] || faseConfig['Diagnóstico'];
          const isExpanded = expandedWeeks.includes(semana.semana);
          const isHighlighted = selectedPhase === semana.fase;

          return (
            <motion.div
              key={semana.semana}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "rounded-xl border overflow-hidden transition-all duration-300",
                isHighlighted 
                  ? `${config.bg} border-current ${config.color}` 
                  : "bg-card/30 border-border/50"
              )}
            >
              <button
                onClick={() => toggleWeek(semana.semana)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                    config.bg,
                    config.color
                  )}>
                    {semana.semana}
                  </div>
                  
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config.bg, config.color)}>
                        {semana.fase}
                      </span>
                    </div>
                    <h4 className="text-foreground font-medium mt-1">
                      {semana.objetivo}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground">
                      {semana.acoes.length} ações
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {semana.acoes.map((acao, acaoIndex) => (
                        <div
                          key={acaoIndex}
                          className="bg-background/50 rounded-lg p-4 border border-border/30"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                              config.bg,
                              config.color
                            )}>
                              {acaoIndex + 1}
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <h5 className="text-foreground font-medium">
                                {acao.acao}
                              </h5>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-cyan-400" />
                                  <div>
                                    <span className="text-muted-foreground text-xs block">Responsável</span>
                                    <span className="text-foreground">{acao.responsavel}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-emerald-400" />
                                  <div>
                                    <span className="text-muted-foreground text-xs block">Entregável</span>
                                    <span className="text-foreground">{acao.entregavel}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-purple-400" />
                                  <div>
                                    <span className="text-muted-foreground text-xs block">Recursos</span>
                                    <span className="text-foreground">{acao.recursos}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-amber-400" />
                                  <div>
                                    <span className="text-muted-foreground text-xs block">Métrica</span>
                                    <span className="text-foreground">{acao.metricas}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-6 border border-orange-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Transforme em Projeto</h3>
              <p className="text-sm text-muted-foreground">
                Exporte este plano de ação para o Gestão de Impacto e acompanhe a execução
              </p>
            </div>
          </div>
          <Button
            onClick={exportToGestaoImpacto}
            disabled={isExporting}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Criar Projeto no Gestão de Impacto
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card/30 rounded-xl p-4 border border-border/50 text-center">
          <div className="text-3xl font-bold text-primary">{normalizedPlano.length}</div>
          <div className="text-sm text-muted-foreground">Semanas</div>
        </div>
        <div className="bg-card/30 rounded-xl p-4 border border-border/50 text-center">
          <div className="text-3xl font-bold text-emerald-400">
            {normalizedPlano.reduce((acc, s) => acc + s.acoes.length, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Ações Totais</div>
        </div>
        <div className="bg-card/30 rounded-xl p-4 border border-border/50 text-center">
          <div className="text-3xl font-bold text-cyan-400">{Object.keys(fases).length}</div>
          <div className="text-sm text-muted-foreground">Fases</div>
        </div>
        <div className="bg-card/30 rounded-xl p-4 border border-border/50 text-center">
          <div className="text-3xl font-bold text-amber-400">90</div>
          <div className="text-sm text-muted-foreground">Dias</div>
        </div>
      </div>
    </div>
  );
}
