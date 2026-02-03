import { DiagnosticoArea } from '@/types/company';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiagnosticCardProps {
  diagnostic: DiagnosticoArea;
  icon: React.ReactNode;
  delay?: number;
}

export function DiagnosticCard({ diagnostic, icon, delay = 0 }: DiagnosticCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    excelente: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/30',
      glow: 'hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]',
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: 'Excelente',
    },
    adequado: {
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: 'Adequado',
    },
    atencao: {
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/30',
      glow: 'hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]',
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Atenção',
    },
    critico: {
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/30',
      glow: 'hover:shadow-[0_0_30px_rgba(248,113,113,0.15)]',
      icon: <XCircle className="w-5 h-5" />,
      label: 'Crítico',
    },
  };

  const config = statusConfig[diagnostic.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn(
        "rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-300",
        config.border,
        config.glow,
        "card-hover"
      )}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bg, config.color)}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{diagnostic.area}</h3>
              <div className={cn("flex items-center gap-1.5 text-sm", config.color)}>
                {config.icon}
                <span>{config.label}</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
              {/* Pontos Fortes */}
              {diagnostic.pontosFortesText.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-1.5">
                    {diagnostic.pontosFortesText.map((ponto, i) => (
                      <li key={i} className="text-sm text-muted-foreground pl-6 relative">
                        <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                        {ponto}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pontos de Atenção */}
              {diagnostic.pontosAtencaoText.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Pontos de Atenção
                  </h4>
                  <ul className="space-y-1.5">
                    {diagnostic.pontosAtencaoText.map((ponto, i) => (
                      <li key={i} className="text-sm text-muted-foreground pl-6 relative">
                        <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                        {ponto}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Oportunidades */}
              {diagnostic.oportunidades.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Oportunidades
                  </h4>
                  <ul className="space-y-1.5">
                    {diagnostic.oportunidades.map((op, i) => (
                      <li key={i} className="text-sm text-muted-foreground pl-6 relative">
                        <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {op}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
