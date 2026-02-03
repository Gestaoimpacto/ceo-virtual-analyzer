import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

export function ScoreGauge({ score, label, size = 'md', showAnimation = true }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(showAnimation ? 0 : score);
  
  useEffect(() => {
    if (!showAnimation) {
      setDisplayScore(score);
      return;
    }
    
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [score, showAnimation]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-400', glow: 'glow-emerald' };
    if (s >= 60) return { text: 'text-primary', bg: 'bg-primary', glow: 'glow-blue' };
    if (s >= 40) return { text: 'text-amber-400', bg: 'bg-amber-400', glow: 'glow-amber' };
    return { text: 'text-red-400', bg: 'bg-red-400', glow: 'glow-coral' };
  };

  const colors = getScoreColor(displayScore);
  
  const sizeClasses = {
    sm: { container: 'w-20 h-20', text: 'text-xl', label: 'text-xs' },
    md: { container: 'w-28 h-28', text: 'text-3xl', label: 'text-sm' },
    lg: { container: 'w-36 h-36', text: 'text-4xl', label: 'text-base' },
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", sizeClasses[size].container)}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn(colors.text, "transition-all duration-1000")}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-mono font-bold tabular-nums",
            sizeClasses[size].text,
            colors.text
          )}>
            {displayScore}
          </span>
        </div>
      </div>
      
      {/* Label */}
      <span className={cn(
        "text-muted-foreground font-medium text-center",
        sizeClasses[size].label
      )}>
        {label}
      </span>
    </div>
  );
}
