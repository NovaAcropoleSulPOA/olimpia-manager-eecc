
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthContextType, AuthUser } from '@/types/auth';
import { PUBLIC_ROUTES, PublicRoute } from '@/constants/routes';
import { fetchUserProfile, handleAuthRedirect } from '@/services/authService';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuthOperations } from '@/hooks/useAuthOperations';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signOut, signUp, resendVerificationEmail } = useAuthOperations({ setUser, navigate, location });

  useEffect(() => {
    console.log('Setting up authentication state...');
    let mounted = true;

    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session status:', session ? 'Active' : 'No active session');

        if (!session?.user && !PUBLIC_ROUTES.includes(location.pathname as PublicRoute) && 
            location.pathname !== '/reset-password') {
          navigate('/', { replace: true });
          return;
        }

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUser({ ...session.user, ...userProfile });
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);

            if (event === 'SIGNED_OUT') {
              if (mounted) {
                setUser(null);
                localStorage.removeItem('currentEventId');
                navigate('/', { replace: true });
              }
              return;
            }

            if (session?.user) {
              try {
                const userProfile = await fetchUserProfile(session.user.id);
                if (mounted) {
                  setUser({ ...session.user, ...userProfile });
                }
              } catch (error) {
                console.error('Error in auth setup:', error);
                toast.error(handleSupabaseError(error));
                if (mounted) {
                  setUser(null);
                  navigate('/', { replace: true });
                }
              }
            } else {
              if (mounted) {
                setUser(null);
                if (!PUBLIC_ROUTES.includes(location.pathname as PublicRoute)) {
                  navigate('/', { replace: true });
                }
              }
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in auth setup:', error);
        if (mounted) {
          setUser(null);
          if (!PUBLIC_ROUTES.includes(location.pathname as PublicRoute)) {
            navigate('/', { replace: true });
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setupAuth();
    return () => {
      mounted = false;
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      signUp,
      resendVerificationEmail 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
