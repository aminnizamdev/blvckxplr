
import React from 'react';
import { ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

  const getConfidenceLevel = () => {
    if (!price || !previousPrice) return null;
    
    const percentChange = Math.abs(((price - previousPrice) / previousPrice) * 100);
    
    if (percentChange < 0.1) return { level: 'High', color: 'bg-green-500' };
    if (percentChange < 0.5) return { level: 'Medium', color: 'bg-yellow-500' };
    return { level: 'Low', color: 'bg-red-500' };
  };
  
  const confidence = getConfidenceLevel();

  // Add timestamp for last update tracking
  const [lastUpdateTime, setLastUpdateTime] = React.useState<Date>(new Date());
  
  // Update timestamp whenever price updates
  React.useEffect(() => {
    if (price) {
      setLastUpdateTime(new Date());
    }
  }, [price]);
  
  // Check if data might be stale
  const isDataPotentiallyStale = React.useMemo(() => {
    const now = new Date();
    const timeDifference = now.getTime() - lastUpdateTime.getTime();
    // Consider data stale if no update in 5 seconds (much longer than refresh rate)
    return timeDifference > 5000; 
  }, [lastUpdateTime]);

  if (!price || isDataPotentiallyStale) {
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
        <span>${price.toFixed(6)}</span>
        {priceChange && (
          <span className={cn(
            "flex items-center text-sm",
            priceChange.isPositive ? "text-cyan-500" : 
            priceChange.isNeutral ? "text-muted-foreground" : "text-pink-500"
          )}>
            {priceChange.isPositive ? (
              <ArrowUp size={16} />
            ) : priceChange.isNeutral ? (
              <ArrowRight size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
            {Math.abs(priceChange.value).toFixed(4)}%
          </span>
        )}
        {confidence && (
          <Badge className={cn("ml-2 text-xs", confidence.color)}>
            {confidence.level} Confidence
          </Badge>
        )}
      </div>
      <div className={cn(
        "text-muted-foreground",
        isLarge ? "text-sm" : "text-xs"
      )}>
        SOL/USD • Updated {lastUpdateTime.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SolPriceDisplay;
