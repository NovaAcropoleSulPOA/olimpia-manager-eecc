import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface Filial {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

interface AuthUser extends User {
  nome_completo?: string;
  telefone?: string;
  filial_id?: string;
  confirmado?: boolean;
  papeis?: string[];
  foto_perfil?: string | null;
  numero_identificador?: string;
  filial?: Filial | null;
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

  useEffect(() => {
    let mounted = true;
    
    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (!PUBLIC_ROUTES.includes(location.pathname)) {
            navigate('/login');
          }
          if (mounted) {
            setLoading(false);
            setInitialLoadComplete(true);
          }
          return;
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('usuarios')
          .select(`
            nome_completo,
            telefone,
            filial_id,
            confirmado,
            foto_perfil,
            numero_identificador,
            filial:filiais!filial_id (
              id,
              nome,
              cidade,
              estado
            )
          `)
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        const filialData: Filial | null = userProfile.filial ? {
          id: userProfile.filial.id,
          nome: userProfile.filial.nome,
          cidade: userProfile.filial.cidade,
          estado: userProfile.filial.estado,
        } : null;

        const updatedUser: AuthUser = {
          ...session.user,
          ...userProfile,
          filial: filialData,
        };

        if (mounted) {
          setUser(updatedUser);
          setLoading(false);
          setInitialLoadComplete(true);
        }
      } catch (error) {
        console.error('Error setting up auth:', error);
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn: async () => {}, signOut: async () => {}, signUp: async () => ({ user: null, error: null }), resendVerificationEmail: async () => {} }}>
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
