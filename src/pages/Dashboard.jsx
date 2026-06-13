import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QuickTrade from "../components/trading/QuickTrade";
import PortfolioOverview from "../components/trading/PortfolioOverview";
import MarketTicker from "../components/trading/MarketTicker";
import PriceCard from "../components/trading/PriceCard";
import TransactionHistory from "../components/trading/TransactionHistory";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Initialize portfolio with $10,000 USD if new user
        const portfolio = await base44.entities.Portfolio.filter({ user_email: currentUser.email });
        if (portfolio.length === 0) {
          await base44.entities.Portfolio.create({
            user_email: currentUser.email,
            symbol: "USD",
            amount: 10000,
            average_buy_price: 1
          });
          queryClient.invalidateQueries(['portfolio']);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    fetchUser();
  }, []);

  // Fetch live prices
  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Get current cryptocurrency prices for BTC, ETH, SOL, BNB, XRP, ADA, DOGE, DOT, MATIC, AVAX in USD. 
        Also include 24h price change percentage for each.
        Return prices with reasonable precision (2-6 decimals depending on price).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            BTC: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            ETH: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            SOL: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            BNB: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            XRP: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            ADA: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            DOGE: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            DOT: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            MATIC: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            AVAX: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            USD: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } },
            USDT: { type: "object", properties: { price: { type: "number" }, change: { type: "number" } } }
          }
        }
      });
      
      // Ensure USD and USDT are set correctly
      response.USD = { price: 1, change: 0 };
      response.USDT = { price: 1, change: 0 };
      
      setPrices(response);
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Get portfolio
  const { data: portfolio = [], refetch: refetchPortfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Portfolio.filter({ user_email: user.email });
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  // Get transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Transaction.filter({ user_email: user.email }, '-created_date', 20);
    },
    enabled: !!user
  });

  // Calculate portfolio value
  const calculatePortfolioValue = () => {
    let total = 0;
    portfolio.forEach(asset => {
      const price = prices[asset.symbol]?.price || 0;
      total += asset.amount * price;
    });
    return total;
  };

  const totalValue = calculatePortfolioValue();
  
  // Calculate 24h change (simplified)
  const calculate24hChange = () => {
    let weightedChange = 0;
    let totalWeight = 0;
    
    portfolio.forEach(asset => {
      const price = prices[asset.symbol]?.price || 0;
      const change = prices[asset.symbol]?.change || 0;
      const weight = asset.amount * price;
      weightedChange += change * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedChange / totalWeight : 0;
  };

  const change24h = calculate24hChange();

  const topMarkets = [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "BNB", name: "BNB" },
    { symbol: "XRP", name: "Ripple" },
    { symbol: "ADA", name: "Cardano" }
  ];

  const handleTradeComplete = () => {
    refetchPortfolio();
    queryClient.invalidateQueries(['transactions']);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <MarketTicker prices={prices} loading={loading} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">CryptoVault</h1>
            <p className="text-gray-400">Trade cryptocurrencies with zero fees</p>
          </div>
          <Button
            onClick={fetchPrices}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Prices
          </Button>
        </div>

        <PortfolioOverview
          totalValue={totalValue}
          change24h={change24h}
          holdings={portfolio.length}
          loading={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">Live Markets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topMarkets.map(market => (
                <PriceCard
                  key={market.symbol}
                  symbol={market.symbol}
                  name={market.name}
                  price={prices[market.symbol]?.price}
                  change={prices[market.symbol]?.change || 0}
                />
              ))}
            </div>
          </div>

          <div>
            <QuickTrade prices={prices} onTradeComplete={handleTradeComplete} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionHistory transactions={transactions} />
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white text-xl font-bold mb-4">Your Holdings</h3>
            {portfolio.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No holdings yet. Start trading!</p>
            ) : (
              <div className="space-y-3">
                {portfolio.map(asset => {
                  const currentPrice = prices[asset.symbol]?.price || 0;
                  const value = asset.amount * currentPrice;
                  const profitLoss = ((currentPrice - asset.average_buy_price) / asset.average_buy_price) * 100;
                  
                  return (
                    <div key={asset.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-lg">{asset.symbol}</span>
                        <span className="text-white font-bold">
                          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{asset.amount.toFixed(6)} {asset.symbol}</span>
                        <span className={profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}