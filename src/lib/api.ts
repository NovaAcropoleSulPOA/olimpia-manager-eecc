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
  numero_documento: string;  // Added this field
  genero: string;           // Added this field
}

export const fetchBranches = async (): Promise<Branch[]> => {
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
    const { data, error } = await supabase
      .from('vw_inscricoes_atletas')
      .select('*');

    if (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }

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
      numero_documento: registration.numero_documento || '',  // Added this field
      genero: registration.genero || 'Prefiro não informar',  // Added this field with default value
      modalidades: [{
        id: registration.inscricao_id?.toString() || registration.id?.toString(),
        modalidade: registration.modalidade_nome || registration.modalidade,
        status: registration.status_inscricao || 'pendente',
        justificativa_status: registration.justificativa_status || ''
      }],
      status_inscricao: registration.status_inscricao || 'pendente',
      status_pagamento: registration.status_pagamento || 'pendente'
    }));

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
  
  // Get all modality registrations for this athlete
  const { data: registrations, error: fetchError } = await supabase
    .from('inscricoes_modalidades')
    .select('id')
    .eq('atleta_id', athleteId);

  if (fetchError) {
    console.error('Error fetching registrations:', fetchError);
    throw fetchError;
  }

  if (!registrations?.length) {
    console.error('No registrations found for athlete:', athleteId);
    throw new Error('No registrations found for athlete');
  }

  // Update the status for all registrations
  const { error } = await supabase
    .rpc('atualizar_status_inscricao', {
      inscricao_id: registrations[0].id,
      novo_status: status,
      justificativa: `Payment status updated to ${status}`
    });

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }

  return Promise.resolve();
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
