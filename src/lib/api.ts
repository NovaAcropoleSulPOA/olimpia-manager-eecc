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
  nome_completo: string;
  confirmado: boolean;
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

export const assignUserRoles = async (userId: string, roles: string[]) => {
  console.log('Assigning roles to user:', userId, roles);
  
  const { error } = await supabase
    .from('papeis_usuarios')
    .upsert(
      roles.map(role => ({
        usuario_id: userId,
        tipo_papel: role.toLowerCase() // Changed to tipo_papel
      }))
    );

  if (error) {
    console.error('Error assigning user roles:', error);
    throw error;
  }
};

export const createUserProfile = async (userId: string, data: any) => {
  console.log('Creating user profile:', userId, data);
  
  const { error } = await supabase
    .from('usuarios')
    .insert([
      {
        id: userId,
        nome_completo: data.nome,
        telefone: data.telefone.replace(/\D/g, ''),
        email: data.email,
        senha: data.password,
        filial_id: data.branchId,
        confirmado: false,
        data_criacao: new Date().toISOString()
      }
    ]);

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
      confirmado,
      papeis_usuarios (
        tipo_papel
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
      id: getRoleId(pu.tipo_papel),
      nome: pu.tipo_papel,
      descricao: getRoleDescription(pu.tipo_papel)
    }))
  }));
};

// Helper function to map tipo_papel to role ID
const getRoleId = (tipoPapel: string): number => {
  switch (tipoPapel.toLowerCase()) {
    case 'atleta': return 1;
    case 'organizador': return 2;
    case 'juiz': return 3;
    default: return 0;
  }
};

// Helper function to get role description
const getRoleDescription = (tipoPapel: string): string => {
  switch (tipoPapel.toLowerCase()) {
    case 'atleta': return 'Usuário que participa das competições';
    case 'organizador': return 'Usuário responsável pela organização de eventos';
    case 'juiz': return 'Usuário responsável por avaliar e pontuar as competições';
    default: return '';
  }
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
    .update({ confirmado: false })
    .eq('id', userId);

  if (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
};

export const removeUserRole = async (userId: string, tipoPapel: string) => {
  console.log('Removing role from user:', userId, tipoPapel);
  const { error } = await supabase
    .from('papeis_usuarios')
    .delete()
    .eq('usuario_id', userId)
    .eq('tipo_papel', tipoPapel.toLowerCase());

  if (error) {
    console.error('Error removing user role:', error);
    throw error;
  }
};
