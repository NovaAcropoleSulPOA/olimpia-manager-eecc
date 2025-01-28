import { supabase } from './supabase';

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
}

export interface BranchAnalytics {
  filial_id: string;
  filial: string;
  cidade: string;
  estado: string;
  total_inscritos: number;
  total_inscricoes: number;
  valor_total_arrecadado: number;
  modalidades_ativas: number;
  media_pontuacao_atletas: number;
  inscricoes_confirmadas: number;
  inscricoes_pendentes: number;
  inscricoes_canceladas: number;
  inscricoes_recusadas: number;
  modalidades_populares: Record<string, number>;
}

export const fetchBranchAnalytics = async (): Promise<BranchAnalytics[]> => {
  console.log('Fetching branch analytics from view...');
  const { data, error } = await supabase
    .from('vw_analytics_inscricoes')
    .select('*');

  if (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }

  return data || [];
};

export const fetchAthleteRegistrations = async (): Promise<AthleteRegistration[]> => {
  console.log('Fetching athlete registrations from vw_inscricoes_atletas...');
  const { data, error } = await supabase
    .from('vw_inscricoes_atletas')
    .select('*');

  if (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }

  // Transform the data to match the expected format
  const transformedData = data?.map(registration => ({
    id: registration.atleta_id,
    nome_atleta: registration.atleta_nome,
    email: registration.atleta_email || '',
    confirmado: registration.status_confirmacao,
    telefone: registration.telefone,
    filial: registration.filial_nome,
    modalidades: [{
      id: registration.inscricao_id.toString(),
      modalidade: registration.modalidade_nome,
      status: registration.status_inscricao,
      justificativa_status: registration.justificativa_status || ''
    }],
    status_inscricao: registration.status_inscricao,
    status_pagamento: registration.status_pagamento
  })) || [];

  // Group registrations by athlete
  const groupedData = transformedData.reduce((acc, curr) => {
    const existingAthlete = acc.find(a => a.id === curr.id);
    if (existingAthlete) {
      existingAthlete.modalidades.push(...curr.modalidades);
    } else {
      acc.push(curr);
    }
    return acc;
  }, [] as AthleteRegistration[]);

  console.log('Transformed registrations data:', groupedData);
  return groupedData;
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

export const fetchBranches = async () => {
  console.log('Fetching branches...');
  const { data, error } = await supabase
    .from('filiais')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }

  return data || [];
};
