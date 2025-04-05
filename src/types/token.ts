
export interface TokenData {
  // Token info
  name: string;
  symbol: string;
  mint: string;
  signature: string;
  creator: string;
  timestamp: number;
  createdAt: string;
  
  // Current values
  marketCapSol: number;
  marketCapUsd: number;
  devBalance: number;
  devValueSol: number;
  devValueUsd: number;
  estTokenPriceSol: number;
  estTokenPriceUsd: number;
  vTokensInBondingCurve: number;
  
  // Previous values for trends
  prevMarketCapSol: number | null;
  prevMarketCapUsd: number | null;
  prevDevBalance: number | null;
  prevDevValueSol: number | null;
  prevDevValueUsd: number | null;
  prevEstTokenPriceSol: number | null;
  prevEstTokenPriceUsd: number | null;
  
  // Status indicators
  hasDevActivity: boolean;
  lastUpdate: number;
}
