export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      criterios_pontuacao: {
        Row: {
          id: number
          modalidade_id: number | null
          tipo_pontuacao: string
        }
        Insert: {
          id?: number
          modalidade_id?: number | null
          tipo_pontuacao: string
        }
        Update: {
          id?: number
          modalidade_id?: number | null
          tipo_pontuacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "criterios_pontuacao_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criterios_pontuacao_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "criterios_pontuacao_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      filiais: {
        Row: {
          cidade: string
          estado: string
          id: string
          nome: string
        }
        Insert: {
          cidade: string
          estado: string
          id?: string
          nome: string
        }
        Update: {
          cidade?: string
          estado?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      inscricoes_modalidades: {
        Row: {
          atleta_id: string | null
          data_inscricao: string | null
          id: number
          justificativa_status: string | null
          modalidade_id: number | null
          status: string | null
        }
        Insert: {
          atleta_id?: string | null
          data_inscricao?: string | null
          id?: number
          justificativa_status?: string | null
          modalidade_id?: number | null
          status?: string | null
        }
        Update: {
          atleta_id?: string | null
          data_inscricao?: string | null
          id?: number
          justificativa_status?: string | null
          modalidade_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "inscricoes_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      modalidades: {
        Row: {
          categoria: string
          grupo: string | null
          id: number
          limite_vagas: number
          nome: string
          status: string
          tipo_modalidade: string
          tipo_pontuacao: string
          vagas_ocupadas: number
        }
        Insert: {
          categoria: string
          grupo?: string | null
          id: number
          limite_vagas?: number
          nome: string
          status?: string
          tipo_modalidade: string
          tipo_pontuacao: string
          vagas_ocupadas?: number
        }
        Update: {
          categoria?: string
          grupo?: string | null
          id?: number
          limite_vagas?: number
          nome?: string
          status?: string
          tipo_modalidade?: string
          tipo_pontuacao?: string
          vagas_ocupadas?: number
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          atleta_id: string | null
          comprovante_url: string | null
          data_criacao: string
          data_validacao: string | null
          id: number
          status: string | null
          validado_sem_comprovante: boolean | null
          valor: number
        }
        Insert: {
          atleta_id?: string | null
          comprovante_url?: string | null
          data_criacao: string
          data_validacao?: string | null
          id?: number
          status?: string | null
          validado_sem_comprovante?: boolean | null
          valor?: number
        }
        Update: {
          atleta_id?: string | null
          comprovante_url?: string | null
          data_criacao?: string
          data_validacao?: string | null
          id?: number
          status?: string | null
          validado_sem_comprovante?: boolean | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pagamentos_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pagamentos_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
        ]
      }
      papeis_usuarios: {
        Row: {
          id: number
          perfil_id: number
          usuario_id: string
        }
        Insert: {
          id?: number
          perfil_id: number
          usuario_id: string
        }
        Update: {
          id?: number
          perfil_id?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "papeis_usuarios_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papeis_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "papeis_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "papeis_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "papeis_usuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
        ]
      }
      perfis: {
        Row: {
          descricao: string | null
          id: number
          nome: string
        }
        Insert: {
          descricao?: string | null
          id?: number
          nome: string
        }
        Update: {
          descricao?: string | null
          id?: number
          nome?: string
        }
        Relationships: []
      }
      pontuacoes: {
        Row: {
          atleta_id: string | null
          bateria: string | null
          criterio_id: number | null
          data_registro: string | null
          id: number
          juiz_id: string | null
          modalidade_id: number | null
          posicao_final: number | null
          unidade: string
          valor_pontuacao: number
        }
        Insert: {
          atleta_id?: string | null
          bateria?: string | null
          criterio_id?: number | null
          data_registro?: string | null
          id?: number
          juiz_id?: string | null
          modalidade_id?: number | null
          posicao_final?: number | null
          unidade: string
          valor_pontuacao: number
        }
        Update: {
          atleta_id?: string | null
          bateria?: string | null
          criterio_id?: number | null
          data_registro?: string | null
          id?: number
          juiz_id?: string | null
          modalidade_id?: number | null
          posicao_final?: number | null
          unidade?: string
          valor_pontuacao?: number
        }
        Relationships: [
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_criterio_id_fkey"
            columns: ["criterio_id"]
            isOneToOne: false
            referencedRelation: "criterios_pontuacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_juiz_id_fkey"
            columns: ["juiz_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "pontuacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pontuacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "pontuacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      premiacoes: {
        Row: {
          atleta_id: string | null
          categoria: string
          data_registro: string | null
          id: number
          modalidade_id: number | null
          posicao: number
        }
        Insert: {
          atleta_id?: string | null
          categoria: string
          data_registro?: string | null
          id?: number
          modalidade_id?: number | null
          posicao: number
        }
        Update: {
          atleta_id?: string | null
          categoria?: string
          data_registro?: string | null
          id?: number
          modalidade_id?: number | null
          posicao?: number
        }
        Relationships: [
          {
            foreignKeyName: "premiacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premiacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "premiacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "premiacoes_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "premiacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premiacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["modalidade_id"]
          },
          {
            foreignKeyName: "premiacoes_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      ranking_filiais: {
        Row: {
          filial_id: string | null
          id: number
          total_pontos: number
        }
        Insert: {
          filial_id?: string | null
          id?: number
          total_pontos?: number
        }
        Update: {
          filial_id?: string | null
          id?: number
          total_pontos?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["filial_id"]
          },
          {
            foreignKeyName: "ranking_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
        ]
      }
      usuarios: {
        Row: {
          confirmado: boolean | null
          data_criacao: string | null
          email: string
          filial_id: string | null
          foto_perfil: string | null
          genero: string
          id: string
          nome_completo: string
          numero_documento: string
          numero_identificador: string
          telefone: string
          tipo_documento: string
        }
        Insert: {
          confirmado?: boolean | null
          data_criacao?: string | null
          email: string
          filial_id?: string | null
          foto_perfil?: string | null
          genero?: string
          id?: string
          nome_completo: string
          numero_documento: string
          numero_identificador?: string
          telefone: string
          tipo_documento: string
        }
        Update: {
          confirmado?: boolean | null
          data_criacao?: string | null
          email?: string
          filial_id?: string | null
          foto_perfil?: string | null
          genero?: string
          id?: string
          nome_completo?: string
          numero_documento?: string
          numero_identificador?: string
          telefone?: string
          tipo_documento?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["filial_id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
        ]
      }
    }
    Views: {
      view_perfil_atleta: {
        Row: {
          atleta_id: string | null
          data_validacao: string | null
          email: string | null
          filial_cidade: string | null
          filial_estado: string | null
          filial_id: string | null
          filial_nome: string | null
          genero: string | null
          nome_completo: string | null
          numero_documento: string | null
          numero_identificador: string | null
          pagamento_data_criacao: string | null
          pagamento_status: string | null
          pagamento_valor: number | null
          status_confirmacao: boolean | null
          telefone: string | null
          tipo_documento: string | null
        }
        Relationships: []
      }
      vw_analytics_inscricoes: {
        Row: {
          atletas_por_categoria: Json | null
          filial: string | null
          filial_id: string | null
          inscritos_por_status: Json | null
          inscritos_por_status_pagamento: Json | null
          media_pontuacao_por_modalidade: Json | null
          modalidades_populares: Json | null
          ranking_filiais: Json | null
          total_atletas_pendentes_pagamento: number | null
          total_inscritos: number | null
          valor_total_pago: number | null
          valor_total_pendente: number | null
        }
        Relationships: []
      }
      vw_inscricoes_atletas: {
        Row: {
          atleta_email: string | null
          atleta_id: string | null
          atleta_nome: string | null
          filial_id: string | null
          filial_nome: string | null
          genero: string | null
          inscricao_id: number | null
          modalidade_id: number | null
          modalidade_nome: string | null
          numero_documento: string | null
          numero_identificador: string | null
          status_confirmacao: boolean | null
          status_inscricao: string | null
          status_pagamento: string | null
          telefone: string | null
          tipo_documento: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["filial_id"]
          },
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
        ]
      }
      vw_pontuacoes_gerais_atletas: {
        Row: {
          atleta_id: string | null
          atleta_nome: string | null
          modalidade_categoria: string | null
          modalidade_id: number | null
          modalidade_nome: string | null
          modalidade_tipo: string | null
          pontuacao_media: number | null
          pontuacao_total: number | null
          total_pontuacoes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      atualizar_status_inscricao: {
        Args: {
          inscricao_id: number
          novo_status: string
          justificativa: string
        }
        Returns: undefined
      }
      atualizar_status_pagamento: {
        Args: {
          p_atleta_id: string
          p_novo_status: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
