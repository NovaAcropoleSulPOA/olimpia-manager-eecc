import { supabase } from './supabase';

// Types matching database schema
export interface Modality {
  id: number;
  nome: string;
  tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
  tipo_modalidade: 'individual' | 'coletivo';
  categoria: 'misto' | 'masculino' | 'feminino';
  status?: 'pendente' | 'confirmado' | 'rejeitado';
}

export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export interface Role {
  id: number;
  nome: 'atleta' | 'organizador' | 'juiz';
  descricao?: string;
}

export interface User {
  id: string;
  email: string;
  nome_completo: string;
  telefone: string;
  filial_id: string;
  confirmado: boolean;
  data_criacao: string;
  tipo_documento: 'CPF' | 'RG';
  numero_documento: string;
  genero: 'Masculino' | 'Feminino' | 'Prefiro não informar';
  roles: Role[];
  modalidades?: Modality[];
}

export interface BranchAnalytics {
  filial_id: string;
  filial: string;
  cidade: string;
  estado: string;
  total_inscritos: number;
  total_inscricoes: number;
  inscricoes_pendentes: number;
  inscricoes_confirmadas: number;
  inscricoes_canceladas: number;
  inscricoes_recusadas: number;
  valor_total_arrecadado: number;
  modalidades_ativas: number;
  modalidades_populares: { [key: string]: number };
  total_pontos: number;
  media_pontuacao_atletas: number;
}

export interface ModalityRegistration {
  status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada';
  modalidade_id: number;
  modalidades: {
    nome: string;
  };
}

export interface AthleteRegistration {
  id: string;
  nome_atleta: string;
  email: string;
  telefone: string;
  filial: string;
  modalidades: string[];
  status_inscricao: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada';
  status_pagamento: 'pendente' | 'confirmado' | 'cancelado';
  pontos_totais: number;
}

export const fetchModalities = async (): Promise<Modality[]> => {
  console.log('Fetching modalities from database');
  const { data, error } = await supabase
    .from('modalidades')
    .select('*');
  
  if (error) {
    console.error('Error fetching modalities:', error);
    throw error;
  }
  
  console.log('Fetched modalities:', data);
  return data;
};

export const fetchBranches = async (): Promise<Branch[]> => {
  console.log('Fetching branches from database');
  const { data, error } = await supabase
    .from('filiais')
    .select('*');
  
  if (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }
  
  console.log('Fetched branches:', data);
  return data;
};

