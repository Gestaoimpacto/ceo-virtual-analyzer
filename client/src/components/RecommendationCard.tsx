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
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface RecommendationCardProps {
  recommendation: Recomendacao;
  index: number;
}

export function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const areaConfig = {
    financeiro: {
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      label: 'Finanças',
    },
    comercial: {
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-primary',
      bg: 'bg-primary/10',
      label: 'Comercial',
    },
    operacional: {
      icon: <Settings className="w-5 h-5" />,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      label: 'Operações',
    },
    pessoas: {
      icon: <Users className="w-5 h-5" />,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      label: 'Pessoas',
    },
    tecnologia: {
      icon: <Cpu className="w-5 h-5" />,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10',
      label: 'Tecnologia',
    },
    estrategia: {
      icon: <Target className="w-5 h-5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      label: 'Estratégia',
    },
  };

  const prioridadeConfig = {
    alta: {
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/30',
      label: 'Alta Prioridade',
    },
    media: {
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/30',
      label: 'Média Prioridade',
    },
    baixa: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/30',
      label: 'Baixa Prioridade',
    },
  };

  const area = areaConfig[recommendation.area];
  const prioridade = prioridadeConfig[recommendation.prioridade];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden",
        "transition-all duration-300 card-hover",
        prioridade.border
      )}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          {/* Number badge */}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm shrink-0",
            prioridade.bg,
            prioridade.color
          )}>
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                area.bg,
                area.color
              )}>
                {area.label}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                prioridade.bg,
                prioridade.color
              )}>
                {prioridade.label}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground mb-1">
              {recommendation.titulo}
            </h3>

            {/* Description preview */}
            <p className={cn(
              "text-sm text-muted-foreground",
              !isExpanded && "line-clamp-2"
            )}>
              {recommendation.descricao}
            </p>
          </div>

          <ChevronRight className={cn(
            "w-5 h-5 text-muted-foreground shrink-0 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="border-t border-border/50"
        >
          <div className="p-4 grid gap-4 sm:grid-cols-3">
            {/* Impacto */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Impacto Esperado</span>
              </div>
              <p className="text-sm text-foreground">{recommendation.impactoEsperado}</p>
            </div>

            {/* Prazo */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Prazo Sugerido</span>
              </div>
              <p className="text-sm text-foreground">{recommendation.prazoSugerido}</p>
            </div>

            {/* Recursos */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400">
                <Settings className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Recursos</span>
              </div>
              <p className="text-sm text-foreground">{recommendation.recursos}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
