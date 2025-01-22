import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { assignUserRoles, createUserProfile } from '@/lib/api';

interface AuthUser extends User {
  nome_completo?: string;
  telefone?: string;
  filial_id?: string;
  confirmado?: boolean;
  roleIds?: number[];
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
          // Fetch user roles when session changes
          const { data: userRoles } = await supabase
            .from('papeis_usuarios')
            .select('role_id')
            .eq('user_id', session.user.id);

          // Fetch user profile from usuarios table
          const { data: userProfile } = await supabase
            .from('usuarios')
            .select('nome_completo, telefone, filial_id, confirmado')
            .eq('id', session.user.id)
            .single();

          const roleIds = userRoles?.map(ur => ur.role_id) || [];
          
          setUser({
            ...session.user,
            roleIds,
            ...userProfile
          });

          // Handle different user statuses
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
          .select('role_id')
          .eq('user_id', session.user.id);

        const { data: userProfile } = await supabase
          .from('usuarios')
          .select('nome_completo, telefone, filial_id, confirmado')
          .eq('id', session.user.id)
          .single();

        const roleIds = userRoles?.map(ur => ur.role_id) || [];
        
        setUser({
          ...session.user,
          roleIds,
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check email verification status
      if (!data.user.email_confirmed_at) {
        toast.error('Por favor, verifique seu email antes de fazer login.');
        return;
      }

      // Check user status
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('status')
        .eq('id', data.user.id)
        .single();

      if (userProfile?.status === 'pendente') {
        toast.warning('Seu cadastro está pendente de aprovação.');
        navigate('/pending-approval');
        return;
      }

      if (userProfile?.status === 'rejeitado') {
        toast.error('Seu cadastro foi rejeitado.');
        navigate('/rejected');
        return;
      }

      console.log('Sign in successful:', data.user);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting sign out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      navigate('/login');
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Erro ao fazer logout.');
      throw error;
    }
  };

  const signUp = async (userData: any) => {
    try {
      console.log('Starting user registration process:', userData);
      
      // Step 1: Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('User creation failed');
      }

      console.log('User created in Supabase Auth:', data.user);

      // Step 2: Create user profile in usuarios table
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: data.user.id,
            nome_completo: userData.nome,
            telefone: userData.telefone.replace(/\D/g, ''), // Remove non-digits
            email: userData.email,
            filial_id: userData.branchId,
            confirmado: false,
            data_criacao: new Date().toISOString()
          },
        ]);

      if (profileError) throw profileError;

      console.log('User profile created in usuarios table');

      // Step 3: Assign user roles
      if (data.user) {
        await assignUserRoles(data.user.id, userData.roleIds);
      }

      console.log('User roles assigned successfully');
      toast.success('Cadastro realizado com sucesso! Por favor, verifique seu email.');
      navigate('/verify-email');
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Erro ao realizar cadastro.');
      return { user: null, error };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
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
