
import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import TokenCard from '@/components/TokenCard';
import EmptyState from '@/components/EmptyState';
import TokenDetailsModal from '@/components/TokenDetailsModal';
import { useLiveData } from '@/hooks/useLiveData';
import { TokenData } from '@/types/token';
import SolPriceDisplay from '@/components/SolPriceDisplay';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Index = () => {
  const { toast } = useToast();
  const {
    solPrice,
    prevSolPrice,
    tokens,
    pythStatus,
    pumpStatus,
    isRefreshing,
    handleRefresh
  } = useLiveData();
  
  const [selectedToken, setSelectedToken] = React.useState<TokenData | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('marketCap'); // Default to marketCap

  const handleViewDetails = (tokenId: string) => {
    const token = tokens.find(t => t.mint === tokenId);
    if (token) {
      setSelectedToken(token);
      setDetailsOpen(true);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption);
    toast({
      title: "Sorted tokens",
      description: `Tokens sorted by ${sortOption}`,
      duration: 2000,
    });
  };

  // Filter tokens based on search term
  const filteredTokens = React.useMemo(() => {
    if (!searchTerm) return tokens;
    
    const term = searchTerm.toLowerCase();
    return tokens.filter(token => 
      token.name.toLowerCase().includes(term) || 
      token.symbol.toLowerCase().includes(term) || 
      token.mint.toLowerCase().includes(term) ||
      token.creator.toLowerCase().includes(term)
    );
  }, [tokens, searchTerm]);

  // Sort tokens based on sort option
  const sortedTokens = React.useMemo(() => {
    switch (sortBy) {
      case 'marketCap':
        return [...filteredTokens].sort((a, b) => b.marketCapSol - a.marketCapSol);
      case 'priceChange':
        return [...filteredTokens].sort((a, b) => {
          const aChange = a.prevEstTokenPriceUsd ? 
            ((a.estTokenPriceUsd - a.prevEstTokenPriceUsd) / a.prevEstTokenPriceUsd) : 0;
          const bChange = b.prevEstTokenPriceUsd ? 
            ((b.estTokenPriceUsd - b.prevEstTokenPriceUsd) / b.prevEstTokenPriceUsd) : 0;
          return bChange - aChange;
        });
      case 'devValue':
        return [...filteredTokens].sort((a, b) => b.devValueSol - a.devValueSol);
      case 'newest':
        return [...filteredTokens].sort((a, b) => b.timestamp - a.timestamp);
      default:
        return [...filteredTokens].sort((a, b) => b.marketCapSol - a.marketCapSol);
    }
  }, [filteredTokens, sortBy]);

  // Update refresh toast
  React.useEffect(() => {
    if (isRefreshing) {
      toast({
        title: "Refreshing data...",
        description: `Last update: ${format(new Date(), 'h:mm:ss a')}`,
      });
    }
  }, [isRefreshing, toast]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Dashboard Header */}
          <DashboardHeader
            solPrice={solPrice}
            prevSolPrice={prevSolPrice}
            pumpStatus={pumpStatus}
            pythStatus={pythStatus}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            onSearch={handleSearch}
            onSort={handleSort}
          />
          
          {/* Mobile SOL Price (only visible on mobile) */}
          <div className="md:hidden p-4 bg-card rounded-lg border border-border/50">
            <div className="text-sm text-muted-foreground mb-1">Current SOL Price</div>
            <SolPriceDisplay 
              price={solPrice} 
              previousPrice={prevSolPrice} 
            />
          </div>
          
          {/* Token Grid */}
          <div className="dashboard-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Live Tokens</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {sortedTokens.length} tokens</span>
              </div>
            </div>
            
            {sortedTokens.length > 0 ? (
              <div className="token-grid">
                {sortedTokens.map((token) => (
                  <TokenCard
                    key={token.mint}
                    token={token}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                message={searchTerm ? "No matching tokens found" : "No tokens found"}
                subMessage={searchTerm 
                  ? "Try a different search term or clear your filter" 
                  : "Waiting for new tokens to be created on PumpFun..."}
                isLoading={isRefreshing}
                buttonText={isRefreshing ? "Refreshing..." : "Refresh Connections"}
                onAction={handleRefresh}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Token Details Modal */}
      <TokenDetailsModal
        token={selectedToken}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
      
      <Toaster />
    </div>
  );
};

export default Index;
