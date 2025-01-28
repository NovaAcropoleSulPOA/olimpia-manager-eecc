import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError, recoverSession } from '@/lib/supabase';
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleAuthRedirect = (userProfile: any) => {
    if (!userProfile.confirmado) {
      navigate('/pending-approval');
      return;
    }

    if (userProfile.papeis.length > 1) {
      navigate('/role-selection', { state: { roles: userProfile.papeis } });
    } else if (userProfile.papeis.length === 1) {
      const role = userProfile.papeis[0].toLowerCase();
      switch (role) {
        case 'atleta':
          navigate('/athlete-profile');
          break;
        case 'organizador':
          navigate('/organizer-dashboard');
          break;
        case 'representante de delegação':
          navigate('/delegation-dashboard');
          break;
        default:
          console.error('Unknown role:', role);
          toast.error('Erro ao determinar perfil de acesso');
          navigate('/login');
      }
    } else {
      console.error('No roles assigned');
      toast.error('Nenhum perfil atribuído ao usuário');
      navigate('/login');
    }
  };

  useEffect(() => {
    console.log('Initializing auth state...');
    let mounted = true;
    
    const setupAuth = async () => {
      try {
        const existingSession = await recoverSession();
        console.log('Recovered session:', existingSession?.user?.id);
        
        if (!existingSession) {
          console.log('No active session found');
          if (!PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/login');
          }
          if (mounted) {
            setLoading(false);
            setInitialLoadComplete(true);
          }
          return;
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (session?.user) {
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              
              const updatedUser = {
                ...session.user,
                ...userProfile,
              };

              console.log('Setting authenticated user:', updatedUser);
              if (mounted) {
                setUser(updatedUser);
              }

              if (!userProfile.confirmado) {
                navigate('/pending-approval');
                return;
              }

              if (event === 'SIGNED_IN') {
                if (userProfile.papeis.length > 1) {
                  navigate('/role-selection', { state: { roles: userProfile.papeis } });
                } else {
                  const redirectPath = getDefaultRoute(userProfile.papeis);
                  navigate(redirectPath);
                }
              }
            } catch (error) {
              console.error('Error setting up user session:', error);
              toast.error(handleSupabaseError(error));
              if (mounted) {
                setUser(null);
                navigate('/login');
              }
            }
          } else {
            if (mounted) {
              setUser(null);
            }
            if (!PUBLIC_ROUTES.includes(location.pathname)) {
              navigate('/login');
            }
          }
          
          if (mounted) {
            setLoading(false);
            setInitialLoadComplete(true);
          }
        });

        if (existingSession?.user) {
          try {
            const userProfile = await fetchUserProfile(existingSession.user.id);
            const updatedUser = {
              ...existingSession.user,
              ...userProfile,
            };
            if (mounted) {
              setUser(updatedUser);
            }
          } catch (error) {
            console.error('Error fetching initial user profile:', error);
            toast.error(handleSupabaseError(error));
          }
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in auth setup:', error);
        if (mounted) {
          setLoading(false);
          setInitialLoadComplete(true);
        }
      }
    };

    setupAuth();

    return () => {
      mounted = false;
    };
  }, [navigate, location]);

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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/login');
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Erro ao fazer logout.');
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

  if (!initialLoadComplete) {
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
