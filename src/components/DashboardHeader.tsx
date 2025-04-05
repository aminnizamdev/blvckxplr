
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import StatusIndicator from './StatusIndicator';
import SolPriceDisplay from './SolPriceDisplay';

interface DashboardHeaderProps {
  solPrice: number | null;
  prevSolPrice: number | null;
  pumpStatus: 'connected' | 'disconnected' | 'connecting';
  pythStatus: 'connected' | 'disconnected' | 'connecting';
  onRefresh: () => void;
  isRefreshing: boolean;
}

const DashboardHeader = ({
  solPrice,
  prevSolPrice,
  pumpStatus,
  pythStatus,
  onRefresh,
  isRefreshing
}: DashboardHeaderProps) => {
  return (
    <div className="dashboard-header">
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PumpFun Token Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor and track Solana tokens on PumpFun
          </p>
        </div>
        
        <div className="hidden md:block">
          <SolPriceDisplay 
            price={solPrice} 
            previousPrice={prevSolPrice} 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="hidden md:flex flex-col gap-1">
          <StatusIndicator 
            status={pumpStatus} 
            label="PumpFun" 
            className="bg-secondary/80 text-xs" 
          />
          <StatusIndicator 
            status={pythStatus} 
            label="Pyth" 
            className="bg-secondary/80 text-xs" 
          />
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-10 w-10"
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin-slow" : ""} />
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
