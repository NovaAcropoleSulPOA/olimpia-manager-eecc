
import { z } from "zod";
import { validateCPF } from "@/utils/documentValidation";

export const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  ddi: z.string().default('+55'),
  telefone: z.string().min(14, 'Telefone inválido').max(15),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  branchId: z.string().uuid('Sede inválida').optional(),
  tipo_documento: z.enum(['CPF', 'RG'], {
    required_error: "Selecione o tipo de documento",
  }),
  numero_documento: z.string()
    .min(1, 'Número do documento é obrigatório')
    .refine((val) => {
      if (!val) return false;
      const clean = val.replace(/\D/g, '');
      return clean.length >= 9;
    }, 'Documento inválido')
    .refine((val) => {
      const clean = val.replace(/\D/g, '');
      if (clean.length !== 11) return true;
      return validateCPF(clean);
    }, 'CPF inválido'),
  genero: z.enum(['Masculino', 'Feminino'], {
    required_error: "Selecione o gênero",
  }),
  data_nascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
