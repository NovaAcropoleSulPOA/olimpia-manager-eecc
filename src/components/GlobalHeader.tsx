import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function GlobalHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleHomeNavigation = () => {
    console.log('GlobalHeader - Navigating to home page');
    // Always navigate to home page when clicking the header
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleHomeNavigation}
            className="text-olimpics-green-primary hover:text-olimpics-green-secondary"
          >
            Olimpíadas Estaduais da Nova Acrópole
          </Button>
        </div>
      </div>
    </header>
  );
}