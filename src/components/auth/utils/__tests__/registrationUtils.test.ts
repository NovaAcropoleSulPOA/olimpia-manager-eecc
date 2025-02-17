
import { describe, it, expect, vi } from 'vitest';
import { 
  formatBirthDate, 
  formatPhoneNumber, 
  checkExistingUser, 
  prepareUserMetadata 
} from '../registrationUtils';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn()
        }))
      }))
    }))
  }
}));

describe('formatBirthDate', () => {
  it('should format string date correctly', () => {
    const result = formatBirthDate('25/12/1990');
    expect(result).toBe('1990-12-25');
  });

  it('should format Date object correctly', () => {
    const date = new Date('1990-12-25');
    const result = formatBirthDate(date);
    expect(result).toBe('1990-12-25');
  });

  it('should return null for invalid date string', () => {
    const result = formatBirthDate('invalid-date');
    expect(result).toBeNull();
  });

  it('should return null for invalid Date object', () => {
    const result = formatBirthDate(new Date('invalid'));
    expect(result).toBeNull();
  });
});

describe('formatPhoneNumber', () => {
  it('should format phone number correctly', () => {
    const result = formatPhoneNumber('+55', '11999887766');
    expect(result).toBe('+5511999887766');
  });

  it('should handle undefined phone number', () => {
    const result = formatPhoneNumber('+55', undefined);
    expect(result).toBe('+55');
  });

  it('should remove non-numeric characters', () => {
    const result = formatPhoneNumber('+55', '(11) 99988-7766');
    expect(result).toBe('+5511999887766');
  });
});

describe('checkExistingUser', () => {
  it('should call Supabase with correct parameters', async () => {
    const email = 'test@example.com';
    await checkExistingUser(email);

    expect(supabase.from).toHaveBeenCalledWith('usuarios');
    expect(supabase.from().select).toHaveBeenCalledWith('id');
    expect(supabase.from().select().eq).toHaveBeenCalledWith('email', email);
  });
});

describe('prepareUserMetadata', () => {
  it('should prepare metadata correctly', () => {
    const values = {
      nome: 'John Doe',
      ddi: '+55',
      telefone: '11999887766',
      branchId: 'branch-123',
      tipo_documento: 'CPF',
      numero_documento: '123.456.789-00',
      genero: 'M',
      email: 'test@example.com',
      password: 'password123',
      data_nascimento: '01/01/1990'
    };

    const formattedBirthDate = '1990-01-01';

    const result = prepareUserMetadata(values, formattedBirthDate);

    expect(result).toEqual({
      nome_completo: 'John Doe',
      telefone: '+5511999887766',
      filial_id: 'branch-123',
      tipo_documento: 'CPF',
      numero_documento: '12345678900',
      genero: 'M',
      data_nascimento: '1990-01-01'
    });
  });

  it('should handle missing optional fields', () => {
    const values = {
      nome: 'John Doe',
      ddi: '+55',
      telefone: undefined,
      branchId: null,
      tipo_documento: 'CPF',
      numero_documento: undefined,
      genero: 'M',
      email: 'test@example.com',
      password: 'password123',
      data_nascimento: '01/01/1990'
    };

    const formattedBirthDate = '1990-01-01';

    const result = prepareUserMetadata(values, formattedBirthDate);

    expect(result).toEqual({
      nome_completo: 'John Doe',
      telefone: '+55',
      filial_id: null,
      tipo_documento: 'CPF',
      numero_documento: '',
      genero: 'M',
      data_nascimento: '1990-01-01'
    });
  });
});
