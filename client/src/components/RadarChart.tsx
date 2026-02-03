import { useEffect, useState } from 'react';
import { 
  RadarChart as RechartsRadar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface RadarChartProps {
  data: {
    area: string;
    score: number;
    fullMark: number;
  }[];
}

export function RadarChart({ data }: RadarChartProps) {
  const [animatedData, setAnimatedData] = useState(
    data.map(d => ({ ...d, score: 0 }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={animatedData}>
          <PolarGrid 
            stroke="oklch(0.28 0.02 260)" 
            strokeDasharray="3 3"
          />
          <PolarAngleAxis 
            dataKey="area" 
            tick={{ 
              fill: 'oklch(0.6 0.02 260)', 
              fontSize: 12,
              fontFamily: 'Inter'
            }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: 'oklch(0.5 0.02 260)', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="oklch(0.65 0.2 250)"
            fill="oklch(0.65 0.2 250)"
            fillOpacity={0.3}
            strokeWidth={2}
            animationDuration={1500}
            animationEasing="ease-out"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.16 0.02 260)',
              border: '1px solid oklch(0.28 0.02 260)',
              borderRadius: '8px',
              color: 'oklch(0.92 0.01 260)',
              fontFamily: 'Inter',
            }}
            formatter={(value: number) => [`${value} pontos`, 'Score']}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
