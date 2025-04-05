
import React from 'react';
import { ExternalLink, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenData } from '@/types/token';
import { useTokenDetails } from '@/hooks/useTokenDetails';

interface TokenCardProps {
  token: TokenData;
  onViewDetails: (tokenId: string) => void;
}

const TokenCard = ({ token, onViewDetails }: TokenCardProps) => {
  const { getTrendIcon, formatValue } = useTokenDetails();
  
  return (
    <Card className="token-card animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              {token.name.toUpperCase()} 
              <span className="text-sm text-muted-foreground">({token.symbol})</span>
            </CardTitle>
            <div className="flex gap-1 text-xs text-muted-foreground mt-1">
              <span className="truncate max-w-[180px]" title={token.mint}>
                {token.mint.substring(0, 8)}...{token.mint.substring(token.mint.length - 4)}
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            asChild
          >
            <a 
              href={`https://solscan.io/tx/${token.signature}`} 
              target="_blank" 
              rel="noopener noreferrer"
              title="View on Solscan"
            >
              <ExternalLink size={16} />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="py-2 space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="data-label">Market Cap (SOL)</div>
            <div className="data-value flex items-center gap-1">
              {formatValue(token.marketCapSol, 4)}
              {getTrendIcon(token.marketCapSol, token.prevMarketCapSol)}
            </div>
          </div>
          
          <div>
            <div className="data-label">Market Cap (USD)</div>
            <div className="data-value flex items-center gap-1">
              ${formatValue(token.marketCapUsd, 2)}
              {getTrendIcon(token.marketCapUsd, token.prevMarketCapUsd)}
            </div>
          </div>
          
          <div>
            <div className="data-label">Dev Balance</div>
            <div className="data-value flex items-center gap-1">
              {formatValue(token.devBalance, 4)}
              {getTrendIcon(token.devBalance, token.prevDevBalance)}
            </div>
          </div>
          
          <div>
            <div className="data-label">Dev Value (USD)</div>
            <div className="data-value flex items-center gap-1">
              ${formatValue(token.devValueUsd, 2)}
              {getTrendIcon(token.devValueUsd, token.prevDevValueUsd)}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <div className="data-label">Est. Token Price</div>
          <div className="flex justify-between items-center">
            <div className="data-value">
              ${formatValue(token.estTokenPriceUsd, 8)}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {formatValue(token.estTokenPriceSol, 8)} SOL
              {getTrendIcon(token.estTokenPriceUsd, token.prevEstTokenPriceUsd)}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onViewDetails(token.mint)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TokenCard;
