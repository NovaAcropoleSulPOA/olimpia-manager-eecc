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

export const fetchUserModalities = async (userId: string): Promise<Modality[]> => {
  console.log('Fetching user modalities for:', userId);
  const { data, error } = await supabase
    .from('modalidades_usuarios')
    .select(`
      modalidades (
        id,
        nome,
        tipo_pontuacao,
        tipo_modalidade,
        categoria,
        status
      )
    `)
    .eq('usuario_id', userId);

  if (error) {
    console.error('Error fetching user modalities:', error);
    throw error;
  }

  return data.map((item: any) => item.modalidades);
};

export const registerModality = async (userId: string, modalityId: number) => {
  console.log('Registering modality:', { userId, modalityId });
  const { error } = await supabase
    .from('modalidades_usuarios')
    .insert([{
      usuario_id: userId,
      modalidade_id: modalityId,
      status: 'pendente'
    }]);

  if (error) {
    console.error('Error registering modality:', error);
    throw error;
  }
};
