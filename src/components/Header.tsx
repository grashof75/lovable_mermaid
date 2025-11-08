import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Moon, Sun, User, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthProvider';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onExport: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onExport,
  toggleTheme,
  isDarkMode
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="w-full py-4 px-6 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm bg-white/50 dark:bg-black/30 animate-fade-in">
        <div className="container max-w-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold">M</div>
            <h1 className="text-xl font-medium">AI Diagram creator</h1>
            <div className="flex items-center gap-2">
              <div className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Beta</div>
              <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Database Enabled</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="glass-button" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <Button variant="outline" size="sm" className="glass-button" onClick={onExport}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
            
            {/* Auth Section */}
            {loading ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/50 rounded-md">
                  <User size={14} />
                  <span className="text-sm max-w-32 truncate">{user.email}</span>
                </div>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline" 
                  size="sm" 
                  className="glass-button"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setShowAuthModal(true)} 
                variant="outline" 
                size="sm"
                className="glass-button"
              >
                <User size={16} className="mr-2" />
                Accedi
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};
export default Header;