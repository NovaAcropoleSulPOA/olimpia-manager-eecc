
export interface PaymentStatus {
  valor: number | null;
  perfil_nome: string | null;
  isento: boolean;
  status?: string;
  evento_id: string;
  usuario_id: string;
}

export interface PaymentFeeInfo {
  valor: number | null;
  pix_key: string | null;
  data_limite_inscricao: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  isento: boolean;
  perfil_nome: string | null;
  qr_code_image: string | null;
  qr_code_codigo: string | null;
  link_formulario: string | null;
  perfil_id: number;
  is_current_profile?: boolean;
}
