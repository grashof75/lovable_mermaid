import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);
      
      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Successo",
          description: isLogin ? "Login effettuato con successo" : "Registrazione effettuata. Controlla la tua email per confermare l'account.",
        });
        
        if (isLogin) {
          onClose();
        }
        
        // Reset form
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full"
            onClick={switchMode}
            disabled={loading}
          >
            {isLogin 
              ? 'Non hai un account? Registrati' 
              : 'Hai già un account? Accedi'
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};