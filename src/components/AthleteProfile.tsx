import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Loader2, User, MapPin, Phone, Mail, List, Plus, Upload,
  Waves, PersonStanding, Volleyball, Dumbbell, Target, Sword, BookOpen, Disc
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AthleteScores from './AthleteScores';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchData();
    fetchProfileImage();
  }, [user?.id]);

  const fetchProfileImage = async () => {
    if (!user?.id) return;
    
    try {
      const { data: profile } = await supabase
        .from('usuarios')
        .select('foto_perfil')  // Changed from avatar_url to foto_perfil
        .eq('id', user.id)
        .single();
      
      if (profile?.foto_perfil) {
        const { data } = await supabase.storage
          .from('avatars')
          .getPublicUrl(profile.foto_perfil);
        
        setProfileImage(data.publicUrl);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 4MB');
      return;
    }

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ foto_perfil: fileName })  // Changed from avatar_url to foto_perfil
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfileImage();
      toast.success('Imagem de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao atualizar imagem de perfil');
    } finally {
      setUploadingImage(false);
    }
  };

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

      // Get IDs of modalities the user is already registered for
      const registeredIds = inscriptions.map(insc => insc.modalidade.id);
      console.log('Already registered modality IDs:', registeredIds);
      
      // Filter out modalities that are already registered
      const available = data.filter(mod => !registeredIds.includes(mod.id));
      console.log('Available modalities after filtering:', available);
      
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
      await fetchData();
      
      // Update available modalities
      setAvailableModalities(prev => 
        prev.filter(mod => mod.id !== modalityId)
      );

    } catch (error) {
      console.error('Error adding modality:', error);
      toast.error('Erro ao adicionar modalidade');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'Pendente':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'Recusada':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'Cancelada':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const groupInscriptionsByStatus = () => {
    const groups: Record<string, Inscription[]> = {
      Pendente: [],
      Confirmada: [],
      Recusada: [],
      Cancelada: []
    };

    inscriptions.forEach(inscription => {
      groups[inscription.status].push(inscription);
    });

    return groups;
  };

  const getSportIcon = (sportName: string) => {
    const iconProps = { className: "h-6 w-6" };
    switch (sportName.toLowerCase()) {
      case 'natação':
        return <Waves {...iconProps} />;
      case 'corrida':
        return <PersonStanding {...iconProps} />; // Changed from Running to PersonStanding
      case 'handebol':
        return <Volleyball {...iconProps} />;
      case 'levantamento de peso':
        return <Dumbbell {...iconProps} />;
      case 'arco e flecha':
        return <Target {...iconProps} />; // Changed from BowArrow to Target
      case 'esgrima':
        return <Sword {...iconProps} />;
      case 'poesia':
        return <BookOpen {...iconProps} />;
      case 'lançamento de disco':
      case 'lançamento de dardo':
        return <Disc {...iconProps} />;
      case 'vôlei':
        return <Volleyball {...iconProps} />;
      default:
        return <List {...iconProps} />;
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

  const groupedInscriptions = groupInscriptionsByStatus();

  return (
    <div className="space-y-4">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-olimpics-green-primary" />
            Perfil Olímpico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage || undefined} alt={user?.nome_completo} />
                <AvatarFallback>
                  {user?.nome_completo?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow cursor-pointer hover:bg-gray-100"
              >
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </label>
            </div>
            <div className="flex-1 grid gap-4">
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
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-olimpics-green-primary/10 border-olimpics-green-primary/20">
        <InfoIcon className="h-4 w-4 text-olimpics-green-primary" />
        <AlertDescription className="text-olimpics-text">
          Os atletas podem se inscrever em quantas modalidades quiserem. No entanto, todas as inscrições passarão por aprovação devido a limitações de vagas, espaço e logística. Uma vez inscrito, o atleta não poderá se desinscrever por conta própria. Apenas os representantes de delegação poderão cancelar inscrições mediante justificativa. Caso precise cancelar sua participação em alguma modalidade, entre em contato com o representante da sua delegação.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-olimpics-green-primary" />
            Modalidades Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="misto" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="misto">Misto</TabsTrigger>
              <TabsTrigger value="masculino">Masculino</TabsTrigger>
              <TabsTrigger value="feminino">Feminino</TabsTrigger>
            </TabsList>

            {['misto', 'masculino', 'feminino'].map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {availableModalities
                    .filter(modality => modality.categoria.toLowerCase() === category)
                    .map((modality) => (
                      <div
                        key={modality.id}
                        className="flex flex-col p-4 border rounded-lg hover:border-olimpics-green-primary/50 hover:shadow-md transition-all bg-white"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-olimpics-green-primary/10">
                            {getSportIcon(modality.nome)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-base">{modality.nome}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {modality.tipo_modalidade}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddModality(modality.id)}
                          disabled={submitting}
                          className="mt-4 w-full"
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
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <AthleteScores scores={scores} />
    </div>
  );
}
