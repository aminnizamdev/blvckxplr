
import React from 'react';
import { Flame, TrendingUp, ArrowUpDown, BarChart2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TokenData } from '@/types/token';

type TrendType = 'trending' | 'hot' | 'stable' | 'volume' | 'rugged';

interface TokenTrendBadgeProps {
  token: TokenData;
  className?: string;
}

export const TokenTrendBadge = ({ token, className }: TokenTrendBadgeProps) => {
  // Determine token trend based on various metrics
  const getTrendType = (token: TokenData): TrendType | null => {
    const hasPrice = token.estTokenPriceUsd > 0;
    const hasPrevPrice = token.prevEstTokenPriceUsd !== null && token.prevEstTokenPriceUsd > 0;
    
    // Market cap over certain threshold could indicate "trending"
    if (token.marketCapUsd > 1000) {
      return 'trending';
    }
    
    // Price increased significantly
    if (hasPrevPrice && token.estTokenPriceUsd > token.prevEstTokenPriceUsd) {
      const priceChange = ((token.estTokenPriceUsd - token.prevEstTokenPriceUsd) / token.prevEstTokenPriceUsd);
      if (priceChange > 0.2) { // 20% price increase
        return 'hot';
      }
    }
    
    // Stable price (little volatility)
    if (hasPrevPrice && Math.abs((token.estTokenPriceUsd - token.prevEstTokenPriceUsd) / token.prevEstTokenPriceUsd) < 0.05) {
      return 'stable';
    }
    
    // Dev withdrawing significant amount might indicate "rugged"
    if (token.prevDevBalance && token.devBalance < token.prevDevBalance * 0.5) {
      return 'rugged';
    }
    
    // High trading volume (devValue to marketCap ratio)
    if (token.devValueSol / token.marketCapSol > 0.3) {
      return 'volume';
    }
    
    return null;
  };
  
  const trendType = getTrendType(token);
  
  if (!trendType) return null;
  
  const renderBadge = () => {
    switch (trendType) {
      case 'trending':
        return (
          <div className={cn("token-tag token-tag-trending flex items-center gap-1", className)}>
            <TrendingUp size={12} />
            <span>Trending</span>
          </div>
        );
      case 'hot':
        return (
          <div className={cn("token-tag token-tag-hot flex items-center gap-1", className)}>
            <Flame size={12} />
            <span>Hot</span>
          </div>
        );
      case 'stable':
        return (
          <div className={cn("token-tag token-tag-stable flex items-center gap-1", className)}>
            <ArrowUpDown size={12} />
            <span>Stable</span>
          </div>
        );
      case 'volume':
        return (
          <div className={cn("token-tag token-tag-volume flex items-center gap-1", className)}>
            <BarChart2 size={12} />
            <span>High Volume</span>
          </div>
        );
      case 'rugged':
        return (
          <div className={cn("token-tag token-tag-rugged flex items-center gap-1", className)}>
            <AlertTriangle size={12} />
            <span>Rugged</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return renderBadge();
};

export default TokenTrendBadge;
