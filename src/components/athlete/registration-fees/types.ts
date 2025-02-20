
export interface Fee {
  id: number;
  valor: number;
  isento: boolean;
  pix_key: string | null;
  data_limite_inscricao: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  qr_code_image: string | null;
  qr_code_codigo: string | null;
  link_formulario: string | null;
  perfil: {
    nome: string;
    id: number;
  };
}

export interface RegistrationFeesProps {
  eventId: string | null;
  userProfileId?: number;
}
