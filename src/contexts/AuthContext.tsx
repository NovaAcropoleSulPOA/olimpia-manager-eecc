import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthUser extends User {
  nome_completo?: string;
  telefone?: string;
  filial_id?: string;
  confirmado?: boolean;
  papeis?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (userData: any) => Promise<{ user: AuthUser | null; error: Error | null; }>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/login', '/reset-password', '/pending-approval'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthRedirect = (userProfile: any, isInitialLogin: boolean = false) => {
    console.log('AuthContext - Handling auth redirect. Initial login:', isInitialLogin);
    console.log('AuthContext - Current location:', location.pathname);
    
    if (!userProfile.confirmado) {
      console.log('AuthContext - User not confirmed, redirecting to pending approval');
      navigate('/pending-approval');
      return;
    }

    // Only redirect if:
    // 1. It's the initial login AND
    // 2. We're on a public route AND
    // 3. Initial auth check is not done
    if (isInitialLogin && PUBLIC_ROUTES.includes(location.pathname) && !initialAuthCheckDone) {
      const roles = userProfile.papeis || [];
      console.log('AuthContext - User roles for redirect:', roles);

      if (roles.includes('Atleta')) {
        console.log('AuthContext - Initial redirect to athlete profile');
        navigate('/athlete-profile');
      } else if (roles.includes('Organizador')) {
        console.log('AuthContext - Initial redirect to organizer dashboard');
        navigate('/organizer-dashboard');
      } else {
        console.error('AuthContext - No valid role found for navigation');
        toast.error('Erro ao determinar perfil de acesso');
        navigate('/login');
      }
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      
      const { data: userRoles, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select('perfis (id, nome)')
        .eq('usuario_id', userId);

      if (rolesError) throw rolesError;

      const { data: userProfile, error: profileError } = await supabase
        .from('usuarios')
        .select('nome_completo, telefone, filial_id, confirmado')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const papeis = userRoles?.map((ur: any) => ur.perfis.nome) || [];
      console.log('User roles fetched:', papeis);
      
      return {
        ...userProfile,
        papeis,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

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
            handleAuthRedirect(userProfile, true);
            setInitialAuthCheckDone(true);
          }
        } else if (!PUBLIC_ROUTES.includes(location.pathname)) {
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
                // Only redirect on sign in, public route, and initial auth
                if (event === 'SIGNED_IN' && PUBLIC_ROUTES.includes(location.pathname) && !initialAuthCheckDone) {
                  handleAuthRedirect(userProfile, true);
                  setInitialAuthCheckDone(true);
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
          setInitialAuthCheckDone(true);
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
        password 
      });
  
      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Email not confirmed')) {
          toast.error('Email não confirmado. Por favor, verifique sua caixa de entrada.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos.');
        } else {
          toast.error(handleSupabaseError(error));
        }
        return;
      }
  
      if (!data.user) {
        console.error('No user data returned');
        toast.error("Erro ao fazer login. Tente novamente.");
        return;
      }
  
      console.log('Login successful, fetching user roles...');
      
      const userProfile = await fetchUserProfile(data.user.id);
      console.log('User profile fetched:', userProfile);

      if (!userProfile.confirmado) {
        console.log('User not confirmed, redirecting to pending approval page');
        toast.warning('Seu cadastro está pendente de aprovação.');
        navigate('/pending-approval');
        return;
      }
  
      setUser({ ...data.user, ...userProfile });
      handleAuthRedirect(userProfile);
      toast.success("Login realizado com sucesso!");
  
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast.error('Erro ao fazer login. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext - Starting logout process...');
      
      // First clear local state
      setUser(null);
      
      // Get current session before attempting logout
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('AuthContext - No active session found, proceeding with local cleanup');
        navigate('/login');
        toast.success('Logout realizado com sucesso!');
        return;
      }
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthContext - Error during signOut:', error);
        
        if (error.message?.includes('session_not_found')) {
          console.log('AuthContext - Session already expired, continuing with local cleanup');
          navigate('/login');
          toast.success('Logout realizado com sucesso!');
          return;
        }
        
        // For other types of errors, we still want to ensure the user is logged out locally
        console.warn('AuthContext - Non-session error during logout:', error);
      }

      console.log('AuthContext - Logout successful, navigating to login page');
      navigate('/login');
      toast.success('Logout realizado com sucesso!');
      
    } catch (error: any) {
      console.error('AuthContext - Unexpected error during signOut:', error);
      // Even if there's an error, we want to ensure the user is logged out locally
      setUser(null);
      navigate('/login');
      toast.error('Erro ao fazer logout, mas sua sessão foi encerrada localmente.');
    }
  };

  const signUp = async (userData: any) => {
    try {
      console.log('Checking if email already exists:', userData.email);
      
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();
  
      if (checkError) {
        console.error('Error checking existing user:', checkError);
        toast.error('Erro ao verificar cadastro existente.');
        return { user: null, error: checkError };
      }
  
      if (existingUser) {
        toast.error("Este e-mail já está cadastrado. Por favor, faça login com sua conta existente.");
        return { user: null, error: new Error('Email already exists') };
      }
  
      console.log('Starting new user registration.');
  
      const { data, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
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
  
      const userId = data.user.id;
  
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([{
          id: userId,
          nome_completo: userData.nome,
          telefone: userData.telefone.replace(/\D/g, ''),
          email: userData.email,
          filial_id: userData.branchId,
          confirmado: false,
        }]);
  
      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast.error('Erro ao salvar dados do usuário.');
        return { user: null, error: profileError };
      }
  
      console.log('User profile created in usuarios table.');
  
      toast.success('Cadastro realizado com sucesso! Verifique seu email para ativação.');
      navigate('/login');
  
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