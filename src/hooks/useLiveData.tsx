import React from 'react';
import { TokenData, TokenTransaction } from '@/types/token';
import { 
  WebSocketConnection, 
  PUMP_WS, 
  PYTH_WS, 
  SOL_FEED_ID, 
  ConnectionStatus 
} from '@/services/WebSocketService';
import { useToast } from '@/hooks/use-toast';

const LARGE_TRANSACTION_THRESHOLD = 1000;
const MAX_TRANSACTIONS = 20;
const MAX_PRICE_HISTORY = 30; // Maximum number of price points to keep (30 minutes)

export const useLiveData = () => {
  const { toast } = useToast();
  const [solPrice, setSolPrice] = React.useState<number | null>(null);
  const [prevSolPrice, setPrevSolPrice] = React.useState<number | null>(null);
  const [solPriceHistory, setSolPriceHistory] = React.useState<{time: Date, price: number, isIncrease: boolean}[]>([]);
  const [tokens, setTokens] = React.useState<TokenData[]>([]);
  const [pythStatus, setPythStatus] = React.useState<ConnectionStatus>('connecting');
  const [pumpStatus, setPumpStatus] = React.useState<ConnectionStatus>('connecting');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [largeTransactions, setLargeTransactions] = React.useState<TokenTransaction[]>([]);
  
  // References to store WebSocket connections
  const pythWsRef = React.useRef<WebSocketConnection | null>(null);
  const pumpWsRef = React.useRef<WebSocketConnection | null>(null);
  
  // Store tokens in a more accessible format for updates
  const tokensMapRef = React.useRef<Map<string, TokenData>>(new Map());
  
  // Initialize WebSocket connections
  React.useEffect(() => {
    // Initialize Pyth WebSocket for SOL price
    pythWsRef.current = new WebSocketConnection(
      PYTH_WS,
      {
        onOpen: () => {
          setPythStatus('connected');
          
          // Subscribe to SOL/USD price feed
          pythWsRef.current?.send({
            type: "subscribe",
            ids: [SOL_FEED_ID]
          });
          
          toast({
            title: "Connected to Pyth",
            description: "Receiving real-time SOL price data",
          });
        },
        onMessage: (data) => {
          // Process price updates from Pyth
          if (data?.type === "price_update") {
            const p = data.price_feed.price;
            const newPrice = Number(p.price) * (10 ** Number(p.expo));
            
            setPrevSolPrice(solPrice);
            setSolPrice(newPrice);
            
            // Add to price history with the isIncrease flag
            setSolPriceHistory(prev => {
              const isIncrease = prev.length > 0 ? newPrice > prev[prev.length - 1].price : true;
              const newHistory = [...prev, {
                time: new Date(), 
                price: newPrice,
                isIncrease
              }];
              
              // Keep only the most recent MAX_PRICE_HISTORY data points
              if (newHistory.length > MAX_PRICE_HISTORY) {
                return newHistory.slice(newHistory.length - MAX_PRICE_HISTORY);
              }
              return newHistory;
            });
            
            // Update USD values for all tokens when SOL price changes
            updateTokenUsdValues(newPrice);
          }
        },
        onClose: () => {
          setPythStatus('disconnected');
          toast({
            title: "Disconnected from Pyth",
            description: "SOL price updates paused",
            variant: "destructive",
          });
        },
        onError: () => {
          setPythStatus('disconnected');
        }
      }
    );
    
    // Initialize PumpFun WebSocket for token data
    pumpWsRef.current = new WebSocketConnection(
      PUMP_WS,
      {
        onOpen: () => {
          setPumpStatus('connected');
          
          // Subscribe to new token events
          pumpWsRef.current?.send({
            method: "subscribeNewToken"
          });
          
          toast({
            title: "Connected to PumpFun",
            description: "Receiving real-time token data",
          });
        },
        onMessage: (data) => {
          if (data?.txType === "create") {
            // Handle new token creation
            const mint = data.mint;
            
            // Create new token object
            const newToken: TokenData = {
              name: data.name,
              symbol: data.symbol,
              mint: mint,
              signature: data.signature,
              creator: data.traderPublicKey,
              timestamp: Date.now(),
              createdAt: new Date().toISOString(),
              marketCapSol: data.marketCapSol || 0,
              marketCapUsd: (data.marketCapSol || 0) * (solPrice || 0),
              devBalance: data.initialBuy || 0,
              devValueSol: (data.initialBuy || 0) * ((data.marketCapSol || 0) / (data.vTokensInBondingCurve || 1000000000)),
              devValueUsd: 0, // Will be calculated
              estTokenPriceSol: (data.marketCapSol || 0) / (data.vTokensInBondingCurve || 1000000000),
              estTokenPriceUsd: 0, // Will be calculated
              vTokensInBondingCurve: data.vTokensInBondingCurve || 1000000000,
              prevMarketCapSol: null,
              prevMarketCapUsd: null,
              prevDevBalance: null,
              prevDevValueSol: null,
              prevDevValueUsd: null,
              prevEstTokenPriceSol: null,
              prevEstTokenPriceUsd: null,
              hasDevActivity: true,
              lastUpdate: Date.now()
            };
            
            // Calculate USD values
            if (solPrice) {
              newToken.marketCapUsd = newToken.marketCapSol * solPrice;
              newToken.devValueUsd = newToken.devValueSol * solPrice;
              newToken.estTokenPriceUsd = newToken.estTokenPriceSol * solPrice;
            }
            
            // Add to tokens map
            tokensMapRef.current.set(mint, newToken);
            
            // Update tokens state
            setTokens(Array.from(tokensMapRef.current.values()));
            
            // Subscribe to this token's trades
            pumpWsRef.current?.send({
              method: "subscribeTokenTrade",
              keys: [mint]
            });
            
            toast({
              title: "New token detected",
              description: `${data.name} (${data.symbol}) was just created`,
            });
          } else if (data?.txType === "buy" || data?.txType === "sell") {
            // Handle token trades
            const mint = data.mint;
            const token = tokensMapRef.current.get(mint);
            
            if (token) {
              // Store previous values for trend indicators
              const updatedToken: TokenData = {
                ...token,
                prevMarketCapSol: token.marketCapSol,
                prevMarketCapUsd: token.marketCapUsd,
                prevDevBalance: token.devBalance,
                prevDevValueSol: token.devValueSol,
                prevDevValueUsd: token.devValueUsd,
                prevEstTokenPriceSol: token.estTokenPriceSol,
                prevEstTokenPriceUsd: token.estTokenPriceUsd,
                // Update with new values
                marketCapSol: data.marketCapSol,
                signature: data.signature, // Update to latest transaction
                lastUpdate: Date.now()
              };
              
              // Update dev balance if it's a developer transaction
              if (data.traderPublicKey === token.creator) {
                updatedToken.devBalance = data.newTokenBalance;
                updatedToken.hasDevActivity = true;
              }
              
              // Recalculate dependent values
              updatedToken.estTokenPriceSol = updatedToken.marketCapSol / updatedToken.vTokensInBondingCurve;
              updatedToken.devValueSol = updatedToken.devBalance * updatedToken.estTokenPriceSol;
              
              // Update USD values
              if (solPrice) {
                updatedToken.marketCapUsd = updatedToken.marketCapSol * solPrice;
                updatedToken.devValueUsd = updatedToken.devValueSol * solPrice;
                updatedToken.estTokenPriceUsd = updatedToken.estTokenPriceSol * solPrice;
              }
              
              // Update token in map
              tokensMapRef.current.set(mint, updatedToken);
              
              // Update tokens state
              setTokens(Array.from(tokensMapRef.current.values()));
              
              // Track large transactions
              if (solPrice && (data.solAmount * solPrice > LARGE_TRANSACTION_THRESHOLD)) {
                const transaction: TokenTransaction = {
                  signature: data.signature,
                  tokenMint: mint,
                  tokenName: token.name,
                  tokenSymbol: token.symbol,
                  trader: data.traderPublicKey,
                  timestamp: Date.now(),
                  type: data.txType,
                  amountSol: data.solAmount,
                  valueUsd: data.solAmount * solPrice,
                  isDeveloper: data.traderPublicKey === token.creator
                };
                
                setLargeTransactions(prev => {
                  const newTransactions = [transaction, ...prev].slice(0, MAX_TRANSACTIONS);
                  return newTransactions;
                });
              }
            }
          }
        },
        onClose: () => {
          setPumpStatus('disconnected');
          toast({
            title: "Disconnected from PumpFun",
            description: "Token data updates paused",
            variant: "destructive",
          });
        },
        onError: () => {
          setPumpStatus('disconnected');
        }
      }
    );
    
    // Connect to WebSockets
    pythWsRef.current.connect();
    pumpWsRef.current.connect();
    
    // Simulate initial price history if none exists yet
    // This will be replaced by real data as it comes in
    if (solPriceHistory.length === 0 && solPrice) {
      const initialHistory = [];
      const now = new Date();
      
      for (let i = 0; i < MAX_PRICE_HISTORY; i++) {
        const time = new Date(now.getTime() - (MAX_PRICE_HISTORY - 1 - i) * 60000);
        // Small random variation around current price
        const variation = 0.9995 + (Math.random() * 0.001);
        const price = solPrice * variation;
        const isIncrease = i > 0 ? price > initialHistory[i-1].price : true;
        
        initialHistory.push({
          time,
          price,
          isIncrease
        });
      }
      
      setSolPriceHistory(initialHistory);
    }
    
    // Cleanup on unmount
    return () => {
      if (pythWsRef.current) {
        pythWsRef.current.disconnect();
      }
      if (pumpWsRef.current) {
        pumpWsRef.current.disconnect();
      }
    };
  }, [solPrice, toast]); // Added solPrice as dependency
  
  // Helper function to update USD values when SOL price changes
  const updateTokenUsdValues = (newSolPrice: number) => {
    if (!newSolPrice) return;
    
    tokensMapRef.current.forEach((token, mint) => {
      const updatedToken = {
        ...token,
        marketCapUsd: token.marketCapSol * newSolPrice,
        devValueUsd: token.devValueSol * newSolPrice,
        estTokenPriceUsd: token.estTokenPriceSol * newSolPrice
      };
      
      tokensMapRef.current.set(mint, updatedToken);
    });
    
    setTokens(Array.from(tokensMapRef.current.values()));
  };
  
  // Manual refresh function (will reconnect sockets if disconnected)
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Reconnect WebSockets if disconnected
    if (pythStatus === 'disconnected' && pythWsRef.current) {
      pythWsRef.current.connect();
    }
    
    if (pumpStatus === 'disconnected' && pumpWsRef.current) {
      pumpWsRef.current.connect();
    }
    
    // Force an update of token values
    if (solPrice) {
      updateTokenUsdValues(solPrice);
    }
    
    // Simulate a brief loading state
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: `Last update: ${new Date().toLocaleTimeString()}`,
      });
    }, 1000);
  };
  
  // Get filtered large transactions
  const getLargeTransactions = () => {
    const buyTransactions = largeTransactions.filter(tx => tx.type === 'buy');
    const sellTransactions = largeTransactions.filter(tx => tx.type === 'sell');
    
    return { buyTransactions, sellTransactions };
  };
  
  // Format price history for chart display
  const getFormattedPriceHistory = () => {
    return solPriceHistory.map((item, index) => ({
      time: item.time,
      timeFormatted: item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: item.price,
      increase: item.isIncrease,
      // Add random volume data for display purposes
      volume: Math.round(100 + Math.random() * 500)
    }));
  };
  
  return {
    solPrice,
    prevSolPrice,
    solPriceHistory: getFormattedPriceHistory(),
    tokens,
    pythStatus,
    pumpStatus,
    isRefreshing,
    handleRefresh,
    largeTransactions,
    getLargeTransactions,
    largeTransactionThreshold: LARGE_TRANSACTION_THRESHOLD
  };
};
