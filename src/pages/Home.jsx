import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Zap, Shield, TrendingUp, Wallet, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        setIsAuthenticated(authed);
        
        // If authenticated, redirect to dashboard
        if (authed) {
          window.location.href = createPageUrl("Dashboard");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Welcome to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">CryptoVault</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Trade cryptocurrencies with institutional-grade security. Start with $10,000 virtual balance.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-6 text-lg"
            >
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="bg-purple-600/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Instant Trading</h3>
            <p className="text-gray-400">Execute trades in milliseconds with our advanced engine</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="bg-green-600/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Bank-Grade Security</h3>
            <p className="text-gray-400">Your assets are protected with enterprise-level encryption</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="bg-blue-600/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Live Market Data</h3>
            <p className="text-gray-400">Real-time prices from multiple exchanges aggregated</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="bg-orange-600/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Multi-Asset Portfolio</h3>
            <p className="text-gray-400">Trade Bitcoin, Ethereum, Solana and more</p>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">Start Trading Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">$10,000</div>
              <div className="text-gray-300">Starting Balance</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">0.1%</div>
              <div className="text-gray-300">Trading Fee</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-300">Market Access</div>
            </div>
          </div>
          <Button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-6 text-lg"
          >
            Create Free Account
          </Button>
        </motion.div>
      </div>
    </div>
  );
}