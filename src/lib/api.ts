import { supabase } from './supabase';

export interface AthleteRegistration {
  id: string;
  nome_atleta: string;
  email: string;
  telefone: string;
  filial: string;
  modalidades: string[];
  status_inscricao: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada';
  status_pagamento: 'pendente' | 'confirmado' | 'cancelado';
}

export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
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

export const fetchBranches = async (): Promise<Branch[]> => {
  console.log('Fetching branches...');
  const { data, error } = await supabase
    .from('filiais')
    .select('id, nome, cidade, estado');

  if (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }

  return data || [];
};

export const fetchAthleteRegistrations = async (): Promise<AthleteRegistration[]> => {
  console.log('Fetching athlete registrations...');
  const { data, error } = await supabase
    .from('inscricoes')
    .select(`
      id,
      nome_atleta,
      email,
      telefone,
      filial,
      modalidades,
      status_inscricao,
      status_pagamento
    `);

  if (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }

  return data || [];
};

export const fetchBranchAnalytics = async (): Promise<BranchAnalytics[]> => {
  console.log('Fetching branch analytics...');
  const { data, error } = await supabase
    .from('analytics_filiais')
    .select('*');

  if (error) {
    console.error('Error fetching branch analytics:', error);
    throw error;
  }

  return data || [];
};

export const updateRegistrationStatus = async (
  id: string, 
  status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada'
): Promise<void> => {
  console.log('Updating registration status:', { id, status });
  const { error } = await supabase
    .from('inscricoes')
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
    .from('inscricoes')
    .update({ status_pagamento: status })
    .eq('id', id);

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};
