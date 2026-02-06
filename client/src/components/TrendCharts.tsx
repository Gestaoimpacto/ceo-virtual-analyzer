import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalysisData {
  createdAt: string | Date;
  scoreGeral: number;
  scoreFinanceiro: number;
  scoreComercial: number;
  scoreOperacional: number;
  scorePessoas: number;
  scoreTecnologia: number;
  faturamento6Meses: number;
  empresaNome: string;
}

interface TrendChartsProps {
  analyses: AnalysisData[];
}

// Agrupar análises por mês
function groupByMonth(analyses: AnalysisData[]) {
  const groups: Record<string, AnalysisData[]> = {};
  for (const a of analyses) {
    const d = new Date(a.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  }
  // Ordenar por mês
  const sorted = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  return sorted;
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
}

const chartColors = {
  primary: 'rgb(234, 118, 38)',
  primaryAlpha: 'rgba(234, 118, 38, 0.15)',
  financeiro: 'rgb(59, 130, 246)',
  financeiroAlpha: 'rgba(59, 130, 246, 0.1)',
  comercial: 'rgb(239, 68, 68)',
  comercialAlpha: 'rgba(239, 68, 68, 0.1)',
  operacional: 'rgb(234, 179, 8)',
  operacionalAlpha: 'rgba(234, 179, 8, 0.1)',
  pessoas: 'rgb(16, 185, 129)',
  pessoasAlpha: 'rgba(16, 185, 129, 0.1)',
  tecnologia: 'rgb(139, 92, 246)',
  tecnologiaAlpha: 'rgba(139, 92, 246, 0.1)',
  volume: 'rgba(234, 118, 38, 0.6)',
  volumeHover: 'rgba(234, 118, 38, 0.8)',
  faturamento: 'rgb(16, 185, 129)',
  faturamentoAlpha: 'rgba(16, 185, 129, 0.15)',
};

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: 'rgba(255,255,255,0.7)',
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 10,
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.8)',
      borderColor: 'rgba(234, 118, 38, 0.3)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
    },
  },
};

// 1. Gráfico de Score Geral por Mês
export function ScoreGeralTrendChart({ analyses }: TrendChartsProps) {
  const chartData = useMemo(() => {
    const grouped = groupByMonth(analyses);
    const labels = grouped.map(([key]) => formatMonthLabel(key));
    const data = grouped.map(([, items]) => {
      const avg = Math.round(items.reduce((s, a) => s + a.scoreGeral, 0) / items.length);
      return avg;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Score Médio Geral',
          data,
          borderColor: chartColors.primary,
          backgroundColor: chartColors.primaryAlpha,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: chartColors.primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderWidth: 3,
        },
      ],
    };
  }, [analyses]);

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: { display: false },
    },
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        min: 0,
        max: 100,
        ticks: {
          ...baseOptions.scales.y.ticks,
          stepSize: 20,
          callback: (value: number | string) => `${value}`,
        },
      },
    },
  };

  if (chartData.labels.length < 1) return null;

  return (
    <div className="h-[280px]">
      <Line data={chartData} options={options as any} />
    </div>
  );
}

// 2. Gráfico de Scores por Área por Mês
export function ScoresByAreaTrendChart({ analyses }: TrendChartsProps) {
  const chartData = useMemo(() => {
    const grouped = groupByMonth(analyses);
    const labels = grouped.map(([key]) => formatMonthLabel(key));

    const areas = [
      { key: 'scoreFinanceiro', label: 'Financeiro', color: chartColors.financeiro, alpha: chartColors.financeiroAlpha },
      { key: 'scoreComercial', label: 'Comercial', color: chartColors.comercial, alpha: chartColors.comercialAlpha },
      { key: 'scoreOperacional', label: 'Operacional', color: chartColors.operacional, alpha: chartColors.operacionalAlpha },
      { key: 'scorePessoas', label: 'Pessoas', color: chartColors.pessoas, alpha: chartColors.pessoasAlpha },
      { key: 'scoreTecnologia', label: 'Tecnologia', color: chartColors.tecnologia, alpha: chartColors.tecnologiaAlpha },
    ];

    const datasets = areas.map((area) => ({
      label: area.label,
      data: grouped.map(([, items]) => {
        const avg = Math.round(
          items.reduce((s, a) => s + ((a as any)[area.key] || 0), 0) / items.length
        );
        return avg;
      }),
      borderColor: area.color,
      backgroundColor: area.alpha,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: area.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 1.5,
      borderWidth: 2.5,
    }));

    return { labels, datasets };
  }, [analyses]);

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: { display: false },
    },
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        min: 0,
        max: 100,
        ticks: {
          ...baseOptions.scales.y.ticks,
          stepSize: 20,
          callback: (value: number | string) => `${value}`,
        },
      },
    },
  };

  if (chartData.labels.length < 1) return null;

  return (
    <div className="h-[320px]">
      <Line data={chartData} options={options as any} />
    </div>
  );
}

// 3. Gráfico de Volume de Análises por Mês
export function VolumeAnalisesTrendChart({ analyses }: TrendChartsProps) {
  const chartData = useMemo(() => {
    const grouped = groupByMonth(analyses);
    const labels = grouped.map(([key]) => formatMonthLabel(key));
    const data = grouped.map(([, items]) => items.length);

    return {
      labels,
      datasets: [
        {
          label: 'Análises Realizadas',
          data,
          backgroundColor: chartColors.volume,
          hoverBackgroundColor: chartColors.volumeHover,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 40,
          maxBarThickness: 50,
        },
      ],
    };
  }, [analyses]);

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: { display: false },
      legend: { display: false },
    },
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        beginAtZero: true,
        ticks: {
          ...baseOptions.scales.y.ticks,
          stepSize: 1,
          callback: (value: number | string) => Number.isInteger(Number(value)) ? `${value}` : '',
        },
      },
    },
  };

  if (chartData.labels.length < 1) return null;

  return (
    <div className="h-[240px]">
      <Bar data={chartData} options={options as any} />
    </div>
  );
}

// 4. Gráfico de Faturamento Médio por Mês
export function FaturamentoTrendChart({ analyses }: TrendChartsProps) {
  const chartData = useMemo(() => {
    const grouped = groupByMonth(analyses);
    const labels = grouped.map(([key]) => formatMonthLabel(key));
    const data = grouped.map(([, items]) => {
      const comFat = items.filter(a => a.faturamento6Meses > 0);
      if (comFat.length === 0) return 0;
      return Math.round(comFat.reduce((s, a) => s + a.faturamento6Meses, 0) / comFat.length);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Faturamento Médio (6 meses)',
          data,
          borderColor: chartColors.faturamento,
          backgroundColor: chartColors.faturamentoAlpha,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: chartColors.faturamento,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderWidth: 3,
        },
      ],
    };
  }, [analyses]);

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: { display: false },
      legend: { display: false },
      tooltip: {
        ...baseOptions.plugins.tooltip,
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.raw as number;
            if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
            return `R$ ${val.toLocaleString('pt-BR')}`;
          },
        },
      },
    },
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales.y,
        beginAtZero: true,
        ticks: {
          ...baseOptions.scales.y.ticks,
          callback: (value: number | string) => {
            const v = Number(value);
            if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
            if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
            return `R$ ${v}`;
          },
        },
      },
    },
  };

  // Verificar se há dados de faturamento
  const hasFaturamento = chartData.datasets[0].data.some(v => v > 0);
  if (chartData.labels.length < 1 || !hasFaturamento) return null;

  return (
    <div className="h-[280px]">
      <Line data={chartData} options={options as any} />
    </div>
  );
}
