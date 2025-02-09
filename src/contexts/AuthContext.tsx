
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthContextType, AuthUser } from '@/types/auth';
import { PUBLIC_ROUTES } from '@/constants/routes';
import { fetchUserProfile, handleAuthRedirect } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AuthContext - Setting up auth state...');
    let mounted = true;

    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('AuthContext - Initial session:', session?.user?.id);

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUser({ ...session.user, ...userProfile });
            handleAuthRedirect(userProfile, location.pathname, navigate);
          }
        } else if (!PUBLIC_ROUTES.includes(location.pathname) && 
                  !(location.pathname === '/reset-password')) {
          navigate('/login');
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('AuthContext - Auth state changed:', event, session?.user?.id);

            if (session?.user) {
              try {
                const userProfile = await fetchUserProfile(session.user.id);
                if (mounted) {
                  setUser({ ...session.user, ...userProfile });
                }
                if (event === 'SIGNED_IN') {
                  handleAuthRedirect(userProfile, location.pathname, navigate);
                }
              } catch (error) {
                console.error('AuthContext - Error setting up user session:', error);
                toast.error(handleSupabaseError(error));
                if (mounted) {
                  setUser(null);
                  navigate('/login');
                }
              }
            } else {
              if (mounted) {
                setUser(null);
                if (!PUBLIC_ROUTES.includes(location.pathname)) {
                  navigate('/login');
                }
              }
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('AuthContext - Error in auth setup:', error);
        if (mounted) {
          setUser(null);
          if (!PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/login');
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

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
      setLoading(true);
  
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        console.log('Login error:', error);
        const errorMessage = error.message;
        
        if (errorMessage.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Invalid login credentials');
        }
        
        throw new Error(errorMessage || 'Login failed');
      }
  
      if (!data.user) {
        console.log("No user data returned");
        throw new Error("Login failed");
      }
  
      console.log("Login successful, fetching user profile...");
      const profile = await fetchUserProfile(data.user.id);
      setUser({ ...data.user, ...profile });
      handleAuthRedirect(profile, location.pathname, navigate);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext - Starting logout process...');
      setUser(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthContext - Error during signOut:', error);
        if (error.message?.includes('session_not_found')) {
          console.log('AuthContext - Session already expired, continuing with local cleanup');
        } else {
          console.warn('AuthContext - Non-session error during logout:', error);
        }
      }

      console.log('AuthContext - Logout successful, navigating to login page');
      navigate('/login');
      toast.success('Logout realizado com sucesso!');
      
    } catch (error: any) {
      console.error('AuthContext - Unexpected error during signOut:', error);
      setUser(null);
      navigate('/login');
      toast.error('Erro ao fazer logout, mas sua sessão foi encerrada localmente.');
    }
  };

  const signUp = async (userData: any) => {
    try {
      console.log('Starting new user registration.');
      
      const { data, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nome_completo: userData.nome,
            telefone: userData.telefone.replace(/\D/g, ''),
            filial_id: userData.branchId,
            tipo_documento: userData.tipo_documento,
            numero_documento: userData.numero_documento.replace(/\D/g, ''),
            genero: userData.genero
          }
        }
      });
  
      if (authError) {
        console.error('Auth Error:', authError.message);
        toast.error('Erro ao criar conta. Tente novamente.');
        return { user: null, error: authError };
      }
  
      if (!data.user) {
        toast.error('Erro ao criar conta. Tente novamente.');
        return { user: null, error: new Error('User creation failed') };
      }
  
      console.log('User registered successfully!');
      toast.success('Cadastro realizado com sucesso! Faça login para acessar o sistema.');
      navigate('/');
  
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Erro ao realizar cadastro.');
      return { user: null, error };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, email_confirmed_at')
        .eq('email', email)
        .single();
      
      if (userError) {
        console.error('Error checking user:', userError);
        toast.error('Erro ao verificar status do email.');
        return;
      }

      if (userData?.email_confirmed_at) {
        toast.error('Este e-mail já foi confirmado. Por favor, faça login.');
        navigate('/login');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) throw error;
      toast.success('Email de verificação reenviado com sucesso!');
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      toast.error('Erro ao reenviar email de verificação.');
      throw error;
    }
  };

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
