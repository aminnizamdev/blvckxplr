import React from 'react';
import { TokenData, TokenTransaction } from '@/types/token';
import { 
  WebSocketConnection, 
  PUMP_WS, 
  PYTH_WS, 
  SOL_FEED_ID, 
  ConnectionStatus 
} from '@/services/WebSocketService';

const LARGE_TRANSACTION_THRESHOLD = 1000;
const MAX_TRANSACTIONS = 20;
const MAX_TOKENS_DISPLAYED = 20; // Maximum tokens to display
const TOKEN_INACTIVE_THRESHOLD = 300000; // 5 minutes in milliseconds
const MAX_PRICE_HISTORY = 30; // Maximum number of price points to keep (30 minutes)
const RECONNECT_INTERVAL = 10000; // 10 seconds between reconnection attempts

export const useLiveData = () => {
  const [solPrice, setSolPrice] = React.useState<number | null>(null);
  const [prevSolPrice, setPrevSolPrice] = React.useState<number | null>(null);
  const [solPriceHistory, setSolPriceHistory] = React.useState<{time: Date, price: number, isIncrease: boolean}[]>([]);
  const [tokens, setTokens] = React.useState<TokenData[]>([]);
  const [pythStatus, setPythStatus] = React.useState<ConnectionStatus>('connecting');
  const [pumpStatus, setPumpStatus] = React.useState<ConnectionStatus>('connecting');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [largeTransactions, setLargeTransactions] = React.useState<TokenTransaction[]>([]);
  
  const pythWsRef = React.useRef<WebSocketConnection | null>(null);
  const pumpWsRef = React.useRef<WebSocketConnection | null>(null);
  
  const tokensMapRef = React.useRef<Map<string, TokenData>>(new Map());
  
  React.useEffect(() => {
    pythWsRef.current = new WebSocketConnection(
      PYTH_WS,
      {
        onOpen: () => {
          setPythStatus('connected');
          
          pythWsRef.current?.send({
            type: "subscribe",
            ids: [SOL_FEED_ID]
          });
        },
        onMessage: (data) => {
          if (data?.type === "price_update") {
            const p = data.price_feed.price;
            const newPrice = Number(p.price) * (10 ** Number(p.expo));
            
            setPrevSolPrice(solPrice);
            setSolPrice(newPrice);
            
            setSolPriceHistory(prev => {
              const isIncrease = prev.length > 0 ? newPrice > prev[prev.length - 1].price : true;
              const newHistory = [...prev, {
                time: new Date(), 
                price: newPrice,
                isIncrease
              }];
              
              if (newHistory.length > MAX_PRICE_HISTORY) {
                return newHistory.slice(newHistory.length - MAX_PRICE_HISTORY);
              }
              return newHistory;
            });
            
            updateTokenUsdValues(newPrice);
          }
        },
        onClose: () => {
          setPythStatus('disconnected');
        },
        onError: () => {
          setPythStatus('disconnected');
        }
      },
      RECONNECT_INTERVAL
    );
    
    pumpWsRef.current = new WebSocketConnection(
      PUMP_WS,
      {
        onOpen: () => {
          setPumpStatus('connected');
          
          pumpWsRef.current?.send({
            method: "subscribeNewToken"
          });
        },
        onMessage: (data) => {
          if (data?.txType === "create") {
            const mint = data.mint;
            
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
              devValueUsd: 0,
              estTokenPriceSol: (data.marketCapSol || 0) / (data.vTokensInBondingCurve || 1000000000),
              estTokenPriceUsd: 0,
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
            
            if (solPrice) {
              newToken.marketCapUsd = newToken.marketCapSol * solPrice;
              newToken.devValueUsd = newToken.devValueSol * solPrice;
              newToken.estTokenPriceUsd = newToken.estTokenPriceSol * solPrice;
            }
            
            tokensMapRef.current.set(mint, newToken);
            
            setTokens(Array.from(tokensMapRef.current.values()));
            
            pumpWsRef.current?.send({
              method: "subscribeTokenTrade",
              keys: [mint]
            });
          } else if (data?.txType === "buy" || data?.txType === "sell") {
            const mint = data.mint;
            const token = tokensMapRef.current.get(mint);
            
            if (token) {
              const updatedToken: TokenData = {
                ...token,
                prevMarketCapSol: token.marketCapSol,
                prevMarketCapUsd: token.marketCapUsd,
                prevDevBalance: token.devBalance,
                prevDevValueSol: token.devValueSol,
                prevDevValueUsd: token.devValueUsd,
                prevEstTokenPriceSol: token.estTokenPriceSol,
                prevEstTokenPriceUsd: token.estTokenPriceUsd,
                marketCapSol: data.marketCapSol,
                signature: data.signature,
                lastUpdate: Date.now()
              };
              
              if (data.traderPublicKey === token.creator) {
                updatedToken.devBalance = data.newTokenBalance;
                updatedToken.hasDevActivity = true;
              }
              
              updatedToken.estTokenPriceSol = updatedToken.marketCapSol / updatedToken.vTokensInBondingCurve;
              updatedToken.devValueSol = updatedToken.devBalance * updatedToken.estTokenPriceSol;
              
              if (solPrice) {
                updatedToken.marketCapUsd = updatedToken.marketCapSol * solPrice;
                updatedToken.devValueUsd = updatedToken.devValueSol * solPrice;
                updatedToken.estTokenPriceUsd = updatedToken.estTokenPriceSol * solPrice;
              }
              
              tokensMapRef.current.set(mint, updatedToken);
              
              setTokens(Array.from(tokensMapRef.current.values()));
              
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
        },
        onError: () => {
          setPumpStatus('disconnected');
        }
      },
      RECONNECT_INTERVAL
    );
    
    pythWsRef.current.connect();
    pumpWsRef.current.connect();
    
    if (solPriceHistory.length === 0 && solPrice) {
      const initialHistory = [];
      const now = new Date();
      
      for (let i = 0; i < MAX_PRICE_HISTORY; i++) {
        const time = new Date(now.getTime() - (MAX_PRICE_HISTORY - 1 - i) * 60000);
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
    
    return () => {
      if (pythWsRef.current) {
        pythWsRef.current.disconnect();
      }
      if (pumpWsRef.current) {
        pumpWsRef.current.disconnect();
      }
    };
  }, [solPrice, solPriceHistory.length]);
  
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
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    if (pythStatus === 'disconnected' && pythWsRef.current) {
      pythWsRef.current.resetConnection();
    }
    
    if (pumpStatus === 'disconnected' && pumpWsRef.current) {
      pumpWsRef.current.resetConnection();
    }
    
    if (solPrice) {
      updateTokenUsdValues(solPrice);
    }
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  const getLargeTransactions = () => {
    const buyTransactions = largeTransactions.filter(tx => tx.type === 'buy');
    const sellTransactions = largeTransactions.filter(tx => tx.type === 'sell');
    
    return { buyTransactions, sellTransactions };
  };
  
  const getFormattedPriceHistory = () => {
    return solPriceHistory.map((item, index) => ({
      time: item.time,
      timeFormatted: item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: item.price,
      increase: item.isIncrease,
      volume: Math.round(100 + Math.random() * 500)
    }));
  };
  
  const getFilteredTokens = (): TokenData[] => {
    const now = Date.now();
    const allTokens = Array.from(tokensMapRef.current.values());
    
    const activeTokens = allTokens.filter(token => {
      const lastActivity = token.lastUpdate || token.timestamp;
      return (now - lastActivity) < TOKEN_INACTIVE_THRESHOLD;
    });
    
    const nonRuggedTokens = activeTokens.filter(token => {
      if (!token.prevDevBalance || token.prevDevBalance === 0) return true;
      if (token.devBalance < token.prevDevBalance * 0.3) return false;
      return true;
    });
    
    return nonRuggedTokens
      .sort((a, b) => b.marketCapSol - a.marketCapSol)
      .slice(0, MAX_TOKENS_DISPLAYED);
  };
  
  return {
    solPrice,
    prevSolPrice,
    solPriceHistory: getFormattedPriceHistory(),
    tokens: getFilteredTokens(),
    pythStatus,
    pumpStatus,
    isRefreshing,
    handleRefresh,
    largeTransactions,
    getLargeTransactions,
    largeTransactionThreshold: LARGE_TRANSACTION_THRESHOLD
  };
};
