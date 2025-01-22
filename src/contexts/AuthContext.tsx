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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // Check if the error is due to unconfirmed email
        if (error.message.includes('Email not confirmed') || 
            (error as any)?.body?.includes('email_not_confirmed')) {
          toast.error('Por favor, confirme seu email antes de fazer login.');
          navigate('/verify-email', { state: { email } });
          return;
        }
        
        throw error;
      }

      if (!data.user.email_confirmed_at) {
        toast.error('Por favor, confirme seu email antes de fazer login.');
        navigate('/verify-email', { state: { email } });
        return;
      }

      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('confirmado')
        .eq('id', data.user.id)
        .single();

      if (!userProfile?.confirmado) {
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
        const error = new Error('User creation failed');
        console.error('User creation failed');
        toast.error('Erro ao criar conta. Tente novamente.');
        return { user: null, error };
      }

      console.log('User created in Supabase Auth:', data.user);

      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([{
          id: data.user.id,
          nome_completo: userData.nome,
          telefone: userData.telefone.replace(/\D/g, ''),
          email: userData.email,
          filial_id: userData.branchId,
          confirmado: false,
          data_criacao: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast.error('Erro ao salvar dados do usuário.');
        return { user: null, error: profileError };
      }

      console.log('User profile created in usuarios table');

      const { error: rolesError } = await supabase
        .from('papeis_usuarios')
        .insert(
          userData.roleIds.map((roleId: number) => ({
            usuario_id: data.user.id,
            perfil_id: roleId
          }))
        );

      if (rolesError) {
        console.error('Role assignment error:', rolesError);
        toast.error('Erro ao salvar os papéis do usuário.');
        return { user: null, error: rolesError };
      }

      console.log('User roles assigned successfully');

      if (userData.roleIds.includes(1) && userData.modalities?.length > 0) {
        const inscricoesToInsert = userData.modalities.map((modalidadeId: number) => ({
          atleta_id: data.user.id,
          modalidade_id: modalidadeId,
          status: 'Pendente', // Updated to match the database constraint
          data_inscricao: new Date().toISOString()
        }));

        const { error: inscricoesError } = await supabase
          .from('inscricoes')
          .insert(inscricoesToInsert);

        if (inscricoesError) {
          console.error('Modality registration error:', inscricoesError);
          toast.error('Erro ao salvar as inscrições do atleta.');
          return { user: null, error: inscricoesError };
        }

        console.log('Athlete modalities registered successfully');
      }

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