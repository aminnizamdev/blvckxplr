
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  ExternalLink, 
  Wallet, 
  CopyIcon, 
  CheckIcon,
  Clock,
  TrendingUp,
  BarChart4
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TokenData } from '@/types/token';
import { useTokenDetails } from '@/hooks/useTokenDetails';
import PriceChangeBadge from './PriceChangeBadge';
import { formatDistanceToNow } from 'date-fns';
import { 
  LineChart, 
  Line, 
  Area,
  AreaChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface TokenDetailsModalProps {
  token: TokenData | null;
  open: boolean;
  onClose: () => void;
}

const TokenDetailsModal = ({ token, open, onClose }: TokenDetailsModalProps) => {
  const { formatValue, getPercentChange } = useTokenDetails();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('overview');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!token) return null;
  
  // Calculate percent changes for key metrics
  const marketCapChange = getPercentChange(token.marketCapSol, token.prevMarketCapSol);
  const devValueChange = getPercentChange(token.devValueSol, token.prevDevValueSol);
  const priceChange = getPercentChange(token.estTokenPriceUsd, token.prevEstTokenPriceUsd);
  
  // Mock time-series data (in a real app, this would come from your API)
  const mockTimeData = Array.from({ length: 24 }, (_, i) => ({
    name: `${i}h`,
    price: token.estTokenPriceUsd * (1 + Math.sin(i/3) * 0.2),
    marketCap: token.marketCapUsd * (1 + Math.sin(i/4) * 0.15),
    devValue: token.devValueUsd * (1 + Math.cos(i/5) * 0.3),
  }));
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{token.name.toUpperCase()} ({token.symbol})</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <a 
                  href={`https://solscan.io/tx/${token.signature}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="View Transaction"
                >
                  <ExternalLink size={16} />
                </a>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <a 
                  href={`https://solscan.io/account/${token.creator}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="View Creator Wallet"
                >
                  <Wallet size={16} />
                </a>
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground" />
            Created {formatDistanceToNow(new Date(token.timestamp), { addSuffix: true })}
            <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full">
              {new Date(token.timestamp).toLocaleString()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col p-4 bg-background rounded-lg">
                <span className="text-xs text-muted-foreground">Market Cap</span>
                <span className="text-2xl font-bold mt-1">{formatValue(token.marketCapSol, 4)} SOL</span>
                <span className="text-sm">${formatValue(token.marketCapUsd, 2)}</span>
                <div className="mt-1">
                  <PriceChangeBadge 
                    currentValue={token.marketCapSol} 
                    previousValue={token.prevMarketCapSol}
                    showPercent
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="flex flex-col p-4 bg-background rounded-lg">
                <span className="text-xs text-muted-foreground">Token Price</span>
                <span className="text-2xl font-bold mt-1">${formatValue(token.estTokenPriceUsd, 8)}</span>
                <span className="text-sm">{formatValue(token.estTokenPriceSol, 8)} SOL</span>
                <div className="mt-1">
                  <PriceChangeBadge 
                    currentValue={token.estTokenPriceUsd} 
                    previousValue={token.prevEstTokenPriceUsd}
                    showPercent
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div className="flex flex-col p-4 bg-background rounded-lg">
                <span className="text-xs text-muted-foreground">Dev Holdings</span>
                <span className="text-2xl font-bold mt-1">{formatValue(token.devBalance, 4)}</span>
                <span className="text-sm">${formatValue(token.devValueUsd, 2)}</span>
                <div className="mt-1">
                  <PriceChangeBadge 
                    currentValue={token.devValueSol} 
                    previousValue={token.prevDevValueSol}
                    showPercent
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Token Details</h3>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Token Contract</div>
                  <div className="flex items-center justify-between bg-muted/20 p-2 rounded-md">
                    <code className="text-xs break-all">{token.mint}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => copyToClipboard(token.mint, 'mint')}
                    >
                      {copiedField === 'mint' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Developer Wallet</div>
                  <div className="flex items-center justify-between bg-muted/20 p-2 rounded-md">
                    <code className="text-xs break-all">{token.creator}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => copyToClipboard(token.creator, 'creator')}
                    >
                      {copiedField === 'creator' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-border/50 rounded-lg bg-black/5">
                <h3 className="text-sm font-medium mb-2">Token Price (24h)</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={mockTimeData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{fontSize: 10}} />
                    <YAxis tick={{fontSize: 10}} width={30} tickFormatter={(value) => `$${value.toFixed(8).slice(0, 5)}`} />
                    <Tooltip 
                      formatter={(value: number) => ['$' + value.toFixed(8), 'Price']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-4">
            <div className="p-4 border border-border/50 rounded-lg bg-black/5">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                Token Price vs Market Cap (24h)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockTimeData}>
                  <CartesianGrid stroke="#555" strokeDasharray="5 5" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `$${value.toFixed(8).slice(0, 5)}`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${(value/1000).toFixed(2)}k`} />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="price" 
                    name="Token Price" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="marketCap" 
                    name="Market Cap" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-4 border border-border/50 rounded-lg bg-black/5">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <BarChart4 size={16} className="mr-1" />
                Dev Value (24h)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mockTimeData}>
                  <CartesianGrid stroke="#555" strokeDasharray="5 5" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(1)}k`} />
                  <Tooltip formatter={(value: number) => ['$' + value.toFixed(2), 'Dev Value']} />
                  <defs>
                    <linearGradient id="colorDev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="devValue" 
                    stroke="#ffc658" 
                    fillOpacity={1} 
                    fill="url(#colorDev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span>SOL:</span>
                    <span className="font-medium flex items-center gap-1">
                      {formatValue(token.marketCapSol, 4)}
                      <PriceChangeBadge 
                        currentValue={token.marketCapSol} 
                        previousValue={token.prevMarketCapSol}
                        showPercent
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>USD:</span>
                    <span className="font-medium flex items-center gap-1">
                      ${formatValue(token.marketCapUsd, 2)}
                      <PriceChangeBadge 
                        currentValue={token.marketCapUsd} 
                        previousValue={token.prevMarketCapUsd}
                        showPercent
                      />
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Dev Holdings</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Balance:</span>
                    <span className="font-medium flex items-center gap-1">
                      {formatValue(token.devBalance, 4)}
                      <PriceChangeBadge 
                        currentValue={token.devBalance} 
                        previousValue={token.prevDevBalance}
                        showPercent
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Value (SOL):</span>
                    <span className="font-medium flex items-center gap-1">
                      {formatValue(token.devValueSol, 4)}
                      <PriceChangeBadge 
                        currentValue={token.devValueSol} 
                        previousValue={token.prevDevValueSol}
                        showPercent
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Value (USD):</span>
                    <span className="font-medium flex items-center gap-1">
                      ${formatValue(token.devValueUsd, 2)}
                      <PriceChangeBadge 
                        currentValue={token.devValueUsd} 
                        previousValue={token.prevDevValueUsd}
                        showPercent
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground">Estimated Token Price</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>SOL/Token:</span>
                  <span className="font-medium flex items-center gap-1">
                    {formatValue(token.estTokenPriceSol, 8)} SOL
                    <PriceChangeBadge 
                      currentValue={token.estTokenPriceSol} 
                      previousValue={token.prevEstTokenPriceSol}
                      showPercent
                    />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>USD/Token:</span>
                  <span className="font-medium flex items-center gap-1">
                    ${formatValue(token.estTokenPriceUsd, 8)}
                    <PriceChangeBadge 
                      currentValue={token.estTokenPriceUsd} 
                      previousValue={token.prevEstTokenPriceUsd}
                      showPercent
                    />
                  </span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="text-sm text-muted-foreground">Technical Data</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>vTokens in Curve:</span>
                  <span className="font-medium">
                    {formatValue(token.vTokensInBondingCurve, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dev % of Supply:</span>
                  <span className="font-medium">
                    {formatValue((token.devBalance / token.vTokensInBondingCurve) * 100, 2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Creation Tx:</span>
                  <span className="font-medium text-xs flex items-center">
                    {token.signature.substring(0, 10)}...
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-1" 
                      asChild
                    >
                      <a 
                        href={`https://solscan.io/tx/${token.signature}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </Button>
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-start">
          <div className="flex gap-2 w-full">
            <Button 
              variant="secondary" 
              onClick={onClose} 
              className="w-full"
            >
              Close
            </Button>
            <Button 
              variant="default" 
              asChild 
              className="w-full"
            >
              <a 
                href={`https://www.pump.fun/token/${token.mint}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on PumpFun
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TokenDetailsModal;
