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
  telefone: string;
  filial: string;
  modalidades: AthleteModality[];
  status_inscricao: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada';
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

export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  created_at: string;
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
  console.log('Fetching athlete registrations...');
  const { data, error } = await supabase
    .from('vw_inscricoes_atletas')
    .select(`
      id,
      nome_atleta,
      email,
      telefone,
      filial,
      modalidades:inscricoes_modalidades(
        id,
        modalidade:modalidades(nome),
        status,
        justificativa_status
      ),
      status_inscricao,
      status_pagamento
    `);

  if (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }

  // Transform the data to match the expected format
  const transformedData = data?.map(registration => ({
    ...registration,
    modalidades: registration.modalidades.map((m: any) => ({
      id: m.id,
      modalidade: m.modalidade.nome,
      status: m.status,
      justificativa_status: m.justificativa_status
    }))
  })) || [];

  console.log('Transformed registrations data:', transformedData);
  return transformedData;
};

export const updateRegistrationStatus = async (
  id: string, 
  status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada'
): Promise<void> => {
  console.log('Updating registration status:', { id, status });
  const { error } = await supabase
    .from('registros_atletas')
    .update({ status_inscricao: status })
    .eq('id', id);

  if (error) {
    console.error('Error updating registration status:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  id: string, 
  status: 'pendente' | 'confirmado' | 'cancelado'
): Promise<void> => {
  console.log('Updating payment status:', { id, status });
  const { error } = await supabase
    .from('registros_atletas')
    .update({ status_pagamento: status })
    .eq('id', id);

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export const fetchBranches = async (): Promise<Branch[]> => {
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

export const updateModalityStatus = async (
  modalityId: string,
  status: string,
  justification: string
): Promise<void> => {
  console.log('Updating modality status:', { modalityId, status, justification });
  const { error } = await supabase
    .from('inscricoes_modalidades')
    .update({ 
      status: status,
      justificativa_status: justification 
    })
    .eq('id', modalityId);

  if (error) {
    console.error('Error updating modality status:', error);
    throw error;
  }

  // Return a Promise that resolves when the update is complete
  return Promise.resolve();
};
