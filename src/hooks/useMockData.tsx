
import React from 'react';
import { TokenData } from '@/types/token';

// This hook simulates the data we would get from our WebSocket connections
export const useMockData = () => {
  const [solPrice, setSolPrice] = React.useState<number | null>(22.45);
  const [prevSolPrice, setPrevSolPrice] = React.useState<number | null>(21.98);
  const [tokens, setTokens] = React.useState<TokenData[]>([]);
  const [pythStatus, setPythStatus] = React.useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [pumpStatus, setPumpStatus] = React.useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Simulate WebSocket connections
  React.useEffect(() => {
    // Simulate Pyth connection
    const pythTimer = setTimeout(() => {
      setPythStatus('connected');
    }, 1500);
    
    // Simulate PumpFun connection
    const pumpTimer = setTimeout(() => {
      setPumpStatus('connected');
      generateMockTokens();
    }, 2000);
    
    return () => {
      clearTimeout(pythTimer);
      clearTimeout(pumpTimer);
    };
  }, []);
  
  // Function to generate mock token data
  const generateMockTokens = () => {
    const mockTokens: TokenData[] = [
      {
        name: "Diamond Hands",
        symbol: "DHAND",
        mint: "DHANDj1iWXXcY8EWcKHcHRMjqS6Mp5YXeH82LUmHVjd",
        signature: "4XE7c8aLZfkgQgK7TV8uQM6Z1Ha7q9YK6WZcmxfHtYJ6rCvkEcJYXTtQQJZYEZJeqvDiHc5zH89xeQHEkjpZ7jD2",
        creator: "BrJDCrspkZHD2gqbP4NbgGJZ9pKEBsy2uZEP1x93HM7D",
        timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
        marketCapSol: 7.82,
        marketCapUsd: 7.82 * (solPrice || 0),
        devBalance: 1000000,
        devValueSol: 3.21,
        devValueUsd: 3.21 * (solPrice || 0),
        estTokenPriceSol: 0.00000782,
        estTokenPriceUsd: 0.00000782 * (solPrice || 0),
        prevMarketCapSol: 7.45,
        prevMarketCapUsd: 7.45 * (prevSolPrice || 0),
        prevDevBalance: 1000000,
        prevDevValueSol: 3.05,
        prevDevValueUsd: 3.05 * (prevSolPrice || 0),
        prevEstTokenPriceSol: 0.00000745,
        prevEstTokenPriceUsd: 0.00000745 * (prevSolPrice || 0),
      },
      {
        name: "Moon Shot",
        symbol: "MOON",
        mint: "MOONHwwRThXiLLdZypdNs8dBaHJtQ8ByrNxLHHB8Jym",
        signature: "3cqvqA5sDcWK4BStVLygbTPHxTZ7RLGN2Wj9YYGRTvjWXaXLULn2AEZhJvVPSHykFcuSKAum8KpzrMaLMQp5FtGs",
        creator: "5mAQtYLQxvqFTPaMAcgV9BoNBNhQGXKPUeGcERPmPxb5",
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        marketCapSol: 15.43,
        marketCapUsd: 15.43 * (solPrice || 0),
        devBalance: 2500000,
        devValueSol: 9.67,
        devValueUsd: 9.67 * (solPrice || 0),
        estTokenPriceSol: 0.00001543,
        estTokenPriceUsd: 0.00001543 * (solPrice || 0),
        prevMarketCapSol: 14.89,
        prevMarketCapUsd: 14.89 * (prevSolPrice || 0),
        prevDevBalance: 2500000,
        prevDevValueSol: 9.32,
        prevDevValueUsd: 9.32 * (prevSolPrice || 0),
        prevEstTokenPriceSol: 0.00001489,
        prevEstTokenPriceUsd: 0.00001489 * (prevSolPrice || 0),
      },
      {
        name: "Solana Bulls",
        symbol: "BULL",
        mint: "BULLpRa9yiAQz1C2MzHUQbpFJ3a7fAzqDURDMdpL6W8K",
        signature: "4pWLGbq4LH6JqkGdea3NPgc1YTZCNa3Z8nvbMxbJvAbNkWRXECfRPYDcKGe3PgHZ4Zc8M7HV9M1s2fAhY6hFKh8a",
        creator: "6EeUDE1CaMJrn9QLvzcHvv73RA9uLMVXLMPCdxcY1Lw6",
        timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
        marketCapSol: 3.87,
        marketCapUsd: 3.87 * (solPrice || 0),
        devBalance: 750000,
        devValueSol: 1.93,
        devValueUsd: 1.93 * (solPrice || 0),
        estTokenPriceSol: 0.00000387,
        estTokenPriceUsd: 0.00000387 * (solPrice || 0),
        prevMarketCapSol: 4.12,
        prevMarketCapUsd: 4.12 * (prevSolPrice || 0),
        prevDevBalance: 750000,
        prevDevValueSol: 2.06,
        prevDevValueUsd: 2.06 * (prevSolPrice || 0),
        prevEstTokenPriceSol: 0.00000412,
        prevEstTokenPriceUsd: 0.00000412 * (prevSolPrice || 0),
      }
    ];
    
    setTokens(mockTokens);
  };
  
  // Simulate refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate price update
    setPrevSolPrice(solPrice);
    setSolPrice(prev => {
      if (!prev) return 22.45;
      // Random price change between -2% and +2%
      const change = prev * (0.98 + Math.random() * 0.04);
      return parseFloat(change.toFixed(2));
    });
    
    // Simulate token updates
    setTimeout(() => {
      setTokens(prev => prev.map(token => {
        // Update market cap with a random change
        const marketCapChange = token.marketCapSol * (0.97 + Math.random() * 0.06);
        const newMarketCapSol = parseFloat(marketCapChange.toFixed(2));
        const newMarketCapUsd = newMarketCapSol * (solPrice || 0);
        
        // Maybe update dev balance (50% chance)
        const updateDevBalance = Math.random() > 0.5;
        const newDevBalance = updateDevBalance 
          ? token.devBalance * (0.98 + Math.random() * 0.04)
          : token.devBalance;
          
        // Calculate new dev value
        const tokenPrice = newMarketCapSol / 1_000_000_000;
        const newDevValueSol = newDevBalance * tokenPrice;
        const newDevValueUsd = newDevValueSol * (solPrice || 0);
        
        // Calculate new token price
        const newEstTokenPriceSol = newMarketCapSol / 1_000_000_000;
        const newEstTokenPriceUsd = newEstTokenPriceSol * (solPrice || 0);
        
        return {
          ...token,
          prevMarketCapSol: token.marketCapSol,
          prevMarketCapUsd: token.marketCapUsd,
          prevDevBalance: token.devBalance,
          prevDevValueSol: token.devValueSol,
          prevDevValueUsd: token.devValueUsd,
          prevEstTokenPriceSol: token.estTokenPriceSol,
          prevEstTokenPriceUsd: token.estTokenPriceUsd,
          marketCapSol: newMarketCapSol,
          marketCapUsd: newMarketCapUsd,
          devBalance: newDevBalance,
          devValueSol: parseFloat(newDevValueSol.toFixed(4)),
          devValueUsd: newDevValueUsd,
          estTokenPriceSol: newEstTokenPriceSol,
          estTokenPriceUsd: newEstTokenPriceUsd,
        };
      }));
      
      setIsRefreshing(false);
    }, 1500);
  };
  
  return {
    solPrice,
    prevSolPrice,
    tokens,
    pythStatus,
    pumpStatus,
    isRefreshing,
    handleRefresh,
  };
};
