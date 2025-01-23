import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Phone, Mail, List, Plus } from 'lucide-react';
import AthleteScores from './AthleteScores';

interface Modality {
  id: number;
  nome: string;
  tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
  tipo_modalidade: 'individual' | 'coletivo';
  categoria: 'misto' | 'masculino' | 'feminino';
}

interface Inscription {
  id: number;
  status: 'Pendente' | 'Confirmada' | 'Recusada' | 'Cancelada';
  data_inscricao: string;
  modalidade: Modality; // ✅ Corrigido: agora é um único objeto
}

interface Score {
  id: number;
  valor: number;
  modalidade: Modality;
}

interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export default function AthleteProfile() {
  const { user } = useAuth();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [availableModalities, setAvailableModalities] = useState<Modality[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    valor: number;
    status: string;
    data_criacao: string;
    data_validacao: string | null;
  } | null>(null);
  

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchInscriptions(),
        fetchAvailableModalities(),
        fetchScores(),
        fetchBranch(),
        fetchPaymentInfo(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInscriptions = async () => {
    try {
      console.log('Fetching inscriptions for athlete:', user?.id);
      const { data, error } = await supabase
        .from('inscricoes')
        .select(`
          id,
          status,
          data_inscricao,
          modalidade:modalidades (
            id,
            nome,
            tipo_pontuacao,
            tipo_modalidade,
            categoria
          )
        `)
        .eq('atleta_id', user?.id);
  
      if (error) throw error;
  
      // A estrutura do retorno já contém apenas UMA modalidade por inscrição
      const formattedData = data.map(insc => ({
        id: insc.id,
        status: insc.status,
        data_inscricao: insc.data_inscricao,
        modalidade: insc.modalidade // Já é um único objeto
      }));
  
      console.log('Fetched inscriptions:', formattedData);
      setInscriptions(formattedData || []);
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
      toast.error('Erro ao carregar inscrições');
    }
  };  

  const fetchAvailableModalities = async () => {
    try {
      console.log('Fetching available modalities');
      const { data, error } = await supabase
        .from('modalidades')
        .select('*')
        .order('nome');

      if (error) throw error;

      const registeredIds = inscriptions.map(insc => insc.modalidade.id);
      const available = (data || []).filter(mod => !registeredIds.includes(mod.id));
      console.log('Available modalities:', available);
      setAvailableModalities(available);
    } catch (error) {
      console.error('Error fetching modalities:', error);
      toast.error('Erro ao carregar modalidades disponíveis');
    }
  };

  const fetchScores = async () => {
    try {
      console.log('Fetching scores for athlete:', user?.id);
      const { data, error } = await supabase
        .from('pontuacoes')
        .select(`
          id,
          valor_pontuacao,
          unidade,
          modalidade:modalidades (
            id,
            nome,
            tipo_pontuacao,
            tipo_modalidade,
            categoria
          )
        `)
        .eq('atleta_id', user?.id);
  
      if (error) throw error;
  
      const formattedData = data.map(score => ({
        id: score.id,
        valor: score.valor_pontuacao, // ✅ Ajustado para o nome correto da coluna
        unidade: score.unidade, // Pode ser útil exibir a unidade de medida
        modalidade: score.modalidade
      }));
  
      console.log('Fetched scores:', formattedData);
      setScores(formattedData || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
      toast.error('Erro ao carregar pontuações');
    }
  };  

  const fetchBranch = async () => {
    if (!user?.filial_id) return;

    try {
      const { data, error } = await supabase
        .from('filiais')
        .select('*')
        .eq('id', user.filial_id)
        .single();

      if (error) throw error;

      setBranch(data);
    } catch (error) {
      console.error('Error fetching branch:', error);
      toast.error('Erro ao carregar informações da filial');
    }
  };

  const fetchPaymentInfo = async () => {
    try {
      console.log('Fetching payment info for athlete:', user?.id);
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          valor,
          status,
          data_criacao,
          data_validacao
        `)
        .eq('atleta_id', user?.id)
        .single();
  
      if (error) {
        console.error('Error fetching payment info:', error);
        toast.error('Erro ao carregar informações de pagamento.');
        return;
      }
  
      console.log('Fetched payment info:', data);
      setPaymentInfo(data);
    } catch (error) {
      console.error('Unexpected error fetching payment info:', error);
      toast.error('Erro inesperado ao buscar informações de pagamento.');
    }
  };  

  const handleAddModality = async (modalityId: number) => {
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('inscricoes')
        .insert([{
          atleta_id: user?.id,
          modalidade_id: modalityId,
          status: 'Pendente',
          data_inscricao: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Modalidade adicionada com sucesso!');
      await fetchData();
    } catch (error) {
      console.error('Error adding modality:', error);
      toast.error('Erro ao adicionar modalidade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-olimpics-green-primary" />
            Perfil do Atleta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{user?.nome_completo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user?.telefone}</span>
            </div>
            {branch && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{branch.nome} - {branch.cidade}/{branch.estado}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-olimpics-green-primary" />
            Modalidades Inscritas
          </CardTitle>
        </CardHeader>
        <CardContent>
        {inscriptions.length === 0 ? (
          <p>Nenhuma modalidade inscrita.</p>
        ) : (
          <div className="grid gap-4">
            {inscriptions.map((inscription) => (
              <div key={inscription.id} className="p-4 border rounded-lg">
                <h4 className="font-medium">{inscription.modalidade.nome}</h4>
                <p className="text-sm text-muted-foreground">
                  Status: {inscription.status}
                </p>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>

      <AthleteScores scores={scores} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-olimpics-green-primary" />
            Modalidades Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {availableModalities.map((modality) => (
              <div
                key={modality.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{modality.nome}</h4>
                  <p className="text-sm text-muted-foreground">
                    {modality.tipo_modalidade} • {modality.categoria}
                  </p>
                </div>
                <Button
                  onClick={() => handleAddModality(modality.id)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Adicionar'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}