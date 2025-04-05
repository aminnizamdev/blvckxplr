
import React from 'react';
import { ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';

interface SolPriceDisplayProps {
  price: number | null;
  previousPrice: number | null;
}

const SolPriceDisplay = ({ price, previousPrice }: SolPriceDisplayProps) => {
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
        <div className="h-8 w-24 bg-muted rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <div className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <span>${price.toFixed(2)}</span>
        {priceChange && (
          <span className={cn(
            "flex items-center text-sm",
            priceChange.isPositive ? "trend-up" : priceChange.isNeutral ? "trend-neutral" : "trend-down"
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
      <div className="text-sm text-muted-foreground">
        SOL/USD
      </div>
    </div>
  );
};

export default SolPriceDisplay;

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
