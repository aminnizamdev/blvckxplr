
import React from 'react';
import { ExternalLink, Wallet, Clock, Info, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenData } from '@/types/token';
import { useTokenDetails } from '@/hooks/useTokenDetails';
import PriceChangeBadge from './PriceChangeBadge';
import TokenTrendBadge from './TokenTrendBadge';
import { formatDistanceToNow } from 'date-fns';

interface TokenCardProps {
  token: TokenData;
  onViewDetails: (tokenId: string) => void;
}

const TokenCard = ({ token, onViewDetails }: TokenCardProps) => {
  const { formatValue, truncateAddress } = useTokenDetails();
  
  return (
    <Card className="token-card animate-fade-in border-border/50 relative overflow-hidden enhanced-card">
      {/* Created Age Badge */}
      <div className="absolute top-0 right-0 bg-secondary/60 text-xs px-2 py-1 rounded-bl-lg flex items-center gap-1">
        <Clock size={12} />
        {formatDistanceToNow(new Date(token.timestamp), { addSuffix: true })}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              {token.name.toUpperCase()} 
              <span className="text-sm text-muted-foreground">({token.symbol})</span>
            </CardTitle>
            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <span className="truncate max-w-[140px]" title={token.mint}>
                  {truncateAddress(token.mint)}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 rounded-full p-0 ml-1" 
                  asChild
                >
                  <a 
                    href={`https://solscan.io/token/${token.mint}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="View Token on Solscan"
                  >
                    <ExternalLink size={10} />
                  </a>
                </Button>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TokenTrendBadge token={token} />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-foreground/70 hover:text-cyan-400 transition-colors" 
              asChild
            >
              <a 
                href={`https://www.pump.fun/token/${token.mint}`} 
                target="_blank" 
                rel="noopener noreferrer"
                title="View on PumpFun"
              >
                <ExternalLink size={16} />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2 space-y-3">
        <div className="data-grid">
          <div>
            <div className="data-label">Market Cap</div>
            <div className="data-value flex flex-col">
              <div className="flex justify-between">
                <span>{formatValue(token.marketCapSol, 4)} SOL</span>
                <PriceChangeBadge 
                  currentValue={token.marketCapSol} 
                  previousValue={token.prevMarketCapSol}
                  showPercent
                />
              </div>
              <div className="text-xs text-muted-foreground">
                ${formatValue(token.marketCapUsd, 2)}
              </div>
            </div>
          </div>
          
          <div>
            <div className="data-label">Dev Value</div>
            <div className="data-value flex flex-col">
              <div className="flex justify-between">
                <span>{formatValue(token.devValueSol, 4)} SOL</span>
                <PriceChangeBadge 
                  currentValue={token.devValueSol} 
                  previousValue={token.prevDevValueSol}
                  showPercent
                />
              </div>
              <div className="text-xs text-muted-foreground">
                ${formatValue(token.devValueUsd, 2)}
              </div>
            </div>
          </div>
          
          <div>
            <div className="data-label">Dev Balance</div>
            <div className="data-value flex justify-between">
              <span>{formatValue(token.devBalance, 4)}</span>
              <PriceChangeBadge 
                currentValue={token.devBalance} 
                previousValue={token.prevDevBalance}
                showPercent
              />
            </div>
            <a 
              href={`https://solscan.io/account/${token.creator}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-cyan-400/80 hover:text-cyan-400 transition-colors"
            >
              <Wallet size={10} />
              {truncateAddress(token.creator, 6, 6)}
            </a>
          </div>
          
          <div>
            <div className="data-label">Dev Share</div>
            <div className="data-value">
              {formatValue((token.devValueSol / token.marketCapSol) * 100, 2)}%
            </div>
            <div className="text-xs text-muted-foreground">
              of market cap
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <div className="data-label flex justify-between">
            <span>Token Price</span>
            <PriceChangeBadge 
              currentValue={token.estTokenPriceUsd} 
              previousValue={token.prevEstTokenPriceUsd}
              showPercent
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="data-value">
              ${formatValue(token.estTokenPriceUsd, 8)}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {formatValue(token.estTokenPriceSol, 8)} SOL
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full group"
          onClick={() => onViewDetails(token.mint)}
        >
          <Info size={16} className="mr-1" />
          <span>View Details</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TokenCard;
