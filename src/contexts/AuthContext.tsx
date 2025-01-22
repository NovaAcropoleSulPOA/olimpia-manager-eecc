import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthUser extends User {
  roleIds?: number[];
  nome?: string;
  status?: 'pendente' | 'aprovado' | 'rejeitado';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (userData: any) => Promise<{ user: AuthUser | null; error: Error | null; }>;
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

          const roleIds = userRoles?.map(ur => ur.role_id) || [];
          
          setUser({
            ...session.user,
            roleIds
          });
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

        const roleIds = userRoles?.map(ur => ur.role_id) || [];
        
        setUser({
          ...session.user,
          roleIds
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

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
      console.log('Attempting sign up:', userData.email);
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nome: userData.nome,
            roleIds: userData.roleIds,
            status: 'pendente',
          },
        },
      });

      if (error) throw error;

      console.log('Sign up successful:', data.user);
      toast.success('Cadastro realizado com sucesso! Aguarde a aprovação.');
      navigate('/login');
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error('Erro ao realizar cadastro.');
      return { user: null, error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
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