
import { supabase } from './supabase';

export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export interface AthleteModality {
  id: string;
  modalidade: string;
  status: string;
  justificativa_status: string;
}

export interface AthleteRegistration {
  id: string;
  nome_atleta: string;
  email: string;
  confirmado: boolean;
  telefone: string;
  filial: string;
  filial_id: string;  // Added this field
  modalidades: AthleteModality[];
  status_inscricao: 'pendente' | 'confirmado' | 'rejeitado' | 'cancelado';
  status_pagamento: 'pendente' | 'confirmado' | 'cancelado';
  inscricao_id?: number;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  numero_identificador?: string;
}

export interface BranchAnalytics {
  filial_id: string;
  filial: string;
  total_inscritos: number;
  valor_total_pago: number;
  valor_total_pendente: number;
  total_atletas_pendentes_pagamento: number;
  inscritos_por_status_pagamento: Record<string, number>;
  modalidades_populares: Record<string, {
    Masculino: number;
    Feminino: number;
    Misto: number;
  }>;
  media_pontuacao_por_modalidade: Record<string, number>;
  top_modalidades_masculino: Record<string, number>;
  top_modalidades_feminino: Record<string, number>;
  top_modalidades_misto: Record<string, number>;
}

export const updatePaymentAmount = async (
  athleteId: string,
  amount: number
): Promise<void> => {
  console.log('Updating payment amount:', { athleteId, amount });
  
  try {
    const { error } = await supabase
      .from('pagamentos')
      .update({ valor: amount })
      .eq('atleta_id', athleteId);

    if (error) {
      console.error('Error updating payment amount:', error);
      throw new Error(error.message);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error in updatePaymentAmount:', error);
    throw error;
  }
};

export const fetchBranches = async (): Promise<Branch[]> => {
  console.log('Fetching branches...');
  const { data, error } = await supabase
    .from('filiais')
    .select('*');

  if (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }

  return data || [];
};

export const fetchBranchAnalytics = async (): Promise<BranchAnalytics[]> => {
  console.log('Fetching branch analytics from view...');
  try {
    const { data, error } = await supabase
      .from('vw_analytics_inscricoes')
      .select('*');

    if (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }

    if (!data) {
      console.log('No data returned from analytics view');
      return [];
    }

    console.log('Branch analytics response:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchBranchAnalytics:', error);
    throw error;
  }
};

export const fetchAthleteRegistrations = async (): Promise<AthleteRegistration[]> => {
  console.log('Fetching athlete registrations...');
  try {
    // First, check if user is an organizer
    const { data: userRoles, error: rolesError } = await supabase
      .from('papeis_usuarios')
      .select(`
        perfil_id,
        perfis:perfis (
          nome
        )
      `)
      .eq('usuario_id', supabase.auth.getUser().then(res => res.data.user?.id));

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      throw rolesError;
    }

    console.log('User roles:', userRoles);

    const isOrganizer = userRoles?.some(role => role.perfis?.nome === 'Organizador');
    console.log('Is user an organizer?', isOrganizer);

    // Fetch registrations based on role
    const { data, error } = await supabase
      .from('vw_inscricoes_atletas')
      .select('*')
      .order('nome_atleta');

    if (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }

    console.log('Raw registrations data:', data);
    console.log('Number of registrations:', data?.length);

    if (!data) {
      console.log('No registrations data returned');
      return [];
    }

    const transformedData = data.map(registration => ({
      id: registration.atleta_id?.toString() || registration.id?.toString(),
      nome_atleta: registration.atleta_nome || registration.nome_atleta,
      email: registration.atleta_email || registration.email || '',
      confirmado: registration.status_confirmacao || false,
      telefone: registration.telefone || '',
      filial: registration.filial_nome || registration.filial,
      filial_id: registration.filial_id || '',
      modalidades: [{
        id: registration.inscricao_id?.toString() || registration.id?.toString(),
        modalidade: registration.modalidade_nome || registration.modalidade,
        status: registration.status_inscricao || 'pendente',
        justificativa_status: registration.justificativa_status || ''
      }],
      status_inscricao: registration.status_inscricao || 'pendente',
      status_pagamento: registration.status_pagamento || 'pendente',
      inscricao_id: registration.inscricao_id || undefined,
      tipo_documento: registration.tipo_documento || '',
      numero_documento: registration.numero_documento || '',
      genero: registration.genero || '',
      numero_identificador: registration.numero_identificador || undefined
    }));

    // Group registrations by athlete
    const groupedData = transformedData.reduce((acc, curr) => {
      const existingAthlete = acc.find(a => a.id === curr.id);
      if (existingAthlete) {
        // Merge modalidades arrays while preventing duplicates
        const modalidadesSet = new Set([
          ...existingAthlete.modalidades.map(m => JSON.stringify(m)),
          ...curr.modalidades.map(m => JSON.stringify(m))
        ]);
        existingAthlete.modalidades = Array.from(modalidadesSet).map(m => JSON.parse(m));
      } else {
        acc.push(curr);
      }
      return acc;
    }, [] as AthleteRegistration[]);

    console.log('Transformed and grouped data:', groupedData);
    console.log('Number of unique athletes:', groupedData.length);

    return groupedData;
  } catch (error) {
    console.error('Error in fetchAthleteRegistrations:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  athleteId: string,
  status: string
): Promise<void> => {
  console.log('Updating payment status:', { athleteId, status });
  
  try {
    const { error } = await supabase
      .rpc('atualizar_status_pagamento', {
        p_atleta_id: athleteId,
        p_novo_status: status
      });

    if (error) {
      console.error('Error updating payment status:', error);
      throw new Error(error.message);
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    throw error;
  }
};

export const updateModalityStatus = async (
  modalityId: string,
  status: string,
  justification: string
): Promise<void> => {
  console.log('Updating modality status:', { modalityId, status, justification });
  const { error } = await supabase
    .rpc('atualizar_status_inscricao', {
      inscricao_id: parseInt(modalityId),
      novo_status: status,
      justificativa: justification
    });

  if (error) {
    console.error('Error updating modality status:', error);
    throw error;
  }

  return Promise.resolve();
};
