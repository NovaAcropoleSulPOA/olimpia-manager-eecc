import { z } from "zod";

export interface RegisterFormData {
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
  branchId: string | null;
  ddi: string;
  telefone: string;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  data_nascimento: Date | undefined;
  acceptPrivacyPolicy: boolean;
}

export const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  branchId: z.string().nullable(),
  ddi: z.string(),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  tipo_documento: z.string().min(1, 'Tipo de documento é obrigatório'),
  numero_documento: z.string().min(1, 'Número do documento é obrigatório'),
  genero: z.string().min(1, 'Gênero é obrigatório'),
  data_nascimento: z.date({
    required_error: 'Data de nascimento é obrigatória',
    invalid_type_error: 'Data de nascimento inválida',
  }),
  acceptPrivacyPolicy: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar a política de privacidade para continuar" }),
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

export interface DependentRegisterFormData {
  nome: string;
  tipo_documento: string;
  numero_documento: string;
  genero: string;
  data_nascimento: Date | undefined;
  modalidades: string[];
}

export const dependentRegisterSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo_documento: z.string().min(1, 'Tipo de documento é obrigatório'),
  numero_documento: z.string().min(1, 'Número do documento é obrigatório'),
  genero: z.string().min(1, 'Gênero é obrigatório'),
  data_nascimento: z.date({
    required_error: 'Data de nascimento é obrigatória',
    invalid_type_error: 'Data de nascimento inválida',
  }),
  modalidades: z.array(z.string()).optional(),
});
