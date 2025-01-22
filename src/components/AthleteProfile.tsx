import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Modality {
  id: number;
  nome: string;
  tipo_pontuacao: 'tempo' | 'distancia' | 'pontos';
  tipo_modalidade: 'individual' | 'coletivo';
  categoria: 'misto' | 'masculino' | 'feminino';
}

interface Inscription {
  id: number;
  status: 'Pendente' | 'Aprovada' | 'Rejeitada';
  data_inscricao: string;
  modalidade: Modality;
}

export default function AthleteProfile() {
  const { user } = useAuth();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [availableModalities, setAvailableModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInscriptions();
    fetchAvailableModalities();
  }, []);

  const fetchInscriptions = async () => {
    try {
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

      setInscriptions(data as Inscription[]);
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
      toast.error('Erro ao carregar inscrições');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableModalities = async () => {
    try {
      const { data, error } = await supabase
        .from('modalidades')
        .select('*')
        .order('nome');

      if (error) throw error;

      const registeredIds = inscriptions.map(insc => insc.modalidade.id);
      const available = data.filter(mod => !registeredIds.includes(mod.id));
      setAvailableModalities(available);
    } catch (error) {
      console.error('Error fetching modalities:', error);
      toast.error('Erro ao carregar modalidades disponíveis');
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
      await fetchInscriptions();
      await fetchAvailableModalities();
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
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Atleta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <strong>Nome:</strong> {user?.nome_completo}
            </div>
            <div>
              <strong>Email:</strong> {user?.email}
            </div>
            <div>
              <strong>Telefone:</strong> {user?.telefone}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modalidades Inscritas</CardTitle>
        </CardHeader>
        <CardContent>
          {inscriptions.length === 0 ? (
            <p>Nenhuma modalidade inscrita.</p>
          ) : (
            <div className="grid gap-4">
              {inscriptions.map((inscription) => (
                <div
                  key={inscription.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{inscription.modalidade.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      Status: {inscription.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modalidades Disponíveis</CardTitle>
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