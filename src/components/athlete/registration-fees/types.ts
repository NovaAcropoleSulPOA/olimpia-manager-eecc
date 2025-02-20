
export interface RegistrationFeesProps {
  eventId: string | null;
  userProfileId?: string;
}

export interface Fee {
  id: number;
  valor: number;
  isento: boolean;
  mostra_card: boolean;
  pix_key?: string | null;
  data_limite_inscricao?: string | null;
  contato_nome?: string | null;
  contato_telefone?: string | null;
  qr_code_image?: string | null;
  qr_code_codigo?: string | null;
  link_formulario?: string | null;
  perfil?: {
    id: number;
    nome: string;
  } | null;
  isUserFee?: boolean;
}

export interface UserProfileData {
  nome: string;
  codigo: string;
}

export interface UserProfile {
  perfis: {
    nome: string;
    perfil_tipo: {
      codigo: string;
    };
  };
}
