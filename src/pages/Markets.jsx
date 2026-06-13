import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export default function Markets() {
  const [prices, setPrices] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, gainers, losers
  const [category, setCategory] = useState("all"); // all, defi, layer1, meme
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Watchlist.filter({ user_email: user.email });
    },
    enabled: !!user
  });

  const fetchPrices = async () => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Get current cryptocurrency prices and 24h changes for: BTC, ETH, SOL, BNB, XRP, ADA, DOGE, DOT, MATIC, AVAX, LINK, UNI, ATOM, LTC, BCH, FIL, APT, ARB, OP, IMX.
        Return price, 24h change %, market cap, and 24h volume for each.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            coins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  symbol: { type: "string" },
                  name: { type: "string" },
                  price: { type: "number" },
                  change: { type: "number" },
                  market_cap: { type: "number" },
                  volume_24h: { type: "number" }
                }
              }
            }
          }
        }
      });
      
      const priceMap = {};
      response.coins.forEach(coin => {
        priceMap[coin.symbol] = coin;
      });
      setPrices(priceMap);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToWatchlist = async (symbol, name) => {
    try {
      const exists = watchlist.find(w => w.symbol === symbol);
      if (exists) {
        await base44.entities.Watchlist.delete(exists.id);
      } else {
        await base44.entities.Watchlist.create({
          user_email: user.email,
          symbol,
          name
        });
      }
    } catch (error) {
      alert("Error updating watchlist: " + error.message);
    }
  };

  const categoryMap = {
    layer1: ["BTC", "ETH", "SOL", "DOT", "AVAX", "ATOM", "ADA"],
    defi: ["UNI", "LINK", "MATIC", "ARB", "OP"],
    meme: ["DOGE"],
    stablecoin: ["USDT"],
    exchange: ["BNB"]
  };

  const coins = Object.values(prices);
  
  const filteredCoins = coins.filter(coin => {
    const matchesSearch = coin.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         coin.symbol?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (category !== "all") {
      matchesCategory = categoryMap[category]?.includes(coin.symbol);
    }
    
    let matchesFilter = true;
    if (filter === "gainers") matchesFilter = coin.change > 0;
    if (filter === "losers") matchesFilter = coin.change < 0;
    
    return matchesSearch && matchesCategory && matchesFilter;
  }).sort((a, b) => b.market_cap - a.market_cap);

  const isInWatchlist = (symbol) => watchlist.some(w => w.symbol === symbol);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Markets</h1>
          <p className="text-gray-400">Explore and track cryptocurrency prices</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter("all")}
                variant={filter === "all" ? "default" : "outline"}
                className={filter === "all" ? "bg-purple-600" : "bg-white/10 border-white/20 text-white"}
              >
                All
              </Button>
              <Button
                onClick={() => setFilter("gainers")}
                variant={filter === "gainers" ? "default" : "outline"}
                className={filter === "gainers" ? "bg-green-600" : "bg-white/10 border-white/20 text-white"}
              >
                Gainers
              </Button>
              <Button
                onClick={() => setFilter("losers")}
                variant={filter === "losers" ? "default" : "outline"}
                className={filter === "losers" ? "bg-red-600" : "bg-white/10 border-white/20 text-white"}
              >
                Losers
              </Button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <span>Category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setCategory("all")}
                size="sm"
                variant={category === "all" ? "default" : "outline"}
                className={category === "all" ? "bg-purple-600" : "bg-white/10 border-white/20 text-white"}
              >
                All Markets
              </Button>
              <Button
                onClick={() => setCategory("layer1")}
                size="sm"
                variant={category === "layer1" ? "default" : "outline"}
                className={category === "layer1" ? "bg-blue-600" : "bg-white/10 border-white/20 text-white"}
              >
                Layer 1
              </Button>
              <Button
                onClick={() => setCategory("defi")}
                size="sm"
                variant={category === "defi" ? "default" : "outline"}
                className={category === "defi" ? "bg-green-600" : "bg-white/10 border-white/20 text-white"}
              >
                DeFi
              </Button>
              <Button
                onClick={() => setCategory("meme")}
                size="sm"
                variant={category === "meme" ? "default" : "outline"}
                className={category === "meme" ? "bg-orange-600" : "bg-white/10 border-white/20 text-white"}
              >
                Meme
              </Button>
              <Button
                onClick={() => setCategory("exchange")}
                size="sm"
                variant={category === "exchange" ? "default" : "outline"}
                className={category === "exchange" ? "bg-yellow-600" : "bg-white/10 border-white/20 text-white"}
              >
                Exchange Tokens
              </Button>
              <Button
                onClick={() => setCategory("stablecoin")}
                size="sm"
                variant={category === "stablecoin" ? "default" : "outline"}
                className={category === "stablecoin" ? "bg-gray-600" : "bg-white/10 border-white/20 text-white"}
              >
                Stablecoins
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">#</th>
                  <th className="px-6 py-4 text-left text-gray-400 font-semibold text-sm">Name</th>
                  <th className="px-6 py-4 text-right text-gray-400 font-semibold text-sm">Price</th>
                  <th className="px-6 py-4 text-right text-gray-400 font-semibold text-sm">24h Change</th>
                  <th className="px-6 py-4 text-right text-gray-400 font-semibold text-sm">Market Cap</th>
                  <th className="px-6 py-4 text-right text-gray-400 font-semibold text-sm">Volume (24h)</th>
                  <th className="px-6 py-4 text-center text-gray-400 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoins.map((coin, index) => {
                  const isPositive = coin.change >= 0;
                  return (
                    <motion.tr
                      key={coin.symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-white">{coin.symbol}</div>
                          <div className="text-gray-400 text-sm">{coin.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-white font-semibold">
                        ${coin.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {isPositive ? '+' : ''}{coin.change?.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300">
                        ${(coin.market_cap / 1e9)?.toFixed(2)}B
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300">
                        ${(coin.volume_24h / 1e9)?.toFixed(2)}B
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          onClick={() => handleAddToWatchlist(coin.symbol, coin.name)}
                          variant="ghost"
                          size="icon"
                          className={isInWatchlist(coin.symbol) ? "text-yellow-400" : "text-gray-400"}
                        >
                          <Star className={`w-5 h-5 ${isInWatchlist(coin.symbol) ? 'fill-yellow-400' : ''}`} />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}