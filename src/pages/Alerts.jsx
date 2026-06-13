import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BellOff, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Alerts() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "BTC",
    target_price: "",
    condition: "above"
  });
  const queryClient = useQueryClient();

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

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.PriceAlert.filter({ user_email: user.email }, '-created_date');
    },
    enabled: !!user
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.PriceAlert.create({
        ...data,
        user_email: user.email,
        is_active: true,
        triggered: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts']);
      setShowForm(false);
      setFormData({ symbol: "BTC", target_price: "", condition: "above" });
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id) => base44.entities.PriceAlert.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['alerts'])
  });

  const toggleAlertMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PriceAlert.update(id, { is_active: !is_active }),
    onSuccess: () => queryClient.invalidateQueries(['alerts'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.target_price || parseFloat(formData.target_price) <= 0) {
      alert("Please enter a valid price");
      return;
    }
    createAlertMutation.mutate({
      symbol: formData.symbol,
      target_price: parseFloat(formData.target_price),
      condition: formData.condition
    });
  };

  const cryptoOptions = [
    "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "MATIC", "AVAX"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Price Alerts</h1>
            <p className="text-gray-400">Get notified when prices hit your targets</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Alert
          </Button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-white text-xl font-bold mb-4">Create Price Alert</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Cryptocurrency</label>
                  <Select value={formData.symbol} onValueChange={(value) => setFormData({...formData, symbol: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoOptions.map(symbol => (
                        <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Condition</label>
                  <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Goes Above</SelectItem>
                      <SelectItem value="below">Goes Below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Target Price ($)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.target_price}
                    onChange={(e) => setFormData({...formData, target_price: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="bg-white/10 border-white/20 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAlertMutation.isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  Create Alert
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white text-xl font-bold mb-4">Active Alerts</h3>
          {alerts.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No price alerts yet. Create one to get started!</p>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-white/5 rounded-lg p-4 flex items-center justify-between ${!alert.is_active && 'opacity-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${alert.is_active ? 'bg-green-600/20' : 'bg-gray-600/20'}`}>
                      <Bell className={`w-5 h-5 ${alert.is_active ? 'text-green-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">
                        {alert.symbol} {alert.condition === 'above' ? '↑' : '↓'} ${alert.target_price.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Alert when price goes {alert.condition} ${alert.target_price.toLocaleString()}
                      </div>
                      {alert.triggered && (
                        <div className="text-yellow-400 text-sm mt-1">⚠️ Alert triggered!</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleAlertMutation.mutate({ id: alert.id, is_active: alert.is_active })}
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white"
                    >
                      {alert.is_active ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}