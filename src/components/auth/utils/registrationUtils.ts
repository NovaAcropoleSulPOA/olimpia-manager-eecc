
import { format, isValid, parse } from 'date-fns';
import { RegisterFormData } from '../types/form-types';
import { supabase } from '@/lib/supabase';

export const formatBirthDate = (birthDateValue: Date | string): string | null => {
  try {
    let birthDate: Date;
    
    if (typeof birthDateValue === 'string') {
      birthDate = parse(birthDateValue, 'dd/MM/yyyy', new Date());
    } else {
      birthDate = birthDateValue;
    }

    if (!isValid(birthDate)) {
      return null;
    }

    return format(birthDate, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting birth date:', error);
    return null;
  }
};

export const formatPhoneNumber = (ddi: string, telefone: string | undefined): string => {
  const cleanedPhoneNumber = telefone ? telefone.replace(/\D/g, '') : '';
  return `${ddi}${cleanedPhoneNumber}`;
};

export const checkExistingUser = async (email: string) => {
  return await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .maybeSingle();
};

export const prepareUserMetadata = (values: RegisterFormData, formattedBirthDate: string) => {
  return {
    nome_completo: values.nome,
    telefone: formatPhoneNumber(values.ddi, values.telefone),
    filial_id: values.branchId || null,
    tipo_documento: values.tipo_documento,
    numero_documento: values.numero_documento ? values.numero_documento.replace(/\D/g, '') : '',
    genero: values.genero,
    data_nascimento: formattedBirthDate
  };
};
