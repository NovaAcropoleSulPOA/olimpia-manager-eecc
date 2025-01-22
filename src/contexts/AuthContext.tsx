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
            .select('role')
            .eq('usuario_id', session.user.id);

          // Fetch user profile from usuarios table
          const { data: userProfile } = await supabase
            .from('usuarios')
            .select('nome_completo, telefone, filial_id, confirmado')
            .eq('id', session.user.id)
            .single();

          const papeis = userRoles?.map(ur => ur.role) || [];
          
          setUser({
            ...session.user,
            papeis,
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
          .select('role')
          .eq('usuario_id', session.user.id);

        const { data: userProfile } = await supabase
          .from('usuarios')
          .select('nome_completo, telefone, filial_id, confirmado')
          .eq('id', session.user.id)
          .single();

        const papeis = userRoles?.map(ur => ur.role) || [];
        
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
        .select('confirmado, id')
        .eq('id', data.user.id)
        .single();

      if (userProfile?.confirmado === false) {
        toast.warning('Seu cadastro está pendente de aprovação.');
        navigate('/pending-approval');
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
      await createUserProfile(data.user.id, {
        ...userData,
        password: userData.password
      });

      console.log('User profile created in usuarios table');

      // Step 3: Assign user roles
      if (data.user) {
        // Convert roleIds to papel values
        const papeis = userData.roleIds.map((roleId: number) => {
          switch (roleId) {
            case 1: return 'atleta';
            case 2: return 'organizador';
            case 3: return 'juiz';
            default: return '';
          }
        }).filter(Boolean);

        await assignUserRoles(data.user.id, papeis);
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
