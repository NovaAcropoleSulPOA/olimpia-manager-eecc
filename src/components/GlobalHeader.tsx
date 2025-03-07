
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MenuItems } from './navigation/MenuItems';

export function GlobalHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full h-16 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-olimpics-green-primary hover:text-olimpics-green-secondary"
          >
            Olimpíadas Estaduais - Escola do Esporte com Coração - EECC
          </Button>
        </div>
        <MenuItems />
      </div>
    </header>
  );
}
