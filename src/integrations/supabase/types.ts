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
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      cronograma_atividade_modalidades: {
        Row: {
          cronograma_atividade_id: number
          modalidade_id: number
        }
        Insert: {
          cronograma_atividade_id: number
          modalidade_id: number
        }
        Update: {
          cronograma_atividade_id?: number
          modalidade_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_atividade_modalidades_cronograma_atividade_id_fkey"
            columns: ["cronograma_atividade_id"]
            isOneToOne: false
            referencedRelation: "cronograma_atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividade_modalidades_cronograma_atividade_id_fkey"
            columns: ["cronograma_atividade_id"]
            isOneToOne: false
            referencedRelation: "vw_cronograma_atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividade_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividade_modalidades_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      cronograma_atividades: {
        Row: {
          atividade: string
          cronograma_id: number
          dia: string
          evento_id: string
          global: boolean
          horario_fim: string
          horario_inicio: string
          id: number
          local: string
          ordem: number | null
        }
        Insert: {
          atividade: string
          cronograma_id: number
          dia: string
          evento_id: string
          global?: boolean
          horario_fim: string
          horario_inicio: string
          id?: number
          local: string
          ordem?: number | null
        }
        Update: {
          atividade?: string
          cronograma_id?: number
          dia?: string
          evento_id?: string
          global?: boolean
          horario_fim?: string
          horario_inicio?: string
          id?: number
          local?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_atividades_cronograma_id_fkey"
            columns: ["cronograma_id"]
            isOneToOne: false
            referencedRelation: "cronogramas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      cronogramas: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          evento_id: string
          id: number
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          evento_id: string
          id?: number
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          evento_id?: string
          id?: number
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronogramas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          created_at: string | null
          data_fim_inscricao: string
          data_inicio_inscricao: string
          descricao: string
          foto_evento: string | null
          id: string
          nome: string
          status_evento: string
          tipo: string
          updated_at: string | null
          visibilidade_publica: boolean
        }
        Insert: {
          created_at?: string | null
          data_fim_inscricao: string
          data_inicio_inscricao: string
          descricao: string
          foto_evento?: string | null
          id?: string
          nome: string
          status_evento?: string
          tipo: string
          updated_at?: string | null
          visibilidade_publica?: boolean
        }
        Update: {
          created_at?: string | null
          data_fim_inscricao?: string
          data_inicio_inscricao?: string
          descricao?: string
          foto_evento?: string | null
          id?: string
          nome?: string
          status_evento?: string
          tipo?: string
          updated_at?: string | null
          visibilidade_publica?: boolean
        }
        Relationships: []
      }
      eventos_filiais: {
        Row: {
          evento_id: string
          filial_id: string
        }
        Insert: {
          evento_id: string
          filial_id: string
        }
        Update: {
          evento_id?: string
          filial_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_filiais_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "filiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["filial_id"]
          },
          {
            foreignKeyName: "eventos_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_analytics_inscricoes"
            referencedColumns: ["filial_id"]
          },
          {
            foreignKeyName: "eventos_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["filial_id"]
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
      inscricoes_eventos: {
        Row: {
          data_inscricao: string | null
          evento_id: string
          id: string
          selected_role: Database["public"]["Enums"]["perfil_tipo"]
          taxa_inscricao_id: number
          usuario_id: string
        }
        Insert: {
          data_inscricao?: string | null
          evento_id: string
          id?: string
          selected_role: Database["public"]["Enums"]["perfil_tipo"]
          taxa_inscricao_id: number
          usuario_id: string
        }
        Update: {
          data_inscricao?: string | null
          evento_id?: string
          id?: string
          selected_role?: Database["public"]["Enums"]["perfil_tipo"]
          taxa_inscricao_id?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inscricoes_eventos_taxa_inscricao"
            columns: ["taxa_inscricao_id"]
            isOneToOne: false
            referencedRelation: "taxas_inscricao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
        ]
      }
      inscricoes_modalidades: {
        Row: {
          atleta_id: string | null
          data_inscricao: string | null
          evento_id: string
          id: number
          justificativa_status: string | null
          modalidade_id: number | null
          status: string | null
        }
        Insert: {
          atleta_id?: string | null
          data_inscricao?: string | null
          evento_id: string
          id?: number
          justificativa_status?: string | null
          modalidade_id?: number | null
          status?: string | null
        }
        Update: {
          atleta_id?: string | null
          data_inscricao?: string | null
          evento_id?: string
          id?: number
          justificativa_status?: string | null
          modalidade_id?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_modalidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      modalidades: {
        Row: {
          categoria: string
          evento_id: string
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
          evento_id: string
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
          evento_id?: string
          grupo?: string | null
          id?: number
          limite_vagas?: number
          nome?: string
          status?: string
          tipo_modalidade?: string
          tipo_pontuacao?: string
          vagas_ocupadas?: number
        }
        Relationships: [
          {
            foreignKeyName: "modalidades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          atleta_id: string | null
          comprovante_url: string | null
          data_criacao: string
          data_validacao: string | null
          evento_id: string | null
          id: number
          numero_identificador: string
          status: string | null
          taxa_inscricao_id: number
          validado_sem_comprovante: boolean | null
          valor: number
        }
        Insert: {
          atleta_id?: string | null
          comprovante_url?: string | null
          data_criacao: string
          data_validacao?: string | null
          evento_id?: string | null
          id?: number
          numero_identificador: string
          status?: string | null
          taxa_inscricao_id: number
          validado_sem_comprovante?: boolean | null
          valor?: number
        }
        Update: {
          atleta_id?: string | null
          comprovante_url?: string | null
          data_criacao?: string
          data_validacao?: string | null
          evento_id?: string | null
          id?: number
          numero_identificador?: string
          status?: string | null
          taxa_inscricao_id?: number
          validado_sem_comprovante?: boolean | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_taxa_inscricao_fk"
            columns: ["taxa_inscricao_id"]
            isOneToOne: false
            referencedRelation: "taxas_inscricao"
            referencedColumns: ["id"]
          },
        ]
      }
      papeis_usuarios: {
        Row: {
          evento_id: string
          id: number
          perfil_id: number
          usuario_id: string
        }
        Insert: {
          evento_id: string
          id?: number
          perfil_id: number
          usuario_id: string
        }
        Update: {
          evento_id?: string
          id?: number
          perfil_id?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "papeis_usuarios_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "vw_athletes_management"
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
          evento_id: string
          id: number
          nome: string
          perfil_tipo_id: string
        }
        Insert: {
          descricao?: string | null
          evento_id: string
          id?: number
          nome: string
          perfil_tipo_id: string
        }
        Update: {
          descricao?: string | null
          evento_id?: string
          id?: number
          nome?: string
          perfil_tipo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfis_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_tipo_perfil_fkey"
            columns: ["perfil_tipo_id"]
            isOneToOne: false
            referencedRelation: "perfis_tipo"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_tipo: {
        Row: {
          codigo: string
          descricao: string | null
          id: string
        }
        Insert: {
          codigo: string
          descricao?: string | null
          id?: string
        }
        Update: {
          codigo?: string
          descricao?: string | null
          id?: string
        }
        Relationships: []
      }
      pontuacoes: {
        Row: {
          atleta_id: string | null
          bateria: string | null
          criterio_id: number | null
          data_registro: string | null
          evento_id: string
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
          evento_id: string
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
          evento_id?: string
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
            referencedRelation: "vw_athletes_management"
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
            foreignKeyName: "pontuacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
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
            referencedRelation: "vw_athletes_management"
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
          evento_id: string
          id: number
          modalidade_id: number | null
          posicao: number
        }
        Insert: {
          atleta_id?: string | null
          categoria: string
          data_registro?: string | null
          evento_id: string
          id?: number
          modalidade_id?: number | null
          posicao: number
        }
        Update: {
          atleta_id?: string | null
          categoria?: string
          data_registro?: string | null
          evento_id?: string
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
            referencedRelation: "vw_athletes_management"
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
            foreignKeyName: "premiacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
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
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
          },
        ]
      }
      ranking_filiais: {
        Row: {
          evento_id: string
          filial_id: string | null
          id: number
          total_pontos: number
        }
        Insert: {
          evento_id: string
          filial_id?: string | null
          id?: number
          total_pontos?: number
        }
        Update: {
          evento_id?: string
          filial_id?: string | null
          id?: number
          total_pontos?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_filiais_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "ranking_filiais_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["filial_id"]
          },
        ]
      }
      taxas_inscricao: {
        Row: {
          contato_nome: string | null
          contato_telefone: string | null
          data_limite_inscricao: string | null
          evento_id: string
          id: number
          isento: boolean
          perfil_id: number
          pix_key: string | null
          qr_code_codigo: string | null
          qr_code_image: string | null
          valor: number
        }
        Insert: {
          contato_nome?: string | null
          contato_telefone?: string | null
          data_limite_inscricao?: string | null
          evento_id: string
          id?: number
          isento?: boolean
          perfil_id: number
          pix_key?: string | null
          qr_code_codigo?: string | null
          qr_code_image?: string | null
          valor: number
        }
        Update: {
          contato_nome?: string | null
          contato_telefone?: string | null
          data_limite_inscricao?: string | null
          evento_id?: string
          id?: number
          isento?: boolean
          perfil_id?: number
          pix_key?: string | null
          qr_code_codigo?: string | null
          qr_code_image?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_taxas_inscricao_perfil"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_taxas_perfil"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taxas_inscricao_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          confirmado: boolean | null
          data_criacao: string | null
          data_nascimento: string | null
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
          data_nascimento?: string | null
          email: string
          filial_id?: string | null
          foto_perfil?: string | null
          genero?: string
          id?: string
          nome_completo: string
          numero_documento: string
          numero_identificador: string
          telefone: string
          tipo_documento: string
        }
        Update: {
          confirmado?: boolean | null
          data_criacao?: string | null
          data_nascimento?: string | null
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
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["filial_id"]
          },
        ]
      }
    }
    Views: {
      view_perfil_atleta: {
        Row: {
          atleta_id: string | null
          data_nascimento: string | null
          data_validacao: string | null
          email: string | null
          evento_id: string | null
          filial_cidade: string | null
          filial_estado: string | null
          filial_id: string | null
          filial_nome: string | null
          foto_perfil: string | null
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
        Relationships: [
          {
            foreignKeyName: "pagamentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_analytics_inscricoes: {
        Row: {
          filial: string | null
          filial_id: string | null
          inscritos_por_status_pagamento: Json | null
          media_pontuacao_por_modalidade: Json | null
          modalidades_populares: Json | null
          top_modalidades_feminino: Json | null
          top_modalidades_masculino: Json | null
          top_modalidades_misto: Json | null
          total_atletas_pendentes_pagamento: number | null
          total_inscritos: number | null
          valor_total_pago: number | null
          valor_total_pendente: number | null
        }
        Relationships: []
      }
      vw_athletes_management: {
        Row: {
          atleta_id: string | null
          email: string | null
          filial_id: string | null
          filial_nome: string | null
          genero: string | null
          inscricao_id: number | null
          justificativa_status: string | null
          modalidade_nome: string | null
          nome_atleta: string | null
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
          {
            foreignKeyName: "usuarios_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["filial_id"]
          },
        ]
      }
      vw_cronograma_atividades: {
        Row: {
          atividade: string | null
          dia: string | null
          evento_id: string | null
          global: boolean | null
          horario_fim: string | null
          horario_inicio: string | null
          id: number | null
          local: string | null
          modalidade_nome: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_atividades_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_cronograma_atividades_por_atleta: {
        Row: {
          atividade: string | null
          atleta_id: string | null
          cronograma_atividade_id: number | null
          dia: string | null
          evento_id: string | null
          global: boolean | null
          horario_fim: string | null
          horario_inicio: string | null
          local: string | null
          modalidade_nome: string | null
          modalidade_status: string | null
        }
        Relationships: []
      }
      vw_inscricoes_atletas: {
        Row: {
          atleta_id: string | null
          email: string | null
          filial: string | null
          filial_id: string | null
          genero: string | null
          inscricao_id: number | null
          modalidade_id: number | null
          modalidade_nome: string | null
          nome_atleta: string | null
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
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["modalidade_id"]
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
      vw_taxas_inscricao_usuarios: {
        Row: {
          contato_nome: string | null
          contato_telefone: string | null
          data_limite_inscricao: string | null
          evento_id: string | null
          isento: boolean | null
          perfil_nome: string | null
          pix_key: string | null
          qr_code_codigo: string | null
          qr_code_image: string | null
          usuario_id: string | null
          valor: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "view_perfil_atleta"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_athletes_management"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_inscricoes_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "inscricoes_eventos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_pontuacoes_gerais_atletas"
            referencedColumns: ["atleta_id"]
          },
          {
            foreignKeyName: "taxas_inscricao_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_user_profiles: {
        Args: {
          p_user_id: string
          p_profile_ids: number[]
        }
        Returns: undefined
      }
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
      has_profile: {
        Args: {
          user_id: string
          profile_name: string
        }
        Returns: boolean
      }
      is_event_admin: {
        Args: {
          user_id: string
          event_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      perfil_tipo:
        | "Administração"
        | "Organizador"
        | "Atleta"
        | "Representante de Delegação"
        | "Público Geral"
        | "PGR"
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
