import React from "react";
import { ArrowUpRight, ArrowDownLeft, Repeat } from "lucide-react";
import { format } from "date-fns";

export default function TransactionHistory({ transactions }) {
  const getIcon = (type) => {
    switch (type) {
      case "buy":
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case "sell":
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case "swap":
        return <Repeat className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-white text-xl font-bold mb-4">Recent Transactions</h3>
      
      {transactions.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 rounded-full p-2">
                    {getIcon(tx.type)}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {tx.type === "swap" 
                        ? `${tx.from_symbol} → ${tx.to_symbol}`
                        : `${tx.type.toUpperCase()} ${tx.to_symbol}`
                      }
                    </div>
                    <div className="text-gray-400 text-sm">
                      {format(new Date(tx.created_date), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {tx.from_amount.toFixed(6)} {tx.from_symbol}
                  </div>
                  <div className="text-green-400 text-sm">
                    +{tx.to_amount.toFixed(6)} {tx.to_symbol}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}