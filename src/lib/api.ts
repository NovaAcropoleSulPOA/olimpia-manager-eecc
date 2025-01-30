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
  modalidades: AthleteModality[];
  status_inscricao: 'pendente' | 'confirmado' | 'rejeitado' | 'cancelado';
  status_pagamento: 'pendente' | 'confirmado' | 'cancelado';
  numero_documento: string;
  tipo_documento: string;
  numero_identificador: string;
  genero: string;
}

export interface BranchAnalytics {
  filial_id: string;
  filial: string;
  total_inscritos: number;
  valor_total_arrecadado: number;
  modalidades_populares: Array<{
    modalidade: string;
    total_inscritos: number;
  }>;
  inscritos_por_status: Array<{
    status_inscricao: string;
    quantidade: number;
  }>;
  inscritos_por_status_pagamento: Array<{
    status_pagamento: string;
    quantidade: number;
  }>;
  atletas_por_categoria: Array<{
    categoria: string;
    quantidade: number;
  }>;
}

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

interface ViewPerfilAtletaResponse {
  atleta_id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  filial_nome: string;
  numero_documento: string;
  tipo_documento: string;
  numero_identificador: string;
  genero: string;
  status_confirmacao: boolean;
  pagamento_status: 'pendente' | 'confirmado' | 'cancelado';
  inscricoes: Array<{
    id: string;
    modalidade: {
      nome: string;
    };
    status: string;
    justificativa_status: string;
  }>;
}

export const fetchAthleteRegistrations = async (): Promise<AthleteRegistration[]> => {
  console.log('Fetching athlete registrations...');
  try {
    const { data, error } = await supabase
      .from('view_perfil_atleta')
      .select(`
        atleta_id,
        nome_completo,
        email,
        telefone,
        filial_nome,
        numero_documento,
        tipo_documento,
        numero_identificador,
        genero,
        status_confirmacao,
        pagamento_status,
        inscricoes:inscricoes_modalidades(
          id,
          modalidade:modalidades(nome),
          status,
          justificativa_status
        )
      `);

    if (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }

    if (!data) {
      console.log('No registrations data returned');
      return [];
    }

    console.log('Raw data from view_perfil_atleta:', data);

    const transformedData: AthleteRegistration[] = (data as ViewPerfilAtletaResponse[]).map(registration => ({
      id: registration.atleta_id,
      nome_atleta: registration.nome_completo,
      email: registration.email || '',
      confirmado: registration.status_confirmacao || false,
      telefone: registration.telefone || '',
      filial: registration.filial_nome,
      modalidades: registration.inscricoes?.map(inscricao => ({
        id: inscricao.id,
        modalidade: inscricao.modalidade?.nome || '',
        status: inscricao.status || 'pendente',
        justificativa_status: inscricao.justificativa_status || ''
      })) || [],
      status_inscricao: 'pendente' as const,
      status_pagamento: registration.pagamento_status || 'pendente',
      numero_documento: registration.numero_documento || '',
      tipo_documento: registration.tipo_documento || '',
      numero_identificador: registration.numero_identificador || '',
      genero: registration.genero || 'Prefiro não informar'
    }));

    console.log('Transformed registrations data:', transformedData);
    return transformedData;
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
