import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import AthleteScoresSection from './AthleteScoresSection';
import AthleteProfile from './AthleteProfile';
import PaymentInfo from './PaymentInfo';
import { Loader2 } from "lucide-react";

interface AthleteProfileData {
  atleta_id: string;
  nome_completo: string;
  telefone: string;
  email: string;
  numero_identificador: string;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  filial_nome: string;
  filial_cidade: string;
  filial_estado: string;
  papeis?: string[];
}

interface PaymentStatus {
  status: string;
  valor?: number;
}

// Updated interface to match exact Supabase response structure
interface UserRole {
  perfis: {
    nome: string;
  }[]
}

export default function AthleteProfilePage() {
  const { user } = useAuth();
  const isPublicUser = user?.papeis?.includes('Público Geral') || user?.papeis?.length === 0;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['athlete-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Fetching athlete profile for:', user.id);

      // Fetch basic profile data
      const { data: profileData, error: profileError } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('atleta_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching athlete profile:', profileError);
        throw profileError;
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis (
            nome
          )
        `)
        .eq('usuario_id', user.id);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }

      // Combine profile data with roles
      const userRoles = (rolesData as UserRole[])?.flatMap(role => role.perfis.map(p => p.nome)) || [];
      
      console.log('Profile data:', { ...profileData, papeis: userRoles });
      return {
        ...profileData,
        papeis: userRoles
      } as AthleteProfileData;
    },
    enabled: !!user?.id,
  });

  const { data: paymentStatus, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Fetching payment status for:', user.id);

      if (isPublicUser) {
        const { data: taxaData, error: taxaError } = await supabase
          .from('vw_taxas_inscricao_usuarios')
          .select('*')
          .eq('usuario_id', user.id)
          .maybeSingle();

        if (taxaError) {
          console.error('Error fetching public user payment info:', taxaError);
          throw taxaError;
        }

        const { data: pgtoData, error: pgtoError } = await supabase
          .from('pagamentos')
          .select('status')
          .eq('atleta_id', user.id)
          .maybeSingle();

        if (pgtoError) {
          console.error('Error fetching public user payment status:', pgtoError);
          throw pgtoError;
        }

        console.log('Public user payment data:', { taxa: taxaData, pagamento: pgtoData });
        return {
          status: pgtoData?.status || 'pendente',
          valor: taxaData?.valor
        } as PaymentStatus;
      } else {
        const { data, error } = await supabase
          .from('pagamentos')
          .select('status, valor')
          .eq('atleta_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching athlete payment status:', error);
          throw error;
        }
        console.log('Athlete payment status:', data);
        return data as PaymentStatus;
      }
    },
    enabled: !!user?.id,
  });

  if (profileLoading || paymentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
      </div>
    );
  }

  if (!profile && !isPublicUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Perfil não encontrado</p>
      </div>
    );
  }

  const isPendingPayment = paymentStatus?.status?.toLowerCase() === 'pendente';

  return (
    <div className="container mx-auto py-6 space-y-8">
      <AthleteProfile 
        profile={{
          ...profile || {
            nome_completo: user?.nome_completo || '',
            email: user?.email || '',
            telefone: user?.telefone || '',
            tipo_documento: user?.tipo_documento || '',
            numero_documento: user?.numero_documento || '',
            filial_nome: '',
            filial_cidade: '',
            filial_estado: '',
            genero: user?.genero || '',
          },
          papeis: user?.papeis,
          pagamento_status: paymentStatus?.status,
          pagamento_valor: paymentStatus?.valor,
        }} 
        isPublicUser={isPublicUser}
      />
      {isPendingPayment && <PaymentInfo key={user?.id} />}
      {!isPublicUser && user?.id && <AthleteScoresSection athleteId={user.id} />}
    </div>
  );
}
