import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { motion } from "framer-motion";

export default function Portfolio() {
  const [prices, setPrices] = useState({});
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

  const fetchPrices = async () => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Get current cryptocurrency prices for BTC, ETH, SOL, BNB, XRP, ADA, DOGE, DOT, MATIC, AVAX, USD, USDT. Include 24h change.`,
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
      response.USD = { price: 1, change: 0 };
      response.USDT = { price: 1, change: 0 };
      setPrices(response);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Portfolio.filter({ user_email: user.email });
    },
    enabled: !!user
  });

  const calculatePortfolioMetrics = () => {
    let totalValue = 0;
    let totalCost = 0;
    
    portfolio.forEach(asset => {
      const currentPrice = prices[asset.symbol]?.price || 0;
      const value = asset.amount * currentPrice;
      const cost = asset.amount * asset.average_buy_price;
      totalValue += value;
      totalCost += cost;
    });

    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    return { totalValue, totalCost, totalPnL, totalPnLPercent };
  };

  const metrics = calculatePortfolioMetrics();

  const portfolioData = portfolio.map(asset => {
    const currentPrice = prices[asset.symbol]?.price || 0;
    const value = asset.amount * currentPrice;
    return {
      name: asset.symbol,
      value: value
    };
  }).filter(item => item.value > 0);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Portfolio</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">Total Value</span>
            </div>
            <div className="text-white text-3xl font-bold">
              ${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Total Cost</span>
            </div>
            <div className="text-white text-3xl font-bold">
              ${metrics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-gradient-to-br ${metrics.totalPnL >= 0 ? 'from-green-600/20 to-emerald-600/20' : 'from-red-600/20 to-rose-600/20'} backdrop-blur-xl border border-white/20 rounded-xl p-6`}
          >
            <div className="flex items-center gap-2 mb-2">
              {metrics.totalPnL >= 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
              <span className="text-gray-400 text-sm">Total P&L</span>
            </div>
            <div className={`text-3xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.totalPnL >= 0 ? '+' : ''}${Math.abs(metrics.totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-gradient-to-br ${metrics.totalPnLPercent >= 0 ? 'from-green-600/20 to-emerald-600/20' : 'from-red-600/20 to-rose-600/20'} backdrop-blur-xl border border-white/20 rounded-xl p-6`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 text-sm">Return</span>
            </div>
            <div className={`text-3xl font-bold ${metrics.totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.totalPnLPercent >= 0 ? '+' : ''}{metrics.totalPnLPercent.toFixed(2)}%
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white text-xl font-bold mb-4">Portfolio Allocation</h3>
            {portfolioData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-20">No holdings yet</p>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white text-xl font-bold mb-4">Holdings Details</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {portfolio.map(asset => {
                const currentPrice = prices[asset.symbol]?.price || 0;
                const value = asset.amount * currentPrice;
                const cost = asset.amount * asset.average_buy_price;
                const pnl = value - cost;
                const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

                return (
                  <div key={asset.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-semibold text-lg">{asset.symbol}</div>
                        <div className="text-gray-400 text-sm">{asset.amount.toFixed(6)} coins</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className={`text-sm ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Avg: ${asset.average_buy_price.toFixed(2)}</span>
                      <span>Current: ${currentPrice.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}