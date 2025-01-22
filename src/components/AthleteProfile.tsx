import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Modality } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trophy } from 'lucide-react';

interface Inscription {
  id: number;
  modalidade: Modality;
  status: string;
  data_inscricao: string;
}

export function AthleteProfile() {
  const { user } = useAuth();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [availableModalities, setAvailableModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInscriptions = async () => {
      console.log('Fetching inscriptions for user:', user?.id);
      try {
        const { data: inscriptionData, error: inscriptionError } = await supabase
          .from('inscricoes')
          .select(`
            id,
            status,
            data_inscricao,
            modalidade: modalidade_id (
              id,
              nome,
              tipo_pontuacao,
              tipo_modalidade,
              categoria
            )
          `)
          .eq('atleta_id', user?.id);

        if (inscriptionError) {
          console.error('Error fetching inscriptions:', inscriptionError);
          toast.error('Erro ao carregar inscrições');
          return;
        }

        console.log('Fetched inscriptions:', inscriptionData);
        setInscriptions(inscriptionData || []);

        // Fetch available modalities
        const { data: modalityData, error: modalityError } = await supabase
          .from('modalidades')
          .select('*');

        if (modalityError) {
          console.error('Error fetching modalities:', modalityError);
          toast.error('Erro ao carregar modalidades disponíveis');
          return;
        }

        // Filter out already registered modalities
        const registeredIds = inscriptionData?.map(insc => insc.modalidade.id) || [];
        const available = modalityData?.filter(mod => !registeredIds.includes(mod.id)) || [];
        setAvailableModalities(available);

      } catch (error) {
        console.error('Error in fetchInscriptions:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchInscriptions();
    }
  }, [user?.id]);

  const handleAddModality = async (modalityId: number) => {
    try {
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
      // Refresh inscriptions
      window.location.reload();
    } catch (error) {
      console.error('Error adding modality:', error);
      toast.error('Erro ao adicionar modalidade');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-olimpics-orange-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-olimpics-orange-primary text-white text-xl">
              {user?.nome_completo?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user?.nome_completo}</CardTitle>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground">Tel: {user?.telefone}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Inscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-olimpics-orange-primary" />
            Minhas Modalidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modalidade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Inscrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inscriptions.map((inscription) => (
                <TableRow key={inscription.id}>
                  <TableCell className="font-medium">{inscription.modalidade.nome}</TableCell>
                  <TableCell>{inscription.modalidade.categoria}</TableCell>
                  <TableCell>{inscription.modalidade.tipo_modalidade}</TableCell>
                  <TableCell>{inscription.status}</TableCell>
                  <TableCell>
                    {new Date(inscription.data_inscricao).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Available Modalities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-6 w-6 text-olimpics-orange-primary" />
            Modalidades Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableModalities.map((modality) => (
              <Card key={modality.id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{modality.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {modality.categoria} • {modality.tipo_modalidade}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddModality(modality.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}