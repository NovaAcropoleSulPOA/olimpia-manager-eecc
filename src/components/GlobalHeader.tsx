import { Home, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function GlobalHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDefaultRoute = () => {
    if (!user?.papeis?.length) return '/login';
    const role = user.papeis[0];
    switch (role) {
      case 'Atleta':
        return '/athlete-dashboard';
      case 'Juiz':
        return '/referee-dashboard';
      case 'Organizador':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="text-olimpics-green-primary">
                  Nova Acrópole Brasil Sul
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Início
                </Button>
                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate(getDefaultRoute())}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Meu Painel
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Button
            variant="ghost"
            className="hidden md:flex"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Início
          </Button>
          {user && (
            <Button
              variant="ghost"
              className="hidden md:flex"
              onClick={() => navigate(getDefaultRoute())}
            >
              <User className="mr-2 h-4 w-4" />
              Meu Painel
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!user && (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary text-white"
                onClick={() => navigate('/login?tab=register')}
              >
                Cadastrar
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}