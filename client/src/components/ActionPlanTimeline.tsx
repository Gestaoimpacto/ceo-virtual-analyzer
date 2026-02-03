import { PlanoAcao } from '@/types/company';
import { cn } from '@/lib/utils';
import { Calendar, CheckSquare, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionPlanTimelineProps {
  plano: PlanoAcao[];
}

export function ActionPlanTimeline({ plano }: ActionPlanTimelineProps) {
  const getWeekLabel = (semana: number) => {
    if (semana <= 2) return 'Diagnóstico e Quick Wins';
    if (semana <= 4) return 'Implementações Iniciais';
    if (semana <= 8) return 'Consolidação';
    return 'Otimização e Escala';
  };

  const getPhaseColor = (semana: number) => {
    if (semana <= 2) return 'bg-primary';
    if (semana <= 4) return 'bg-emerald-500';
    if (semana <= 8) return 'bg-amber-500';
    return 'bg-purple-500';
  };

  return (
    <div className="space-y-6">
      {plano.map((item, index) => (
        <motion.div
          key={item.semana}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="relative"
        >
          {/* Timeline connector */}
          {index < plano.length - 1 && (
            <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-border" />
          )}

          <div className="flex gap-4">
            {/* Week indicator */}
            <div className="shrink-0">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm text-white",
                getPhaseColor(item.semana)
              )}>
                S{item.semana}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              {/* Phase label */}
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Semana {item.semana} - {getWeekLabel(item.semana)}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {item.acoes.map((acao, acaoIndex) => (
                  <div
                    key={acaoIndex}
                    className="rounded-lg border border-border/50 bg-card/30 p-4 hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground mb-2">
                          {acao.acao}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{acao.responsavel}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span>{acao.entregavel}</span>
                          </div>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium shrink-0",
                        acao.area === 'Finanças' && "bg-emerald-400/10 text-emerald-400",
                        acao.area === 'Comercial' && "bg-primary/10 text-primary",
                        acao.area === 'Operações' && "bg-purple-400/10 text-purple-400",
                        acao.area === 'Pessoas' && "bg-cyan-400/10 text-cyan-400",
                        acao.area === 'Tecnologia' && "bg-violet-400/10 text-violet-400",
                        acao.area === 'Estratégia' && "bg-amber-400/10 text-amber-400",
                      )}>
                        {acao.area}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
