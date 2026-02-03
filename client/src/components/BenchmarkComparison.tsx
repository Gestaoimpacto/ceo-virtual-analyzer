import { CompanyData, BenchmarkSetor } from '@/types/company';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent } from '@/lib/excelParser';

interface BenchmarkComparisonProps {
  company: CompanyData;
  benchmark: BenchmarkSetor;
}

interface MetricRowProps {
  label: string;
  value: number;
  benchmark: number;
  format: 'percent' | 'currency' | 'number' | 'days';
  higherIsBetter?: boolean;
  delay?: number;
}

function MetricRow({ label, value, benchmark, format, higherIsBetter = true, delay = 0 }: MetricRowProps) {
  const formatValue = (v: number) => {
    switch (format) {
      case 'percent':
        return formatPercent(v);
      case 'currency':
        return formatCurrency(v);
      case 'days':
        return `${v} dias`;
      default:
        return v.toLocaleString('pt-BR');
    }
  };

  const diff = value - benchmark;
  const percentDiff = benchmark > 0 ? ((value - benchmark) / benchmark) * 100 : 0;
  
  const isPositive = higherIsBetter ? diff > 0 : diff < 0;
  const isNeutral = Math.abs(percentDiff) < 5;

  const getStatusColor = () => {
    if (isNeutral) return 'text-muted-foreground';
    return isPositive ? 'text-emerald-400' : 'text-red-400';
  };

  const getStatusIcon = () => {
    if (isNeutral) return <Minus className="w-4 h-4" />;
    return isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const progressWidth = Math.min(100, Math.max(0, (value / (benchmark * 2)) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-foreground">
            {formatValue(value)}
          </span>
          <span className={cn("flex items-center gap-1 text-sm", getStatusColor())}>
            {getStatusIcon()}
            <span className="font-mono">{percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(0)}%</span>
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        {/* Benchmark marker */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
          style={{ left: '50%' }}
        />
        
        {/* Value bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressWidth}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
          className={cn(
            "h-full rounded-full",
            isPositive ? "bg-emerald-400" : "bg-red-400"
          )}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className="text-amber-400">Benchmark: {formatValue(benchmark)}</span>
        <span>{formatValue(benchmark * 2)}</span>
      </div>
    </motion.div>
  );
}

export function BenchmarkComparison({ company, benchmark }: BenchmarkComparisonProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Comparação com o Setor
        </h3>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {benchmark.setor}
        </span>
      </div>

      <div className="space-y-6">
        <MetricRow
          label="Margem de Lucro Líquido"
          value={company.lucroLiquido6MesesPercent}
          benchmark={benchmark.margemLucroMedia}
          format="percent"
          delay={0}
        />
        
        <MetricRow
          label="Ticket Médio"
          value={company.ticketMedio}
          benchmark={benchmark.ticketMedioMercado}
          format="currency"
          delay={0.1}
        />
        
        <MetricRow
          label="Taxa de Conversão"
          value={company.taxaConversaoGeral}
          benchmark={benchmark.taxaConversaoMedia}
          format="percent"
          delay={0.2}
        />
        
        <MetricRow
          label="NPS"
          value={company.nps}
          benchmark={benchmark.npsReferencia}
          format="number"
          delay={0.3}
        />
        
        <MetricRow
          label="Turnover (12 meses)"
          value={company.turnover12Meses}
          benchmark={benchmark.turnoverMedio}
          format="percent"
          higherIsBetter={false}
          delay={0.4}
        />
        
        <MetricRow
          label="Ciclo de Vendas"
          value={company.cicloMedioVendas}
          benchmark={benchmark.cicloVendasMedio}
          format="days"
          higherIsBetter={false}
          delay={0.5}
        />
      </div>
    </div>
  );
}
