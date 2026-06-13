import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function PriceCard({ symbol, name, price, change, sparkline, onClick }) {
  const isPositive = change >= 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-lg">{symbol}</span>
            <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change).toFixed(2)}%
            </span>
          </div>
          <p className="text-gray-400 text-xs">{name}</p>
        </div>
      </div>
      <div className="text-white text-2xl font-bold mb-2">
        ${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      {sparkline && sparkline.length > 0 && (
        <svg className="w-full h-8" viewBox={`0 0 ${sparkline.length} 40`} preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={isPositive ? "#4ade80" : "#f87171"}
            strokeWidth="2"
            points={sparkline.map((price, i) => `${i},${40 - (price / Math.max(...sparkline)) * 30}`).join(' ')}
          />
        </svg>
      )}
    </motion.div>
  );
}