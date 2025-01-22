import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthUser extends User {
  nome_completo?: string;
  telefone?: string;
  filial_id?: string;
  confirmado?: boolean;
  papeis?: string[];
}

interface UserRoleResponse {
  perfis: {
    id: number;
    nome: string;
    descricao?: string;
  };
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Setting up Supabase auth listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user);
        
        if (session?.user) {
          const { data: userRoles, error: rolesError } = await supabase
            .from('papeis_usuarios')
            .select(`
              perfis (
                id,
                nome,
                descricao
              )
            `)
            .eq('usuario_id', session.user.id);

          if (rolesError) {
            console.error('Error fetching user roles:', rolesError);
            return;
          }

          const { data: userProfile, error: profileError } = await supabase
            .from('usuarios')
            .select('nome_completo, telefone, filial_id, confirmado')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return;
          }

          const papeis = userRoles?.map((ur: any) => ur.perfis.nome) || [];
          console.log('User roles mapped:', papeis);
          
          const updatedUser = {
            ...session.user,
            papeis,
            ...userProfile
          };
          
          setUser(updatedUser);

          if (!userProfile?.confirmado) {
            console.log('User not confirmed, redirecting to pending approval');
            toast.warning('Seu cadastro está pendente de aprovação.');
            navigate('/pending-approval');
            return;
          }

          // Handle role-based navigation on auth state change
          if (event === 'SIGNED_IN') {
            if (papeis.length > 1) {
              console.log('User has multiple roles, redirecting to role selection');
              navigate('/role-selection', { state: { roles: papeis } });
            } else if (papeis.length === 1) {
              console.log('User has single role, redirecting to dashboard');
              const role = papeis[0];
              let redirectPath = '/dashboard';
              
              switch (role) {
                case 'Atleta':
                  redirectPath = '/athlete-dashboard';
                  break;
                case 'Juiz':
                  redirectPath = '/referee-dashboard';
                  break;
                case 'Organizador':
                  redirectPath = '/admin-dashboard';
                  break;
              }
              
              navigate(redirectPath);
            }
          }
        } else {
          setUser(null);
          navigate('/login');
        }
        
        setLoading(false);
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user);
      
      if (session?.user) {
        const { data: userRoles } = await supabase
          .from('papeis_usuarios')
          .select(`
            perfis (
              id,
              nome,
              descricao
            )
          `)
          .eq('usuario_id', session.user.id);

        const { data: userProfile } = await supabase
          .from('usuarios')
          .select('nome_completo, telefone, filial_id, confirmado')
          .eq('id', session.user.id)
          .single();

        const papeis = userRoles?.map((ur: any) => ur.perfis.nome) || [];
        
        setUser({
          ...session.user,
          papeis,
          ...userProfile
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando login com:', email);
      setLoading(true);
  
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
      if (error) {
        console.error('Erro no login:', error);
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
        return;
      }
  
      console.log('Login successful, fetching user roles...');
      
      // Busca os papéis do usuário
      const { data: userRoles, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select('perfis (id, nome)')
        .eq('usuario_id', data.user.id);

      console.log("Dados dos papéis do usuário:", userRoles);
  
      if (rolesError) {
        console.error('Erro ao carregar papéis:', rolesError);
        toast.error('Erro ao carregar perfis do usuário');
        return;
      }
  
      const roles = userRoles?.map((ur: any) => ur.perfis.nome) || [];
      console.log('Papéis do usuário:', roles);
  
      // Verifica se o usuário está confirmado
      const { data: userProfile, error: profileError } = await supabase
        .from('usuarios')
        .select('confirmado')
        .eq('id', data.user.id)
        .single();
  
      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        toast.error('Erro ao carregar perfil do usuário');
        return;
      }
  
      if (!userProfile?.confirmado) {
        console.log('Usuário não confirmado, redirecionando para página de aprovação pendente.');
        toast.warning('Seu cadastro está pendente de aprovação.');
        navigate('/pending-approval');
        return;
      }
  
      setUser({ ...data.user, papeis: roles });
  
      // Lógica de redirecionamento
      if (roles.length > 1) {
        console.log('Usuário com múltiplos perfis, redirecionando para seleção de perfil.');
        navigate('/role-selection', { state: { roles } });
        toast.success('Login realizado com sucesso! Selecione seu perfil.');
        return;
      }
  
      // Redirecionamento direto se houver apenas um papel
      let redirectPath = '/dashboard';
      if (roles.includes('Atleta')) {
        redirectPath = '/athlete-dashboard';
      } else if (roles.includes('Juiz')) {
        redirectPath = '/referee-dashboard';
      } else if (roles.includes('Organizador')) {
        redirectPath = '/admin-dashboard';
      }
  
      console.log('Redirecionando para:', redirectPath);
      navigate(redirectPath);
      toast.success("Login realizado com sucesso!");
  
    } catch (error) {
      console.error("Erro inesperado no login:", error);
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
      console.log('Checking if email already exists:', userData.email);
      
      // Check if the email is already registered
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
  
      // Create user profile in usuarios table
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
  
      // Registration successful, instruct user to check email
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