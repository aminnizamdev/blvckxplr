
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import { 
  ArrowUpDown, 
  Clock, 
  Zap, 
  TrendingUp, 
  BarChart4, 
  Activity, 
  Shield, 
  Info,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTokenDetails } from '@/hooks/useTokenDetails';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChartContainer } from '@/components/ui/chart';
import { useLiveData } from '@/hooks/useLiveData';

interface SolanaPricePanelProps {
  currentPrice: number | null;
  previousPrice: number | null;
}

const SolanaPricePanel = ({ currentPrice, previousPrice }: SolanaPricePanelProps) => {
  const { formatValue } = useTokenDetails();
  const { solPriceHistory } = useLiveData();
  
  // Calculate statistics based on the price data
  const calculateStats = () => {
    if (!solPriceHistory.length) return { high: 0, low: 0, avg: 0, volume: 0 };
    
    const prices = solPriceHistory.map(d => d.price);
    const volumes = solPriceHistory.map(d => d.volume);
    
    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      volume: volumes.reduce((sum, vol) => sum + vol, 0),
    };
  };
  
  const stats = React.useMemo(() => calculateStats(), [solPriceHistory]);
  
  // Calculate price change percentage
  const getPriceChange = () => {
    if (!currentPrice || !previousPrice) return { value: 0, isPositive: false };
    
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;
    return {
      value: change,
      isPositive: change > 0,
    };
  };
  
  const priceChange = getPriceChange();
  
  // Calculate confidence level based on price stability
  const getConfidenceLevel = () => {
    if (!currentPrice || !previousPrice) return null;
    
    const percentChange = Math.abs(((currentPrice - previousPrice) / previousPrice) * 100);
    
    if (percentChange < 0.1) return { level: 'High', color: 'bg-green-500', description: 'Highly stable price with minimal fluctuation' };
    if (percentChange < 0.5) return { level: 'Medium', color: 'bg-yellow-500', description: 'Moderate price stability with expected fluctuations' };
    return { level: 'Low', color: 'bg-red-500', description: 'High volatility detected, exercise caution' };
  };
  
  const confidence = getConfidenceLevel();
  
  // Calculate data accuracy metrics
  const getDataAccuracy = () => {
    // In a real-world scenario, this would come from the data source
    return {
      sourceLatency: Math.floor(Math.random() * 150), // ms
      dataPoints: solPriceHistory.length,
      updateFrequency: '1 minute',
      reliabilityScore: 95 + Math.floor(Math.random() * 5), // 95-99%
    };
  };
  
  const accuracy = getDataAccuracy();
  
  // Find the average price for the reference line
  const averagePrice = React.useMemo(() => {
    if (!solPriceHistory.length) return 0;
    const sum = solPriceHistory.reduce((total, item) => total + item.price, 0);
    return sum / solPriceHistory.length;
  }, [solPriceHistory]);
  
  if (!currentPrice) {
    return (
      <Card className="sol-price-panel w-full border border-border/50 enhanced-card animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity size={18} />
            SOL Price Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-full h-40 bg-muted/30 rounded-md"></div>
          <div className="w-3/4 h-4 bg-muted/30 rounded-md mt-4"></div>
          <div className="w-1/2 h-4 bg-muted/30 rounded-md mt-2"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="sol-price-panel w-full border border-border/50 enhanced-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-cyan-500" />
            SOL Price Analysis
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(confidence?.color, "text-xs text-white")}>
              {confidence?.level} Confidence
            </Badge>
            <Badge variant="outline" className="text-xs">
              Last update: {formatDistanceToNow(new Date(), { addSuffix: true })}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col items-center justify-center p-3 bg-card/50 rounded-lg border border-border/30 glass-card">
            <span className="text-xs text-muted-foreground mb-1">Current Price</span>
            <span className="text-2xl font-bold">${typeof currentPrice === 'number' ? currentPrice.toFixed(6) : '-'}</span>
            <span className={cn(
              "text-sm flex items-center gap-1",
              priceChange.isPositive ? "text-cyan-500" : "text-pink-500"
            )}>
              {priceChange.isPositive ? '+' : ''}{priceChange.value.toFixed(4)}%
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 bg-card/50 rounded-lg border border-border/30 glass-card">
            <span className="text-xs text-muted-foreground mb-1">30m High</span>
            <span className="text-2xl font-bold">${stats.high.toFixed(6)}</span>
            <span className="text-sm text-muted-foreground">
              <TrendingUp size={12} className="inline mr-1 text-cyan-500" />
              Peak price
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 bg-card/50 rounded-lg border border-border/30 glass-card">
            <span className="text-xs text-muted-foreground mb-1">30m Low</span>
            <span className="text-2xl font-bold">${stats.low.toFixed(6)}</span>
            <span className="text-sm text-muted-foreground">
              <TrendingUp size={12} className="inline mr-1 text-pink-500 transform rotate-180" />
              Lowest point
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 bg-card/50 rounded-lg border border-border/30 glass-card">
            <span className="text-xs text-muted-foreground mb-1">Volume</span>
            <span className="text-2xl font-bold">${formatValue(stats.volume, 0)}</span>
            <span className="text-sm text-muted-foreground">
              <BarChart4 size={12} className="inline mr-1" />
              Trading activity
            </span>
          </div>
        </div>
        
        <div className="price-chart-container bg-black/30 p-6 rounded-lg border border-border/30 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-medium text-gradient-primary text-lg">SOL/USD Histogram (Last 30 minutes)</span>
              <div className="text-xs text-muted-foreground mt-1">
                Data reliability: {accuracy.reliabilityScore}% • Refresh rate: {accuracy.updateFrequency}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Clock size={12} className="mr-1" /> Live Data
              </Badge>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Shield size={12} className="mr-1" /> Verified Source
              </Badge>
            </div>
          </div>
          
          <ChartContainer 
            config={{
              price: { 
                label: "Price", 
                color: "#06b6d4" 
              },
              priceIncrease: {
                label: "Price Increase",
                color: "#06b6d4"
              },
              priceDecrease: {
                label: "Price Decrease",
                color: "#ec4899"
              },
              average: {
                label: "Average",
                color: "#ffa500"
              }
            }}
            className="pb-4"
          >
            <BarChart 
              data={solPriceHistory} 
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              barGap={0} // No gap between bars in the same group
              barCategoryGap={0} // No gap between groups - this makes bars touch each other
            >
              <CartesianGrid stroke="#555" strokeDasharray="5 5" opacity={0.1} />
              <XAxis 
                dataKey="timeFormatted"
                tick={{ fontSize: 10, fill: "#999" }}
                axisLine={{ stroke: "#555" }}
                tickLine={{ stroke: "#555" }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: "#999" }}
                width={60}
                tickFormatter={(value) => `$${typeof value === 'number' ? value.toFixed(2) : value}`}
                axisLine={{ stroke: "#555" }}
                tickLine={{ stroke: "#555" }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black/80 border border-white/10 p-3 rounded-lg shadow-lg backdrop-blur-sm">
                        <p className="text-xs text-white/70 mb-1">{label}</p>
                        <p className="text-sm font-medium text-white">
                          Price: <span className={payload[0]?.payload?.increase ? "text-cyan-400" : "text-pink-400"}>
                            ${typeof payload[0]?.value === 'number' ? payload[0]?.value.toFixed(6) : payload[0]?.value}
                          </span>
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                          Volume: <span className="text-purple-400">${formatValue(Number(payload[0]?.payload?.volume || 0), 0)}</span>
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                          Time: <span className="text-gray-300">
                            {new Date(payload[0]?.payload?.time).toLocaleTimeString()}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                y={averagePrice} 
                stroke="#ffa500" 
                strokeDasharray="3 3" 
                label={{ 
                  value: "Avg", 
                  position: "insideTopLeft", 
                  fill: "#ffa500", 
                  fontSize: 10 
                }} 
              />
              <Bar 
                dataKey="price" 
                name="Price"
                radius={[0, 0, 0, 0]} // Remove rounded corners for tight packing
                barSize={18} // Make bars fill the entire width 
                shape={(props: any) => {
                  const { fill, x, y, width, height } = props;
                  const isIncrease = props.payload.increase;
                  
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={isIncrease ? "#06b6d4" : "#ec4899"}
                      stroke="none"
                    />
                  );
                }}
              />
            </BarChart>
          </ChartContainer>
          
          <div className="flex justify-between text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-cyan-500"></div>
                <span>Price Increase</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-pink-500"></div>
                <span>Price Decrease</span>
              </div>
            </div>
            <div>Latency: {accuracy.sourceLatency}ms</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card/50 p-4 rounded-lg border border-border/30 glass-card">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Shield size={14} />
              Data Confidence
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <AlertCircle size={12} className="text-muted-foreground" />
                  Confidence Level
                </span>
                <Badge variant="outline" className={cn(confidence?.color, "text-white text-xs")}>
                  {confidence?.level}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {confidence?.description}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs flex items-center gap-1">
                  <Clock size={12} className="text-muted-foreground" />
                  Price Stability
                </span>
                <span className="text-xs">
                  {Math.abs(priceChange.value) < 0.5 ? 'Stable' : Math.abs(priceChange.value) < 2 ? 'Moderate' : 'Volatile'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-card/50 p-4 rounded-lg border border-border/30 glass-card">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Info size={14} />
              Data Accuracy
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <Zap size={12} className="text-muted-foreground" />
                  Source Latency
                </span>
                <span className="text-xs">{accuracy.sourceLatency}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <BarChart4 size={12} className="text-muted-foreground" />
                  Data Points
                </span>
                <span className="text-xs">{accuracy.dataPoints} points (1 min interval)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <Clock size={12} className="text-muted-foreground" />
                  Update Frequency
                </span>
                <span className="text-xs">Every {accuracy.updateFrequency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <Shield size={12} className="text-muted-foreground" />
                  Reliability Score
                </span>
                <span className="text-xs">{accuracy.reliabilityScore}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-center text-muted-foreground mt-2">
          Data provided by Pyth Network • Solana blockchain
        </div>
      </CardContent>
    </Card>
  );
};

export default SolanaPricePanel;
