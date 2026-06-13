import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const TRADING_PAIRS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "SOL", name: "Solana", icon: "◎" },
  { symbol: "USDT", name: "Tether", icon: "$" },
  { symbol: "USD", name: "US Dollar", icon: "$" }
];

export default function QuickTrade({ prices, onTradeComplete }) {
  const [fromToken, setFromToken] = useState("BTC");
  const [toToken, setToToken] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (fromAmount && prices[fromToken] && prices[toToken]) {
      const fromValue = parseFloat(fromAmount) * prices[fromToken];
      const calculatedToAmount = fromValue / prices[toToken];
      setToAmount(calculatedToAmount.toFixed(6));
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken, prices]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  const handleExecuteTrade = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!toAmount || parseFloat(toAmount) <= 0 || isNaN(parseFloat(toAmount))) {
      alert("Cannot calculate trade amount. Please wait for prices to load.");
      return;
    }

    if (!prices[fromToken] || !prices[toToken]) {
      alert("Price data not available. Please wait.");
      return;
    }

    setIsExecuting(true);
    try {
      const user = await base44.auth.me();
      
      // Get user's portfolio
      const portfolio = await base44.entities.Portfolio.filter({ user_email: user.email });
      const fromAsset = portfolio.find(p => p.symbol === fromToken);
      
      // Check if user has enough balance
      if (fromToken !== "USD" && (!fromAsset || fromAsset.amount < parseFloat(fromAmount))) {
        alert(`Insufficient ${fromToken} balance`);
        setIsExecuting(false);
        return;
      }

      const fee = parseFloat(fromAmount) * 0.001; // 0.1% fee
      const netFromAmount = parseFloat(fromAmount) - fee;
      const finalToAmount = parseFloat(toAmount);
      const finalPrice = prices[toToken];

      // Create transaction
      await base44.entities.Transaction.create({
        user_email: user.email,
        type: "swap",
        from_symbol: fromToken,
        to_symbol: toToken,
        from_amount: parseFloat(fromAmount),
        to_amount: finalToAmount,
        price: finalPrice,
        fee: fee,
        status: "completed"
      });

      // Update portfolio - deduct from source
      if (fromAsset) {
        if (fromAsset.amount <= parseFloat(fromAmount)) {
          await base44.entities.Portfolio.delete(fromAsset.id);
        } else {
          await base44.entities.Portfolio.update(fromAsset.id, {
            amount: fromAsset.amount - parseFloat(fromAmount)
          });
        }
      }

      // Update portfolio - add to destination
      const toAsset = portfolio.find(p => p.symbol === toToken);
      if (toAsset) {
        const newAmount = toAsset.amount + parseFloat(toAmount);
        const newAvgPrice = ((toAsset.average_buy_price * toAsset.amount) + (prices[toToken] * parseFloat(toAmount))) / newAmount;
        await base44.entities.Portfolio.update(toAsset.id, {
          amount: newAmount,
          average_buy_price: newAvgPrice
        });
      } else {
        await base44.entities.Portfolio.create({
          user_email: user.email,
          symbol: toToken,
          amount: parseFloat(toAmount),
          average_buy_price: prices[toToken]
        });
      }

      setFromAmount("");
      setToAmount("");
      if (onTradeComplete) onTradeComplete();
      
      alert("Trade executed successfully!");
    } catch (error) {
      alert("Trade failed: " + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const networkFee = fromAmount ? (parseFloat(fromAmount) * 0.001).toFixed(6) : "0";

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-white text-xl font-bold">Quick Trade</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl p-4">
          <label className="text-gray-400 text-sm mb-2 block">From</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white text-xl"
            />
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADING_PAIRS.map(pair => (
                  <SelectItem key={pair.symbol} value={pair.symbol}>
                    {pair.icon} {pair.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fromAmount && prices[fromToken] && (
            <p className="text-gray-400 text-sm mt-2">
              ≈ ${(parseFloat(fromAmount) * prices[fromToken]).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleSwapTokens}
            variant="ghost"
            size="icon"
            className="rounded-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ArrowDownUp className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <label className="text-gray-400 text-sm mb-2 block">To</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={toAmount}
              readOnly
              className="flex-1 bg-white/10 border-white/20 text-white text-xl"
            />
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRADING_PAIRS.map(pair => (
                  <SelectItem key={pair.symbol} value={pair.symbol}>
                    {pair.icon} {pair.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {toAmount && prices[toToken] && (
            <p className="text-gray-400 text-sm mt-2">
              ≈ ${(parseFloat(toAmount) * prices[toToken]).toLocaleString()}
            </p>
          )}
        </div>

        <div className="bg-white/5 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Network Fee (0.1%)</span>
            <span className="text-white">{networkFee} {fromToken}</span>
          </div>
          {prices[fromToken] && prices[toToken] && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rate</span>
              <span className="text-white">
                1 {fromToken} = {(prices[fromToken] / prices[toToken]).toFixed(6)} {toToken}
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleExecuteTrade}
          disabled={isExecuting || !fromAmount}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg"
        >
          {isExecuting ? "Executing..." : "Execute Trade"}
        </Button>
      </div>
    </div>
  );
}