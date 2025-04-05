
import React from 'react';
import { useTokenDetails } from '@/hooks/useTokenDetails';
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { TokenTransaction } from '@/types/token';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionMarqueeProps {
  buyTransactions: TokenTransaction[];
  sellTransactions: TokenTransaction[];
  threshold: number;
}

const TransactionMarquee = ({ 
  buyTransactions, 
  sellTransactions, 
  threshold 
}: TransactionMarqueeProps) => {
  const { truncateAddress, formatCurrency } = useTokenDetails();

  return (
    <div className="w-full bg-card/60 border border-border/50 rounded-md p-2 mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Big Transactions</span>
          <span className="text-xs text-muted-foreground">
            (Above {formatCurrency(threshold, 'USD', 0)})
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {/* Buy Transactions */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUp size={14} className="text-cyan-500" />
            <span className="text-xs font-medium">Buy Transactions</span>
          </div>
          
          {buyTransactions.length > 0 ? (
            <div className="relative overflow-hidden">
              <div className="animate-marquee whitespace-nowrap flex gap-4">
                {buyTransactions.map((tx) => (
                  <div key={tx.signature} className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-600/10 border border-cyan-600/20 rounded-md">
                    <span className="text-xs font-medium">{tx.tokenSymbol}</span>
                    <span className="text-xs text-muted-foreground">by</span>
                    <span className="text-xs">{truncateAddress(tx.trader, 3, 3)}</span>
                    <span className="text-xs font-semibold text-cyan-400">
                      {formatCurrency(tx.valueUsd, 'USD', 2)}
                    </span>
                  </div>
                ))}
                
                {/* Duplicate for continuous scrolling */}
                {buyTransactions.length > 0 && buyTransactions.map((tx) => (
                  <div key={`${tx.signature}-dup`} className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-600/10 border border-cyan-600/20 rounded-md">
                    <span className="text-xs font-medium">{tx.tokenSymbol}</span>
                    <span className="text-xs text-muted-foreground">by</span>
                    <span className="text-xs">{truncateAddress(tx.trader, 3, 3)}</span>
                    <span className="text-xs font-semibold text-cyan-400">
                      {formatCurrency(tx.valueUsd, 'USD', 2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground py-1">
              No large buy transactions yet
            </div>
          )}
        </div>
        
        {/* Sell Transactions */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDown size={14} className="text-pink-500" />
            <span className="text-xs font-medium">Sell Transactions</span>
          </div>
          
          {sellTransactions.length > 0 ? (
            <div className="relative overflow-hidden">
              <div className="animate-marquee-reverse whitespace-nowrap flex gap-4">
                {sellTransactions.map((tx) => (
                  <div key={tx.signature} className="inline-flex items-center gap-2 px-3 py-1 bg-pink-600/10 border border-pink-600/20 rounded-md">
                    <span className="text-xs font-medium">{tx.tokenSymbol}</span>
                    <span className="text-xs text-muted-foreground">by</span>
                    <span className="text-xs">{truncateAddress(tx.trader, 3, 3)}</span>
                    <span className="text-xs font-semibold text-pink-400">
                      {formatCurrency(tx.valueUsd, 'USD', 2)}
                    </span>
                  </div>
                ))}
                
                {/* Duplicate for continuous scrolling */}
                {sellTransactions.length > 0 && sellTransactions.map((tx) => (
                  <div key={`${tx.signature}-dup`} className="inline-flex items-center gap-2 px-3 py-1 bg-pink-600/10 border border-pink-600/20 rounded-md">
                    <span className="text-xs font-medium">{tx.tokenSymbol}</span>
                    <span className="text-xs text-muted-foreground">by</span>
                    <span className="text-xs">{truncateAddress(tx.trader, 3, 3)}</span>
                    <span className="text-xs font-semibold text-pink-400">
                      {formatCurrency(tx.valueUsd, 'USD', 2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground py-1">
              No large sell transactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionMarquee;
