
import React from 'react';
import { ArrowDown, ArrowUp, ArrowRight, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Enhanced timestamp and data freshness tracking
  const [lastUpdateTime, setLastUpdateTime] = React.useState<Date>(new Date());
  const [staleWarningVisible, setStaleWarningVisible] = React.useState<boolean>(false);
  const [connectionQuality, setConnectionQuality] = React.useState<'good' | 'unstable' | 'poor'>('good');
  const [updateCount, setUpdateCount] = React.useState<number>(0);
  
  // Update timestamp whenever price updates
  React.useEffect(() => {
    if (price !== null) {
      setLastUpdateTime(new Date());
      setStaleWarningVisible(false);
      setUpdateCount(prev => prev + 1);
    }
  }, [price]);
  
  // Calculate update frequency
  const [updateFrequency, setUpdateFrequency] = React.useState<number | null>(null);
  React.useEffect(() => {
    const freqInterval = setInterval(() => {
      const now = new Date();
      const secondsElapsed = (now.getTime() - lastUpdateTime.getTime()) / 1000;
      
      // Set connection quality based on update frequency
      if (secondsElapsed > 5) {
        setConnectionQuality('poor');
      } else if (secondsElapsed > 2) {
        setConnectionQuality('unstable');
      } else {
        setConnectionQuality('good');
      }
      
      if (secondsElapsed > 3) {
        setStaleWarningVisible(true);
      }
    }, 1000);
    
    return () => clearInterval(freqInterval);
  }, [lastUpdateTime]);
  
  // Calculate updates per second
  React.useEffect(() => {
    const frequencyTimer = setInterval(() => {
      // Reset counter every 5 seconds and calculate average
      setUpdateFrequency(updateCount / 5);
      setUpdateCount(0);
    }, 5000);
    
    return () => clearInterval(frequencyTimer);
  }, [updateCount]);
  
  // Check if data might be stale
  const isDataPotentiallyStale = React.useMemo(() => {
    const now = new Date();
    const timeDifference = now.getTime() - lastUpdateTime.getTime();
    // Consider data stale if no update in 3 seconds (longer than refresh rate)
    return timeDifference > 3000; 
  }, [lastUpdateTime]);

  // Connection quality indicator
  const getConnectionIndicator = () => {
    if (connectionQuality === 'good') {
      return <Wifi size={16} className="text-green-500" />;
    } else if (connectionQuality === 'unstable') {
      return <Wifi size={16} className="text-yellow-500" />;
    } else {
      return <WifiOff size={16} className="text-red-500" />;
    }
  };

  if (!price || isDataPotentiallyStale) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className={cn(
          "bg-muted rounded-md",
          isLarge ? "h-10 w-32" : "h-8 w-24"
        )}></div>
        {isDataPotentiallyStale && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-amber-500">
                  <AlertCircle size={16} className="animate-pulse" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Data may be stale. Last update: {lastUpdateTime.toLocaleTimeString()}</p>
                <p>Connection appears to be {connectionQuality}.</p>
                <p>Refresh rate: {updateFrequency ? `${updateFrequency.toFixed(1)} updates/sec` : 'calculating...'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="ml-2">
                {getConnectionIndicator()}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Connection: {connectionQuality}</p>
              <p>Updates: {updateFrequency ? `${updateFrequency.toFixed(1)}/sec` : 'calculating...'}</p>
              <p>Last update: {lastUpdateTime.toLocaleTimeString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className={cn(
        "text-muted-foreground",
        isLarge ? "text-sm" : "text-xs"
      )}>
        SOL/USD • Updated {lastUpdateTime.toLocaleTimeString()} • 
        Refresh rate: {updateFrequency ? `${updateFrequency.toFixed(1)}/sec` : 'calculating...'}
      </div>
    </div>
  );
};

export default SolPriceDisplay;
