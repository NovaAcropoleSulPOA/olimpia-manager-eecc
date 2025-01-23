import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Phone, Mail, List, Plus } from 'lucide-react';
import AthleteScores from './AthleteScores';
import { format } from 'date-fns';

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
  modalidade: Modality;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AthleteProfile mounted, user:', user?.id);
    if (!user?.id) {
      console.log('No user ID found, cannot fetch data');
      setLoading(false);
      return;
    }
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to fetch all athlete data...');

      const results = await Promise.allSettled([
        fetchInscriptions(),
        fetchAvailableModalities(),
        fetchScores(),
        fetchBranch(),
      ]);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error in fetch operation ${index}:`, result.reason);
          setError('Failed to load some data. Please try refreshing the page.');
        }
      });

      console.log('All athlete data fetch attempts completed');
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError('Failed to load data. Please try refreshing the page.');
      toast.error('Erro ao carregar dados do atleta');
    } finally {
      setLoading(false);
    }
  };

  const fetchInscriptions = async () => {
    if (!user?.id) {
      console.log('No user ID for inscriptions fetch');
      return;
    }

    console.log('Fetching inscriptions for athlete:', user.id);
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
      .eq('atleta_id', user.id);

    if (error) {
      console.error('Error fetching inscriptions:', error);
      throw error;
    }

    const formattedData: Inscription[] = data.map(insc => ({
      id: insc.id,
      status: insc.status,
      data_inscricao: insc.data_inscricao,
      modalidade: insc.modalidade as unknown as Modality
    }));

    console.log('Fetched inscriptions:', formattedData);
    setInscriptions(formattedData);
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
      const available = data as unknown as Modality[];
      const filteredModalities = available.filter(mod => !registeredIds.includes(mod.id));
      
      console.log('Available modalities:', filteredModalities);
      setAvailableModalities(filteredModalities);
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
  
      const formattedData: Score[] = data.map(score => ({
        id: score.id,
        valor: score.valor_pontuacao,
        modalidade: score.modalidade as unknown as Modality
      }));
  
      console.log('Fetched scores:', formattedData);
      setScores(formattedData);
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
      await fetchData(); // Refresh all data after adding modality

    } catch (error) {
      console.error('Error adding modality:', error);
      toast.error('Erro ao adicionar modalidade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-green-primary" />
        <p className="text-sm text-muted-foreground">Carregando dados do atleta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchData()} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
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
      </div>

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
            <div className="grid gap-2">
              {inscriptions.map((inscription) => (
                <div key={inscription.id} className="flex justify-between items-center p-2 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{inscription.modalidade.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      Status: {inscription.status}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(inscription.data_inscricao), 'dd/MM/yyyy')}
                  </span>
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
          <div className="grid gap-2">
            {availableModalities.map((modality) => (
              <div
                key={modality.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <h4 className="font-medium">{modality.nome}</h4>
                  <span className="text-sm text-muted-foreground">
                    {modality.tipo_modalidade} • {modality.categoria}
                  </span>
                </div>
                <Button
                  size="sm"
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
