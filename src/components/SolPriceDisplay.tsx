
import React from 'react';
import { ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SolPriceDisplayProps {
  price: number | null;
  previousPrice: number | null;
  isLarge?: boolean;
}

const SolPriceDisplay = ({ price, previousPrice, isLarge = false }: SolPriceDisplayProps) => {
  const priceChange = React.useMemo(() => {
    if (!price || !previousPrice) return null;
    
    const change = ((price - previousPrice) / previousPrice) * 100;
    return {
      value: change,
      isPositive: change > 0,
      isNeutral: change === 0,
    };
  }, [price, previousPrice]);

  if (!price) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className={cn(
          "bg-muted rounded-md",
          isLarge ? "h-10 w-32" : "h-8 w-24"
        )}></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <div className={cn(
        "font-bold tracking-tight flex items-center gap-2",
        isLarge ? "text-3xl" : "text-2xl"
      )}>
        <span>${price.toFixed(2)}</span>
        {priceChange && (
          <span className={cn(
            "flex items-center text-sm",
            priceChange.isPositive ? "text-green-500" : 
            priceChange.isNeutral ? "text-muted-foreground" : "text-red-500"
          )}>
            {priceChange.isPositive ? (
              <ArrowUp size={16} />
            ) : priceChange.isNeutral ? (
              <ArrowRight size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
            {Math.abs(priceChange.value).toFixed(2)}%
          </span>
        )}
      </div>
      <div className={cn(
        "text-muted-foreground",
        isLarge ? "text-sm" : "text-xs"
      )}>
        SOL/USD • Updated {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SolPriceDisplay;
