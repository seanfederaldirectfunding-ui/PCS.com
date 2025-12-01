"use client";

import { useEffect, useState } from "react";
import { authService } from "@/lib/auth-service";
import { LoginDialog } from "@/components/login-dialog";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setShowLogin(!authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (username: string, role: string) => {
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">PAGE CRM</h1>
              <p className="text-white/80">Please sign in to access the dialer</p>
            </div>
            <LoginDialog 
              open={showLogin} 
              onOpenChange={setShowLogin} 
              onLogin={handleLogin} 
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}