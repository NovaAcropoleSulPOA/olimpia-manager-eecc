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
  id: string;  // Changed to string since Supabase IDs are UUIDs
  nome: string;
  cidade: string;
  estado: string;
}

export interface Role {
  id: number;
  nome: string;
  descricao: string;
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