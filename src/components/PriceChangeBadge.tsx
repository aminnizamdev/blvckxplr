
import React from 'react';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceChangeBadgeProps {
  currentValue: number | null;
  previousValue: number | null;
  showPercent?: boolean;
  className?: string;
  digits?: number;
}

const PriceChangeBadge = ({
  currentValue,
  previousValue,
  showPercent = false,
  className,
  digits = 2
}: PriceChangeBadgeProps) => {
  if (currentValue === null || previousValue === null) {
    return (
      <span className={cn("inline-flex items-center text-muted-foreground", className)}>
        <ArrowRight size={14} className="mr-0.5" />
        {showPercent ? "0.00%" : ""}
      </span>
    );
  }

  const percentChange = ((currentValue - previousValue) / previousValue) * 100;
  const isPositive = percentChange > 0;
  const isNeutral = percentChange === 0;
  
  return (
    <span className={cn(
      "inline-flex items-center text-xs font-medium",
      isPositive ? "text-cyan-500" : isNeutral ? "text-muted-foreground" : "text-pink-500",
      className
    )}>
      {isPositive ? (
        <ArrowUp size={14} className="mr-0.5" />
      ) : isNeutral ? (
        <ArrowRight size={14} className="mr-0.5" />
      ) : (
        <ArrowDown size={14} className="mr-0.5" />
      )}
      {showPercent && `${Math.abs(percentChange).toFixed(digits)}%`}
    </span>
  );
};

export default PriceChangeBadge;
