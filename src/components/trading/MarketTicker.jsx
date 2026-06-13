import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MarketTicker({ prices, loading }) {
  const topCoins = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA"];

  return (
    <div className="bg-black/40 backdrop-blur-md border-b border-white/10 py-3 overflow-hidden">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-8 whitespace-nowrap"
      >
        {[...topCoins, ...topCoins].map((symbol, index) => {
          const data = prices[symbol];
          if (!data) return null;
          
          const isPositive = data.change >= 0;
          
          return (
            <div key={`${symbol}-${index}`} className="flex items-center gap-3">
              <span className="text-white font-semibold">{symbol}</span>
              <span className="text-gray-400">
                ${data.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(data.change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}