
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Info, Filter, Search } from 'lucide-react';
import StatusIndicator from './StatusIndicator';
import SolPriceDisplay from './SolPriceDisplay';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  solPrice: number | null;
  prevSolPrice: number | null;
  pumpStatus: 'connected' | 'disconnected' | 'connecting';
  pythStatus: 'connected' | 'disconnected' | 'connecting';
  onRefresh: () => void;
  isRefreshing: boolean;
  onSearch?: (term: string) => void;
  onSort?: (sortBy: string) => void;
}

const DashboardHeader = ({
  solPrice,
  prevSolPrice,
  pumpStatus,
  pythStatus,
  onRefresh,
  isRefreshing,
  onSearch,
  onSort
}: DashboardHeaderProps) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  return (
    <div className="dashboard-header border-b border-border/50 pb-4 mb-4">
      <div className="flex items-center justify-between gap-8 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center">
            BLVCK XPLR
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                    <Info size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">
                    Real-time tracking of new tokens created on PumpFun with market cap and dev wallet analytics
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor Solana tokens and trading activity in real-time
          </p>
        </div>
        
        <div className="hidden md:block">
          <SolPriceDisplay 
            price={solPrice} 
            previousPrice={prevSolPrice}
            isLarge={true}
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-grow">
          {onSearch && (
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, symbol or address..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          )}
          
          {onSort && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter size={14} />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSort('newest')}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSort('marketCap')}>
                  Highest Market Cap
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSort('priceChange')}>
                  Highest Price Change
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSort('devValue')}>
                  Highest Dev Value
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-row md:flex-col gap-2 md:gap-1">
            <StatusIndicator 
              status={pumpStatus} 
              label="PumpFun" 
              className="text-xs" 
            />
            <StatusIndicator 
              status={pythStatus} 
              label="Pyth" 
              className="text-xs" 
            />
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="h-10 w-10"
                >
                  <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
