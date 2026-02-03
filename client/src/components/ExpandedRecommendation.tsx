import { Recomendacao } from '@/types/company';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Users, 
  Cpu, 
  Target,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Wrench,
  BarChart3,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ExpandedRecommendationProps {
  recommendation: Recomendacao;
  index: number;
}

export function ExpandedRecommendation({ recommendation, index }: ExpandedRecommendationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const areaConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    financeiro: { icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Finanças' },
    Financeiro: { icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Finanças' },
    comercial: { icon: <TrendingUp className="w-5 h-5" />, color: 'text-primary', bg: 'bg-primary/10', label: 'Comercial' },
    Comercial: { icon: <TrendingUp className="w-5 h-5" />, color: 'text-primary', bg: 'bg-primary/10', label: 'Comercial' },
    Marketing: { icon: <TrendingUp className="w-5 h-5" />, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Marketing' },
    operacional: { icon: <Settings className="w-5 h-5" />, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Operações' },
    pessoas: { icon: <Users className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Pessoas' },
    Pessoas: { icon: <Users className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Pessoas' },
    tecnologia: { icon: <Cpu className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-400/10', label: 'Tecnologia' },
    Tecnologia: { icon: <Cpu className="w-5 h-5" />, color: 'text-violet-400', bg: 'bg-violet-400/10', label: 'Tecnologia' },
    estrategia: { icon: <Target className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Estratégia' },
  };

  const prioridadeConfig = {
    alta: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', label: 'Alta Prioridade', icon: <Zap className="w-4 h-4" /> },
    media: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', label: 'Média Prioridade', icon: <Clock className="w-4 h-4" /> },
    baixa: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', label: 'Baixa Prioridade', icon: <Target className="w-4 h-4" /> },
  };

  const area = areaConfig[recommendation.area] || areaConfig['estrategia'];
  const prioridade = prioridadeConfig[recommendation.prioridade];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden",
        "transition-all duration-300",
        prioridade.border
      )}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          {/* Priority Badge */}
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0",
            prioridade.bg,
            prioridade.color
          )}>
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {/* Area Badge */}
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                area.bg,
                area.color
              )}>
                {area.icon}
                {area.label}
              </span>
              
              {/* Priority Badge */}
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                prioridade.bg,
                prioridade.color
              )}>
                {prioridade.icon}
                {prioridade.label}
              </span>
            </div>

            <h4 className="text-foreground font-semibold text-lg mb-1">
              {recommendation.titulo}
            </h4>
            
            <p className="text-muted-foreground text-sm line-clamp-2">
              {recommendation.descricao}
            </p>
          </div>

          <div className="shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-medium">Impacto Esperado</span>
                  </div>
                  <p className="text-foreground text-sm">{recommendation.impactoEsperado}</p>
                </div>
                
                <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Prazo Sugerido</span>
                  </div>
                  <p className="text-foreground text-sm">{recommendation.prazoSugerido}</p>
                </div>
                
                <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <Coins className="w-4 h-4" />
                    <span className="text-xs font-medium">Investimento</span>
                  </div>
                  <p className="text-foreground text-sm">{recommendation.recursos}</p>
                </div>
              </div>

              {/* Steps */}
              {recommendation.passos && recommendation.passos.length > 0 && (
                <div className="bg-background/50 rounded-lg p-4 border border-border/30">
                  <h5 className="text-foreground font-medium mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Passo a Passo para Implementação
                  </h5>
                  <div className="space-y-2">
                    {recommendation.passos.map((passo, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          "bg-primary/20 text-primary"
                        )}>
                          {i + 1}
                        </div>
                        <p className="text-muted-foreground text-sm pt-0.5">
                          {passo.replace(/^\d+\.\s*/, '')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools & Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendation.ferramentas && recommendation.ferramentas.length > 0 && (
                  <div className="bg-background/50 rounded-lg p-4 border border-border/30">
                    <h5 className="text-foreground font-medium mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-purple-400" />
                      Ferramentas Recomendadas
                    </h5>
                    <ul className="space-y-1.5">
                      {recommendation.ferramentas.map((ferramenta, i) => (
                        <li key={i} className="text-muted-foreground text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          {ferramenta}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation.metricas && recommendation.metricas.length > 0 && (
                  <div className="bg-background/50 rounded-lg p-4 border border-border/30">
                    <h5 className="text-foreground font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Métricas de Sucesso
                    </h5>
                    <ul className="space-y-1.5">
                      {recommendation.metricas.map((metrica, i) => (
                        <li key={i} className="text-muted-foreground text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {metrica}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
