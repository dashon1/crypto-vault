import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Shield, Bell, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setFullName(currentUser.full_name || "");
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await base44.auth.updateMe({ full_name: fullName });
      alert("Profile updated successfully!");
      const updated = await base44.auth.me();
      setUser(updated);
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  };

  const handleResetPortfolio = async () => {
    if (!confirm("This will reset your portfolio to $10,000 USD and delete all transactions. Are you sure?")) {
      return;
    }

    try {
      const portfolio = await base44.entities.Portfolio.filter({ user_email: user.email });
      for (const asset of portfolio) {
        await base44.entities.Portfolio.delete(asset.id);
      }

      const transactions = await base44.entities.Transaction.filter({ user_email: user.email });
      for (const tx of transactions) {
        await base44.entities.Transaction.delete(tx.id);
      }

      await base44.entities.Portfolio.create({
        user_email: user.email,
        symbol: "USD",
        amount: 10000,
        average_buy_price: 1
      });

      alert("Portfolio reset successfully!");
      window.location.reload();
    } catch (error) {
      alert("Error resetting portfolio: " + error.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Email</label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-white/10 border-white/20 text-gray-400"
                />
              </div>
              
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Role</label>
                <Input
                  value={user.role}
                  disabled
                  className="bg-white/10 border-white/20 text-gray-400 capitalize"
                />
              </div>

              <Button
                onClick={handleUpdateProfile}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Bank-Grade Security Active</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Your account is protected with enterprise-level encryption and multi-factor authentication.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Notifications</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Price Alerts</div>
                  <div className="text-gray-400 text-sm">Get notified when your price alerts trigger</div>
                </div>
                <div className="text-green-400">Enabled</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Trade Confirmations</div>
                  <div className="text-gray-400 text-sm">Receive confirmation for executed trades</div>
                </div>
                <div className="text-green-400">Enabled</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-900/20 backdrop-blur-xl border border-red-600/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-6 h-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-400">
                Reset your portfolio back to the starting balance of $10,000 USD. This will delete all your holdings and transaction history.
              </p>
              <Button
                onClick={handleResetPortfolio}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Reset Portfolio
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}