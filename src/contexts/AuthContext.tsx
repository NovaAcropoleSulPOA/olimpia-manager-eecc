import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  roles: string[];
  nome: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Implement Supabase auth listener
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Implement Supabase auth
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const signOut = async () => {
    try {
      // TODO: Implement Supabase auth
      setUser(null);
      navigate('/');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout.');
    }
  };

  const signUp = async (userData: any) => {
    try {
      // TODO: Implement Supabase auth
      toast.success('Cadastro realizado com sucesso! Aguarde a aprovação.');
      navigate('/');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao realizar cadastro.');
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