export const fetchRoles = async (): Promise<Role[]> => {
  console.log('Fetching roles from database');
  const { data, error } = await supabase
    .from('perfis')
    .select('*');
  
  if (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
  
  console.log('Fetched roles:', data);
  return data;
};

export const assignUserRoles = async (userId: string, roleIds: number[]) => {
  console.log('Assigning roles to user:', userId, roleIds);
  
  const rolesToInsert = roleIds.map(roleId => ({
    usuario_id: userId,
    perfil_id: roleId
  }));

  const { error } = await supabase
    .from('papeis_usuarios')
    .upsert(rolesToInsert);

  if (error) {
    console.error('Error assigning user roles:', error);
    throw error;
  }
};

export const createUserProfile = async (userId: string, data: any) => {
  console.log('Creating user profile with data:', { userId, data });
  
  const { error } = await supabase
    .from('usuarios')
    .insert([{
      id: userId,
      nome_completo: data.nome,
      telefone: data.telefone.replace(/\D/g, ''),
      email: data.email,
      filial_id: data.branchId,
      confirmado: false,
      data_criacao: new Date().toISOString(),
      tipo_documento: data.tipo_documento,
      numero_documento: data.numero_documento.replace(/\D/g, ''),
      genero: data.genero
    }]);

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const fetchPendingUsers = async (): Promise<User[]> => {
  console.log('Fetching pending users');
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      id,
      email,
      nome_completo,
      telefone,
      filial_id,
      confirmado,
      data_criacao,
      tipo_documento,
      numero_documento,
      papeis_usuarios (
        perfis (
          id,
          nome,
          descricao
        )
      )
    `)
    .eq('confirmado', false);

  if (error) {
    console.error('Error fetching pending users:', error);
    throw error;
  }

  return data.map((user: any) => ({
    ...user,
    roles: user.papeis_usuarios.map((pu: any) => ({
      id: pu.perfis.id,
      nome: pu.perfis.nome,
      descricao: pu.perfis.descricao
    }))
  }));
};

export const approveUser = async (userId: string) => {
  console.log('Approving user:', userId);
  const { error } = await supabase
    .from('usuarios')
    .update({ confirmado: true })
    .eq('id', userId);

  if (error) {
    console.error('Error approving user:', error);
    throw error;
  }
};

export const rejectUser = async (userId: string) => {
  console.log('Rejecting user:', userId);
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
};

export const fetchAthleteRegistrations = async (): Promise<AthleteRegistration[]> => {
  console.log('Fetching athlete registrations from tables...');
  
  // First, fetch all confirmed users with their branch information
  const { data: users, error: usersError } = await supabase
    .from('usuarios')
    .select(`
      id,
      nome_completo,
      email,
      telefone,
      filial_id,
      filiais (
        nome
      )
    `)
    .eq('confirmado', true);

  if (usersError) {
    console.error('Error fetching users:', usersError);
    throw usersError;
  }

  // Process each user to get their complete registration information
  const registrations = await Promise.all(users.map(async (user) => {
    // Fetch modality registrations for the user
    const { data: modalityRegistrations, error: modalityError } = await supabase
      .from('inscricoes_modalidades')
      .select(`
        status,
        modalidade_id,
        modalidades:modalidades (
          nome
        )
      `)
      .eq('atleta_id', user.id);

    if (modalityError) {
      console.error('Error fetching modality registrations:', modalityError);
      return null;
    }

    // Type assertion for modalityRegistrations
    type ModalityData = {
      status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada';
      modalidade_id: number;
      modalidades: {
        nome: string;
      };
    };

    const typedModalityRegistrations = modalityRegistrations as ModalityData[];

    // Fetch payment status
    const { data: payments, error: paymentError } = await supabase
      .from('pagamentos')
      .select('status')
      .eq('atleta_id', user.id)
      .limit(1);

    if (paymentError) {
      console.error('Error fetching payment status:', paymentError);
      return null;
    }

    // Fetch scores
    const { data: scores, error: scoresError } = await supabase
      .from('pontuacoes')
      .select('pontuacao')
      .eq('atleta_id', user.id);

    if (scoresError) {
      console.error('Error fetching scores:', scoresError);
      return null;
    }

    // Process modality registrations with proper type checking
    const modalityNames = typedModalityRegistrations
      ? typedModalityRegistrations.map(reg => reg.modalidades?.nome).filter(Boolean)
      : [];
    
    const registrationStatus = typedModalityRegistrations?.[0]?.status || 'Pendente';
    const paymentStatus = (payments?.[0]?.status || 'pendente') as 'pendente' | 'confirmado' | 'cancelado';
    const totalPoints = scores?.reduce((sum, score) => sum + (score.pontuacao || 0), 0) || 0;

    return {
      id: user.id,
      nome_atleta: user.nome_completo,
      email: user.email,
      telefone: user.telefone,
      filial: user.filiais?.nome || 'N/A',
      modalidades: modalityNames,
      status_inscricao: registrationStatus,
      status_pagamento: paymentStatus,
      pontos_totais: totalPoints
    };
  }));

  // Filter out any null values from failed fetches
  return registrations.filter((reg): reg is AthleteRegistration => reg !== null);
};

export const updateRegistrationStatus = async (
  registrationId: string,
  status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Recusada'
) => {
  console.log('Updating registration status:', { registrationId, status });
  
  const { error } = await supabase
    .from('inscricoes_modalidades')
    .update({ status })
    .eq('atleta_id', registrationId);

  if (error) {
    console.error('Error updating registration status:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  registrationId: string,
  status: 'pendente' | 'confirmado' | 'cancelado'
) => {
  console.log('Updating payment status:', { registrationId, status });
  
  const { error } = await supabase
    .from('pagamentos')
    .update({ status })
    .eq('atleta_id', registrationId);

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export const fetchBranchAnalytics = async (): Promise<BranchAnalytics[]> => {
  console.log('Fetching branch analytics...');
  const { data, error } = await supabase
    .from('vw_analytics_inscricoes')
    .select('*');

  if (error) {
    console.error('Error fetching branch analytics:', error);
    throw error;
  }

  console.log('Fetched branch analytics:', data);
  return data;
};
