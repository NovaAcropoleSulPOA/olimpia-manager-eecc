import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Types that match our database schema
interface AuthUser extends User {
  nome_completo?: string;
  telefone?: string;
  filial_id?: string;
  confirmado?: boolean;
  papeis?: string[];
}

// Updated interface to match the exact structure from Supabase response
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
          // Fetch user roles through the correct relationship
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

          // Fetch user profile from usuarios table
          const { data: userProfile, error: profileError } = await supabase
            .from('usuarios')
            .select('nome_completo, telefone, filial_id, confirmado')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return;
          }

          // Map roles correctly from the perfis table
          const papeis = userRoles?.map((ur: any) => ur.perfis.nome) || [];
          
          setUser({
            ...session.user,
            papeis,
            ...userProfile
          });

          if (!userProfile?.confirmado) {
            toast.warning('Seu cadastro está pendente de aprovação.');
            navigate('/pending-approval');
          }
        } else {
          setUser(null);
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
      console.log('Attempting sign in:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
      if (error) {
        console.error('Sign in error:', error);
  
        if (error.code === "email_not_confirmed") {
          toast.error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e ative sua conta antes de fazer login.");
          return;
        }
  
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
        return;
      }
  
      // Busca os papéis do usuário
      const { data: userRoles, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis (
            id,
            nome
          )
        `)
        .eq('usuario_id', data.user.id);
  
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        toast.error('Erro ao carregar perfis do usuário');
        return;
      }
  
      const roles = userRoles?.map((ur: any) => ur.perfis.nome) || [];
      console.log('User roles:', roles);
  
      // Busca a confirmação do usuário
      const { data: userProfile, error: profileError } = await supabase
        .from('usuarios')
        .select('confirmado')
        .eq('id', data.user.id)
        .single();
  
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast.error('Erro ao carregar perfil do usuário');
        return;
      }
  
      if (!userProfile?.confirmado) {
        console.log('User not confirmed, redirecting to pending approval');
        toast.warning('Seu cadastro está pendente de aprovação.');
        navigate('/pending-approval');
        return;
      }
  
      // Atualiza o estado do usuário
      setUser({ ...data.user, papeis: roles });
  
      // Redireciona conforme os papéis do usuário
      if (roles.length > 1) {
        console.log('User has multiple roles, redirecting to role selection');
        navigate('/role-selection', { state: { roles } });
        toast.success('Login realizado com sucesso! Selecione seu perfil.');
        return;
      }
  
      // Redirecionamento direto para o painel correto
      let redirectPath = '/dashboard';
      if (roles.includes('Atleta')) {
        redirectPath = '/athlete-dashboard';
      } else if (roles.includes('Juiz')) {
        redirectPath = '/referee-dashboard';
      } else if (roles.includes('Organizador')) {
        redirectPath = '/admin-dashboard';
      }
  
      console.log('Redirecting to:', redirectPath);
      toast.success("Login realizado com sucesso!");
      navigate(redirectPath);
  
    } catch (error) {
      console.error("Unexpected Login Error:", error);
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
