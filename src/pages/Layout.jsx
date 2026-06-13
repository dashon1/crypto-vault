
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard, Home } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout(createPageUrl("Home"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CV</span>
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">CryptoVault</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  <Link
                    to={createPageUrl("Dashboard")}
                    className={`text-gray-300 hover:text-white transition-colors ${
                      currentPageName === "Dashboard" ? "text-white font-semibold" : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={createPageUrl("Markets")}
                    className={`text-gray-300 hover:text-white transition-colors ${
                      currentPageName === "Markets" ? "text-white font-semibold" : ""
                    }`}
                  >
                    Markets
                  </Link>
                  <Link
                    to={createPageUrl("Portfolio")}
                    className={`text-gray-300 hover:text-white transition-colors ${
                      currentPageName === "Portfolio" ? "text-white font-semibold" : ""
                    }`}
                  >
                    Portfolio
                  </Link>
                  <Link
                    to={createPageUrl("Alerts")}
                    className={`text-gray-300 hover:text-white transition-colors ${
                      currentPageName === "Alerts" ? "text-white font-semibold" : ""
                    }`}
                  >
                    Alerts
                  </Link>
                  <Link
                    to={createPageUrl("Settings")}
                    className={`text-gray-300 hover:text-white transition-colors ${
                      currentPageName === "Settings" ? "text-white font-semibold" : ""
                    }`}
                  >
                    Settings
                  </Link>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{user.email}</span>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              {user ? (
                <div className="space-y-4">
                  <Link
                    to={createPageUrl("Dashboard")}
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={createPageUrl("Markets")}
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Markets
                  </Link>
                  <Link
                    to={createPageUrl("Portfolio")}
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Portfolio
                  </Link>
                  <Link
                    to={createPageUrl("Alerts")}
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Alerts
                  </Link>
                  <Link
                    to={createPageUrl("Settings")}
                    className="block text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="text-gray-400 text-sm">{user.email}</div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Sign In
                </Button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}
