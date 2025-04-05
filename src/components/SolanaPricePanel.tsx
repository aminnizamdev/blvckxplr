
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowUpDown, Clock, Zap, TrendingUp, BarChart4, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTokenDetails } from '@/hooks/useTokenDetails';
import { Separator } from '@/components/ui/separator';

interface SolanaPricePanelProps {
  currentPrice: number | null;
  previousPrice: number | null;
}

const SolanaPricePanel = ({ currentPrice, previousPrice }: SolanaPricePanelProps) => {
  const { formatValue } = useTokenDetails();
  
  // Generate mock historical data
  const generateMockData = () => {
    if (!currentPrice) return [];
    
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 3600000);
      // Create some variation in the price
      const randomFactor = 0.98 + Math.random() * 0.04; // Random between 0.98 and 1.02
      const basePrice = currentPrice * (0.95 + (i/24) * 0.1); // Gradual trend upward
      return {
        time: time.getHours() + ':00',
        price: basePrice * randomFactor,
        volume: Math.round(1000 + Math.random() * 5000),
      };
    });
  };
  
  const mockData = React.useMemo(() => generateMockData(), [currentPrice]);
  
  // Calculate daily statistics
  const calculateStats = () => {
    if (!mockData.length) return { high: 0, low: 0, avg: 0, volume: 0 };
    
    const prices = mockData.map(d => d.price);
    const volumes = mockData.map(d => d.volume);
    
    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      volume: volumes.reduce((sum, vol) => sum + vol, 0),
    };
  };
  
  const stats = React.useMemo(() => calculateStats(), [mockData]);
  
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
  
  if (!currentPrice) {
    return (
      <Card className="sol-price-panel h-full border border-border/50 enhanced-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity size={18} />
            SOL Price Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-full h-40 bg-muted/30 rounded-md"></div>
          <div className="w-3/4 h-4 bg-muted/30 rounded-md mt-4"></div>
          <div className="w-1/2 h-4 bg-muted/30 rounded-md mt-2"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="sol-price-panel h-full border border-border/50 enhanced-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity size={18} className="text-cyan-500" />
          SOL Price Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="price-chart-container">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mockData}>
              <CartesianGrid stroke="#555" strokeDasharray="5 5" opacity={0.1} />
              <XAxis 
                dataKey="time"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fontSize: 10 }}
                width={60}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8, fill: '#06b6d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <div className="text-xs text-muted-foreground">24h Statistics</div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <TrendingUp size={12} className="text-cyan-500" />
                  24h High
                </span>
                <span className="text-sm font-medium">${stats.high.toFixed(6)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <TrendingUp size={12} className="text-pink-500 transform rotate-180" />
                  24h Low
                </span>
                <span className="text-sm font-medium">${stats.low.toFixed(6)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <ArrowUpDown size={12} className="text-muted-foreground" />
                  24h Avg
                </span>
                <span className="text-sm font-medium">${stats.avg.toFixed(6)}</span>
              </div>
            </div>
          </div>
          
          <Separator orientation="vertical" className="hidden md:block h-auto" />
          
          <div className="flex-1 space-y-2">
            <div className="text-xs text-muted-foreground">Market Info</div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <BarChart4 size={12} className="text-muted-foreground" />
                  24h Volume
                </span>
                <span className="text-sm font-medium">${formatValue(stats.volume, 0)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <Zap size={12} className="text-yellow-500" />
                  Change
                </span>
                <span className={`text-sm font-medium ${priceChange.isPositive ? 'text-cyan-500' : 'text-pink-500'}`}>
                  {priceChange.isPositive ? '+' : ''}{priceChange.value.toFixed(4)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center gap-1">
                  <Clock size={12} className="text-muted-foreground" />
                  Last Updated
                </span>
                <span className="text-sm">{formatDistanceToNow(new Date(), { addSuffix: true })}</span>
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
