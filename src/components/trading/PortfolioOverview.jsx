import React from "react";
import { TrendingUp, Wallet, DollarSign, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function PortfolioOverview({ totalValue, change24h, holdings, loading }) {
  const isPositive = change24h >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-purple-400" />
          <span className="text-gray-400 text-sm">Total Balance</span>
        </div>
        <div className="text-white text-3xl font-bold">
          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <span className="text-gray-400 text-sm">24h Change</span>
        </div>
        <div className={`text-3xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{change24h.toFixed(2)}%
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-blue-400" />
          <span className="text-gray-400 text-sm">Holdings</span>
        </div>
        <div className="text-white text-3xl font-bold">
          {holdings}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-orange-400" />
          <span className="text-gray-400 text-sm">Status</span>
        </div>
        <div className="text-white text-3xl font-bold">
          {loading ? "Updating..." : "Live"}
        </div>
      </motion.div>
    </div>
  );
}