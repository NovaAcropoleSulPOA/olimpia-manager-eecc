
import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthUser } from '@/types/auth';
import { fetchUserProfile, handleAuthRedirect } from '@/services/authService';
import { AuthError, AuthApiError } from '@supabase/supabase-js';

interface UseAuthOperationsProps {
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  navigate: NavigateFunction;
  location: { pathname: string };
}

export function useAuthOperations({ setUser, navigate, location }: UseAuthOperationsProps) {
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
  
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        console.log('Login error:', error);
        
        // Extract error details from the error object
        let parsedError;
        if (typeof error === 'object' && 'body' in error && typeof error.body === 'string') {
          try {
            parsedError = JSON.parse(error.body);
          } catch (e) {
            console.error('Error parsing error body:', e);
          }
        }

        // Handle parsed error first
        if (parsedError?.code === 'invalid_credentials') {
          throw new Error('Invalid login credentials');
        }

        // Handle AuthApiError as fallback
        if (error instanceof AuthApiError) {
          if (error.status === 400) {
            throw new Error('Invalid login credentials');
          } else if (error.status === 429) {
            throw new Error('Too many login attempts');
          }
        }

        // Final fallback to message content check
        const errorMessage = parsedError?.message || error.message;
        if (errorMessage?.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Invalid login credentials');
        } else if (errorMessage?.toLowerCase().includes('email not confirmed')) {
          throw new Error('Email not confirmed');
        } else if (errorMessage?.toLowerCase().includes('too many requests')) {
          throw new Error('Too many login attempts');
        }
        
        // If we reach here, throw a generic error
        console.error('Unhandled auth error:', error);
        throw new Error('Login failed');
      }
  
      if (!data.user) {
        console.log("No user data returned");
        throw new Error("Login failed");
      }
  
      console.log("Login successful, fetching user profile...");
      const profile = await fetchUserProfile(data.user.id);
      setUser({ ...data.user, ...profile });
      handleAuthRedirect(profile, location.pathname, navigate);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext - Starting logout process...');
      setUser(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthContext - Error during signOut:', error);
        if (error.message?.includes('session_not_found')) {
          console.log('AuthContext - Session already expired, continuing with local cleanup');
        } else {
          console.warn('AuthContext - Non-session error during logout:', error);
        }
      }

      console.log('AuthContext - Logout successful, navigating to login page');
      navigate('/login');
      toast.success('Logout realizado com sucesso!');
      
    } catch (error: any) {
      console.error('AuthContext - Unexpected error during signOut:', error);
      setUser(null);
      navigate('/login');
      toast.error('Erro ao fazer logout, mas sua sessão foi encerrada localmente.');
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    options?: {
      data?: {
        nome_completo?: string;
        telefone?: string;
        filial_id?: string | null;
        tipo_documento?: string;
        numero_documento?: string;
        genero?: string;
        data_nascimento?: string;
      };
    };
  }) => {
    try {
      console.log('Starting new user registration.');
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nome_completo: userData.options?.data?.nome_completo,
            telefone: userData.options?.data?.telefone,
            filial_id: userData.options?.data?.filial_id,
            tipo_documento: userData.options?.data?.tipo_documento,
            numero_documento: userData.options?.data?.numero_documento,
            genero: userData.options?.data?.genero,
            data_nascimento: userData.options?.data?.data_nascimento
          }
        }
      });
  
      if (error) {
        console.error('Auth Error:', error.message);
        toast.error('Erro ao criar conta. Tente novamente.');
        return { user: null, error };
      }
  
      if (!data.user) {
        toast.error('Erro ao criar conta. Tente novamente.');
        return { user: null, error: new Error('User creation failed') };
      }
  
      console.log('User registered successfully!');
      toast.success('Cadastro realizado com sucesso! Faça login para acessar o sistema.');
      navigate('/');
  
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

  return {
    signIn,
    signOut,
    signUp,
    resendVerificationEmail
  };
}
