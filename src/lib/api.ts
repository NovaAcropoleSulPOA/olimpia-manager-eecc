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
  
  // Fetch all the necessary data
  const { data: branches, error: branchError } = await supabase
    .from('filiais')
    .select('id, nome, cidade, estado');

  if (branchError) throw branchError;

  const { data: registrations, error: regError } = await supabase
    .from('inscricoes')
    .select('*');

  if (regError) throw regError;

  // Calculate analytics for each branch
  const analytics: BranchAnalytics[] = (branches || []).map(branch => {
    const branchRegistrations = (registrations || []).filter(reg => reg.filial_id === branch.id);
    
    const modalidadesCount: Record<string, number> = {};
    branchRegistrations.forEach(reg => {
      (reg.modalidades || []).forEach((modalidade: string) => {
        modalidadesCount[modalidade] = (modalidadesCount[modalidade] || 0) + 1;
      });
    });

    return {
      filial_id: branch.id,
      filial: branch.nome,
      cidade: branch.cidade,
      estado: branch.estado,
      total_inscritos: new Set(branchRegistrations.map(reg => reg.atleta_id)).size,
      total_inscricoes: branchRegistrations.length,
      valor_total_arrecadado: branchRegistrations.reduce((sum, reg) => sum + (reg.valor_total || 0), 0),
      modalidades_ativas: Object.keys(modalidadesCount).length,
      media_pontuacao_atletas: branchRegistrations.reduce((sum, reg) => sum + (reg.pontuacao || 0), 0) / 
        (branchRegistrations.length || 1),
      inscricoes_confirmadas: branchRegistrations.filter(reg => reg.status_inscricao === 'Confirmada').length,
      inscricoes_pendentes: branchRegistrations.filter(reg => reg.status_inscricao === 'Pendente').length,
      inscricoes_canceladas: branchRegistrations.filter(reg => reg.status_inscricao === 'Cancelada').length,
      inscricoes_recusadas: branchRegistrations.filter(reg => reg.status_inscricao === 'Recusada').length,
      modalidades_populares: modalidadesCount
    };
  });

  return analytics;
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