import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthUser extends User {
  nome_completo?: string;
  telefone?: string;
  filial_id?: string;
  confirmado?: boolean;
  papeis?: string[];
  genero?: string;
  numero_identificador?: string;
  tipo_documento?: string;
  numero_documento?: string;
  filial_nome?: string;
  filial_cidade?: string;
  filial_estado?: string;
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

  // Initialize Supabase auth with session persistence
  useEffect(() => {
    console.log('Initializing Supabase auth with session persistence');
    let mounted = true;
    
    const setupAuth = async () => {
      try {
        // Check for existing session first
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id);
        
        if (!session) {
          console.log('No active session found');
          if (!PUBLIC_ROUTES.includes(location.pathname)) {
            console.log('Redirecting to login from protected route:', location.pathname);
            navigate('/login');
          }
          if (mounted) {
            setLoading(false);
            setInitialLoadComplete(true);
          }
          return;
        }

        // Setup auth state change listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (session?.user) {
            try {
              // Fetch user roles
              const { data: userRoles, error: rolesError } = await supabase
                .from('papeis_usuarios')
                .select('perfis (id, nome)')
                .eq('usuario_id', session.user.id);

              if (rolesError) throw rolesError;

              // Fetch user profile
              const { data: userProfile, error: profileError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profileError) throw profileError;

              const papeis = userRoles?.map((ur: any) => ur.perfis.nome) || [];
              
              const updatedUser = {
                ...session.user,
                ...userProfile,
                papeis,
              };

              console.log('Setting authenticated user:', updatedUser);
              if (mounted) {
                setUser(updatedUser);
              }

              // Handle navigation based on user state
              if (!userProfile?.confirmado) {
                console.log('User not confirmed, redirecting to pending approval');
                navigate('/pending-approval');
                return;
              }

              // Only redirect on initial sign in
              if (event === 'SIGNED_IN') {
                if (papeis.length > 1) {
                  console.log('Multiple roles found, redirecting to role selection');
                  navigate('/role-selection', { state: { roles: papeis } });
                } else {
                  const redirectPath = getDefaultRoute(papeis);
                  console.log('Single role, redirecting to:', redirectPath);
                  navigate(redirectPath);
                }
              }
            } catch (error) {
              console.error('Error setting up user session:', error);
              toast.error('Erro ao carregar dados do usuário');
            }
          } else {
            console.log('No active session, clearing user state');
            if (mounted) {
              setUser(null);
            }
            if (!PUBLIC_ROUTES.includes(location.pathname)) {
              console.log('Redirecting to login from:', location.pathname);
              navigate('/login');
            }
          }
          
          if (mounted) {
            setLoading(false);
            setInitialLoadComplete(true);
          }
        });

        return () => {
          mounted = false;
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

  const getDefaultRoute = (roles: string[]) => {
    console.log('Getting default route for roles:', roles);
    if (!roles.length) return '/login';
    if (roles.includes('Atleta')) {
      return '/athlete-profile';
    }
    if (roles.includes('Juiz')) {
      return '/judge-dashboard';
    }
    if (roles.includes('Organizador')) {
      return '/organizer-dashboard';
    }
    return '/login';
  };

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
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Email ou senha incorretos");
        } else if (error.message.includes('Email not confirmed')) {
          toast.error("Por favor, confirme seu email antes de fazer login");
        } else {
          toast.error("Erro ao fazer login. Tente novamente.");
        }
        return;
      }
  
      if (!data.user) {
        console.error('No user data returned');
        toast.error("Erro ao fazer login. Tente novamente.");
        return;
      }
  
      console.log('Login successful, fetching user roles...');
      
      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select('perfis (id, nome)')
        .eq('usuario_id', data.user.id);

      console.log("User roles data:", userRoles);
  
      if (rolesError) {
        console.error('Error loading roles:', rolesError);
        toast.error('Erro ao carregar perfis do usuário');
        return;
      }
  
      const roles = userRoles?.map((ur: any) => ur.perfis.nome) || [];
      console.log('User roles:', roles);
  
      // Check if user is confirmed
      const { data: userProfile, error: profileError } = await supabase
        .from('usuarios')
        .select('confirmado')
        .eq('id', data.user.id)
        .single();
  
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Erro ao carregar perfil do usuário');
        return;
      }
  
      if (!userProfile?.confirmado) {
        console.log('User not confirmed, redirecting to pending approval page');
        toast.warning('Seu cadastro está pendente de aprovação.');
        navigate('/pending-approval');
        return;
      }
  
      setUser({ ...data.user, papeis: roles });
  
      // Redirect logic
      if (roles.length > 1) {
        console.log('Multiple roles found, redirecting to role selection');
        navigate('/role-selection', { state: { roles } });
        toast.success('Login realizado com sucesso! Selecione seu perfil.');
        return;
      }
  
      // Direct redirect for single role
      const redirectPath = getDefaultRoute(roles);
      console.log('Redirecting to:', redirectPath);
      navigate(redirectPath);
      toast.success("Login realizado com sucesso!");
  
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
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

      // Create user profile in usuarios table with all required fields
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([{
          id: userId,
          nome_completo: userData.nome,
          telefone: userData.telefone,
          email: userData.email,
          filial_id: userData.branchId,
          confirmado: false,
          tipo_documento: userData.tipo_documento,
          numero_documento: userData.numero_documento,
          genero: userData.genero
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast.error('Erro ao salvar dados do usuário.');
        return { user: null, error: profileError };
      }

      // Assign athlete role
      const { error: rolesError } = await supabase
        .from('papeis_usuarios')
        .insert([{
          usuario_id: userId,
          perfil_id: 1 // ID for "Atleta" role
        }]);

      if (rolesError) {
        console.error('Role assignment error:', rolesError);
        toast.error('Erro ao atribuir papel de atleta ao usuário.');
        return { user: null, error: rolesError };
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('pagamentos')
        .insert([{
          atleta_id: userId,
          valor: 180.00,
          status: 'pendente',
          comprovante_url: null,
          validado_sem_comprovante: false,
          data_validacao: null,
          data_criacao: new Date().toISOString()
        }]);

      if (paymentError) {
        console.error('Payment record creation error:', paymentError);
        toast.error('Erro ao criar registro de pagamento.');
        return { user: null, error: paymentError };
      }

      console.log('User profile created successfully');
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Erro ao realizar cadastro.');
      return { user: null, error };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      // Check if email exists in the database first
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
    console.log('Initial auth setup in progress...');
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
