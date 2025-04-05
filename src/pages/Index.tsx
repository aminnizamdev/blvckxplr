
import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import TokenCard from '@/components/TokenCard';
import EmptyState from '@/components/EmptyState';
import TokenDetailsModal from '@/components/TokenDetailsModal';
import { useMockData } from '@/hooks/useMockData';
import { TokenData } from '@/types/token';
import SolPriceDisplay from '@/components/SolPriceDisplay';

const Index = () => {
  const {
    solPrice,
    prevSolPrice,
    tokens,
    pythStatus,
    pumpStatus,
    isRefreshing,
    handleRefresh
  } = useMockData();
  
  const [selectedToken, setSelectedToken] = React.useState<TokenData | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleViewDetails = (tokenId: string) => {
    const token = tokens.find(t => t.mint === tokenId);
    if (token) {
      setSelectedToken(token);
      setDetailsOpen(true);
    }
  };

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
              <h2 className="text-xl font-semibold">Recent Tokens</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {tokens.length} tokens</span>
              </div>
            </div>
            
            {tokens.length > 0 ? (
              <div className="token-grid">
                {tokens.map((token) => (
                  <TokenCard
                    key={token.mint}
                    token={token}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                message="No tokens found"
                subMessage="Waiting for new tokens to be created on PumpFun..."
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
    </div>
  );
};

export default Index;
