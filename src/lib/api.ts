import { supabase } from './supabase';

export interface Modality {
  id: number;
  nome: string;
  descricao?: string;
  tipo_pontuacao?: string;
  tipo_modalidade?: string;
  categoria?: string;
}

export interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export interface Role {
  id: number;
  nome: string;
  descricao: string;
}

export interface User {
  id: string;
  email: string;
  nome: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  roles: Role[];
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
  
  const { error } = await supabase
    .from('papeis_usuarios')
    .upsert(
      roleIds.map(roleId => ({
        user_id: userId,
        role_id: roleId
      }))
    );

  if (error) {
    console.error('Error assigning user roles:', error);
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
      nome,
      status,
      papeis_usuarios (
        perfis (
          id,
          nome,
          descricao
        )
      )
    `)
    .eq('status', 'pendente');

  if (error) {
    console.error('Error fetching pending users:', error);
    throw error;
  }

  return data.map((user: any) => ({
    ...user,
    roles: user.papeis_usuarios.map((pu: any) => pu.perfis)
  }));
};

export const approveUser = async (userId: string) => {
  console.log('Approving user:', userId);
  const { error } = await supabase
    .from('usuarios')
    .update({ status: 'aprovado' })
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
    .update({ status: 'rejeitado' })
    .eq('id', userId);

  if (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
};

export const removeUserRole = async (userId: string, roleId: number) => {
  console.log('Removing role from user:', userId, roleId);
  const { error } = await supabase
    .from('papeis_usuarios')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', roleId);

  if (error) {
    console.error('Error removing user role:', error);
    throw error;
  }
};